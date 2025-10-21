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

  const draw = (label, value, x, yFromTop, p = page, size = 9, align = 'left') => {
    const offset = Math.floor(size * 1.2); // Increased offset for better vertical alignment
    const adjustedY = pageHeight - yFromTop - offset;
    let adjustedX = x;
    if (align === 'right') {
      const width = font.widthOfTextAtSize(String(value), size);
      adjustedX -= width + 5; // Slight adjustment for right-align padding
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
  draw('Your first name and middle initial', taxpayerFirstMiddle, 70, 105); // Adjusted y
  draw('Last name', taxpayerLast, 280, 105); // Adjusted y
  draw('Your social security number', payload?.taxpayer?.ssn || '—', 480, 105); // Adjusted y
  const spouseNameParts = payload?.taxpayer?.spouse?.name?.split(' ') || [];
  const spouseFirstMiddle = spouseNameParts.slice(0, -1).join(' ') || '—';
  const spouseLast = spouseNameParts.pop() || '—';
  draw('Spouse’s first name and middle initial', spouseFirstMiddle, 70, 120); // Adjusted y
  draw('Spouse last name', spouseLast, 280, 120); // Adjusted y
  draw('Spouse’s social security number', payload?.taxpayer?.spouse?.ssn || '—', 480, 120); // Adjusted y
  draw('Home address', payload?.taxpayer?.address || '—', 70, 135); // Adjusted y
  draw('Apt. no.', payload?.taxpayer?.aptNo || '—', 480, 135); // Adjusted y
  draw('City, town, or post office', payload?.taxpayer?.city || '—', 70, 150); // Adjusted y
  draw('State', payload?.taxpayer?.residentState?.toUpperCase().slice(0, 2) || '—', 430, 150); // Adjusted y
  draw('ZIP code', payload?.taxpayer?.zip || '—', 500, 150); // Adjusted y
  draw('Foreign country name', payload?.taxpayer?.foreignCountry || '—', 70, 165); // Adjusted y
  draw('Foreign province/state/county', payload?.taxpayer?.foreignProvince || '—', 280, 165); // Adjusted y
  draw('Foreign postal code', payload?.taxpayer?.foreignPostal || '—', 480, 165); // Adjusted y

  // Presidential Election Campaign checkboxes
  if (payload?.presidentialCampaign?.you) {
    draw('Presidential You', 'X', 570, 190, page, 12, 'center'); // Adjusted y
  }
  if (payload?.presidentialCampaign?.spouse) {
    draw('Presidential Spouse', 'X', 600, 190, page, 12, 'center'); // Adjusted y
  }

  // Filing Status checkboxes
  const filingMap = { 'single': {x: 70, y: 205}, 'marriedjointly': {x: 70, y: 220}, 'marriedseparately': {x: 70, y: 235}, 'headofhousehold': {x: 70, y: 250}, 'qualifyingsurvivingspouse': {x: 70, y: 265} }; // Adjusted y
  const fsPos = filingMap[fsKey] || {x: 70, y: 205};
  draw(`Filing Status - ${payload?.taxpayer?.filingStatus || ''}`, 'X', fsPos.x, fsPos.y, page, 12, 'center');
  draw('Spouse/Child name for MFS/HOH/QSS', payload?.taxpayer?.qualifyingName || '—', 70, 265);

  // Nonresident alien spouse
  if (payload?.taxpayer?.nonresidentSpouse) {
    draw('Nonresident spouse check', 'X', 70, 280, page, 12, 'center'); // Adjusted y
    draw('Nonresident spouse name', payload.taxpayer.nonresidentSpouseName || '—', 130, 280);
  }

  // Digital Assets (assume No if not specified)
  const digitalYes = payload?.digitalAssets?.yes ?? false;
  draw('Digital Assets - ' + (digitalYes ? 'Yes' : 'No'), 'X', digitalYes ? 530 : 570, 295, page, 12, 'center'); // Adjusted y

  // Standard Deduction checkboxes
  if (payload?.standardDeduction?.youDependent) {
    draw('You as dependent', 'X', 70, 310, page, 12, 'center'); // Adjusted y
  }
  if (payload?.standardDeduction?.spouseDependent) {
    draw('Spouse as dependent', 'X', 230, 310, page, 12, 'center'); // Adjusted y
  }
  if (payload?.standardDeduction?.spouseItemizes) {
    draw('Spouse itemizes/dual-status', 'X', 70, 325, page, 12, 'center'); // Adjusted y
  }

  // Age/Blindness
  const youBornBefore = youDOB && youDOB < bornBeforeDate;
  const spouseBornBefore = spouseDOB && spouseDOB < bornBeforeDate;
  if (youBornBefore) draw('You born before Jan 2, 1960', 'X', 70, 340, page, 12, 'center'); // Adjusted y
  if (payload?.ageBlindness?.youBlind) draw('You blind', 'X', 230, 340, page, 12, 'center'); // Adjusted y
  if (spouseBornBefore) draw('Spouse born before Jan 2, 1960', 'X', 330, 340, page, 12, 'center'); // Adjusted y
  if (payload?.ageBlindness?.spouseBlind) draw('Spouse blind', 'X', 480, 340, page, 12, 'center'); // Adjusted y

  // Dependents
  if (payload?.taxpayer?.dependents?.length > 4) {
    draw('More than four dependents', 'X', 580, 355, page, 12, 'center'); // Adjusted y
  }
  if (payload?.taxpayer?.dependents && payload.taxpayer.dependents.length > 0) {
    payload.taxpayer.dependents.forEach((dep, index) => {
      const y = 370 + index * 15 + 5; // Adjusted slightly
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
  draw('Line 1a - Wages', totalIncome, numericRight, 445 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 1b - Household employee wages', '0', numericRight, 460 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 1c - Tip income', '0', numericRight, 475 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 1d - Medicaid waiver', '0', numericRight, 490 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 1e - Dependent care benefits', '0', numericRight, 505 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 1f - Adoption benefits', '0', numericRight, 520 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 1g - Form 8919 wages', '0', numericRight, 535 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 1h - Other earned income', '0', numericRight, 550 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 1i - Nontaxable combat pay', '0', 470, 565 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 1z - Add 1a-1h', totalIncome, numericRight, 565 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 2a - Tax-exempt interest', '0', 230, 580 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 2b - Taxable interest', '0', numericRight, 580 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 3a - Qualified dividends', '0', 230, 595 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 3b - Ordinary dividends', '0', numericRight, 595 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 4a - IRA distributions', '0', 230, 610 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 4b - Taxable IRA', '0', numericRight, 610 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 5a - Pensions/annuities', '0', 230, 625 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 5b - Taxable pensions', '0', numericRight, 625 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 6a - Social security', '0', 230, 640 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 6b - Taxable social security', '0', numericRight, 640 + 10, page, 10, 'right'); // Adjusted y
  if (payload?.income?.lumpSumElection) {
    draw('Lump-sum election', 'X', 560, 655 + 10, page, 12, 'center'); // Adjusted y
  }
  draw('Line 7 - Capital gain/loss', '0', numericRight, 655 + 10, page, 10, 'right'); // Adjusted y
  if (payload?.income?.noScheduleD) {
    draw('No Schedule D', 'X', 510, 655 + 10, page, 12, 'center'); // Adjusted y
  }
  draw('Line 8 - Additional income', '0', numericRight, 670 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 9 - Add lines 1z, 2b, 3b, 4b, 5b, 6b, 7, and 8. This is your total income', totalIncome.toLocaleString(), numericRight, 685 + 10, page, 10, 'right'); // Adjusted y

  // Adjustments and AGI
  draw('Line 10 - Adjustments', adjustments, numericRight, 700 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 11 - AGI', agi.toLocaleString(), numericRight, 715 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 12 - Deductions', deductionsAmount.toLocaleString(), numericRight, 730 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 13 - QBID', qbid, numericRight, 745 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 14 - Add lines 12 and 13', (deductionsAmount + qbid).toLocaleString(), numericRight, 760 + 10, page, 10, 'right'); // Adjusted y
  draw('Line 15 - Taxable income', taxable.toLocaleString(), numericRight, 775 + 10, page, 10, 'right'); // Adjusted y

  // Page 2 - Tax and Credits
  draw('Line 16 - Tax', tax.toLocaleString(), numericRight, 95 + 10, page2, 10, 'right'); // Adjusted y
  if (payload?.tax?.form8814) {
    draw('Form 8814', 'X', 470, 95 + 10, page2, 12, 'center'); // Adjusted y
  }
  if (payload?.tax?.form4972) {
    draw('Form 4972', 'X', 500, 95 + 10, page2, 12, 'center'); // Adjusted y
  }
  if (payload?.tax?.otherForm) {
    draw('Other form', 'X', 530, 95 + 10, page2, 12, 'center'); // Adjusted y
  }
  draw('Line 17 - Sch 2 line 3', sch2Line3.toLocaleString(), numericRight, 110 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 18 - Add lines 16 and 17', beforeCredits.toLocaleString(), numericRight, 125 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 19 - Child tax credit', nonRefundable.toLocaleString(), numericRight, 140 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 20 - Sch 3 line 8', '0', numericRight, 155 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 21 - Add lines 19 and 20', nonRefundable.toLocaleString(), numericRight, 170 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 22 - Subtract line 21 from line 18. If zero or less, enter -0-', afterCredits.toLocaleString(), numericRight, 185 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 23 - Other taxes', otherTaxes.toLocaleString(), numericRight, 200 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 24 - Add lines 22 and 23. This is your total tax', totalTax.toLocaleString(), numericRight, 215 + 10, page2, 10, 'right'); // Adjusted y

  // Payments
  draw('Line 25a - W-2 withheld', '0', numericRight, 230 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 25b - 1099 withheld', '0', numericRight, 245 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 25c - Other withheld', '0', numericRight, 260 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 25d - Total withheld', '0', numericRight, 275 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 26 - Estimated payments', '0', numericRight, 290 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 27 - EIC', '0', numericRight, 305 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 28 - Additional child tax', refundable.toLocaleString(), numericRight, 320 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 29 - American opportunity', '0', numericRight, 335 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 30 - Reserved', '—', numericRight, 350 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 31 - Sch 3 line 15', '0', numericRight, 365 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 32 - Total other payments', refundable.toLocaleString(), numericRight, 380 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 33 - Total payments', totalPayments.toLocaleString(), numericRight, 395 + 10, page2, 10, 'right'); // Adjusted y

  // Refund/Owe
  draw('Line 34 - Overpaid', overpaid.toLocaleString(), numericRight, 410 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 35a - Refund', overpaid.toLocaleString(), numericRight, 425 + 10, page2, 10, 'right'); // Adjusted y
  if (payload?.refund?.form8888) {
    draw('Form 8888 attached', 'X', 500, 425 + 10, page2, 12, 'center'); // Adjusted y
  }
  draw('Routing number', payload?.bank?.routing || '—', 130, 440 + 10, page2); // Adjusted y
  if (payload?.bank?.type === 'Checking') {
    draw('Checking', 'X', 330, 440 + 10, page2, 12, 'center'); // Adjusted y
  } else if (payload?.bank?.type === 'Savings') {
    draw('Savings', 'X', 430, 440 + 10, page2, 12, 'center'); // Adjusted y
  }
  draw('Account number', payload?.bank?.account || '—', 480, 440 + 10, page2); // Adjusted y
  draw('Line 36 - Applied to 2025', '0', numericRight, 455 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 37 - Amount owed', balanceDue.toLocaleString(), numericRight, 470 + 10, page2, 10, 'right'); // Adjusted y
  draw('Line 38 - Estimated tax penalty', '0', numericRight, 485 + 10, page2, 10, 'right'); // Adjusted y

  // Third Party Designee
  if (payload?.thirdParty?.allow) {
    draw('Third Party Yes', 'X', 520, 500 + 10, page2, 12, 'center'); // Adjusted y
  } else {
    draw('Third Party No', 'X', 560, 500 + 10, page2, 12, 'center'); // Adjusted y
  }
  draw('Designee’s name', payload?.thirdParty?.name || '—', 70, 515 + 10, page2); // Adjusted y
  draw('Phone no.', payload?.thirdParty?.phone || '—', 280, 515 + 10, page2); // Adjusted y
  draw('PIN', payload?.thirdParty?.pin || '—', 430, 515 + 10, page2); // Adjusted y

  // Signatures
  const submitDate = new Date(payload?.metadata?.submittedAt || Date.now()).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  draw('Your signature', payload?.taxpayer?.fullName || '—', 70, 530 + 10, page2); // Adjusted y
  draw('Date', submitDate, 280, 530 + 10, page2); // Adjusted y
  draw('Your occupation', payload?.taxpayer?.occupation || '—', 330, 530 + 10, page2); // Adjusted y
  draw('Identity PIN (you)', payload?.identityVerification?.irsPIN || '—', 480, 530 + 10, page2); // Adjusted y
  draw('Spouse’s signature', payload?.taxpayer?.spouse?.name || '—', 70, 545 + 10, page2); // Adjusted y
  draw('Spouse date', submitDate, 280, 545 + 10, page2); // Adjusted y
  draw('Spouse occupation', payload?.taxpayer?.spouse?.occupation || '—', 330, 545 + 10, page2); // Adjusted y
  draw('Identity PIN (spouse)', payload?.identityVerification?.spousePIN || '—', 480, 545 + 10, page2); // Adjusted y
  draw('Phone no.', payload?.contact?.phone || '—', 70, 560 + 10, page2); // Adjusted y
  draw('Email address', payload?.metadata?.contactEmail || '—', 180, 560 + 10, page2); // Adjusted y

  // Preparer
  draw('Preparer’s name', payload?.preparer?.name || '—', 70, 575 + 10, page2); // Adjusted y
  draw('Preparer’s signature', payload?.preparer?.signature || '—', 180, 575 + 10, page2); // Adjusted y
  draw('Date', submitDate, 380, 575 + 10, page2); // Adjusted y
  draw('PTIN', payload?.preparer?.ptin || '—', 430, 575 + 10, page2); // Adjusted y
  if (payload?.preparer?.selfEmployed) {
    draw('Self-employed', 'X', 530, 575 + 10, page2, 12, 'center'); // Adjusted y
  }
  draw('Firm’s name', payload?.preparer?.firmName || '—', 70, 590 + 10, page2); // Adjusted y
  draw('Firm phone', payload?.preparer?.phone || '—', 430, 590 + 10, page2); // Adjusted y
  draw('Firm’s address', payload?.preparer?.address || '—', 70, 605 + 10, page2); // Adjusted y
  draw('Firm’s EIN', payload?.preparer?.ein || '—', 430, 605 + 10, page2); // Adjusted y

  return pdfDoc;
}