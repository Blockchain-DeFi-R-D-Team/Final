import React from 'react';

const AccountInfo = ({ account, etherBalance, usdcBalance, palcoinBalance, psrBalance }) => {
  return (
    <div className="account-info">
      <h2>Account Information</h2>
      <p>Address: {account}</p>
      <p>Ether Balance: {etherBalance} ETH</p>
      <p>USDC Balance: {usdcBalance} USDC</p>
      <p>Palcoin Balance: {palcoinBalance} PAL</p>
      <p>PSR Balance: {psrBalance} PSR</p>
    </div>
  );
};

export default AccountInfo;
