import React from 'react';

const Navbar = ({ account, connectWallet }) => {
  return (
    <div className="navbar">
      <div className="navbar-title">
      <img src="Paru.png" alt="Logo" className="navbar-logo" /> 
      <span>Paru Lending</span> 
      </div>
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
