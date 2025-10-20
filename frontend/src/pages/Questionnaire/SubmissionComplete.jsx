import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import { useWizardStore } from '../../stores/wizardStore.js';
import GlowingBox from '../../components/GlowingBox.jsx';
import PiSymbol from '../../components/PiSymbol.jsx';
import IRSReceipt from '../../components/IRSReceipt.jsx';
import { IrsPayloadPreview } from '../../components/IrsPayloadPreview.jsx';
import { StatePayloadPreview } from '../../components/StatePayloadPreview.jsx'; // New: Import for state preview component
import Modal from '../../components/Modal.jsx';
import HelpIcon from '../../components/HelpIcon';
import HelpModal from '../../components/HelpModal';
import '../../components/HelpIcon.css';

import { formatCurrency } from '../../utils/formatters.js';

import { fillOut1040Pdf } from '../../shared/utils/fillOut1040Pdf.js';
import { fillOutScheduleA } from '../../shared/utils/fillOutScheduleA.js';
import { fillOutScheduleC } from '../../shared/utils/fillOutScheduleC.js';
import { fillOutScheduleD } from '../../shared/utils/fillOutScheduleD.js';

import buildForm1040Payload from '../../shared/utils/form1040Payload.js';
import { buildIrsPayload } from '../../shared/utils/buildIrsPayload.js';

import { calculateRefund } from '../../shared/utils/calculateRefund.js';
import { submitFinalReturn } from '../../lib/submitFinalReturn.js';
import { generateEfileXml } from '../../shared/utils/generateEfileXml.js';
import { generateStateEfileXml } from '../../shared/utils/generateStateEfileXml.js'; // New: For state XML
import buildStatePayload from '../../shared/utils/buildStatePayload.js'; // New: For state payload builder
import jsPDF from 'jspdf'; // Added for PDF generation

export function generatePdfFromXml(xml) {
  const doc = new jsPDF();
  doc.text(xml, 10, 10); // Simple text dump, format as needed
  doc.save('irs_payload.pdf');
}

export default function SubmissionComplete({ confirmationId, submittedAt }) {
  const navigate = useNavigate();
  const { answers, w2s, willData, setAnswers } = useWizardStore();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const taxYear = new Date().getFullYear();
  const formattedTime = submittedAt ? new Date(submittedAt).toLocaleString() : null;

  const incomeSources = answers.incomeSources || [];

  const fields = {
    filingStatus: answers.maritalStatus || 'single',
    state: answers.residentState || 'N/A',
    income: incomeSources.reduce((sum, src) => sum + Number(src.box1 || src.amount || 0), 0),
    dependents: Array.isArray(answers.dependents) ? answers.dependents.length : answers.dependents ? 1 : 0,
    age: answers.age || 0,
    tipIncome: answers.tipIncome || 0,
    overtimeIncome: answers.overtimeIncome || 0,
    saltPaid: answers.saltPaid || 0,
    assets: answers.assets || [],
    deductionType: answers.deductionType || 'standard',
    deductions: Array.isArray(answers.deductions)
      ? answers.deductions.map((d) => ({ value: d.value, amount: Number(d.amount || 0) }))
      : [],
    credits: answers.credits || [],
    taxWithheld: incomeSources.reduce((sum, src) => sum + Number(src.box2 || src.federalTaxWithheld || 0), 0),
    estimatedPayments: Number(answers.estimatedPayments) || 0,
    stateTaxWithheld: incomeSources.reduce((sum, src) => sum + Number(src.box17 || 0), 0),
    incomeSources,
  };

  const statesPaid = Array.from(
    new Set(incomeSources.map((src) => src.box15?.trim()).filter(Boolean))
  );

  const refundSummary = calculateRefund({
    ...fields,
    statesPaid,
  });

  const estimatedRefund = refundSummary.federalRefund;
  const deductionAmount = refundSummary.deductionAmount;
  const contactEmail = answers.contactEmail || 'anonymous';
  const maritalStatus = answers.maritalStatus || 'N/A';
  const income = fields.income;
  const residentState = answers.residentState || 'N/A';
  const stateRefunds = refundSummary.stateRefunds || {};

  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);
  const [showStatePayloadPreview, setShowStatePayloadPreview] = useState(false); // New: For state modal
  const [irsPdfBlob, setIrsPdfBlob] = useState(null);
  const [irsPayload, setIrsPayload] = useState(null);
  const [statePayload, setStatePayload] = useState(null); // New: For state data

 const buildPdf = async () => {
  setAnswers({ ...answers, trustConfirmed: true });

  const updatedAnswers = useWizardStore.getState().answers;

const payload = buildForm1040Payload({ ...updatedAnswers, trustConfirmed: true });
const pdf1040 = await fillOut1040Pdf(payload);
   const pdfA = await fillOutScheduleA(payload);
    const pdfC = await fillOutScheduleC(payload);
const pdfD = await fillOutScheduleD(payload);

    const finalPdf = pdf1040;
    if (pdfA?.internal?.pages?.length) finalPdf.addPage(pdfA.internal.pages[0]);
    if (pdfC?.internal?.pages?.length) finalPdf.addPage(pdfC.internal.pages[0]);
    if (pdfD?.internal?.pages?.length) finalPdf.addPage(pdfD.internal.pages[0]);

    return finalPdf;
  };

  const handlePrintTaxReturn = async () => {
  try {
    const finalPdf = await buildPdf();
    const pdfBytes = await finalPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    setIrsPdfBlob(blob);

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `irs-return-${contactEmail || 'anonymous'}_${new Date().getFullYear()}.pdf`;
    link.click();
  } catch (err) {
    console.error('IRS PDF generation failed:', err);
  }
};

  const handlePreviewTaxReturn = async () => {
  try {
    const finalPdf = await buildPdf();
    const pdfBytes = await finalPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    setIrsPdfBlob(blob);
    setShowPdfPreview(true);
  } catch (err) {
    console.error('IRS preview failed:', err);
  }
};

const handleViewPayload = () => {
  try {
   const payload = buildForm1040Payload({ ...answers, trustConfirmed: true });
    const xml = generateEfileXml(payload);
    setIrsPayload({ json: payload, xml });
    setShowPayloadPreview(true);
    generatePdfFromXml(xml); // Added to generate and download PDF on click
  } catch (err) {
    console.error('Payload preview failed:', err);
  }
};

const handleViewStatePayload = async () => {
  try {
    const statePayloadData = buildStatePayload({ answers, refundSummary });
    const stateXml = generateStateEfileXml(statePayloadData);
    setStatePayload({ json: statePayloadData, xml: stateXml });
    setShowStatePayloadPreview(true);
    generatePdfFromXml(stateXml); // Reuse for state
  } catch (err) {
    console.error('State payload preview failed:', err);
  }
};

  const handleSubmitToPDP = async () => {
    if (!answers?.paymentMethod) {
      alert('Please complete payment before submitting your return.');
      return;
    }

    try {
      const refund = {
        state: residentState,
        filingStatus: maritalStatus,
        income,
        deduction: deductionAmount,
        total: estimatedRefund,
      };

      const signature = 'user-signature'; // TODO: integrate SignatureCapture.jsx
      const result = await submitFinalReturn({
        refund,
        signature,
        will: willData,
        transmitter: 'pdp',
      });

      console.log('✅ Submission confirmed:', result);
      alert(`Return submitted! Confirmation ID: ${result.id}`);
    } catch (err) {
      console.error('❌ Submission failed:', err);
      alert(`Submission failed: ${err.message}`);
    }
  };

  const handleDownloadReceipt = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.text('Tax Filing Receipt', 10, 10);
      doc.text(`Confirmation ID: ${confirmationId || 'N/A'}`, 10, 20);
      doc.text(`Submitted At: ${formattedTime || 'N/A'}`, 10, 30);
      doc.text(`Filing Status: ${maritalStatus}`, 10, 40);
      doc.text(`Income: $${income.toLocaleString()}`, 10, 50);
      doc.text(`Deduction: $${deductionAmount.toLocaleString()}`, 10, 60);
      doc.text(`Estimated Refund: $${estimatedRefund.toLocaleString()}`, 10, 70);
      doc.text(`State: ${residentState}`, 10, 80);
      doc.text('Thank you for filing with Pi.', 10, 100);
      doc.save(`receipt-${contactEmail}_${taxYear}.pdf`);
    }).catch((err) => {
      console.error('Receipt download failed:', err);
    });
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const buttonStyle = (bg, color, border = false) => ({
    background: bg,
    color,
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: border ? '1px solid #3a3f55' : 'none',
    fontWeight: 'bold',
    marginRight: '1rem',
    marginTop: '0.5rem',
  });

  return (
    <>
      <style>{`
        .submission-complete {
          padding: 2rem;
          background: #1a0028;
          border-radius: 8px;
          box-shadow: 0 0 12px #8c4dcc;
          color: #e0e0ff;
        }
        .submission-complete h2 {
          color: #a166ff;
          margin-bottom: 1rem;
        }
        .submission-complete p {
          margin-bottom: 1rem;
        }
        .submission-complete ul {
          margin-left: 1.5rem;
        }
        .submission-complete ul li {
          margin-bottom: 0.5rem;
        }
        .submission-complete strong {
          color: #ffffff;
        }
        .submission-complete span {
          color: #00ff9d;
        }
        .submission-complete .buttons {
          margin-top: 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .pdf-preview-modal {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
        }
        .pdf-preview-container {
          width: 80vw;
          max-width: 960px;
          box-shadow: 0 0 12px rgba(0,0,0,0.2);
          background: #f8f8ff;
          border-radius: 8px;
          overflow: hidden;
        }
        .pdf-preview-iframe {
          width: 100%;
          height: 850px;
          border: none;
          display: block;
        }
        .payload-preview-modal {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          color: #000000; /* Force dark text for better visibility on light background */
        }
        .payload-preview-container {
          width: 80vw;
          max-width: 960px;
          box-shadow: 0 0 12px rgba(0,0,0,0.2);
          background: #f8f8ff; /* Light background consistent with PDF preview */
          border-radius: 8px;
          overflow: hidden;
          color: #000000; /* Override any inherited light colors */
          padding: 1rem;
        }
        .payload-preview-container pre, .payload-preview-container code {
          color: #000000 !important; /* Ensure code text is dark, overriding any highlighter styles */
        }
        .payload-preview-container .hljs, .payload-preview-container .hljs-string, .payload-preview-container .hljs-number, .payload-preview-container .hljs-literal, .payload-preview-container .hljs-keyword, .payload-preview-container .hljs-attribute, .payload-preview-container .hljs-selector-tag, .payload-preview-container .hljs-meta, .payload-preview-container .hljs-name, .payload-preview-container .hljs-built_in, .payload-preview-container .hljs-params, .payload-preview-container .hljs-symbol, .payload-preview-container .hljs-bullet, .payload-preview-container .hljs-link, .payload-preview-container .hljs-section, .payload-preview-container .hljs-title, .payload-preview-container .hljs-emphasis, .payload-preview-container .hljs-strong, .payload-preview-container .hljs-quote, .payload-preview-container .hljs-comment, .payload-preview-container .hljs-variable, .payload-preview-container .hljs-template-variable, .hljs-type, .hljs-selector-class, .hljs-selector-id, .hljs-selector-attr, .hljs-selector-pseudo {
          color: #000000 !important; /* Override common highlighter classes for strings/values to black */
        }
        @media (max-width: 768px) {
          .submission-complete {
            padding: 1rem;
          }
          .submission-complete h2 {
            font-size: 1.5rem;
            margin-bottom: 0.75rem;
          }
          .submission-complete p {
            font-size: 0.9rem;
            margin-bottom: 0.75rem;
          }
          .submission-complete ul {
            margin-left: 1rem;
            font-size: 0.9rem;
          }
          .submission-complete ul li {
            margin-bottom: 0.4rem;
          }
          .submission-complete .buttons {
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1.5rem;
          }
          .submission-complete button {
            width: 100%;
            padding: 0.75rem;
            margin-right: 0;
            margin-top: 0;
          }
          .pdf-preview-container {
            width: 100vw;
            max-width: none;
            border-radius: 0;
          }
          .pdf-preview-iframe {
            height: 600px;
          }
        }
      `}</style>
      <GlowingBox>
        <div className="submission-complete">
          <h2>
            <PiSymbol /> You Did It! <HelpIcon onClick={() => { setSelectedTopic('submissionCompleteStep'); setShowHelpModal(true); }} />
          </h2>
          <p>Your filing is complete and securely queued. We’ll notify you as it moves through review and disbursement.</p>

          <div>
            {confirmationId && <p><strong>Confirmation ID:</strong> {confirmationId}</p>}
            {formattedTime && <p><strong>Submitted At:</strong> {formattedTime}</p>}
            <p><strong>Filing Status:</strong> {maritalStatus}</p>
            <div>
              <strong>Federal Refund:</strong>{' '}
              <span>
                {formatCurrency(estimatedRefund)}
              </span>
            </div>
            <p><strong>Income Sources:</strong></p>
            <ul>
              {incomeSources.map((src, i) => (
                <li key={i}>
                  {src.owner || 'N/A'} W-2: {src.employerName || 'N/A'} - ${src.box1 || src.amount || 0}
                </li>
              ))}
            </ul>
            <p><strong>Will Summary:</strong> {willData.fullName
              ? `${willData.fullName}, Beneficiary: ${willData.primaryBeneficiary || 'N/A'}`
              : 'N/A'}
            </p>
            <div>
              <strong>State Refunds:</strong>
              {Object.entries(stateRefunds).map(([stateName, data]) => {
                const isRefund = data.stateRefund > 0;
                const amount = isRefund ? data.stateRefund : data.stateBalanceDue;
                return (
                  <div key={stateName}>
                    <strong>{stateName}:</strong>{' '}
                    <span style={{ color: isRefund ? '#00ff9d' : '#ff4d6d' }}>
                      {isRefund
                        ? `Refund of ${formatCurrency(amount)}`
                        : `Balance Due of ${formatCurrency(amount)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="buttons">
            <button onClick={handlePrintTaxReturn} style={buttonStyle('#72caff', '#0f131f')}>Print Tax Return</button>
            <button onClick={handlePreviewTaxReturn} style={buttonStyle('#3f8cff', '#fff')}>Preview Tax Return</button>
            <button onClick={handleViewPayload} style={buttonStyle('#a166ff', '#fff')}>View IRS Payload</button>
            <button onClick={handleViewStatePayload} style={buttonStyle('#a166ff', '#fff')}>View State Payload</button>
            <button onClick={handleSubmitToPDP} style={buttonStyle('#00c78b', '#0f131f')}>Submit</button>
            <button onClick={handleDownloadReceipt} style={buttonStyle('#ffb347', '#0f131f')}>Download Receipt</button>
            <button onClick={handleGoToDashboard} style={buttonStyle('#1c2232', '#e0e0ff', true)}>Go to Dashboard</button>
          </div>

{showPdfPreview && (
  <Modal onClose={() => setShowPdfPreview(false)}>
    <div className="pdf-preview-modal">
      <div className="pdf-preview-container">
        <iframe
          src={URL.createObjectURL(irsPdfBlob)}
          width="100%"
          height="850px"
          title="IRS PDF Preview"
          className="pdf-preview-iframe"
        />
      </div>
    </div>
  </Modal>
)}

          {showPayloadPreview && (
            <Modal onClose={() => setShowPayloadPreview(false)}>
              <div className="payload-preview-modal">
                <div className="payload-preview-container">
                  <IrsPayloadPreview payload={irsPayload} />
                </div>
              </div>
            </Modal>
          )}

          {showStatePayloadPreview && (
            <Modal onClose={() => setShowStatePayloadPreview(false)}>
              <div className="payload-preview-modal">
                <div className="payload-preview-container">
                  <StatePayloadPreview payload={statePayload} onConfirm={handleSubmitToPDP} /> {/* Use new component; adjust onConfirm if needed */}
                </div>
              </div>
            </Modal>
          )}
        </div>
        {showHelpModal && (
          <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
        )}
      </GlowingBox>
    </>
  );
}

SubmissionComplete.propTypes = {
  confirmationId: PropTypes.string,
  submittedAt: PropTypes.string,
};