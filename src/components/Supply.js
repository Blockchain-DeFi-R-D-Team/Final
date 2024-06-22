import React, { useState, useEffect } from 'react';

const Supply = ({ account, web3, pbrBalance, handlePurchasePBR }) => {
  const [etherAmount, setEtherAmount] = useState('');
  const [pbrAmount, setPbrAmount] = useState('');
  const [palcoinAmount, setPalcoinAmount] = useState('');
  const [borrowDays, setBorrowDays] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');

  useEffect(() => {
    if (etherAmount && pbrAmount && parseFloat(pbrAmount) > 0 && parseFloat(pbrAmount) <= pbrBalance) {
      calculatePalcoinAndDays();
    } else {
      setPalcoinAmount('NAN');
      setBorrowDays('NAN');
    }
  }, [etherAmount, pbrAmount]);

  const calculatePalcoinAndDays = async () => {
    // Fetch palcoinAmount and borrowDays from the blockchain
    // This is a placeholder function. Replace with actual logic.
    const palcoinAmountFromChain = (parseFloat(etherAmount) * 10).toFixed(2); // Example conversion
    const borrowDaysFromChain = (parseFloat(pbrAmount) * 30).toFixed(0); // Example conversion

    setPalcoinAmount(palcoinAmountFromChain);
    setBorrowDays(borrowDaysFromChain);
  };

  const handleSupply = async () => {
    if (!etherAmount || isNaN(etherAmount) || parseFloat(etherAmount) <= 0) {
      alert('Please enter a valid Ether amount.');
      return;
    }

    if (!pbrAmount || isNaN(pbrAmount) || parseFloat(pbrAmount) <= 0 || parseFloat(pbrAmount) > pbrBalance) {
      alert('Insufficient PBR balance. Please purchase more PBR.');
      return;
    }

    // Implement the logic to supply Ether and PBR here
    // Replace with actual contract addresses and ABI
    const palcoinAddress = '0xYourPalcoinContractAddress';
    const palcoinAbi = [
      // Add necessary ABI details for supplying function
    ];

    const palcoinContract = new web3.eth.Contract(palcoinAbi, palcoinAddress);

    try {
      const amountInWei = web3.utils.toWei(etherAmount, 'ether');
      // Add your supply function call here
      // await palcoinContract.methods.supply(amountInWei, pbrAmount).send({ from: account });
      alert('Supply transaction successful');
    } catch (error) {
      console.error('Supply transaction failed:', error);
      alert('Supply transaction failed');
    }
  };

  const handlePurchaseSubmit = () => {
    handlePurchasePBR(purchaseAmount);
    setShowPurchaseModal(false);
  };

  return (
    <div className="supply">
      <h2>Paru Loan</h2>
      <div className="supply-form">
      <button onClick={() => setShowPurchaseModal(true)}>Purchase PBR</button>
      <div className="input-group">
          <input
            type="number"
            placeholder="Ether amount"
            value={etherAmount}
            onChange={(e) => setEtherAmount(e.target.value)}
          />
          <span className="input-label">ETH (Collateral Asset)</span>
        </div>
        <div className="input-group">
          <input
            type="number"
            placeholder="PBR amount"
            value={pbrAmount}
            onChange={(e) => setPbrAmount(e.target.value)}
          />
          <span className="input-label">PBR (Borrow Consume)</span>
        </div>
        <div className="calculated-results">
            <div>
              <span>Palcoin Amount: {palcoinAmount} PAL</span>
            </div>
            <div>
              <span>Borrow Days: {borrowDays} days</span>
            </div>
        </div>
        <button onClick={handleSupply}>Deposit && Borrow</button>
      </div>

      {showPurchaseModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Purchase PBR</h3>
            <input
              type="number"
              placeholder="Amount to purchase (PBR)"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
            />
            <button onClick={handlePurchaseSubmit}>Purchase</button>
            <button onClick={() => setShowPurchaseModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supply;
