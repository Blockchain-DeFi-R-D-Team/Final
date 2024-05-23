import React, { useState } from 'react';

const AccountInfo = ({ etherBalance, usdcBalance, palcoinBalance, psrBalance, handleRedeem }) => {
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemToken, setRedeemToken] = useState('');
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [daysBorrowed, setDaysBorrowed] = useState(0);

  const handleShowRedeemModal = (token) => {
    setRedeemToken(token);
    setShowRedeemModal(true);
  };

  const calculatePsrToPay = () => {
    return (redeemAmount * daysBorrowed / 365).toFixed(6);
  };

  const handleRedeemSubmit = () => {
    handleRedeem(redeemToken, redeemAmount, calculatePsrToPay());
    setShowRedeemModal(false);
  };

  return (
    <div className="account-info">
      <div className="account-row">
        <div className="account-item">
          <span>Ether Balance: {etherBalance} ETH</span>
          <button onClick={() => handleShowRedeemModal('ETH')}>Redeem</button>
        </div>
        <div className="account-item">
          <span>USDC Balance: {usdcBalance} USDC</span>
          <button onClick={() => handleShowRedeemModal('USDC')}>Redeem</button>
        </div>
      </div>
      <div className="account-row">
        <div className="account-item">
          <span>Palcoin Balance: {palcoinBalance} PAL</span>
        </div>
        <div className="account-item">
          <span>PSR Balance: {psrBalance} PSR</span>
        </div>
      </div>

      {showRedeemModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Redeem {redeemToken}</h3>
            <input
              type="number"
              placeholder={`Amount of ${redeemToken} to redeem`}
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(parseFloat(e.target.value))}
            />
            <p>PSR to pay: {calculatePsrToPay()} PSR</p>
            <button onClick={handleRedeemSubmit}>Redeem</button>
            <button onClick={() => setShowRedeemModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountInfo;
