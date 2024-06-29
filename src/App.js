import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Navbar from './components/Navbar';
import AccountInfo from './components/AccountInfo';
import PositionSummary from './components/PositionSummary';
import Exchange from './components/Exchange';
import Supply from './components/Supply';
import addresses from './utils/addresses';
import abis from './utils/abis';
var BN = require('ethers').BigNumber;

async function approve(web3_window, tokenIn, amount, user_address, spender){
  amount = BN.from(amount).mul(BN.from('1000000000000000000'))
  var contract = new web3_window.eth.Contract(abis['ERC20'], addresses[tokenIn])
  let response = await contract.methods.approve(spender, amount).send({
    from: user_address
  })
  return response
}

const App = () => {
  var [account, setAccount] = useState(null);
  var [web3, setWeb3] = useState(null);
  var [etherBalance, setEtherBalance] = useState(0);
  var [plcBalance, setPlcBalance] = useState(0);
  var [pbrBalance, setPbrBalance] = useState(0);
  var [pgtBalance, setPgtBalance] = useState(0);

  useEffect(() => {
    if (window.ethereum) {
      var web3Instance = new Web3(window.ethereum);
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

  var connectWallet = async () => {
    if (web3) {
      try {
        var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        // fetchBalances(web3, accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    }
  };

  var fetchBalances = async (web3, account) => {
    console.log(account)
    var etherBalance = await web3.eth.getBalance(account);
    setEtherBalance(parseFloat(web3.utils.fromWei(etherBalance, 'ether')));
    console.log(parseFloat(web3.utils.fromWei(etherBalance, 'ether')))

    // Replace with actual contract addresses and ABI
    var palcoinAddress = addresses['PLC'];
    var pbrAddress = addresses['PBR'];
    var pgtAddress = addresses['PGT'];
    var erc20Abi = abis['ERC20']

    var palcoinContract = new web3.eth.Contract(erc20Abi, palcoinAddress);
    var pbrContract = new web3.eth.Contract(erc20Abi, pbrAddress);
    var pgtContract = new web3.eth.Contract(erc20Abi, pgtAddress);

    var palcoinBalance = await palcoinContract.methods.balanceOf(account).call();
    var pbrBalance = await pbrContract.methods.balanceOf(account).call();
    var pgtBalance = await pgtContract.methods.balanceOf(account).call();

    setPlcBalance(parseFloat(web3.utils.fromWei(palcoinBalance, 'ether')));
    setPbrBalance(parseFloat(web3.utils.fromWei(pbrBalance, 'ether')));
    setPgtBalance(parseFloat(web3.utils.fromWei(pgtBalance, 'ether')));
  };

  var handlePurchasePBR = async (purchaseAmount) => {
    if (!web3 || !account) return;
    var contractAMM = new web3.eth.Contract(abis['THREE_AMM'], addresses['THREE_AMM'])

    try {
      var amountInWei = web3.utils.toWei(purchaseAmount, 'ether');
      await approve(web3, 'PLC', amountInWei, account, addresses['THREE_AMM'])
      let response1 = await contractAMM.methods.PLC_for_PBR(amountInWei, account).send({
        from: account
      })
      console.log(response1)
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
