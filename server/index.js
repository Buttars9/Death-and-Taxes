import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // ✅ Load .env from root

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'; // ✅ Needed for JWT cookie parsing
import { dbConnect } from './lib/dbConnect.js';

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

import { documentUploadRoute } from './routes/documentRoutes.js'; // 📄 Document upload + parsing
import { finalizeReturn } from '../api/controllers/finalize.js'; // 🧮 Refund finalization logic

const app = express();
const PORT = process.env.PORT || 3001;

await dbConnect(); // ✅ MongoDB connection

app.use(cors({
  origin: true,
  credentials: true, // ✅ Allow cookies to be sent
}));
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

// 📄 Document upload + parsing
app.use('/api/upload-document', documentUploadRoute);

// 🧮 Final refund submission
app.post('/api/finalize', finalizeReturn); // ✅ Threads refund payload to controller

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});