import React, { useState } from 'react';

const Supply = ({ handleSupply }) => {
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('USDC');
  const [receiveToken, setReceiveToken] = useState('Palcoin');
  const [convertedAmount, setConvertedAmount] = useState('');

  const handleAmountChange = (e) => {
    const amount = e.target.value;
    setAmount(amount);
    updateConvertedAmount(amount, receiveToken);
  };

  const handleReceiveTokenChange = (e) => {
    const receiveToken = e.target.value;
    setReceiveToken(receiveToken);
    updateConvertedAmount(amount, receiveToken);
  };

  const updateConvertedAmount = (amount, receiveToken) => {
    let rate = 1;
    if (receiveToken === 'Palcoin') {
      rate = 1; // 1 USDC = 1 Palcoin
    } else if (receiveToken === 'PSR') {
      rate = 1; // 1 USDC = 1 PSR
    }
    setConvertedAmount(amount * rate);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSupply(amount, token, receiveToken);
  };

  return (
    <div className="supply">
      <h2>Supply</h2>
      <form onSubmit={handleSubmit} className="supply-form">
        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            required
          />
        </div>
        <div className="form-group">
          <label>Collecteral Asset:</label>
          <select value={token} onChange={(e) => setToken(e.target.value)}>
            <option value="USDC">USDC</option>
            <option value="ETH">Ether</option>
          </select>
        </div>
        <div className="form-group">
          <label>Converted Amount:</label>
          <input
            type="text"
            value={convertedAmount}
            readOnly
            placeholder="Converted amount"
          />
        </div>
        <div className="form-group">
          <label>Receive Token:</label>
          <select value={receiveToken} onChange={handleReceiveTokenChange}>
            <option value="Palcoin">Palcoin</option>
            <option value="PSR">PSR</option>
          </select>
        </div>
        <button type="submit" className="supply-button">Supply</button>
      </form>
    </div>
  );
};

export default Supply;
