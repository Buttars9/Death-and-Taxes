import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { saveFiling, getFiling, getFilingsByUser } from '../store/filingStore.js';
import { getSignatureStatus } from '../store/signatureStore.js';
import { queuePayout, getPayout } from '../store/payoutStore.js';

/**
 * Queue filing submission for processing.
 * @param {object} payload
 * @returns {object} { submissionId, timestamp }
 */
export async function queueFilingSubmission(payload) {
  const submissionId = uuidv4();
  const timestamp = new Date().toISOString();

  const { estate, refund, signature, ...rest } = payload;

  // ✅ Validate estate payload
  const estateSummary = {
    fullName: estate?.fullName || '—',
    beneficiary: estate?.primaryBeneficiary || '—',
    executor: estate?.executor || '—',
    assets: estate?.assetSummary || '—',
    wishes: estate?.finalWishes || '—',
  };

  const filingEntry = {
    id: submissionId,
    userId: payload.userId || 'unknown',
    payload: {
      ...rest,
      refund,
      signature,
      estate: estateSummary,
      trustConfirmed: true, // 🔐 Mark estate as confirmed
    },
    receivedAt: timestamp,
  };

  saveFiling(submissionId, filingEntry);
  console.log('📥 Queued Filing Submission:', filingEntry);

  // 📄 Send to TaxBandits for e-filing
  try {
    const response = await axios.post('https://api.taxbandits.com/v1.7.3/Form1040/Create', {
      Submission: {
        TaxPayer: {
          FirstName: payload.firstName || rest.firstName || 'Unknown',
          LastName: payload.lastName || rest.lastName || 'Unknown',
          SSN: payload.ssn || rest.ssn || '',
          FilingStatus: payload.filingStatus || rest.filingStatus || 'Single',
        },
        ReturnData: {
          Form1040: {
            TaxableIncome: payload.taxableIncome || rest.taxableIncome || 0,
            TotalTax: payload.taxOwed || rest.taxOwed || 0,
            Refund: payload.refund || 0,
            // Add more fields as needed from your form1040PayLoad.js
          }
        }
      }
    }, {
      headers: { Authorization: `Bearer ${process.env.TAXBANDITS_API_KEY}` }
    });
    console.log(`[AUDIT][EFILE] E-filed for user ${payload.userId || 'unknown'}: ${response.data.SubmissionId}`);
  } catch (err) {
    console.error(`[ERROR] TaxBandits e-filing failed for submission ${submissionId}:`, err.message);
  }

  return {
    submissionId,
    timestamp,
  };
}

/**
 * Retrieve filing status by ID.
 * @param {string} submissionId
 * @returns {object|null}
 */
export function fetchFilingStatus(submissionId) {
  const filing = getFiling(submissionId);
  if (!filing) return null;

  const signature = getSignatureStatus(submissionId);
  const payout = getPayout(submissionId);

  return {
    id: filing.id,
    status: 'Queued',
    receivedAt: filing.receivedAt,
    trustConfirmed: filing.payload.trustConfirmed === true,
    refundEstimate: filing.payload.credits?.length || 0,
    signatureConfirmed: !!signature?.signedAt,
    signedAt: signature?.signedAt || null,
    payoutStatus: payout?.status || null,
    payoutQueuedAt: payout?.queuedAt || null,
  };
}

/**
 * Trigger payout for signed and trusted filings.
 * @param {string} submissionId
 * @returns {object}
 */
export function initiatePayout(submissionId) {
  const filing = getFiling(submissionId);
  const signature = getSignatureStatus(submissionId);

  if (!filing || !signature || filing.payload.trustConfirmed !== true) {
    throw new Error('Cannot initiate payout: filing not eligible');
  }

  queuePayout(submissionId, filing.payload);
  return { success: true, submissionId };
}

/**
 * Create a new filing for a user.
 * @param {string} userId
 * @param {object} answers
 * @returns {object}
 */
export async function createUserFiling(userId, answers) {
  const payload = {
    ...answers,
    userId,
  };
  return await queueFilingSubmission(payload);
}

/**
 * Get all filings for a user.
 * @param {string} userId
 * @returns {Array}
 */
export function getUserFilings(userId) {
  return getFilingsByUser(userId);
}