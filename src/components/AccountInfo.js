import React from 'react';

const AccountInfo = ({ etherBalance, plcBalance, pgtBalance, pbrBalance}) => {

  return (
    <div className="account-info">
      <div className="account-row">
        <div className="account-item">
          <span>Ether Balance: {etherBalance.toFixed(2)} ETH</span>
        </div>
        <div className="account-item">
          <span>Palcoin Balance: {plcBalance.toFixed(2)} PLC</span>
        </div>
      </div>
      <div className="account-row">
        <div className="account-item">
          <span>PBR Balance: {pbrBalance.toFixed(2)} PBR</span>
        </div>
        <div className="account-item">
          <span>PGT Balance: {pgtBalance.toFixed(2)} PGT</span>
        </div>
      </div>
    </div>
  );
}

export default AccountInfo;
