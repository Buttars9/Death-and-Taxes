// components/helpContent.js

export const helpContent = {
  credits: {
    overview: {
      title: 'Credits Overview',
      body: 'Credits reduce your tax liability dollar-for-dollar. Unlike deductions, which reduce taxable income, credits directly lower the amount of tax owed. Common credits include Child Tax Credit, Earned Income Credit, and Foreign Tax Credit.',
    },
    foreignTax: {
      title: 'Foreign Tax Credit',
      body: 'If you paid taxes to a foreign government on income earned abroad, you may be eligible for the Foreign Tax Credit. This prevents double taxation and is claimed using IRS Form 1116.',
    },
    childTax: {
      title: 'Child Tax Credit',
      body: 'Provides up to $2,000 per qualifying child under age 17. Eligibility depends on income, filing status, and whether the child meets residency and dependency requirements.',
    },
    earnedIncome: {
      title: 'Earned Income Credit',
      body: 'Designed for low-to-moderate income workers. The credit amount depends on income, filing status, and number of qualifying children. Claimed using IRS Schedule EIC.',
    },
    education: {
      title: 'Education Credits',
      body: 'Includes the American Opportunity Credit and Lifetime Learning Credit. These help offset tuition and education-related expenses. Eligibility depends on enrollment status and income.',
    },
    saver: {
      title: 'Saver’s Credit',
      body: 'Provides a tax credit for contributions to retirement accounts like IRAs or 401(k)s. Available to low- and moderate-income taxpayers who meet eligibility thresholds.',
    },
    otherDependentCredit: {
      title: 'Other Dependent Credit',
      body: 'Worth up to $500 for dependents who don’t qualify for the Child Tax Credit, such as older children or non-relatives.',
    },
  },

  deductions: {
    overview: {
      title: 'Deductions Overview',
      body: 'Deductions reduce your taxable income. You can choose the standard deduction or itemize expenses such as mortgage interest, medical costs, and charitable donations. Itemized deductions are claimed using IRS Schedule A.',
    },
    standard: {
      title: 'Standard Deduction',
      body: 'A fixed deduction amount based on filing status. Most taxpayers claim the standard deduction unless itemized deductions exceed the threshold.',
    },
    itemized: {
      title: 'Itemized Deductions',
      body: 'Includes deductible expenses like mortgage interest, property taxes, medical expenses, and charitable contributions. Requires documentation and IRS Schedule A.',
    },
    studentLoan: {
      title: 'Student Loan Interest Deduction',
      body: 'Allows deduction of up to $2,500 in interest paid on qualified student loans. Subject to income limits and filing status.',
    },
  },

  estatePlan: {
    overview: {
      title: 'Estate Planning Overview',
      body: 'This section lets you add legal documents to your filing, including Transfer-on-Death affidavits, Power of Attorney forms, and trust setup options. These tools help manage asset transfer and decision-making in case of incapacity or death.',
    },
    tod: {
      title: 'Transfer-on-Death Affidavit',
      body: 'Allows assets to pass directly to named beneficiaries without probate. Commonly used for real estate and financial accounts. Requirements vary by state.',
    },
    poa: {
      title: 'Power of Attorney',
      body: 'Grants legal authority to another person to act on your behalf in financial or legal matters. Can be limited or durable depending on your needs.',
    },
    trust: {
      title: 'Trust Setup',
      body: 'A legal entity that holds and manages assets for beneficiaries. Trusts can help avoid probate, reduce estate taxes, and provide long-term control over asset distribution.',
    },
  },

  personalInfoStep: {
  title: 'Your IRS Filing Profile',
  body: `This section builds your full IRS filing profile. We collect your legal name, SSN, date of birth, and address to match IRS records and prevent rejection. Prior year AGI and IRS PIN help verify your identity and protect against fraud. Your filing status and resident state determine your tax bracket, credit eligibility, and refund routing. If you're married, we also collect your spouse's name, SSN, and date of birth for joint filing. Income sources guide which IRS forms you'll need (W-2, 1099, etc.), and dependents help calculate credits like the Child Tax Credit. Every field here affects your refund path, compliance status, and IRS acceptance. Accuracy matters.`,
},

  incomeStep: {
  title: 'Income Step Overview',
  body: `This step collects detailed income from all sources, including W-2 wages, 1099 self-employment, foreign earnings, and more. Enter amounts, employers, and relevant details to ensure accurate tax calculations. Autofill pulls from linked accounts for convenience. Foreign income may qualify for exclusions or credits—review treaties if applicable. Your entries here directly impact deductions, credits, and refund estimates.`,
},

  deductionStep: {
  title: 'Deductions Step Overview',
  body: `This step lets you choose between the standard deduction (a fixed amount based on filing status) or itemizing specific expenses like mortgage interest, medical costs, and charitable donations to potentially reduce taxable income more. Itemizing requires documentation and may increase your refund if expenses exceed the standard amount. Select options and enter amounts accurately—review IRS limits for each category.`,
},

  creditsStep: {
  title: 'Credits Claim Step Overview',
  body: 'This step allows you to claim tax credits that reduce your tax liability dollar-for-dollar. Automatic credits like Child Tax Credit and EITC are applied based on your details. Select additional credits and enter qualified amounts where prompted. Eligibility is calculated using your income, dependents, and other info.',
},

  priorYearStep: {
  title: 'Prior Year Info Overview',
  body: 'Provide your prior year Adjusted Gross Income (AGI) or IRS PIN for identity verification during e-filing. AGI is on line 11 of your 2024 Form 1040. If unavailable, leave blank—we’ll use other methods.',
},

  refundSummaryStep: {
  title: 'Refund Summary Overview',
  body: 'This step shows your estimated refund based on inputs. Confirm accuracy, add an email for updates, and check the box to proceed. The filing fee covers processing—your refund will be direct-deposited if bank info was provided.',
},

  willGeneratorStep: {
  title: 'Will Generator Overview',
  body: 'This step creates a basic last will and testament. Enter beneficiary details, guardians for minors, and asset summaries. For complex estates, consider professional legal advice. The generated document will include revocation, residue, and digital asset clauses if selected.',
},

  estatePlanOfferStep: {
  title: 'Estate Plan Offer Overview',
  body: 'This optional step adds a full estate plan for $25, including trust, POA, and more. Select yes to include or no to proceed with just the will.',
},

  estatePlanWizardStep: {
  title: 'Estate Plan Wizard Overview',
  body: 'Select which estate documents to generate (e.g., trust, POA). Unselect any you don\'t want. Proceed through each to enter details—back/next buttons navigate steps.',
},

  trustGeneratorStep: {
  title: 'Trust Generator Overview',
  body: 'Enter details for a revocable living trust, including grantor, trustee, and beneficiaries. This helps avoid probate. For complex needs, consult an attorney.',
},

  todAffidavitStep: {
  title: 'TOD Affidavit Step Overview',
  body: 'Specify assets and beneficiaries for direct transfer upon death (available in select states). Skip if not supported in your jurisdiction.',
},

  poaGeneratorStep: {
  title: 'POA Generator Overview',
  body: 'Designate an agent to handle financial/legal matters if incapacitated. Define scope and effective date.',
},

  hipaaReleaseStep: {
  title: 'HIPAA Release Step Overview',
  body: 'Authorize release of medical records to specified persons. Include relationship, scope, and expiration.',
},

  executorLetterStep: {
  title: 'Executor Letter Step Overview',
  body: 'Provide instructions for your executor, including special requests and jurisdiction.',
},

  directiveGeneratorStep: {
  title: 'Directive Generator Overview',
  body: 'Outline medical preferences and end-of-life wishes. This ensures your healthcare decisions are honored.',
},

  piPaymentStep: {
  title: 'Pi Payment Step Overview',
  body: 'Select your payment method, with Pi Wallet recommended for seamless crypto integration. Enter wallet details and confirm the transaction. The filing fee covers all processing.',
},

  finalReviewStep: {
  title: 'Final Review Overview',
  body: 'Review your tax estimate and will preview. Use buttons to print documents or submit. Confirm all details before proceeding.',
},

  submissionCompleteStep: {
  title: 'Submission Complete Overview',
  body: 'Your filing is queued. Download receipts, previews, or submit to Drake. Use dashboard for status updates.',
},

  income: {
    overview: {
      title: 'Income Types Overview',
      body: 'Income includes wages, self-employment earnings, interest, dividends, capital gains, rental income, retirement distributions, and more. Each type may be taxed differently and reported on separate IRS forms.',
    },
    w2: {
      title: 'W-2 Wages',
      body: 'Income earned from employment. Reported on IRS Form W-2 and includes wages, tips, and withheld taxes. Federal income tax, Social Security, and Medicare are typically withheld by your employer.',
    },
    withholding: {
      title: 'Taxes Withheld on W-2',
      body: 'Your W-2 shows how much tax your employer withheld from your paycheck during the year. This includes federal income tax, Social Security tax (6.2%), and Medicare tax (1.45%). These amounts are credited against your total tax liability when you file.',
    },
    1099: {
      title: '1099 Income',
      body: 'Includes freelance, contract, or investment income. Common forms include 1099-NEC (nonemployee compensation), 1099-INT (interest), and 1099-DIV (dividends). Taxes are not withheld, so you may owe when filing.',
    },
    crypto: {
      title: 'Crypto Income',
      body: 'Cryptocurrency gains are taxable and must be reported. Includes trading profits, mining income, and staking rewards. Reported on IRS Form 8949 and Schedule D.',
    },
    rental: {
      title: 'Rental Income',
      body: 'Income from renting property. Must report rent received and deduct expenses like mortgage interest, repairs, and property taxes. Use Schedule E.',
    },
    retirement: {
      title: 'Retirement Income',
      body: 'Includes pensions, annuities, Social Security, and IRA/401(k) withdrawals. Some may be taxable depending on age and income.',
    },
    unemployment: {
      title: 'Unemployment Income',
      body: 'Reported on Form 1099-G. Generally taxable. May affect eligibility for credits like EITC.',
    },
    alimony: {
      title: 'Alimony',
      body: 'Alimony received is not taxable for divorces finalized after 2018. Alimony paid is not deductible under current law.',
    },
    gambling: {
      title: 'Gambling Winnings',
      body: 'All winnings are taxable. Report on Form W-2G or as other income. Losses may be deductible if itemized.',
    },
  },

  dependents: {
    overview: {
      title: 'Dependents Overview',
      body: 'You may claim a qualifying child or relative if they meet IRS rules for relationship, residency, age, support, and income.',
    },
    child: {
      title: 'Qualifying Child',
      body: 'Must be under 19 (or 24 if a student), live with you over half the year, and not provide more than half their own support.',
    },
    relative: {
      title: 'Qualifying Relative',
      body: 'Can be a parent, sibling, or even a friend if they live with you and you provide over half their support. Income limits apply.',
    },
  },

  adjustments: {
    overview: {
      title: 'Adjustments to Income',
      body: 'These reduce your taxable income before deductions. Common adjustments include IRA contributions, student loan interest, and self-employment tax.',
    },
    ira: {
      title: 'IRA Deduction',
      body: 'You may deduct contributions to a traditional IRA if you meet income limits. Use Form 1040 Schedule 1.',
    },
    hsa: {
      title: 'HSA Contributions',
      body: 'Contributions to a Health Savings Account are deductible and grow tax-free. Must be enrolled in a high-deductible health plan.',
    },
    selfEmployment: {
      title: 'Self-Employment Tax Deduction',
      body: 'Self-employed individuals can deduct half of their Social Security and Medicare taxes. Claimed on Schedule SE.',
    },
  },

  taxBasics: {
    marginalRate: {
      title: 'Marginal vs. Effective Tax Rate',
      body: 'Your marginal rate is the highest percentage you pay on your last dollar of income. Your effective rate is your total tax divided by total income — a better measure of your overall tax burden.',
    },
    refund: {
      title: 'How Refunds Work',
      body: 'A refund means you overpaid taxes during the year through withholding or estimated payments. It’s not a bonus — it’s your money being returned.',
    },
    withholding: {
      title: 'Tax Withholding',
      body: 'Employers withhold taxes from your paycheck based on your W-4. This includes federal income tax, Social Security, and Medicare. You can adjust your W-4 to avoid overpaying or underpaying.',
    },
    estimatedPayments: {
      title: 'Estimated Tax Payments',
      body: 'Self-employed individuals and others with untaxed income may need to make quarterly estimated payments to avoid penalties. Use IRS Form 1040-ES.',
    },
    penalties: {
      title: 'Late Filing and Payment Penalties',
      body: 'If you file or pay taxes late, the IRS may assess penalties and interest. Filing an extension gives you more time to file, but not to pay.',
    },
  },

  piPayment: {
    overview: {
      title: 'Pi Wallet Payment',
      body: 'This section lets you pay for your filing using your Pi Wallet. In sandbox mode, no real Pi is sent. The flow includes wallet connection, payment confirmation, and backend verification using VITE_API_BASE.',
    },
    sandbox: {
      title: 'Sandbox Mode',
      body: 'Sandbox mode simulates the payment flow without sending real Pi. It connects to your wallet, shows your balance, and triggers backend callbacks for testing.',
    },
    security: {
      title: 'Security Reminder',
      body: 'Never share your 24-word passphrase with any app or person. It grants full access to your Pi Wallet. This app only uses the Pi SDK for secure, sandboxed testing.',
    },
  },
  bankInfo: {
  overview: {
    title: 'Bank Information for Refund',
    body: `This step collects your routing number, account number, and account type (checking or savings) to enable direct deposit of your IRS refund. Your routing number must be exactly 9 digits and match a valid U.S. financial institution.

Direct deposit is the fastest and most secure way to receive your refund. Your bank details are encrypted and used only for IRS submission. If you prefer to receive a paper check, you can skip this step.`,
  },
},

};