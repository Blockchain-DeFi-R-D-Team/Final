import React from 'react';

const Navbar = ({ account, connectWallet }) => {
  return (
    <div className="navbar">
      <div className="navbar-title">Paru Lending</div>
      <div className="navbar-button">
        {account ? (
          <span>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
        ) : (
          <button onClick={connectWallet}>Connect MetaMask</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
