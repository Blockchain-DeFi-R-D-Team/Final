import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Navbar from './components/Navbar';
import AccountInfo from './components/AccountInfo';
import PositionSummary from './components/PositionSummary';
import Borrow from './components/Borrow';
import Supply from './components/Supply';

const App = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [etherBalance, setEtherBalance] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [palcoinBalance, setPalcoinBalance] = useState(null);
  const [psrBalance, setPsrBalance] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            fetchBalances(web3Instance, accounts[0]);
          }
        });
    } else {
      alert('MetaMask is not installed. Please install it to use this app.');
    }
  }, []);

  const connectWallet = async () => {
    if (web3) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        fetchBalances(web3, accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    }
  };

  const fetchBalances = async (web3, account) => {
    const etherBalance = await web3.eth.getBalance(account);
    setEtherBalance(web3.utils.fromWei(etherBalance, 'ether'));

    // Replace with actual contract addresses and ABI
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const palcoinAddress = '0xYourPalcoinContractAddress';
    const psrAddress = '0xYourPsrContractAddress';
    const erc20Abi = [
      // Only include balanceOf method from ERC-20 ABI
      {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function"
      }
    ];

    const usdcContract = new web3.eth.Contract(erc20Abi, usdcAddress);
    const palcoinContract = new web3.eth.Contract(erc20Abi, palcoinAddress);
    const psrContract = new web3.eth.Contract(erc20Abi, psrAddress);

    const usdcBalance = await usdcContract.methods.balanceOf(account).call();
    const palcoinBalance = await palcoinContract.methods.balanceOf(account).call();
    const psrBalance = await psrContract.methods.balanceOf(account).call();

    setUsdcBalance(web3.utils.fromWei(usdcBalance, 'mwei')); // Assuming USDC has 6 decimals
    setPalcoinBalance(web3.utils.fromWei(palcoinBalance, 'ether'));
    setPsrBalance(web3.utils.fromWei(psrBalance, 'ether'));
  };

  const handleSupply = async (amount, token, receiveToken) => {
    if (!web3 || !account) return;

    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const palcoinAddress = '0xYourPalcoinContractAddress';
    const psrAddress = '0xYourPsrContractAddress';
    const erc20Abi = [
      // Include balanceOf and transfer methods from ERC-20 ABI
      {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function"
      },
      {
        constant: false,
        inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }],
        name: "transfer",
        outputs: [{ name: "success", type: "bool" }],
        type: "function"
      }
    ];

    const tokenAddress = token === 'USDC' ? usdcAddress : null;
    const receiveTokenAddress = receiveToken === 'Palcoin' ? palcoinAddress : psrAddress;

    if (tokenAddress && receiveTokenAddress) {
      const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
      const receiveTokenContract = new web3.eth.Contract(erc20Abi, receiveTokenAddress);

      const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

      try {
        await tokenContract.methods.transfer(receiveTokenAddress, amountInWei).send({ from: account });
        alert('Supply transaction successful');
      } catch (error) {
        console.error('Supply transaction failed:', error);
        alert('Supply transaction failed');
      }
    }
  };

  const handleRedeem = async (token, amount, psrToPay) => {
    // Implement the logic for redeeming the token here.
    console.log(`Redeeming ${amount} ${token}, and paying ${psrToPay} PSR.`);
    // Here you would interact with your contracts to handle the redeem transaction
  };
  
  return (
    <div className="App">
      <Navbar connectWallet={connectWallet} account={account} />
      <AccountInfo
        account={account}
        etherBalance={etherBalance}
        usdcBalance={usdcBalance}
        palcoinBalance={palcoinBalance}
        psrBalance={psrBalance}
        handleRedeem={handleRedeem}
      />
      <div className="markets">
        <Supply handleSupply={handleSupply} />
        <Borrow account={account} web3={web3} psrBalance={psrBalance} />
        <PositionSummary
        account={account}
        web3={web3}
      />
      </div>
    </div>
  );
};

export default App;
