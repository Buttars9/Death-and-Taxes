import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import { useWizardStore } from '../../stores/wizardStore.js';
import GlowingBox from '../../components/GlowingBox.jsx';
import PiSymbol from '../../components/PiSymbol.jsx';
import IRSReceipt from '../../components/IRSReceipt.jsx';
import { IrsPayloadPreview } from '../../components/IrsPayloadPreview.jsx';
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
  const [irsPdfBlob, setIrsPdfBlob] = useState(null);
  const [irsPayload, setIrsPayload] = useState(null);

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
  } catch (err) {
    console.error('Payload preview failed:', err);
  }
};

  const handleSubmitToDrake = async () => {
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
        transmitter: 'drake',
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
    <GlowingBox>
      <div style={{
        padding: '2rem',
        background: '#1a0028',
        borderRadius: '8px',
        boxShadow: '0 0 12px #8c4dcc',
        color: '#e0e0ff',
      }}>
        <h2 style={{ color: '#a166ff', marginBottom: '1rem' }}>
          <PiSymbol /> You Did It! <HelpIcon onClick={() => { setSelectedTopic('submissionCompleteStep'); setShowHelpModal(true); }} />
        </h2>
        <p>Your filing is complete and securely queued. We’ll notify you as it moves through review and disbursement.</p>

        <div style={{ marginTop: '2rem' }}>
          {confirmationId && <p><strong>Confirmation ID:</strong> {confirmationId}</p>}
          {formattedTime && <p><strong>Submitted At:</strong> {formattedTime}</p>}
          <p><strong>Filing Status:</strong> {maritalStatus}</p>
          <div style={{ marginTop: '1rem' }}>
            <strong>Federal Refund:</strong>{' '}
            <span style={{ color: '#00ff9d' }}>
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
          <div style={{ marginTop: '1rem' }}>
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

        <div style={{ marginTop: '2rem' }}>
          <button onClick={handlePrintTaxReturn} style={buttonStyle('#72caff', '#0f131f')}>Print Tax Return</button>
          <button onClick={handlePreviewTaxReturn} style={buttonStyle('#3f8cff', '#fff')}>Preview Tax Return</button>
          <button onClick={handleViewPayload} style={buttonStyle('#a166ff', '#fff')}>View IRS Payload</button>
          <button onClick={handleSubmitToDrake} style={buttonStyle('#00c78b', '#0f131f')}>Submit</button>
          <button onClick={handleDownloadReceipt} style={buttonStyle('#ffb347', '#0f131f')}>Download Receipt</button>
          <button onClick={handleGoToDashboard} style={buttonStyle('#1c2232', '#e0e0ff', true)}>Go to Dashboard</button>
        </div>

{showPdfPreview && (
  <Modal onClose={() => setShowPdfPreview(false)}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '80vw',
          maxWidth: '960px',
          boxShadow: '0 0 12px rgba(0,0,0,0.2)',
          background: '#f8f8ff',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <iframe
          src={URL.createObjectURL(irsPdfBlob)}
          width="100%"
          height="850px"
          title="IRS PDF Preview"
          style={{
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  </Modal>
)}

        {showPayloadPreview && (
          <Modal onClose={() => setShowPayloadPreview(false)}>
            <IrsPayloadPreview payload={irsPayload} />
          </Modal>
        )}
      </div>
      {showHelpModal && (
        <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
      )}
    </GlowingBox>
  );
}

SubmissionComplete.propTypes = {
  confirmationId: PropTypes.string,
  submittedAt: PropTypes.string,
};