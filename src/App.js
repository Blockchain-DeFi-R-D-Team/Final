import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Navbar from './components/Navbar';
import AccountInfo from './components/AccountInfo';
import BorrowMarket from './components/BorrowMarket';
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

    const tokenContract = new web3.eth.Contract(erc20Abi, usdcAddress);

    if (token === 'USDC') {
      const amountInWei = web3.utils.toWei(amount, 'mwei'); // USDC has 6 decimals
      await tokenContract.methods.transfer('0xYourContractAddress', amountInWei).send({ from: account });
    } else if (token === 'ETH') {
      const amountInWei = web3.utils.toWei(amount, 'ether');
      await web3.eth.sendTransaction({ from: account, to: '0xYourContractAddress', value: amountInWei });
    }

    // Depending on the selected receiveToken, call appropriate contract methods
    if (receiveToken === 'Palcoin') {
      // Logic to mint or transfer Palcoin to the user
    } else if (receiveToken === 'PSR') {
      // Logic to mint or transfer PSR to the user
    }

    // Optionally fetch updated balances after the transaction
    fetchBalances(web3, account);
  };

  return (
    <div className="app-container">
      <Navbar account={account} connectWallet={connectWallet} />
      <AccountInfo
        account={account}
        etherBalance={etherBalance}
        usdcBalance={usdcBalance}
        palcoinBalance={palcoinBalance}
        psrBalance={psrBalance}
      />
      <div className="markets">
        <Supply handleSupply={handleSupply} />
        <BorrowMarket />
      </div>
      <Borrow />
    </div>
  );
};

export default App;
