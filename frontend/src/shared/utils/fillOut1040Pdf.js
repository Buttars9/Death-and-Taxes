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
  draw('Tax year beginning', '', 290, 115); // Adjusted yFromTop (+20)
  draw('Tax year ending', '', 440, 115); // Adjusted yFromTop (+20)

  // Taxpayer identity (Page 1)
  const taxpayerNameParts = payload?.taxpayer?.fullName?.split(' ') || [];
  const taxpayerFirstMiddle = taxpayerNameParts.slice(0, -1).join(' ') || '';
  const taxpayerLast = taxpayerNameParts.pop() || '';
  draw('Your first name and middle initial', taxpayerFirstMiddle, 70, 130); // Adjusted yFromTop (+20)
  draw('Last name', taxpayerLast, 280, 130); // Adjusted yFromTop (+20)
  draw('Your social security number', payload?.taxpayer?.ssn || '', 480, 130, page, 9, 'right'); // Adjusted yFromTop (+20)
  const spouseNameParts = payload?.taxpayer?.spouse?.name?.split(' ') || [];
  const spouseFirstMiddle = spouseNameParts.slice(0, -1).join(' ') || '';
  const spouseLast = spouseNameParts.pop() || '';
  draw('Spouse’s first name and middle initial', spouseFirstMiddle, 70, 145); // Adjusted yFromTop (+20)
  draw('Spouse last name', spouseLast, 280, 145); // Adjusted yFromTop (+20)
  draw('Spouse’s social security number', payload?.taxpayer?.spouse?.ssn || '', 480, 145, page, 9, 'right'); // Adjusted yFromTop (+20)
  draw('Home address', payload?.taxpayer?.address || '', 70, 160); // Adjusted yFromTop (+20)
  draw('Apt. no.', payload?.taxpayer?.aptNo || '', 480, 160, page, 9, 'right'); // Adjusted yFromTop (+20)
  draw('City, town, or post office', payload?.taxpayer?.city || '', 70, 175); // Adjusted yFromTop (+20)
  draw('State', payload?.taxpayer?.residentState?.toUpperCase().slice(0, 2) || '', 430, 175); // Adjusted yFromTop (+20)
  draw('ZIP code', payload?.taxpayer?.zip || '', 500, 175, page, 9, 'right'); // Adjusted yFromTop (+20)
  draw('Foreign country name', payload?.taxpayer?.foreignCountry || '', 70, 190); // Adjusted yFromTop (+20)
  draw('Foreign province/state/county', payload?.taxpayer?.foreignProvince || '', 280, 190); // Adjusted yFromTop (+20)
  draw('Foreign postal code', payload?.taxpayer?.foreignPostal || '', 480, 190, page, 9, 'right'); // Adjusted yFromTop (+20)

  // Presidential Election Campaign checkboxes
  if (payload?.presidentialCampaign?.you) {
    draw('Presidential You', 'X', 570, 215, page, 12, 'center'); // Adjusted yFromTop (+20)
  }
  if (payload?.presidentialCampaign?.spouse) {
    draw('Presidential Spouse', 'X', 600, 215, page, 12, 'center'); // Adjusted yFromTop (+20)
  }

  // Filing Status checkboxes
  const filingMap = { 'single': {x: 70, y: 230}, 'marriedjointly': {x: 70, y: 245}, 'marriedseparately': {x: 70, y: 260}, 'headofhousehold': {x: 70, y: 275}, 'qualifyingsurvivingspouse': {x: 70, y: 290} }; // Adjusted yFromTop (+20)
  const fsPos = filingMap[fsKey] || {x: 70, y: 230};
  draw(`Filing Status - ${payload?.taxpayer?.filingStatus || ''}`, 'X', fsPos.x, fsPos.y, page, 12, 'center');
  draw('Spouse/Child name for MFS/HOH/QSS', payload?.taxpayer?.qualifyingName || '', 70, 290); // Adjusted yFromTop (+20)

  // Nonresident alien spouse
  if (payload?.taxpayer?.nonresidentSpouse) {
    draw('Nonresident spouse check', 'X', 70, 305, page, 12, 'center'); // Adjusted yFromTop (+20)
    draw('Nonresident spouse name', payload.taxpayer.nonresidentSpouseName || '', 130, 305); // Adjusted yFromTop (+20)
  }

  // Digital Assets (assume No if not specified)
  const digitalYes = payload?.digitalAssets?.yes ?? false;
  draw('Digital Assets - ' + (digitalYes ? 'Yes' : 'No'), 'X', digitalYes ? 530 : 570, 320, page, 12, 'center'); // Adjusted yFromTop (+20)

  // Standard Deduction checkboxes
  if (payload?.standardDeduction?.youDependent) {
    draw('You as dependent', 'X', 70, 335, page, 12, 'center'); // Adjusted yFromTop (+20)
  }
  if (payload?.standardDeduction?.spouseDependent) {
    draw('Spouse as dependent', 'X', 230, 335, page, 12, 'center'); // Adjusted yFromTop (+20)
  }
  if (payload?.standardDeduction?.spouseItemizes) {
    draw('Spouse itemizes/dual-status', 'X', 70, 350, page, 12, 'center'); // Adjusted yFromTop (+20)
  }

  // Age/Blindness
  const youBornBefore = youDOB && youDOB < bornBeforeDate;
  const spouseBornBefore = spouseDOB && spouseDOB < bornBeforeDate;
  if (youBornBefore) draw('You born before Jan 2, 1960', 'X', 70, 365, page, 12, 'center'); // Adjusted yFromTop (+20)
  if (payload?.ageBlindness?.youBlind) draw('You blind', 'X', 230, 365, page, 12, 'center'); // Adjusted yFromTop (+20)
  if (spouseBornBefore) draw('Spouse born before Jan 2, 1960', 'X', 330, 365, page, 12, 'center'); // Adjusted yFromTop (+20)
  if (payload?.ageBlindness?.spouseBlind) draw('Spouse blind', 'X', 480, 365, page, 12, 'center'); // Adjusted yFromTop (+20)

  // Dependents
  if (payload?.taxpayer?.dependents?.length > 4) {
    draw('More than four dependents', 'X', 580, 380, page, 12, 'center'); // Adjusted yFromTop (+20)
  }
  if (payload?.taxpayer?.dependents && payload.taxpayer.dependents.length > 0) {
    payload.taxpayer.dependents.forEach((dep, index) => {
      const y = 395 + index * 20 + 5; // Adjusted spacing (+20 base)
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
  draw('Line 1a - Wages', totalIncome, numericRight, 405, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 1b - Household employee wages', '0', numericRight, 420, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 1c - Tip income', '0', numericRight, 435, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 1d - Medicaid waiver', '0', numericRight, 450, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 1e - Dependent care benefits', '0', numericRight, 465, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 1f - Adoption benefits', '0', numericRight, 480, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 1g - Form 8919 wages', '0', numericRight, 495, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 1h - Other earned income', '0', numericRight, 510, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 1i - Nontaxable combat pay', '0', 470, 525, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 1z - Add 1a-1h', totalIncome, numericRight, 525, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 2a - Tax-exempt interest', '0', 230, 540, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 2b - Taxable interest', '0', numericRight, 540, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 3a - Qualified dividends', '0', 230, 555, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 3b - Ordinary dividends', '0', numericRight, 555, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 4a - IRA distributions', '0', 230, 570, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 4b - Taxable IRA', '0', numericRight, 570, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 5a - Pensions/annuities', '0', 230, 585, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 5b - Taxable pensions', '0', numericRight, 585, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 6a - Social security', '0', 230, 600, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 6b - Taxable social security', '0', numericRight, 600, page, 9, 'right'); // Adjusted yFromTop (-20)
  if (payload?.income?.lumpSumElection) {
    draw('Lump-sum election', 'X', 560, 615, page, 12, 'center'); // Adjusted yFromTop (-20)
  }
  draw('Line 7 - Capital gain/loss', '0', numericRight, 615, page, 9, 'right'); // Adjusted yFromTop (-20)
  if (payload?.income?.noScheduleD) {
    draw('No Schedule D', 'X', 510, 615, page, 12, 'center'); // Adjusted yFromTop (-20)
  }
  draw('Line 8 - Additional income', '0', numericRight, 630, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 9 - Add lines 1z, 2b, 3b, 4b, 5b, 6b, 7, and 8. This is your total income', totalIncome.toLocaleString(), numericRight, 645, page, 9, 'right'); // Adjusted yFromTop (-20)

  // Adjustments and AGI
  draw('Line 10 - Adjustments', adjustments, numericRight, 660, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 11 - AGI', agi.toLocaleString(), numericRight, 675, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 12 - Deductions', deductionsAmount.toLocaleString(), numericRight, 690, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 13 - QBID', qbid, numericRight, 705, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 14 - Add lines 12 and 13', (deductionsAmount + qbid).toLocaleString(), numericRight, 720, page, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 15 - Taxable income', taxable.toLocaleString(), numericRight, 735, page, 9, 'right'); // Adjusted yFromTop (-20)

  // Page 2 - Tax and Credits
  draw('Line 16 - Tax', tax.toLocaleString(), numericRight, 65, page2, 9, 'right'); // Adjusted yFromTop (-20)
  if (payload?.tax?.form8814) {
    draw('Form 8814', 'X', 470, 65, page2, 12, 'center'); // Adjusted yFromTop (-20)
  }
  if (payload?.tax?.form4972) {
    draw('Form 4972', 'X', 500, 65, page2, 12, 'center'); // Adjusted yFromTop (-20)
  }
  if (payload?.tax?.otherForm) {
    draw('Other form', 'X', 530, 65, page2, 12, 'center'); // Adjusted yFromTop (-20)
  }
  draw('Line 17 - Sch 2 line 3', sch2Line3.toLocaleString(), numericRight, 80, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 18 - Add lines 16 and 17', beforeCredits.toLocaleString(), numericRight, 95, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 19 - Child tax credit', nonRefundable.toLocaleString(), numericRight, 110, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 20 - Sch 3 line 8', '0', numericRight, 125, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 21 - Add lines 19 and 20', nonRefundable.toLocaleString(), numericRight, 140, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 22 - Subtract line 21 from line 18. If zero or less, enter -0-', afterCredits.toLocaleString(), numericRight, 155, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 23 - Other taxes', otherTaxes.toLocaleString(), numericRight, 170, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 24 - Add lines 22 and 23. This is your total tax', totalTax.toLocaleString(), numericRight, 185, page2, 9, 'right'); // Adjusted yFromTop (-20)

  // Payments
  draw('Line 25a - W-2 withheld', '0', numericRight, 200, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 25b - 1099 withheld', '0', numericRight, 215, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 25c - Other withheld', '0', numericRight, 230, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 25d - Total withheld', '0', numericRight, 245, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 26 - Estimated payments', '0', numericRight, 260, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 27 - EIC', '0', numericRight, 275, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 28 - Additional child tax', refundable.toLocaleString(), numericRight, 290, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 29 - American opportunity', '0', numericRight, 305, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 30 - Reserved', '', numericRight, 320, page2, 9, 'right'); // Blank instead of '—'
  draw('Line 31 - Sch 3 line 15', '0', numericRight, 335, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 32 - Total other payments', refundable.toLocaleString(), numericRight, 350, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 33 - Total payments', totalPayments.toLocaleString(), numericRight, 365, page2, 9, 'right'); // Adjusted yFromTop (-20)

  // Refund/Owe
  draw('Line 34 - Overpaid', overpaid.toLocaleString(), numericRight, 380, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 35a - Refund', overpaid.toLocaleString(), numericRight, 395, page2, 9, 'right'); // Adjusted yFromTop (-20)
  if (payload?.refund?.form8888) {
    draw('Form 8888 attached', 'X', 500, 395, page2, 12, 'center'); // Adjusted yFromTop (-20)
  }
  draw('Routing number', payload?.bank?.routing || '', 70, 410, page2, 9, 'left'); // Adjusted x and yFromTop (-20)
  if (payload?.bank?.type === 'Checking') {
    draw('Checking', 'X', 270, 410, page2, 12, 'center'); // Adjusted x and yFromTop (-20)
  } else if (payload?.bank?.type === 'Savings') {
    draw('Savings', 'X', 370, 410, page2, 12, 'center'); // Adjusted x and yFromTop (-20)
  }
  draw('Account number', payload?.bank?.account || '', 380, 410, page2, 9, 'left'); // Adjusted x and yFromTop (-20)
  draw('Line 36 - Applied to 2025', '0', numericRight, 425, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 37 - Amount owed', balanceDue.toLocaleString(), numericRight, 440, page2, 9, 'right'); // Adjusted yFromTop (-20)
  draw('Line 38 - Estimated tax penalty', '0', numericRight, 455, page2, 9, 'right'); // Adjusted yFromTop (-20)

  // Third Party Designee
  if (payload?.thirdParty?.allow) {
    draw('Third Party Yes', 'X', 520, 485, page2, 12, 'center'); // Adjusted yFromTop (-20)
  } else {
    draw('Third Party No', 'X', 560, 485, page2, 12, 'center'); // Adjusted yFromTop (-20)
  }
  draw('Designee’s name', payload?.thirdParty?.name || '', 70, 500, page2, 9); // Adjusted yFromTop (-20)
  draw('Phone no.', payload?.thirdParty?.phone || '', 230, 500, page2, 9); // Adjusted x and yFromTop (-20)
  draw('PIN', payload?.thirdParty?.pin || '', 380, 500, page2, 9); // Adjusted x and yFromTop (-20)

  // Signatures
  const submitDate = new Date(payload?.metadata?.submittedAt || Date.now()).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  draw('Your signature', payload?.taxpayer?.fullName || '', 70, 575); // Adjusted yFromTop (+50)
  draw('Date', submitDate, 280, 575, page2, 9); // Adjusted yFromTop (+50)
  draw('Your occupation', payload?.taxpayer?.occupation || '', 380, 575, page2, 9); // Adjusted x and yFromTop (+50)
  draw('Identity PIN (you)', payload?.identityVerification?.irsPIN || '', 520, 575, page2, 9, 'right'); // Adjusted x and yFromTop (+50)
  draw('Spouse’s signature', payload?.taxpayer?.spouse?.name || '', 70, 590); // Adjusted yFromTop (+50)
  draw('Spouse date', submitDate, 280, 590, page2, 9); // Adjusted yFromTop (+50)
  draw('Spouse occupation', payload?.taxpayer?.spouse?.occupation || '', 380, 590, page2, 9); // Adjusted x and yFromTop (+50)
  draw('Identity PIN (spouse)', payload?.identityVerification?.spousePIN || '', 520, 590, page2, 9, 'right'); // Adjusted x and yFromTop (+50)
  draw('Phone no.', payload?.contact?.phone || '', 350, 605, page2, 9); // Adjusted x and yFromTop (+50)
  draw('Email address', payload?.metadata?.contactEmail || '', 450, 605, page2, 9); // Adjusted x and yFromTop (+50)

  // Preparer
  draw('Preparer’s name', payload?.preparer?.name || '', 300, 615, page2, 9); // Adjusted x and yFromTop (+50)
  draw('Preparer’s signature', payload?.preparer?.signature || '', 300, 630, page2, 9); // Adjusted x and yFromTop (+50)
  draw('Date', submitDate, 500, 630, page2, 9); // Adjusted x and yFromTop (+50)
  draw('PTIN', payload?.preparer?.ptin || '', 300, 645, page2, 9, 'right'); // Adjusted x and yFromTop (+50)
  if (payload?.preparer?.selfEmployed) {
    draw('Self-employed', 'X', 400, 645, page2, 12, 'center'); // Adjusted x and yFromTop (+50)
  }
  draw('Firm’s name', payload?.preparer?.firmName || '', 300, 660, page2, 9); // Adjusted x and yFromTop (+50)
  draw('Firm phone', payload?.preparer?.phone || '', 500, 660, page2, 9); // Adjusted x and yFromTop (+50)
  draw('Firm’s address', payload?.preparer?.address || '', 300, 675, page2, 9); // Adjusted x and yFromTop (+50)
  draw('Firm’s EIN', payload?.preparer?.ein || '', 500, 675, page2, 9, 'right'); // Adjusted x and yFromTop (+50)

  return pdfDoc;
}