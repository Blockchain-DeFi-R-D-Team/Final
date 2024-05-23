import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const Borrow = ({ account, web3, psrBalance }) => {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [ethPrice, setEthPrice] = useState(null);

  useEffect(() => {
    // Fetch the current Ether price from an Oracle or API
    const fetchEthPrice = async () => {
      // Placeholder: Replace with actual Oracle call or API request
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      setEthPrice(data.ethereum.usd);
    };

    fetchEthPrice();
  }, []);

  const handleBorrow = async () => {
    if (psrBalance <= 0) {
      alert('You need to purchase PSR before borrowing.');
      return;
    }

    if (!borrowAmount || isNaN(borrowAmount) || parseFloat(borrowAmount) <= 0) {
      alert('Please enter a valid amount to borrow.');
      return;
    }

    // Implement the logic to borrow Palcoin here
    const palcoinAddress = '0xYourPalcoinContractAddress';
    const palcoinAbi = [
      // Add necessary ABI details for borrowing function
    ];

    const palcoinContract = new web3.eth.Contract(palcoinAbi, palcoinAddress);

    try {
      const amountInWei = web3.utils.toWei(borrowAmount, 'ether');
      await palcoinContract.methods.borrow(amountInWei).send({ from: account });
      alert('Borrow transaction successful');
    } catch (error) {
      console.error('Borrow transaction failed:', error);
      alert('Borrow transaction failed');
    }
  };

  const handlePurchasePSR = async () => {
    if (!purchaseAmount || isNaN(purchaseAmount) || parseFloat(purchaseAmount) <= 0) {
      alert('Please enter a valid amount to purchase.');
      return;
    }

    const ethAmount = (parseFloat(purchaseAmount) / ethPrice).toFixed(6);

    try {
      const amountInWei = web3.utils.toWei(ethAmount.toString(), 'ether');
      await web3.eth.sendTransaction({
        from: account,
        to: '0xYourPsrContractAddress', // Replace with your PSR contract address
        value: amountInWei
      });
      alert('Purchase transaction successful');
      setShowPurchaseModal(false);
    } catch (error) {
      console.error('Purchase transaction failed:', error);
      alert('Purchase transaction failed');
    }
  };

  return (
    <div className="borrow">
      <h2>Borrow Palcoin</h2>
      {psrBalance > 0 ? (
        <div className="borrow-form">
          <input
            type="text"
            placeholder="Amount to borrow"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
          />
          <button onClick={handleBorrow}>Borrow</button>
        </div>
      ) : (
        <div className="psr-warning">
          <p>You need to purchase PSR before borrowing.</p>
          <button onClick={() => setShowPurchaseModal(true)}>Purchase PSR</button>
        </div>
      )}

      {showPurchaseModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Purchase PSR</h3>
            <input
              type="text"
              placeholder="Amount to purchase (PSR)"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
            />
            <p>Equivalent in Ether: {(parseFloat(purchaseAmount) / ethPrice).toFixed(6)} ETH</p>
            <button onClick={handlePurchasePSR}>Purchase</button>
            <button onClick={() => setShowPurchaseModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Borrow;
