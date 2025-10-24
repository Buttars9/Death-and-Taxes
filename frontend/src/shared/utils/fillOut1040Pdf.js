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
  draw('Tax year beginning', '', 290, 92); // Adjusted -3
  draw('Tax year ending', '', 440, 92); // Adjusted -3

  // Taxpayer identity (Page 1)
  const taxpayerNameParts = payload?.taxpayer?.fullName?.split(' ') || [];
  const taxpayerFirstMiddle = taxpayerNameParts.slice(0, -1).join(' ') || '';
  const taxpayerLast = taxpayerNameParts.pop() || '';
  draw('Your first name and middle initial', taxpayerFirstMiddle, 70, 107); // Adjusted -3
  draw('Last name', taxpayerLast, 280, 107); // Adjusted -3
  draw('Your social security number', payload?.taxpayer?.ssn || '', 480, 107, page, 9, 'right'); // Adjusted -3
  const spouseNameParts = payload?.taxpayer?.spouse?.name?.split(' ') || [];
  const spouseFirstMiddle = spouseNameParts.slice(0, -1).join(' ') || '';
  const spouseLast = spouseNameParts.pop() || '';
  draw('Spouse’s first name and middle initial', spouseFirstMiddle, 70, 122); // Adjusted -3
  draw('Spouse last name', spouseLast, 280, 122); // Adjusted -3
  draw('Spouse’s social security number', payload?.taxpayer?.spouse?.ssn || '', 480, 122, page, 9, 'right'); // Adjusted -3
  draw('Home address', payload?.taxpayer?.address || '', 70, 137); // Adjusted -3
  draw('Apt. no.', payload?.taxpayer?.aptNo || '', 480, 137, page, 9, 'right'); // Adjusted -3
  draw('City, town, or post office', payload?.taxpayer?.city || '', 70, 152); // Adjusted -3
  draw('State', payload?.taxpayer?.residentState?.toUpperCase().slice(0, 2) || '', 430, 152); // Adjusted -3
  draw('ZIP code', payload?.taxpayer?.zip || '', 500, 152, page, 9, 'right'); // Adjusted -3
  draw('Foreign country name', payload?.taxpayer?.foreignCountry || '', 70, 167); // Adjusted -3
  draw('Foreign province/state/county', payload?.taxpayer?.foreignProvince || '', 280, 167); // Adjusted -3
  draw('Foreign postal code', payload?.taxpayer?.foreignPostal || '', 480, 167, page, 9, 'right'); // Adjusted -3

  // Presidential Election Campaign checkboxes
  if (payload?.presidentialCampaign?.you) {
    draw('Presidential You', 'X', 570, 192, page, 12, 'center'); // Adjusted -3
  }
  if (payload?.presidentialCampaign?.spouse) {
    draw('Presidential Spouse', 'X', 600, 192, page, 12, 'center'); // Adjusted -3
  }

  // Filing Status checkboxes
  const filingMap = { 'single': {x: 70, y: 207}, 'marriedjointly': {x: 70, y: 222}, 'marriedseparately': {x: 70, y: 237}, 'headofhousehold': {x: 70, y: 252}, 'qualifyingsurvivingspouse': {x: 70, y: 267} }; // Adjusted -3
  const fsPos = filingMap[fsKey] || {x: 70, y: 207};
  draw(`Filing Status - ${payload?.taxpayer?.filingStatus || ''}`, 'X', fsPos.x, fsPos.y, page, 12, 'center');
  draw('Spouse/Child name for MFS/HOH/QSS', payload?.taxpayer?.qualifyingName || '', 70, 267); // Adjusted -3

  // Nonresident alien spouse
  if (payload?.taxpayer?.nonresidentSpouse) {
    draw('Nonresident spouse check', 'X', 70, 282, page, 12, 'center'); // Adjusted -3
    draw('Nonresident spouse name', payload.taxpayer.nonresidentSpouseName || '', 130, 282); // Adjusted -3
  }

  // Digital Assets (assume No if not specified)
  const digitalYes = payload?.digitalAssets?.yes ?? false;
  draw('Digital Assets - ' + (digitalYes ? 'Yes' : 'No'), 'X', digitalYes ? 530 : 570, 297, page, 12, 'center'); // Adjusted -3

  // Standard Deduction checkboxes
  if (payload?.standardDeduction?.youDependent) {
    draw('You as dependent', 'X', 70, 312, page, 12, 'center'); // Adjusted -3
  }
  if (payload?.standardDeduction?.spouseDependent) {
    draw('Spouse as dependent', 'X', 230, 312, page, 12, 'center'); // Adjusted -3
  }
  if (payload?.standardDeduction?.spouseItemizes) {
    draw('Spouse itemizes/dual-status', 'X', 70, 327, page, 12, 'center'); // Adjusted -3
  }

  // Age/Blindness
  const youBornBefore = youDOB && youDOB < bornBeforeDate;
  const spouseBornBefore = spouseDOB && spouseDOB < bornBeforeDate;
  if (youBornBefore) draw('You born before Jan 2, 1960', 'X', 70, 342, page, 12, 'center'); // Adjusted -3
  if (payload?.ageBlindness?.youBlind) draw('You blind', 'X', 230, 342, page, 12, 'center'); // Adjusted -3
  if (spouseBornBefore) draw('Spouse born before Jan 2, 1960', 'X', 330, 342, page, 12, 'center'); // Adjusted -3
  if (payload?.ageBlindness?.spouseBlind) draw('Spouse blind', 'X', 480, 342, page, 12, 'center'); // Adjusted -3

  // Dependents
  if (payload?.taxpayer?.dependents?.length > 4) {
    draw('More than four dependents', 'X', 580, 357, page, 12, 'center'); // Adjusted -3
  }
  if (payload?.taxpayer?.dependents && payload.taxpayer.dependents.length > 0) {
    payload.taxpayer.dependents.forEach((dep, index) => {
      const y = 372 + index * 15 + 5; // Adjusted -3
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
  draw('Line 1a - Wages', totalIncome, numericRight, 428, page, 9, 'right'); // Adjusted +3
  draw('Line 1b - Household employee wages', '0', numericRight, 443, page, 9, 'right'); // Adjusted +3
  draw('Line 1c - Tip income', '0', numericRight, 458, page, 9, 'right'); // Adjusted +3
  draw('Line 1d - Medicaid waiver', '0', numericRight, 473, page, 9, 'right'); // Adjusted +3
  draw('Line 1e - Dependent care benefits', '0', numericRight, 488, page, 9, 'right'); // Adjusted +3
  draw('Line 1f - Adoption benefits', '0', numericRight, 503, page, 9, 'right'); // Adjusted +3
  draw('Line 1g - Form 8919 wages', '0', numericRight, 518, page, 9, 'right'); // Adjusted +3
  draw('Line 1h - Other earned income', '0', numericRight, 533, page, 9, 'right'); // Adjusted +3
  draw('Line 1i - Nontaxable combat pay', '0', 470, 548, page, 9, 'right'); // Adjusted +3
  draw('Line 1z - Add 1a-1h', totalIncome, numericRight, 548, page, 9, 'right'); // Adjusted +3
  draw('Line 2a - Tax-exempt interest', '0', 230, 563, page, 9, 'right'); // Adjusted +3
  draw('Line 2b - Taxable interest', '0', numericRight, 563, page, 9, 'right'); // Adjusted +3
  draw('Line 3a - Qualified dividends', '0', 230, 578, page, 9, 'right'); // Adjusted +3
  draw('Line 3b - Ordinary dividends', '0', numericRight, 578, page, 9, 'right'); // Adjusted +3
  draw('Line 4a - IRA distributions', '0', 230, 593, page, 9, 'right'); // Adjusted +3
  draw('Line 4b - Taxable IRA', '0', numericRight, 593, page, 9, 'right'); // Adjusted +3
  draw('Line 5a - Pensions/annuities', '0', 230, 608, page, 9, 'right'); // Adjusted +3
  draw('Line 5b - Taxable pensions', '0', numericRight, 608, page, 9, 'right'); // Adjusted +3
  draw('Line 6a - Social security', '0', 230, 623, page, 9, 'right'); // Adjusted +3
  draw('Line 6b - Taxable social security', '0', numericRight, 623, page, 9, 'right'); // Adjusted +3
  if (payload?.income?.lumpSumElection) {
    draw('Lump-sum election', 'X', 560, 638, page, 12, 'center'); // Adjusted +3
  }
  draw('Line 7 - Capital gain/loss', '0', numericRight, 638, page, 9, 'right'); // Adjusted +3
  if (payload?.income?.noScheduleD) {
    draw('No Schedule D', 'X', 510, 638, page, 12, 'center'); // Adjusted +3
  }
  draw('Line 8 - Additional income', '0', numericRight, 653, page, 9, 'right'); // Adjusted +3
  draw('Line 9 - Add lines 1z, 2b, 3b, 4b, 5b, 6b, 7, and 8. This is your total income', totalIncome.toLocaleString(), numericRight, 668, page, 9, 'right'); // Adjusted +3

  // Adjustments and AGI
  draw('Line 10 - Adjustments', adjustments, numericRight, 683, page, 9, 'right'); // Adjusted +3
  draw('Line 11 - AGI', agi.toLocaleString(), numericRight, 698, page, 9, 'right'); // Adjusted +3
  draw('Line 12 - Deductions', deductionsAmount.toLocaleString(), numericRight, 713, page, 9, 'right'); // Adjusted +3
  draw('Line 13 - QBID', qbid, numericRight, 728, page, 9, 'right'); // Adjusted +3
  draw('Line 14 - Add lines 12 and 13', (deductionsAmount + qbid).toLocaleString(), numericRight, 743, page, 9, 'right'); // Adjusted +3
  draw('Line 15 - Taxable income', taxable.toLocaleString(), numericRight, 758, page, 9, 'right'); // Adjusted +3

  // Page 2 - Tax and Credits
  draw('Line 16 - Tax', tax.toLocaleString(), numericRight, 88, page2, 9, 'right'); // Adjusted +3
  if (payload?.tax?.form8814) {
    draw('Form 8814', 'X', 470, 88, page2, 12, 'center'); // Adjusted +3
  }
  if (payload?.tax?.form4972) {
    draw('Form 4972', 'X', 500, 88, page2, 12, 'center'); // Adjusted +3
  }
  if (payload?.tax?.otherForm) {
    draw('Other form', 'X', 530, 88, page2, 12, 'center'); // Adjusted +3
  }
  draw('Line 17 - Sch 2 line 3', sch2Line3.toLocaleString(), numericRight, 103, page2, 9, 'right'); // Adjusted +3
  draw('Line 18 - Add lines 16 and 17', beforeCredits.toLocaleString(), numericRight, 118, page2, 9, 'right'); // Adjusted +3
  draw('Line 19 - Child tax credit', nonRefundable.toLocaleString(), numericRight, 133, page2, 9, 'right'); // Adjusted +3
  draw('Line 20 - Sch 3 line 8', '0', numericRight, 148, page2, 9, 'right'); // Adjusted +3
  draw('Line 21 - Add lines 19 and 20', nonRefundable.toLocaleString(), numericRight, 163, page2, 9, 'right'); // Adjusted +3
  draw('Line 22 - Subtract line 21 from line 18. If zero or less, enter -0-', afterCredits.toLocaleString(), numericRight, 178, page2, 9, 'right'); // Adjusted +3
  draw('Line 23 - Other taxes', otherTaxes.toLocaleString(), numericRight, 193, page2, 9, 'right'); // Adjusted +3
  draw('Line 24 - Add lines 22 and 23. This is your total tax', totalTax.toLocaleString(), numericRight, 208, page2, 9, 'right'); // Adjusted +3

  // Payments
  draw('Line 25a - W-2 withheld', '0', numericRight, 223, page2, 9, 'right'); // Adjusted +3
  draw('Line 25b - 1099 withheld', '0', numericRight, 238, page2, 9, 'right'); // Adjusted +3
  draw('Line 25c - Other withheld', '0', numericRight, 253, page2, 9, 'right'); // Adjusted +3
  draw('Line 25d - Total withheld', '0', numericRight, 268, page2, 9, 'right'); // Adjusted +3
  draw('Line 26 - Estimated payments', '0', numericRight, 283, page2, 9, 'right'); // Adjusted +3
  draw('Line 27 - EIC', '0', numericRight, 298, page2, 9, 'right'); // Adjusted +3
  draw('Line 28 - Additional child tax', refundable.toLocaleString(), numericRight, 313, page2, 9, 'right'); // Adjusted +3
  draw('Line 29 - American opportunity', '0', numericRight, 328, page2, 9, 'right'); // Adjusted +3
  draw('Line 30 - Reserved', '', numericRight, 343, page2, 9, 'right'); // Blank
  draw('Line 31 - Sch 3 line 15', '0', numericRight, 358, page2, 9, 'right'); // Adjusted +3
  draw('Line 32 - Total other payments', refundable.toLocaleString(), numericRight, 373, page2, 9, 'right'); // Adjusted +3
  draw('Line 33 - Total payments', totalPayments.toLocaleString(), numericRight, 388, page2, 9, 'right'); // Adjusted +3

  // Refund/Owe
  draw('Line 34 - Overpaid', overpaid.toLocaleString(), numericRight, 403, page2, 9, 'right'); // Adjusted +3
  draw('Line 35a - Refund', overpaid.toLocaleString(), numericRight, 418, page2, 9, 'right'); // Adjusted +3
  if (payload?.refund?.form8888) {
    draw('Form 8888 attached', 'X', 500, 418, page2, 12, 'center'); // Adjusted +3
  }
  draw('Routing number', payload?.bank?.routing || '', 130, 433, page2); // Adjusted +3
  if (payload?.bank?.type === 'Checking') {
    draw('Checking', 'X', 330, 433, page2, 12, 'center'); // Adjusted +3
  } else if (payload?.bank?.type === 'Savings') {
    draw('Savings', 'X', 430, 433, page2, 12, 'center'); // Adjusted +3
  }
  draw('Account number', payload?.bank?.account || '', 480, 433, page2); // Adjusted +3
  draw('Line 36 - Applied to 2025', '0', numericRight, 448, page2, 9, 'right'); // Adjusted +3
  draw('Line 37 - Amount owed', balanceDue.toLocaleString(), numericRight, 463, page2, 9, 'right'); // Adjusted +3
  draw('Line 38 - Estimated tax penalty', '0', numericRight, 478, page2, 9, 'right'); // Adjusted +3

  // Third Party Designee
  if (payload?.thirdParty?.allow) {
    draw('Third Party Yes', 'X', 520, 505, page2, 12, 'center'); // No change, as looked good
  } else {
    draw('Third Party No', 'X', 560, 505, page2, 12, 'center'); // No change
  }
  draw('Designee’s name', payload?.thirdParty?.name || '', 70, 520, page2); // No change
  draw('Phone no.', payload?.thirdParty?.phone || '', 280, 520, page2); // No change
  draw('PIN', payload?.thirdParty?.pin || '', 430, 520, page2); // No change

  // Signatures
  const submitDate = new Date(payload?.metadata?.submittedAt || Date.now()).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  draw('Your signature', payload?.taxpayer?.fullName || '', 70, 525, page2); // No change
  draw('Date', submitDate, 280, 525, page2); // No change
  draw('Your occupation', payload?.taxpayer?.occupation || '', 330, 525, page2); // No change
  draw('Identity PIN (you)', payload?.identityVerification?.irsPIN || '', 480, 525, page2, 9, 'right'); // No change
  draw('Spouse’s signature', payload?.taxpayer?.spouse?.name || '', 70, 540, page2); // No change
  draw('Spouse date', submitDate, 280, 540, page2); // No change
  draw('Spouse occupation', payload?.taxpayer?.spouse?.occupation || '', 330, 540, page2); // No change
  draw('Identity PIN (spouse)', payload?.identityVerification?.spousePIN || '', 480, 540, page2, 9, 'right'); // No change
  draw('Phone no.', payload?.contact?.phone || '', 70, 555, page2); // No change
  draw('Email address', payload?.metadata?.contactEmail || '', 180, 555, page2); // No change

  // Preparer
  draw('Preparer’s name', payload?.preparer?.name || '', 70, 565, page2); // No change
  draw('Preparer’s signature', payload?.preparer?.signature || '', 180, 565, page2); // No change
  draw('Date', submitDate, 380, 565, page2); // No change
  draw('PTIN', payload?.preparer?.ptin || '', 430, 565, page2, 9, 'right'); // No change
  if (payload?.preparer?.selfEmployed) {
    draw('Self-employed', 'X', 530, 565, page2, 12, 'center'); // No change
  }
  draw('Firm’s name', payload?.preparer?.firmName || '', 70, 580, page2); // No change
  draw('Firm phone', payload?.preparer?.phone || '', 430, 580, page2); // No change
  draw('Firm’s address', payload?.preparer?.address || '', 70, 595, page2); // No change
  draw('Firm’s EIN', payload?.preparer?.ein || '', 430, 595, page2, 9, 'right'); // No change

  return pdfDoc;
}