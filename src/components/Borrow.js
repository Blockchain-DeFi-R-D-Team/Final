import React, { useState } from 'react';

const Borrow = () => {
  const [amount, setAmount] = useState('');

  const handleBorrow = () => {
    alert(`Borrowing ${amount} ETH`);
  };

  return (
    <div className="borrow">
      <h2>Borrow</h2>
      <input
        type="text"
        placeholder="Amount to borrow"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button  onClick={handleBorrow}>Borrow</button>
    </div>
  );
};

export default Borrow;