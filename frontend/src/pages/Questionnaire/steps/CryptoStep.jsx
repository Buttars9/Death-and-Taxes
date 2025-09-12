import React from 'react';

export default function CryptoStep({ formData, setFormData }) {
  return (
    <div>
      <h2>Crypto Income</h2>

      <label>
        Total Crypto Gains (USD):
        <input
          type="number"
          value={formData.cryptoGains || ''}
          onChange={(e) =>
            setFormData({ ...formData, cryptoGains: e.target.value })
          }
        />
      </label>

      <label>
        Wallet Address:
        <input
          type="text"
          value={formData.walletAddress || ''}
          onChange={(e) =>
            setFormData({ ...formData, walletAddress: e.target.value })
          }
        />
      </label>

      <label>
        Exchange Used:
        <input
          type="text"
          value={formData.exchange || ''}
          onChange={(e) =>
            setFormData({ ...formData, exchange: e.target.value })
          }
        />
      </label>
    </div>
  );
}