import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

const PositionSummary = ({ account, web3 }) => {
  const [etherCollateral, setEtherCollateral] = useState(0);
  const [usdcCollateral, setUsdcCollateral] = useState(0);
  const [etherPrice, setEtherPrice] = useState(0);
  const [usdcPrice, setUsdcPrice] = useState(1); // USDC is generally pegged to $1

  const fetchCollateral = async () => {
    // Replace with actual contract calls to get user's collateral amounts
    const etherCollateralAmount = await getEtherCollateralFromContract(account);
    const usdcCollateralAmount = await getUsdcCollateralFromContract(account);

    setEtherCollateral(web3.utils.fromWei(etherCollateralAmount, 'ether'));
    setUsdcCollateral(web3.utils.fromWei(usdcCollateralAmount, 'mwei')); 
  };

  const fetchPrices = async () => {
    // Replace with actual Oracle contract calls
    const etherPriceFromOracle = await getEtherPriceFromOracle();
    const usdcPriceFromOracle = await getUsdcPriceFromOracle();

    setEtherPrice(etherPriceFromOracle);
    setUsdcPrice(usdcPriceFromOracle);
  };

  useEffect(() => {
    if (web3 && account) {
      fetchCollateral();
      fetchPrices();
    }
  }, [web3, account]);


  const getEtherCollateralFromContract = async (account) => {
    // Dummy function - replace with actual contract call
    return web3.utils.toWei('1', 'ether'); // 1 ETH for example
  };

  const getUsdcCollateralFromContract = async (account) => {
    // Dummy function - replace with actual contract call
    return web3.utils.toWei('1000', 'mwei'); // 1000 USDC for example
  };

  const getEtherPriceFromOracle = async () => {
    // Dummy function - replace with actual Oracle contract call
    return 3000; // $3000 per ETH for example
  };

  const getUsdcPriceFromOracle = async () => {
    // Dummy function - replace with actual Oracle contract call
    return 1; // $1 per USDC
  };

  const getTotalBorrowed = () => {
    // Dummy function - replace with actual contract call to get borrowed amount
    return 0; // Assume nothing borrowed for now
  };

  const collateralValue = (etherCollateral * etherPrice) + (usdcCollateral * usdcPrice);
  const liquidationPoint = collateralValue * 0.7; // Assume a liquidation threshold of 50%
  const borrowCapacity = collateralValue * 0.8; // Assume borrowing capacity is 75% of collateral value
  const availableToBorrow = borrowCapacity - getTotalBorrowed(); // Subtract already borrowed amount

  return (
    <div className="position-summary">
      <h2>Position Summary</h2>
      <table>
        <tbody>
          <tr>
            <td>Collateral Value:</td>
            <td>${collateralValue.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Liquidation Point:</td>
            <td>${liquidationPoint.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Borrow Capacity:</td>
            <td>${borrowCapacity.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Available to Borrow:</td>
            <td>${availableToBorrow.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PositionSummary;
