import React, { useState, useEffect } from 'react';
import addresses from '../utils/addresses'
import abis from '../utils/abis'
var BN = require('ethers').BigNumber;

async function approve(web3_window, tokenIn, amount, user_address, spender){
  amount = BN.from(amount).mul(BN.from('1000000000000000000'))
  var contract = new web3_window.eth.Contract(abis['ERC20'], addresses[tokenIn])
  let response = await contract.methods.approve(spender, amount).send({
    from: user_address
  })
  return response
}

const Supply = ({ account, web3, pbrBalance, handlePurchasePBR }) => {
  const [etherAmount, setEtherAmount] = useState('');
  const [pbrAmount, setPbrAmount] = useState('');
  const [palcoinAmount, setPalcoinAmount] = useState('');
  const [borrowDays, setBorrowDays] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');

  useEffect(() => {
    if (etherAmount && pbrAmount ) {
      calculatePalcoinAndDays();
    } else {
      setPalcoinAmount('NAN');
      setBorrowDays('NAN');
    }
  }, [etherAmount, pbrAmount]);

  const calculatePalcoinAndDays = async () => {

    var debtContract = new web3.eth.Contract(abis['DEBT_MANAGER'], addresses['DEBT_MANAGER']);
    let price = await debtContract.methods.getEthUsdPrice().call()
    price = price/10000
    const palcoinAmountFromChain = (etherAmount * price * 0.8).toFixed(2); // Example conversion
    const borrowDaysFromChain = (parseFloat(pbrAmount) * (365 * 10 ** 4) / 1000 / palcoinAmountFromChain).toFixed(0); // Example conversion

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

    try {

      var pbrAmountInWei = BN.from(pbrAmount).mul(BN.from('1000000000000000000'))
      var etherAmountInWei = BN.from(etherAmount).mul(BN.from('1000000000000000000'))
      var palcoinAmountInWei = BN.from(etherAmount).mul(BN.from('1000000000000000000'))
      var debtContract = new web3.eth.Contract(abis['DEBT_MANAGER'], addresses['DEBT_MANAGER']);

      await approve(web3, 'PBR', pbrAmountInWei, account, addresses['THREE_AMM'])
      const response = await debtContract.methods
        .borrow(0, palcoinAmountInWei, pbrAmountInWei)
        .send({ from: account, 
                value: etherAmountInWei});
      console.log(response)
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
