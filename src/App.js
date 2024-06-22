import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Navbar from './components/Navbar';
import AccountInfo from './components/AccountInfo';
import PositionSummary from './components/PositionSummary';
import Exchange from './components/Exchange';
import Supply from './components/Supply';

const App = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [etherBalance, setEtherBalance] = useState(null);
  const [plcBalance, setPlcBalance] = useState(null);
  const [pbrBalance, setPbrBalance] = useState(null);
  const [pgtBalance, setPgtBalance] = useState(null);

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
    const palcoinAddress = '0xYourPalcoinContractAddress';
    const pbrAddress = '0xYourPbrContractAddress';
    const pgtAddress = '0xYourPgtContractAddress';
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

    const palcoinContract = new web3.eth.Contract(erc20Abi, palcoinAddress);
    const pbrContract = new web3.eth.Contract(erc20Abi, pbrAddress);
    const pgtContract = new web3.eth.Contract(erc20Abi, pgtAddress);

    const palcoinBalance = await palcoinContract.methods.balanceOf(account).call();
    const pbrBalance = await pbrContract.methods.balanceOf(account).call();
    const pgtBalance = await pgtContract.methods.balanceOf(account).call();

    setPlcBalance(web3.utils.fromWei(palcoinBalance, 'PLC'));
    setPbrBalance(web3.utils.fromWei(pbrBalance, 'PBR'));
    setPgtBalance(web3.utils.fromWei(pgtBalance, 'PGT'));
  };

  const handlePurchasePBR = async (purchaseAmount) => {
    if (!web3 || !account) return;

    const pbrAddress = '0xYourPsrContractAddress';
    const pbrAbi = [
      // Add necessary ABI details for purchasing function
    ];

    const pbrContract = new web3.eth.Contract(pbrAbi, pbrAddress);

    try {
      const amountInWei = web3.utils.toWei(purchaseAmount, 'ether');
      // Add your purchase function call here
      // await pbrContract.methods.purchase(amountInWei).send({ from: account });
      alert('PBR purchase transaction successful');
    } catch (error) {
      console.error('PBR purchase transaction failed:', error);
      alert('PBR purchase transaction failed');
    }
  };
  ;

  
  return (
    <div className="App">
      <Navbar connectWallet={connectWallet} account={account} />
      <AccountInfo
        account={account}
        etherBalance={etherBalance}
        plcBalance={plcBalance}
        pbrBalance={pbrBalance}
        pgtBalance={pgtBalance}
      />
      <div className="markets">
        <Supply 
          account={account}
          web3={web3}
          pbrBalance={pbrBalance}
          handlePurchasePBR={handlePurchasePBR} />
        <Exchange account={account} web3={web3} pbrBalance={pbrBalance} />
        <PositionSummary
        account={account}
        web3={web3}
      />
      </div>
    </div>
  );
};

export default App;
