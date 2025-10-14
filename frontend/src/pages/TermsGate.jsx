import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import GlowingBox from "../components/GlowingBox";
import { useAuthStore } from '../auth/authStore.jsx'; // Adjust path if needed

export default function TermsGate() {
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added to prevent double-clicks and show feedback
  const acceptTerms = useAuthStore((s) => s.acceptTerms);
  const navigate = useNavigate(); // Added for navigation

  const handleContinue = () => {
    if (agreed && !isLoading) {
      setIsLoading(true); // Disable button during process
      acceptTerms(); // Updates store, triggers re-render in parent routes
      navigate('/dashboard'); // Restored: Explicit navigation to dashboard
    }
  };

  return (
    <GlowingBox>
      <div className="terms-gate">
        <h2>Terms & Conditions</h2>
        <p>
          Welcome to your secure tax filing dashboard. Before continuing, please review and agree to the following terms. Your agreement will be stored as part of your audit trail and constitutes a digital signature under IRS guidelines.
        </p>

        <h3>📜 Filing Terms</h3>
        <ul>
          <li>You confirm that all information provided is accurate to the best of your knowledge. False or misleading entries may result in delayed or rejected filings.</li>
          <li>You authorize this platform to prepare your federal and state tax returns using the data you've entered, including income, deductions, credits, and refund preferences.</li>
          <li>You acknowledge that a one-time filing fee of <strong>$74.99</strong> will be charged prior to submission. This fee covers federal and state filing, secure processing, audit-grade storage, refund optimization, and generation of a legally binding will.</li>
          <li>You may optionally upgrade to the <strong>$99.99</strong> tier, which includes a full estate plan with transfer-on-death affidavits, power of attorney documents, and trust drafting tools.</li>
          <li>You understand that your refund estimate is based on current inputs and may change after IRS review. Final refund amounts are determined solely by the IRS.</li>
          <li>You consent to receive digital receipts and updates at the email address provided. Your data will never be sold or shared.</li>
          <li>You accept that this platform is not liable for IRS or state delays, rejections, or changes to refund amounts once submitted.</li>
          <li>You acknowledge that until this platform receives direct IRS and state e-file approval, all returns will be securely transmitted via <strong>PDP Tax Service</strong>, an IRS-authorized e-file provider. PDP handles both federal and state submissions under IRS Publication 1345.</li>
        </ul>

        <h3>⚖️ Legal Terms</h3>
        <ul>
          <li>You are solely responsible for the accuracy of the information you provide. This platform does not verify or audit your entries, and is not liable for errors, omissions, or penalties resulting from inaccurate data.</li>
          <li>This platform supports most individual federal returns, including Form 1040 and common schedules. Complex filings (e.g. Schedule C, foreign assets, multi-state income) may not be supported. You are responsible for determining whether this platform meets your filing needs.</li>
          <li>By clicking “Agree & Continue,” you consent to the electronic preparation and submission of your tax return. This action constitutes a digital signature under IRS guidelines and applicable law.</li>
          <li>By agreeing to these terms, you also consent to the digital generation of estate documents, including wills, affidavits, and powers of attorney, where applicable. These documents are generated based on your inputs and jurisdictional defaults, and you are responsible for reviewing them prior to execution.</li>
          <li>Refund delivery timelines are controlled solely by the IRS, state agencies, and your financial institution. This platform does not guarantee refund speed, and is not responsible for delays caused by IRS review, identity verification, or banking issues.</li>
          <li>PDP Tax Service acts solely as a transmission provider. This platform is responsible for generating your return and ensuring its accuracy prior to submission.</li>
          <li>This platform operates under U.S. jurisdiction and complies with IRS and state reporting standards.</li>
          <li>You accept that all communications, transactions, and audit logs may be retained for legal and regulatory review.</li>
        </ul>

        <h3>🧾 Retention & Compatibility</h3>
        <ul>
          <li>Your filing data and receipts will be retained for up to 7 years for audit, compliance, and user access purposes.</li>
          <li>Estate documents generated through this platform may be retained for up to 7 years for audit, compliance, and user access purposes.</li>
          <li>This platform does not guarantee compatibility with all browsers, operating systems, or devices. For best results, use a modern desktop browser with JavaScript enabled.</li>
          <li>Payments are securely processed via third-party providers such as Stripe. This platform does not store your payment credentials and is not liable for third-party processing delays or errors.</li>
        </ul>

        <h3>🌐 Blockchain Deployment & Ecosystem Disclosure</h3>
        <ul>
          <li>This platform may be deployed as a decentralized application (DApp) on the Pi Network blockchain. By using this service, you acknowledge that certain data, transactions, or receipts may be recorded on-chain and subject to the visibility, immutability, and governance rules of that network.</li>
          <li>Blockchain-based deployment may result in permanent, public, or semi-public storage of certain metadata, transaction hashes, or audit logs. You agree to this visibility and understand that blockchain records cannot be altered or deleted once confirmed.</li>
          <li>While this platform is not affiliated with the Pi Network or its core team, it may be promoted within the Pi ecosystem and made accessible to Pi users. All references to Pi are for informational and transactional purposes only.</li>
          <li>You are responsible for ensuring that your use of this platform complies with local laws, including those governing blockchain-based services, digital assets, and tax reporting.</li>
          <li>This platform does not guarantee uninterrupted access to the Pi Network, nor does it control the availability, performance, or governance of Pi’s blockchain infrastructure.</li>
        </ul>

        <h3>🛡️ Platform & Affiliation Disclaimers</h3>
        <ul>
          <li>This application is an independent platform and is <strong>not officially affiliated with the Pi Network or its core team</strong>.</li>
          <li>References to PI, Pi Network, or related terminology are for informational and transactional purposes only.</li>
          <li>The Pi Network does not endorse, certify, or validate any filings, payouts, or transactions made through this platform.</li>
          <li>All services are provided “as is” and “as available,” without warranties of any kind, express or implied.</li>
          <li>Use of this platform is at your own risk. We disclaim liability for any loss, delay, or disruption caused by third-party networks, carriers, or infrastructure.</li>
          <li>You agree that any disputes arising from use of this platform shall be resolved through binding arbitration and waive your right to participate in class action lawsuits.</li>
        </ul>

        <label className="confirmation-checkbox">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed((prev) => !prev)}
          />
          I agree to the terms and conditions above.
        </label>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!agreed || isLoading} // Disable if loading
          style={{
            background: '#72caff',
            color: '#0f131f',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            marginTop: '2rem',
            opacity: (agreed && !isLoading) ? 1 : 0.5,
            cursor: (agreed && !isLoading) ? 'pointer' : 'not-allowed',
          }}
        >
          {isLoading ? 'Processing...' : 'Agree & Continue'} // Show loading text
        </button>
      </div>

      <style jsx>{`
        .terms-gate {
          color: #e1e8fc;
        }
        ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        li {
          margin-bottom: 0.75rem;
        }
        h3 {
          margin-top: 2rem;
          color: #e1e8fc;
        }
        .confirmation-checkbox {
          display: block;
          margin-top: 1.5rem;
        }
      `}</style>
    </GlowingBox>
  );
}