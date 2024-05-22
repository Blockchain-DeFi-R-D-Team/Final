import React from 'react';

const BorrowMarket = () => {
  // Mock data
  const markets = [
    { asset: 'ETH', rate: '5.5%' },
    { asset: 'DAI', rate: '3.1%' },
  ];

  return (
    <div className="borrow-market">
      <h2>Borrow Market</h2>
      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market, index) => (
            <tr key={index}>
              <td>{market.asset}</td>
              <td>{market.rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BorrowMarket;