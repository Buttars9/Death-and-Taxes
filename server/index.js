import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // ✅ Load .env from root

// 🔥 Catch uncaught exceptions for forensic tracing
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err.stack);
});

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'; // ✅ Needed for JWT cookie parsing
import { dbConnect } from './lib/dbConnect.js';
import axios from 'axios';
import mongoose from 'mongoose'; // ✅ Needed for health check

import filingRoutes from './routes/filingRoutes.js';
import signatureRoutes from './routes/signatureRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import vaultRoutes from './routes/vaultRoutes.js';
import filingWizardRoutes from './routes/filingWizardRoutes.js';
import willPreviewRoutes from './routes/willPreviewRoutes.js';
import willFinalizeRoutes from './routes/willFinalizeRoutes.js';
import filingsRoute from './routes/filings.js'; // 📬 Newly added route
import settingsRoutes from './routes/settingsRoutes.js'; // ✅ Admin wallet settings
import refundStoreRoutes from './routes/refundStoreRoutes.js'; // 🧾 Vaulted refund metadata
import registerRoute from './routes/register.js'; // 🧑‍💼 IRS-grade user registration
import loginRoute from './routes/login.js'; // 🔐 IRS-grade login
import sessionRoute from './routes/session.js'; // 🧠 Session rehydration
import logoutRoute from './routes/logout.js'; // 🚪 Logout route
import requestResetRoute from './routes/requestReset.js'; // 🔐 Password reset request
import resetPasswordRoute from './routes/resetPassword.js'; // 🔐 Password reset confirm

import { documentUploadRoute } from './routes/documentRoutes.js'; // 📄 Document upload + parsing
import { finalizeReturn } from '../api/controllers/finalize.js'; // 🧮 Refund finalization logic

const app = express();
const PORT = process.env.PORT || 3001;

await dbConnect(); // ✅ MongoDB connection

// ✅ CORS setup for local + live domains
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://www.deathntaxes.app',
      'https://death-and-taxes-mj94386wx-austin-buttars-projects.vercel.app',
      'https://deathntaxes-nfvzh0bur-austin-buttars-projects.vercel.app' // Added for preview URL
    ]
  : [
      'https://www.deathntaxes.app',
      'https://death-and-taxes-mj94386wx-austin-buttars-projects.vercel.app',
      'https://deathntaxes-nfvzh0bur-austin-buttars-projects.vercel.app', // Added for preview URL
      'http://localhost:5173'
    ];

app.use(cors({
  origin: function (origin, callback) {
    console.log(`[CORS] Incoming origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('/*', cors()); // ✅ Preflight catch-all

app.use(cookieParser()); // ✅ Parse incoming cookies
app.use(bodyParser.json());

// Filing routes
app.use('/api/filing', filingRoutes);
app.use('/api/filing/signature', signatureRoutes);
app.use('/api/filing/wizard', filingWizardRoutes);

// Payout routes
app.use('/api/payout', payoutRoutes);

// Vault routes
app.use('/api/vault', vaultRoutes);

// Will routes
app.use('/api/will-preview', willPreviewRoutes);
app.use('/api/will-finalize', willFinalizeRoutes);

// 💼 Filings dashboard sync
app.use('/api/filings', filingsRoute);

// 🔐 Admin wallet settings
app.use('/api/settings', settingsRoutes);

// 🧾 Refund submission & audit
app.use('/api/refund-store', refundStoreRoutes);

// 🧑‍💼 IRS-grade user registration
app.use('/api/register', registerRoute);

// 🔐 IRS-grade login
app.use('/api/login', loginRoute);

// 🧠 Session rehydration
app.use('/api/me', sessionRoute);

// 🚪 Logout route
app.use('/api/logout', logoutRoute);

// 🔐 Password reset request
app.use('/api/request-reset', requestResetRoute);

// 🔐 Password reset confirm
app.use('/api/reset-password', resetPasswordRoute);

// 📄 Document upload + parsing
app.use('/api/upload-document', documentUploadRoute);

// 🧮 Final refund submission
app.post('/api/finalize', finalizeReturn); // ✅ Threads refund payload to controller

app.post('/api/pi-auth', async (req, res) => {
  const { accessToken, username } = req.body;

  if (!accessToken || !username) {
    return res.status(400).json({ error: 'Missing accessToken or username' });
  }

  try {
    const piResponse = await axios.get('https://api.minepi.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const piUser = piResponse.data;

    if (piUser.username !== username) {
      return res.status(401).json({ error: 'Username mismatch' });
    }

    const user = {
      id: piUser.uid,
      username: piUser.username,
    };

    res.json({ user });
  } catch (error) {
    console.error('Pi token verification failed:', error);
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid access token' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// New: Approve Pi payment (use PI_API_KEY from .env)
app.post('/api/pi-approve', async (req, res) => {
  let { paymentId, sandbox } = req.body;
  if (sandbox === undefined) {
    sandbox = true; // Default to testnet if param missing
    console.log('[WARN] sandbox param missing—defaulting to true (testnet)');
  }
  const apiKey = sandbox ? process.env.PI_TESTNET_API_KEY_NEW : process.env.PI_API_KEY;
  const baseUrl = sandbox ? 'https://api.testnet.minepi.com' : 'https://api.minepi.com';

  console.log(`[DEBUG] Received /pi-approve request: paymentId=${paymentId}, sandbox=${sandbox}, using apiKey=${apiKey ? '[redacted]' : 'MISSING'}, baseUrl=${baseUrl}, full req.body=${JSON.stringify(req.body)}`);

  if (!apiKey) {
    console.error('[ERROR] Missing API key for environment');
    return res.status(500).json({ error: 'Missing API key configuration' });
  }

  const approveWithRetry = async (retries = 3, delay = 5000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(`${baseUrl}/v2/payments/${paymentId}/approve`, {}, {
          headers: {
            Authorization: `Key ${apiKey}`,
          },
        });
        console.log('[SUCCESS] Pi approve response:', response.data);
        return response;
      } catch (error) {
        const piError = error.response ? error.response.data : error.message;
        console.error(`[ERROR] Pi approve attempt ${attempt} failed:`, piError);
        if (error.response?.status !== 404 || attempt === retries) {
          throw error; // Non-retryable error or last attempt
        }
        console.log(`Retrying approve in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  try {
    const response = await approveWithRetry();
    res.status(200).json({ success: true });
  } catch (error) {
    const piError = error.response ? error.response.data : error.message;
    console.error('[ERROR] Pi approve failed after retries:', piError);
    res.status(500).json({ error: 'Approval failed', details: piError });
  }
});

// New: Complete Pi payment
app.post('/api/pi-complete', async (req, res) => {
  const { paymentId, txid, sandbox } = req.body;
  const apiKey = sandbox ? process.env.PI_TESTNET_API_KEY_NEW : process.env.PI_API_KEY;
  const baseUrl = sandbox ? 'https://api.testnet.minepi.com' : 'https://api.minepi.com';

  console.log(`[DEBUG] Received /pi-complete request: paymentId=${paymentId}, txid=${txid}, sandbox=${sandbox}, using apiKey=${apiKey ? '[redacted]' : 'MISSING'}, baseUrl=${baseUrl}, full req.body=${JSON.stringify(req.body)}`);

  if (!apiKey) {
    console.error('[ERROR] Missing API key for environment');
    return res.status(500).json({ error: 'Missing API key configuration' });
  }

  try {
    const response = await axios.post(`${baseUrl}/v2/payments/${paymentId}/complete`, { txid }, {
      headers: {
        Authorization: `Key ${apiKey}`,
      },
    });
    console.log('[SUCCESS] Pi complete response:', response.data);
    res.status(200).json(response.data);
  } catch (error) {
    const piError = error.response ? error.response.data : error.message;
    console.error('[ERROR] Pi complete failed:', piError);
    res.status(500).json({ error: 'Completion failed', details: piError });
  }
});

// 🟢 Warm-up ping route for frontend and uptime monitors
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// ✅ Health check route for MongoDB connection
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: 'ok',
    db: statusMap[dbState],
  });
});

// 🚨 Catch-all fallback to prevent wildcard crash
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});// trigger redeploy