import React, { useState } from 'react';

const AccountInfo = ({ etherBalance, plcBalance, pgtBalance, pbrBalance}) => {

  return (
    <div className="account-info">
      <div className="account-row">
        <div className="account-item">
          <span>Ether Balance: {etherBalance} ETH</span>
        </div>
        <div className="account-item">
          <span>Palcoin Balance: {plcBalance} PLC</span>
        </div>
      </div>
      <div className="account-row">
        <div className="account-item">
          <span>PBR Balance: {pbrBalance} PBR</span>
        </div>
        <div className="account-item">
          <span>PGT Balance: {pgtBalance} PGT</span>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
