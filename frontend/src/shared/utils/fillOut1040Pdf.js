import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Loads f1040_clean.pdf from public assets and overlays user data.
 * Accepts full form1040Payload structure.
 */
export async function fillOut1040Pdf(payload) {
  console.log('fillOut1040Pdf invoked');
  console.log('Full payload:\n', JSON.stringify(payload, null, 2));

  const formUrl = '/assets/forms/f1040_clean.pdf';
  const formBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(formBytes);
  const pages = pdfDoc.getPages();
  const page = pages[0];
  const page2 = pages[1];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pageHeight = page.getHeight(); // Typically 792 for letter size

  const draw = (label, value, x, yFromTop, p = page, size = 10, align = 'left') => {
    const offset = Math.floor(size * 0.3); // Reduced offset
    const adjustedY = pageHeight - yFromTop - offset;
    let adjustedX = x;
    if (align === 'right') {
      const width = font.widthOfTextAtSize(String(value), size);
      adjustedX -= width;
    } else if (align === 'center') {
      const width = font.widthOfTextAtSize(String(value), size);
      adjustedX -= width / 2;
    }
    console.log(`Drawing ${label}:`, value);
    p.drawText(String(value), {
      x: adjustedX,
      y: adjustedY,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // DOB for age
  const youDOB = payload?.taxpayer?.dob ? new Date(payload.taxpayer.dob) : null;
  const spouseDOB = payload?.taxpayer?.spouse?.dob ? new Date(payload.taxpayer.spouse.dob) : null;
  const bornBeforeDate = new Date('1960-01-02');

  // Calculate standard deduction if type is standard
  const fsKey = payload?.taxpayer?.filingStatus?.toLowerCase().replace('filing', '').replace(' ', '');
  if (payload?.deductions?.type === 'standard') {
    const baseAmounts = {
      'single': 14600,
      'marriedjointly': 29200,
      'marriedseparately': 14600,
      'headofhousehold': 21900,
      'qualifyingsurvivingspouse': 29200
    };
    let base = baseAmounts[fsKey] || 0;
    const additionalPer = (fsKey === 'single' || fsKey === 'headofhousehold') ? 1950 : 1550;
    let additional = 0;
    const youBornBefore = youDOB && youDOB < bornBeforeDate;
    const spouseBornBefore = spouseDOB && spouseDOB < bornBeforeDate;
    if (youBornBefore) additional += additionalPer;
    if (payload?.ageBlindness?.youBlind) additional += additionalPer;
    if (fsKey.includes('married') || fsKey === 'qualifyingsurvivingspouse') {
      if (spouseBornBefore) additional += additionalPer;
      if (payload?.ageBlindness?.spouseBlind) additional += additionalPer;
    }
    payload.deductions.amount = base + additional;
  }

  // Calculate AGI, taxable income
  const totalIncome = payload?.incomeDetails?.totalIncome || 0;
  const adjustments = payload?.adjustments?.total || 0;
  const agi = totalIncome - adjustments;
  const deductionsAmount = payload?.deductions?.amount || 0;
  const qbid = payload?.deductions?.qbid || 0;
  const taxable = Math.max(0, agi - deductionsAmount - qbid);

  // Calculate tax
  const calculateTax = (taxableIncome, filingStatus) => {
    const brackets = {
      'marriedjointly': [
        { min: 0, max: 23200, rate: 0.10 },
        { min: 23201, max: 94300, rate: 0.12 },
        { min: 94301, max: 201050, rate: 0.22 },
        { min: 201051, max: 383900, rate: 0.24 },
        { min: 383901, max: 487450, rate: 0.32 },
        { min: 487451, max: 731200, rate: 0.35 },
        { min: 731201, rate: 0.37 }
      ]
      // Add other statuses if needed
    }[filingStatus] || [];
    let tax = 0;
    let prevMax = 0;
    for (let bracket of brackets) {
      const min = bracket.min;
      const max = bracket.max || Infinity;
      const portion = Math.max(0, Math.min(taxableIncome, max) - prevMax);
      tax += portion * bracket.rate;
      prevMax = max;
    }
    return Math.floor(tax);
  };
  const tax = calculateTax(taxable, fsKey);

  // Credits
  const childTax = payload?.credits?.items?.find(item => item.type === 'child_tax')?.amount || 0;
  const nonRefundable = Math.min(tax, childTax);
  const refundable = childTax - nonRefundable;

  // Other assumptions
  const sch2Line3 = 0;
  const beforeCredits = tax + sch2Line3;
  const afterCredits = Math.max(0, beforeCredits - nonRefundable);
  const otherTaxes = 0;
  const totalTax = afterCredits + otherTaxes;
  const totalPayments = refundable; // Assuming no other payments
  const overpaid = Math.max(0, totalPayments - totalTax);
  const balanceDue = Math.max(0, totalTax - totalPayments);

  // Tax year
  draw('Tax year beginning', '', 290, 85);
  draw('Tax year ending', '', 440, 85);

  // Taxpayer identity (Page 1)
  const taxpayerNameParts = payload?.taxpayer?.fullName?.split(' ') || [];
  const taxpayerFirstMiddle = taxpayerNameParts.slice(0, -1).join(' ') || '—';
  const taxpayerLast = taxpayerNameParts.pop() || '—';
  draw('Your first name and middle initial', taxpayerFirstMiddle, 70, 100);
  draw('Last name', taxpayerLast, 280, 100);
  draw('Your social security number', payload?.taxpayer?.ssn || '—', 480, 100);
  const spouseNameParts = payload?.taxpayer?.spouse?.name?.split(' ') || [];
  const spouseFirstMiddle = spouseNameParts.slice(0, -1).join(' ') || '—';
  const spouseLast = spouseNameParts.pop() || '—';
  draw('Spouse’s first name and middle initial', spouseFirstMiddle, 70, 115);
  draw('Spouse last name', spouseLast, 280, 115);
  draw('Spouse’s social security number', payload?.taxpayer?.spouse?.ssn || '—', 480, 115);
  draw('Home address', payload?.taxpayer?.address || '—', 70, 130);
  draw('Apt. no.', payload?.taxpayer?.aptNo || '—', 480, 130);
  draw('City, town, or post office', payload?.taxpayer?.city || '—', 70, 145);
  draw('State', payload?.taxpayer?.residentState?.toUpperCase().slice(0, 2) || '—', 430, 145);
  draw('ZIP code', payload?.taxpayer?.zip || '—', 500, 145);
  draw('Foreign country name', payload?.taxpayer?.foreignCountry || '—', 70, 160);
  draw('Foreign province/state/county', payload?.taxpayer?.foreignProvince || '—', 280, 160);
  draw('Foreign postal code', payload?.taxpayer?.foreignPostal || '—', 480, 160);

  // Presidential Election Campaign checkboxes
  if (payload?.presidentialCampaign?.you) {
    draw('Presidential You', 'X', 570, 185, page, 12, 'center');
  }
  if (payload?.presidentialCampaign?.spouse) {
    draw('Presidential Spouse', 'X', 600, 185, page, 12, 'center');
  }

  // Filing Status checkboxes
  const filingMap = { 'single': {x: 70, y: 200}, 'marriedjointly': {x: 70, y: 215}, 'marriedseparately': {x: 70, y: 230}, 'headofhousehold': {x: 70, y: 245}, 'qualifyingsurvivingspouse': {x: 70, y: 260} };
  const fsPos = filingMap[fsKey] || {x: 70, y: 200};
  draw(`Filing Status - ${payload?.taxpayer?.filingStatus || ''}`, 'X', fsPos.x, fsPos.y, page, 12, 'center');
  draw('Spouse/Child name for MFS/HOH/QSS', payload?.taxpayer?.qualifyingName || '—', 70, 260);

  // Nonresident alien spouse
  if (payload?.taxpayer?.nonresidentSpouse) {
    draw('Nonresident spouse check', 'X', 70, 275, page, 12, 'center');
    draw('Nonresident spouse name', payload.taxpayer.nonresidentSpouseName || '—', 130, 275);
  }

  // Digital Assets (assume No if not specified)
  const digitalYes = payload?.digitalAssets?.yes ?? false;
  draw('Digital Assets - ' + (digitalYes ? 'Yes' : 'No'), 'X', digitalYes ? 530 : 570, 290, page, 12, 'center');

  // Standard Deduction checkboxes
  if (payload?.standardDeduction?.youDependent) {
    draw('You as dependent', 'X', 70, 305, page, 12, 'center');
  }
  if (payload?.standardDeduction?.spouseDependent) {
    draw('Spouse as dependent', 'X', 230, 305, page, 12, 'center');
  }
  if (payload?.standardDeduction?.spouseItemizes) {
    draw('Spouse itemizes/dual-status', 'X', 70, 320, page, 12, 'center');
  }

  // Age/Blindness
  const youBornBefore = youDOB && youDOB < bornBeforeDate;
  const spouseBornBefore = spouseDOB && spouseDOB < bornBeforeDate;
  if (youBornBefore) draw('You born before Jan 2, 1960', 'X', 70, 335, page, 12, 'center');
  if (payload?.ageBlindness?.youBlind) draw('You blind', 'X', 230, 335, page, 12, 'center');
  if (spouseBornBefore) draw('Spouse born before Jan 2, 1960', 'X', 330, 335, page, 12, 'center');
  if (payload?.ageBlindness?.spouseBlind) draw('Spouse blind', 'X', 480, 335, page, 12, 'center');

  // Dependents
  if (payload?.taxpayer?.dependents?.length > 4) {
    draw('More than four dependents', 'X', 580, 350, page, 12, 'center');
  }
  if (payload?.taxpayer?.dependents && payload.taxpayer.dependents.length > 0) {
    payload.taxpayer.dependents.forEach((dep, index) => {
      const y = 365 + index * 15 + 5; // Adjusted slightly
      draw(`Dependent ${index+1} First/Last name`, dep.name || '—', 70, y);
      draw(`Dependent ${index+1} SSN`, dep.ssn || '—', 280, y);
      draw(`Dependent ${index+1} Relationship`, dep.relationship || '—', 380, y);
      if (['son', 'daughter', 'child'].includes(dep.relationship.toLowerCase())) {
        draw(`Dependent ${index+1} Child tax credit`, 'X', 530, y, page, 12, 'center');
      }
      if (dep.otherDependentsCredit) {
        draw(`Dependent ${index+1} Credit for other dependents`, 'X', 580, y, page, 12, 'center');
      }
    });
  }

  // Income lines
  const numericRight = 560;
  draw('Line 1a - Wages', totalIncome, numericRight, 440 + 10, page, 10, 'right');
  draw('Line 1b - Household employee wages', '0', numericRight, 455 + 10, page, 10, 'right');
  draw('Line 1c - Tip income', '0', numericRight, 470 + 10, page, 10, 'right');
  draw('Line 1d - Medicaid waiver', '0', numericRight, 485 + 10, page, 10, 'right');
  draw('Line 1e - Dependent care benefits', '0', numericRight, 500 + 10, page, 10, 'right');
  draw('Line 1f - Adoption benefits', '0', numericRight, 515 + 10, page, 10, 'right');
  draw('Line 1g - Form 8919 wages', '0', numericRight, 530 + 10, page, 10, 'right');
  draw('Line 1h - Other earned income', '0', numericRight, 545 + 10, page, 10, 'right');
  draw('Line 1i - Nontaxable combat pay', '0', 470, 560 + 10, page, 10, 'right');
  draw('Line 1z - Add 1a-1h', totalIncome, numericRight, 560 + 10, page, 10, 'right');
  draw('Line 2a - Tax-exempt interest', '0', 230, 575 + 10, page, 10, 'right');
  draw('Line 2b - Taxable interest', '0', numericRight, 575 + 10, page, 10, 'right');
  draw('Line 3a - Qualified dividends', '0', 230, 590 + 10, page, 10, 'right');
  draw('Line 3b - Ordinary dividends', '0', numericRight, 590 + 10, page, 10, 'right');
  draw('Line 4a - IRA distributions', '0', 230, 605 + 10, page, 10, 'right');
  draw('Line 4b - Taxable IRA', '0', numericRight, 605 + 10, page, 10, 'right');
  draw('Line 5a - Pensions/annuities', '0', 230, 620 + 10, page, 10, 'right');
  draw('Line 5b - Taxable pensions', '0', numericRight, 620 + 10, page, 10, 'right');
  draw('Line 6a - Social security', '0', 230, 635 + 10, page, 10, 'right');
  draw('Line 6b - Taxable social security', '0', numericRight, 635 + 10, page, 10, 'right');
  if (payload?.income?.lumpSumElection) {
    draw('Lump-sum election', 'X', 560, 650 + 10, page, 12, 'center');
  }
  draw('Line 7 - Capital gain/loss', '0', numericRight, 650 + 10, page, 10, 'right');
  if (payload?.income?.noScheduleD) {
    draw('No Schedule D', 'X', 510, 650 + 10, page, 12, 'center');
  }
  draw('Line 8 - Additional income', '0', numericRight, 665 + 10, page, 10, 'right');
  draw('Line 9 - Total income', totalIncome.toLocaleString(), numericRight, 680 + 10, page, 10, 'right');

  // Adjustments and AGI
  draw('Line 10 - Adjustments', adjustments, numericRight, 695 + 10, page, 10, 'right');
  draw('Line 11 - AGI', agi.toLocaleString(), numericRight, 710 + 10, page, 10, 'right');
  draw('Line 12 - Deductions', deductionsAmount.toLocaleString(), numericRight, 725 + 10, page, 10, 'right');
  draw('Line 13 - QBID', qbid, numericRight, 740 + 10, page, 10, 'right');
  draw('Line 14 - Add 12+13', (deductionsAmount + qbid).toLocaleString(), numericRight, 755 + 10, page, 10, 'right');
  draw('Line 15 - Taxable income', taxable.toLocaleString(), numericRight, 770 + 10, page, 10, 'right');

  // Page 2 - Tax and Credits
  draw('Line 16 - Tax', tax.toLocaleString(), numericRight, 90 + 10, page2, 10, 'right');
  if (payload?.tax?.form8814) {
    draw('Form 8814', 'X', 470, 90 + 10, page2, 12, 'center');
  }
  if (payload?.tax?.form4972) {
    draw('Form 4972', 'X', 500, 90 + 10, page2, 12, 'center');
  }
  if (payload?.tax?.otherForm) {
    draw('Other form', 'X', 530, 90 + 10, page2, 12, 'center');
  }
  draw('Line 17 - Sch 2 line 3', sch2Line3.toLocaleString(), numericRight, 105 + 10, page2, 10, 'right');
  draw('Line 18 - Add 16+17', beforeCredits.toLocaleString(), numericRight, 120 + 10, page2, 10, 'right');
  draw('Line 19 - Child tax credit', nonRefundable.toLocaleString(), numericRight, 135 + 10, page2, 10, 'right');
  draw('Line 20 - Sch 3 line 8', '0', numericRight, 150 + 10, page2, 10, 'right');
  draw('Line 21 - Add 19+20', nonRefundable.toLocaleString(), numericRight, 165 + 10, page2, 10, 'right');
  draw('Line 22 - Subtract 21 from 18', afterCredits.toLocaleString(), numericRight, 180 + 10, page2, 10, 'right');
  draw('Line 23 - Other taxes', otherTaxes.toLocaleString(), numericRight, 195 + 10, page2, 10, 'right');
  draw('Line 24 - Total tax', totalTax.toLocaleString(), numericRight, 210 + 10, page2, 10, 'right');

  // Payments
  draw('Line 25a - W-2 withheld', '0', numericRight, 225 + 10, page2, 10, 'right');
  draw('Line 25b - 1099 withheld', '0', numericRight, 240 + 10, page2, 10, 'right');
  draw('Line 25c - Other withheld', '0', numericRight, 255 + 10, page2, 10, 'right');
  draw('Line 25d - Total withheld', '0', numericRight, 270 + 10, page2, 10, 'right');
  draw('Line 26 - Estimated payments', '0', numericRight, 285 + 10, page2, 10, 'right');
  draw('Line 27 - EIC', '0', numericRight, 300 + 10, page2, 10, 'right');
  draw('Line 28 - Additional child tax', refundable.toLocaleString(), numericRight, 315 + 10, page2, 10, 'right');
  draw('Line 29 - American opportunity', '0', numericRight, 330 + 10, page2, 10, 'right');
  draw('Line 30 - Reserved', '—', numericRight, 345 + 10, page2, 10, 'right');
  draw('Line 31 - Sch 3 line 15', '0', numericRight, 360 + 10, page2, 10, 'right');
  draw('Line 32 - Total other payments', refundable.toLocaleString(), numericRight, 375 + 10, page2, 10, 'right');
  draw('Line 33 - Total payments', totalPayments.toLocaleString(), numericRight, 390 + 10, page2, 10, 'right');

  // Refund/Owe
  draw('Line 34 - Overpaid', overpaid.toLocaleString(), numericRight, 405 + 10, page2, 10, 'right');
  draw('Line 35a - Refund', overpaid.toLocaleString(), numericRight, 420 + 10, page2, 10, 'right');
  if (payload?.refund?.form8888) {
    draw('Form 8888 attached', 'X', 500, 420 + 10, page2, 12, 'center');
  }
  draw('Routing number', payload?.bank?.routing || '—', 130, 435 + 10, page2);
  if (payload?.bank?.type === 'Checking') {
    draw('Checking', 'X', 330, 435 + 10, page2, 12, 'center');
  } else if (payload?.bank?.type === 'Savings') {
    draw('Savings', 'X', 430, 435 + 10, page2, 12, 'center');
  }
  draw('Account number', payload?.bank?.account || '—', 480, 435 + 10, page2);
  draw('Line 36 - Applied to 2025', '0', numericRight, 450 + 10, page2, 10, 'right');
  draw('Line 37 - Amount owed', balanceDue.toLocaleString(), numericRight, 465 + 10, page2, 10, 'right');
  draw('Line 38 - Estimated tax penalty', '0', numericRight, 480 + 10, page2, 10, 'right');

  // Third Party Designee
  if (payload?.thirdParty?.allow) {
    draw('Third Party Yes', 'X', 520, 495 + 10, page2, 12, 'center');
  } else {
    draw('Third Party No', 'X', 560, 495 + 10, page2, 12, 'center');
  }
  draw('Designee’s name', payload?.thirdParty?.name || '—', 70, 510 + 10, page2);
  draw('Phone no.', payload?.thirdParty?.phone || '—', 280, 510 + 10, page2);
  draw('PIN', payload?.thirdParty?.pin || '—', 430, 510 + 10, page2);

  // Signatures
  const submitDate = new Date(payload?.metadata?.submittedAt || Date.now()).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  draw('Your signature', payload?.taxpayer?.fullName || '—', 70, 525 + 10, page2);
  draw('Date', submitDate, 280, 525 + 10, page2);
  draw('Your occupation', payload?.taxpayer?.occupation || '—', 330, 525 + 10, page2);
  draw('Identity PIN (you)', payload?.identityVerification?.irsPIN || '—', 480, 525 + 10, page2);
  draw('Spouse’s signature', payload?.taxpayer?.spouse?.name || '—', 70, 540 + 10, page2);
  draw('Spouse date', submitDate, 280, 540 + 10, page2);
  draw('Spouse occupation', payload?.taxpayer?.spouse?.occupation || '—', 330, 540 + 10, page2);
  draw('Identity PIN (spouse)', payload?.identityVerification?.spousePIN || '—', 480, 540 + 10, page2);
  draw('Phone no.', payload?.contact?.phone || '—', 70, 555 + 10, page2);
  draw('Email address', payload?.metadata?.contactEmail || '—', 180, 555 + 10, page2);

  // Preparer
  draw('Preparer’s name', payload?.preparer?.name || '—', 70, 570 + 10, page2);
  draw('Preparer’s signature', payload?.preparer?.signature || '—', 180, 570 + 10, page2);
  draw('Date', submitDate, 380, 570 + 10, page2);
  draw('PTIN', payload?.preparer?.ptin || '—', 430, 570 + 10, page2);
  if (payload?.preparer?.selfEmployed) {
    draw('Self-employed', 'X', 530, 570 + 10, page2, 12, 'center');
  }
  draw('Firm’s name', payload?.preparer?.firmName || '—', 70, 585 + 10, page2);
  draw('Firm phone', payload?.preparer?.phone || '—', 430, 585 + 10, page2);
  draw('Firm’s address', payload?.preparer?.address || '—', 70, 600 + 10, page2);
  draw('Firm’s EIN', payload?.preparer?.ein || '—', 430, 600 + 10, page2);

  return pdfDoc;
}