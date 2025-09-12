// death-and-taxes/src/pages/components/SignatureCapture.jsx

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './SignatureCapture.css';

export default function SignatureCapture({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };

  const getOffset = (e) => {
    const touch = e.nativeEvent.touches?.[0];
    if (touch) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
  };

  const startDrawing = (e) => {
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = getOffset(e);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = getOffset(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas && typeof onSave === 'function') {
      const dataURL = canvas.toDataURL();
      onSave(dataURL);
    }
  };

  const handleClear = () => {
    const ctx = getContext();
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="signature-capture">
      <h3>Sign Below</h3>
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="signature-canvas"
      />
      <div className="signature-actions">
        <button onClick={handleSave}>Save Signature</button>
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}

SignatureCapture.propTypes = {
  onSave: PropTypes.func.isRequired,
};