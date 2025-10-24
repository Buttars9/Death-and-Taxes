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
    const offset = Math.floor(size * 0.8); // Reduced offset for better alignment
    const adjustedY = pageHeight - yFromTop - offset;
    let adjustedX = x;
    if (align === 'right') {
      const width = font.widthOfTextAtSize(String(value), size);
      adjustedX -= width + 2; // Slight padding for right-align
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
  draw('Tax year beginning', '', 290, 110);
  draw('Tax year ending', '', 440, 110);

  // Taxpayer identity (Page 1)
  const taxpayerNameParts = payload?.taxpayer?.fullName?.split(' ') || [];
  const taxpayerFirstMiddle = taxpayerNameParts.slice(0, -1).join(' ') || '';
  const taxpayerLast = taxpayerNameParts.pop() || '';
  draw('Your first name and middle initial', taxpayerFirstMiddle, 70, 110);
  draw('Last name', taxpayerLast, 280, 110);
  draw('Your social security number', payload?.taxpayer?.ssn || '', 480, 110, page, 9, 'right');
  const spouseNameParts = payload?.taxpayer?.spouse?.name?.split(' ') || [];
  const spouseFirstMiddle = spouseNameParts.slice(0, -1).join(' ') || '';
  const spouseLast = spouseNameParts.pop() || '';
  draw('Spouse’s first name and middle initial', spouseFirstMiddle, 70, 130);
  draw('Spouse last name', spouseLast, 280, 130);
  draw('Spouse’s social security number', payload?.taxpayer?.spouse?.ssn || '', 480, 130, page, 9, 'right');
  draw('Home address', payload?.taxpayer?.address || '', 70, 150);
  draw('Apt. no.', payload?.taxpayer?.aptNo || '', 480, 150, page, 9, 'right');
  draw('City, town, or post office', payload?.taxpayer?.city || '', 70, 170);
  draw('State', payload?.taxpayer?.residentState?.toUpperCase().slice(0, 2) || '', 430, 170);
  draw('ZIP code', payload?.taxpayer?.zip || '', 500, 170, page, 9, 'right');
  draw('Foreign country name', payload?.taxpayer?.foreignCountry || '', 70, 190);
  draw('Foreign province/state/county', payload?.taxpayer?.foreignProvince || '', 280, 190);
  draw('Foreign postal code', payload?.taxpayer?.foreignPostal || '', 480, 190, page, 9, 'right');

  // Presidential Election Campaign checkboxes
  if (payload?.presidentialCampaign?.you) {
    draw('Presidential You', 'X', 570, 210, page, 12, 'center');
  }
  if (payload?.presidentialCampaign?.spouse) {
    draw('Presidential Spouse', 'X', 600, 210, page, 12, 'center');
  }

  // Filing Status checkboxes
  const filingMap = { 'single': {x: 70, y: 250}, 'marriedjointly': {x: 70, y: 270}, 'marriedseparately': {x: 70, y: 270}, 'headofhousehold': {x: 70, y: 270}, 'qualifyingsurvivingspouse': {x: 70, y: 270} };
  const fsPos = filingMap[fsKey] || {x: 70, y: 250};
  draw(`Filing Status - ${payload?.taxpayer?.filingStatus || ''}`, 'X', fsPos.x, fsPos.y, page, 12, 'center');
  draw('Spouse/Child name for MFS/HOH/QSS', payload?.taxpayer?.qualifyingName || '', 70, 290);

  // Nonresident alien spouse
  if (payload?.taxpayer?.nonresidentSpouse) {
    draw('Nonresident spouse check', 'X', 70, 330, page, 12, 'center');
    draw('Nonresident spouse name', payload.taxpayer.nonresidentSpouseName || '', 130, 330);
  }

  // Digital Assets (assume No if not specified)
  const digitalYes = payload?.digitalAssets?.yes ?? false;
  draw('Digital Assets - ' + (digitalYes ? 'Yes' : 'No'), 'X', digitalYes ? 530 : 570, 350, page, 12, 'center');

  // Standard Deduction checkboxes
  if (payload?.standardDeduction?.youDependent) {
    draw('You as dependent', 'X', 70, 370, page, 12, 'center');
  }
  if (payload?.standardDeduction?.spouseDependent) {
    draw('Spouse as dependent', 'X', 230, 370, page, 12, 'center');
  }
  if (payload?.standardDeduction?.spouseItemizes) {
    draw('Spouse itemizes/dual-status', 'X', 70, 390, page, 12, 'center');
  }

  // Age/Blindness
  const youBornBefore = youDOB && youDOB < bornBeforeDate;
  const spouseBornBefore = spouseDOB && spouseDOB < bornBeforeDate;
  if (youBornBefore) draw('You born before Jan 2, 1960', 'X', 70, 410, page, 12, 'center');
  if (payload?.ageBlindness?.youBlind) draw('You blind', 'X', 230, 410, page, 12, 'center');
  if (spouseBornBefore) draw('Spouse born before Jan 2, 1960', 'X', 330, 410, page, 12, 'center');
  if (payload?.ageBlindness?.spouseBlind) draw('Spouse blind', 'X', 480, 410, page, 12, 'center');

  // Dependents
  if (payload?.taxpayer?.dependents?.length > 4) {
    draw('More than four dependents', 'X', 580, 450, page, 12, 'center');
  }
  if (payload?.taxpayer?.dependents && payload.taxpayer.dependents.length > 0) {
    payload.taxpayer.dependents.forEach((dep, index) => {
      const y = 470 + index * 20;
      draw(`Dependent ${index+1} First/Last name`, dep.name || '', 70, y);
      draw(`Dependent ${index+1} SSN`, dep.ssn || '', 280, y, page, 9, 'right');
      draw(`Dependent ${index+1} Relationship`, dep.relationship || '', 380, y);
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
  draw('Line 1a - Wages', totalIncome, numericRight, 530, page, 9, 'right');
  draw('Line 1b - Household employee wages', '0', numericRight, 540, page, 9, 'right');
  draw('Line 1c - Tip income', '0', numericRight, 550, page, 9, 'right');
  draw('Line 1d - Medicaid waiver', '0', numericRight, 560, page, 9, 'right');
  draw('Line 1e - Dependent care benefits', '0', numericRight, 570, page, 9, 'right');
  draw('Line 1f - Adoption benefits', '0', numericRight, 580, page, 9, 'right');
  draw('Line 1g - Form 8919 wages', '0', numericRight, 590, page, 9, 'right');
  draw('Line 1h - Other earned income', '0', numericRight, 600, page, 9, 'right');
  draw('Line 1i - Nontaxable combat pay', '0', 470, 610, page, 9, 'right');
  draw('Line 1z - Add 1a-1h', totalIncome, numericRight, 620, page, 9, 'right');
  draw('Line 2a - Tax-exempt interest', '0', 230, 640, page, 9, 'right');
  draw('Line 2b - Taxable interest', '0', numericRight, 650, page, 9, 'right');
  draw('Line 3a - Qualified dividends', '0', 230, 660, page, 9, 'right');
  draw('Line 3b - Ordinary dividends', '0', numericRight, 670, page, 9, 'right');
  draw('Line 4a - IRA distributions', '0', 230, 680, page, 9, 'right');
  draw('Line 4b - Taxable IRA', '0', numericRight, 690, page, 9, 'right');
  draw('Line 5a - Pensions/annuities', '0', 230, 700, page, 9, 'right');
  draw('Line 5b - Taxable pensions', '0', numericRight, 710, page, 9, 'right');
  draw('Line 6a - Social security', '0', 230, 720, page, 9, 'right');
  draw('Line 6b - Taxable social security', '0', numericRight, 730, page, 9, 'right');
  if (payload?.income?.lumpSumElection) {
    draw('Lump-sum election', 'X', 560, 740, page, 12, 'center');
  }
  draw('Line 7 - Capital gain/loss', '0', numericRight, 750, page, 9, 'right');
  if (payload?.income?.noScheduleD) {
    draw('No Schedule D', 'X', 510, 750, page, 12, 'center');
  }
  draw('Line 8 - Additional income', '0', numericRight, 760, page, 9, 'right');
  draw('Line 9 - Add lines 1z, 2b, 3b, 4b, 5b, 6b, 7, and 8. This is your total income', totalIncome.toLocaleString(), numericRight, 770, page, 9, 'right');

  // Adjustments and AGI
  draw('Line 10 - Adjustments', adjustments, numericRight, 780, page, 9, 'right');
  draw('Line 11 - AGI', agi.toLocaleString(), numericRight, 790, page, 9, 'right');
  draw('Line 12 - Deductions', deductionsAmount.toLocaleString(), numericRight, 800, page, 9, 'right');
  draw('Line 13 - QBID', qbid, numericRight, 810, page, 9, 'right');
  draw('Line 14 - Add lines 12 and 13', (deductionsAmount + qbid).toLocaleString(), numericRight, 820, page, 9, 'right');
  draw('Line 15 - Taxable income', taxable.toLocaleString(), numericRight, 830, page, 9, 'right');

  // Page 2 - Tax and Credits
  draw('Line 16 - Tax', tax.toLocaleString(), numericRight, 50, page2, 9, 'right');
  if (payload?.tax?.form8814) {
    draw('Form 8814', 'X', 470, 50, page2, 12, 'center');
  }
  if (payload?.tax?.form4972) {
    draw('Form 4972', 'X', 500, 50, page2, 12, 'center');
  }
  if (payload?.tax?.otherForm) {
    draw('Other form', 'X', 530, 50, page2, 12, 'center');
  }
  draw('Line 17 - Sch 2 line 3', sch2Line3.toLocaleString(), numericRight, 70, page2, 9, 'right');
  draw('Line 18 - Add lines 16 and 17', beforeCredits.toLocaleString(), numericRight, 90, page2, 9, 'right');
  draw('Line 19 - Child tax credit', nonRefundable.toLocaleString(), numericRight, 110, page2, 9, 'right');
  draw('Line 20 - Sch 3 line 8', '0', numericRight, 130, page2, 9, 'right');
  draw('Line 21 - Add lines 19 and 20', nonRefundable.toLocaleString(), numericRight, 150, page2, 9, 'right');
  draw('Line 22 - Subtract line 21 from line 18. If zero or less, enter -0-', afterCredits.toLocaleString(), numericRight, 170, page2, 9, 'right');
  draw('Line 23 - Other taxes', otherTaxes.toLocaleString(), numericRight, 190, page2, 9, 'right');
  draw('Line 24 - Add lines 22 and 23. This is your total tax', totalTax.toLocaleString(), numericRight, 210, page2, 9, 'right');

  // Payments
  draw('Line 25a - W-2 withheld', '0', numericRight, 250, page2, 9, 'right');
  draw('Line 25b - 1099 withheld', '0', numericRight, 270, page2, 9, 'right');
  draw('Line 25c - Other withheld', '0', numericRight, 290, page2, 9, 'right');
  draw('Line 25d - Total withheld', '0', numericRight, 310, page2, 9, 'right');
  draw('Line 26 - Estimated payments', '0', numericRight, 330, page2, 9, 'right');
  draw('Line 27 - EIC', '0', numericRight, 370, page2, 9, 'right');
  draw('Line 28 - Additional child tax', refundable.toLocaleString(), numericRight, 390, page2, 9, 'right');
  draw('Line 29 - American opportunity', '0', numericRight, 410, page2, 9, 'right');
  draw('Line 30 - Reserved', '', numericRight, 430, page2, 9, 'right');
  draw('Line 31 - Sch 3 line 15', '0', numericRight, 450, page2, 9, 'right');
  draw('Line 32 - Total other payments', refundable.toLocaleString(), numericRight, 470, page2, 9, 'right');
  draw('Line 33 - Total payments', totalPayments.toLocaleString(), numericRight, 490, page2, 9, 'right');

  // Refund/Owe
  draw('Line 34 - Overpaid', overpaid.toLocaleString(), numericRight, 530, page2, 9, 'right');
  draw('Line 35a - Refund', overpaid.toLocaleString(), numericRight, 550, page2, 9, 'right');
  if (payload?.refund?.form8888) {
    draw('Form 8888 attached', 'X', 500, 550, page2, 12, 'center');
  }
  draw('Routing number', payload?.bank?.routing || '', 130, 570, page2);
  if (payload?.bank?.type === 'Checking') {
    draw('Checking', 'X', 330, 570, page2, 12, 'center');
  } else if (payload?.bank?.type === 'Savings') {
    draw('Savings', 'X', 430, 570, page2, 12, 'center');
  }
  draw('Account number', payload?.bank?.account || '', 480, 570, page2);
  draw('Line 36 - Applied to 2025', '0', numericRight, 590, page2, 9, 'right');
  draw('Line 37 - Amount owed', balanceDue.toLocaleString(), numericRight, 630, page2, 9, 'right');
  draw('Line 38 - Estimated tax penalty', '0', numericRight, 650, page2, 9, 'right');

  // Third Party Designee
  if (payload?.thirdParty?.allow) {
    draw('Third Party Yes', 'X', 520, 670, page2, 12, 'center');
  } else {
    draw('Third Party No', 'X', 560, 670, page2, 12, 'center');
  }
  draw('Designee’s name', payload?.thirdParty?.name || '', 70, 690, page2);
  draw('Phone no.', payload?.thirdParty?.phone || '', 280, 690, page2);
  draw('PIN', payload?.thirdParty?.pin || '', 430, 690, page2);

  // Signatures
  const submitDate = new Date(payload?.metadata?.submittedAt || Date.now()).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  draw('Your signature', payload?.taxpayer?.fullName || '', 70, 680, page2);
  draw('Date', submitDate, 280, 680, page2);
  draw('Your occupation', payload?.taxpayer?.occupation || '', 330, 680, page2);
  draw('Identity PIN (you)', payload?.identityVerification?.irsPIN || '', 480, 680, page2, 9, 'right');
  draw('Spouse’s signature', payload?.taxpayer?.spouse?.name || '', 70, 700, page2);
  draw('Spouse date', submitDate, 280, 700, page2);
  draw('Spouse occupation', payload?.taxpayer?.spouse?.occupation || '', 330, 700, page2);
  draw('Identity PIN (spouse)', payload?.identityVerification?.spousePIN || '', 480, 700, page2, 9, 'right');
  draw('Phone no.', payload?.contact?.phone || '', 70, 720, page2);
  draw('Email address', payload?.metadata?.contactEmail || '', 180, 720, page2);

  // Preparer
  draw('Preparer’s name', payload?.preparer?.name || '', 70, 720, page2);
  draw('Preparer’s signature', payload?.preparer?.signature || '', 180, 720, page2);
  draw('Date', submitDate, 380, 720, page2);
  draw('PTIN', payload?.preparer?.ptin || '', 430, 720, page2, 9, 'right');
  if (payload?.preparer?.selfEmployed) {
    draw('Self-employed', 'X', 530, 720, page2, 12, 'center');
  }
  draw('Firm’s name', payload?.preparer?.firmName || '', 70, 740, page2);
  draw('Firm phone', payload?.preparer?.phone || '', 430, 740, page2);
  draw('Firm’s address', payload?.preparer?.address || '', 70, 760, page2);
  draw('Firm’s EIN', payload?.preparer?.ein || '', 430, 760, page2, 9, 'right');

  return pdfDoc;
}