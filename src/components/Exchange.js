import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import addresses from '../utils/addresses'
import abis from '../utils/abis'
import provider from '../utils/provider'
import { input } from '@testing-library/user-event/dist/cjs/event/input.js';
var BN = require('ethers').BigNumber;

let web3 = new Web3(new Web3.providers.WebsocketProvider(provider['sepolia']));
var contractAMM = new web3.eth.Contract(abis['THREE_AMM'], addresses['THREE_AMM']);


async function approve(web3_window, tokenIn, amount, user_address, spender){
  amount = BN.from(amount).mul(BN.from('1000000000000000000'))
  var contract = new web3_window.eth.Contract(abis['ERC20'], addresses[tokenIn])
  let response = await contract.methods.approve(spender, amount).send({
    from: user_address
  })
  return response
}


const Exchange = ({ account, web3 }) => {
  const [ammType, setAmmType] = useState('ether-palcoin');
  const [input1, setInput1] = useState('0');
  const [input2, setInput2] = useState('0');
  const [output, setOutput] = useState('NULL');
  const [output1, setOutput1] = useState('NULL');

  const [exchangeType, setExchangeType] = useState('');

  useEffect(() => {
    if (input1) {
      calculateOutput();
    }
  }, [input1, input2,exchangeType]);

  const calculateOutput = async () => {
    // Fetch the output from the blockchain based on the input values and selected tokens
    // This is a placeholder function. Replace with actual logic.

    let outputFromChain = 0;
    let outputFromChain1 = 0;

    if (ammType === 'ether-palcoin') {
      if (exchangeType === 'ether-to-palcoin') {
        outputFromChain = (parseFloat(input1) * 1.5).toFixed(2); // Example rate
      } else if (exchangeType === 'palcoin-to-ether') {
        outputFromChain = (parseFloat(input1) / 1.5).toFixed(2); // Example rate
      }
    } else {
      // Example conversion for Palcoin-PBR-PGT
      switch (exchangeType) {
        case 'plc-to-pbr':
          var amountIn = BN.from(input1).mul(BN.from('1000000000000000000'))
          outputFromChain = await contractAMM.methods.PLC_for_PBR_getamount(amountIn).call()
          outputFromChain = (BN.from(outputFromChain).div(BN.from('1000000000000000000'))).toString()
          break;
        case 'pbr-to-plc':
          var amountIn = BN.from(input1).mul(BN.from('1000000000000000000'))
          outputFromChain = await contractAMM.methods.PBR_for_PLC_getamount(amountIn).call()
          outputFromChain = (BN.from(outputFromChain).div(BN.from('1000000000000000000'))).toString()
          break;
        case 'pgt-to-plc-pbr':
          var pgtIn = BN.from(input1).mul(BN.from('1000000000000000000'))
          outputFromChain = await contractAMM.methods.PGT_for_PLCPBR_getamount(pgtIn).call()
          outputFromChain1 = (BN.from(outputFromChain[0]).div(BN.from('1000000000000000000'))).toString()
          outputFromChain = (BN.from(outputFromChain[1]).div(BN.from('1000000000000000000'))).toString()
          break;
        case 'plc-pbr-to-pgt':
          var plcIn = BN.from(input1).mul(BN.from('1000000000000000000'))
          var pbrIn = BN.from(input2).mul(BN.from('1000000000000000000'))
          outputFromChain = await contractAMM.methods.PLCPBR_for_PGT_getamount(plcIn, pbrIn).call()
          outputFromChain = (BN.from(outputFromChain).div(BN.from('1000000000000000000'))).toString()
          break;
        default:
          break;
      }
    }
    setOutput(outputFromChain);
    setOutput1(outputFromChain1);
  };

  const handleExchange = async () => {
    var web3_window = new Web3(window.ethereum);
    // 请求用户授权访问以太坊帐户
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    var accs = await web3.eth.getAccounts();
    var contractAMM = new web3_window.eth.Contract(abis['THREE_AMM'], addresses['THREE_AMM'])

    if (!input1 || isNaN(input1) || parseFloat(input1) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    else if (ammType === 'ether-palcoin') {
      if (exchangeType === 'ether-to-palcoin') {

      } 
      else if (exchangeType === 'palcoin-to-ether') {

      }
    } else {
      // Example conversion for Palcoin-PBR-PGT
      switch (exchangeType) {
        case 'plc-to-pbr':
          try{
            var amountIn = BN.from(input1).mul(BN.from('1000000000000000000'))
            await approve(web3_window, 'PLC', amountIn, accs[0], addresses['THREE_AMM'])
            let response1 = await contractAMM.methods.PLC_for_PBR(amountIn, accs[0]).send({
              from: accs[0]
            })
            console.log(response1)
          }
          catch (error) {
            console.error('Error:', error);
          }
          break;
        case 'pbr-to-plc':
          try{
            var amountIn = BN.from(input1).mul(BN.from('1000000000000000000'))
            await approve(web3_window, 'PBR', amountIn, accs[0], addresses['THREE_AMM'])
            let response2 = await contractAMM.methods.PBR_for_PLC(amountIn, accs[0]).send({
              from: accs[0]
            })
            console.log(response2)
          }
          catch (error) {
            console.error('Error:', error);
          }
          break;
        case 'pgt-to-plc-pbr':
          try{
            var amountIn = BN.from(input1).mul(BN.from('1000000000000000000'))
            await approve(web3_window, 'PGT', amountIn, accs[0], addresses['THREE_AMM'])
            let response3 = await contractAMM.methods.PGT_for_PLCPBR(amountIn, accs[0]).send({
              from: accs[0]
            })
            console.log(response3)
          }
          catch (error) {
            console.error('Error:', error);
          }
          break;
        case 'plc-pbr-to-pgt':
          try{
            var plcIn = BN.from(input1).mul(BN.from('1000000000000000000'))
            var pbrIn = BN.from(input2).mul(BN.from('1000000000000000000'))
            await approve(web3_window, 'PLC', plcIn, accs[0], addresses['THREE_AMM'])
            await approve(web3_window, 'PBR', pbrIn, accs[0], addresses['THREE_AMM'])
            let response4 = await contractAMM.methods.PLCPLB_for_PGT(plcIn, pbrIn, accs[0]).send({
              from: accs[0]
            })
            console.log(response4)
          }
          catch (error) {
            console.error('Error:', error);
          }
          break;
        default:
          break;
      }
    }
    

  };

  return (
    <div className="exchange">
      <h2>Exchange</h2>
      <div className="exchange-type">
        <button onClick={() => setAmmType('ether-palcoin')}>Ether-Palcoin AMM</button>
        <button onClick={() => setAmmType('palcoin-pbr-pgt')}>Palcoin-PBR-PGT AMM</button>
      </div>

      {ammType === 'ether-palcoin' && (
        <div className="amm ether-palcoin">
          <h2>Ether-Palcoin AMM</h2>
          <div className="exchange-form">
            <div>
              <label>Exchange Type:</label>
              <select value={exchangeType} onChange={(e) => setExchangeType(e.target.value)}>
                <option value="ether-to-palcoin">Ether to Palcoin</option>
                <option value="palcoin-to-ether">Palcoin to Ether</option>
              </select>
            </div>
            <div>
              <label>Input Amount:</label>
              <input
                type="number"
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
                placeholder="Amount"
              />
            </div>
            <div>
              <label>Receive Amount:</label>
              <input
                type="number"
                value={output}
                readOnly
                placeholder="Amount"
              />
            </div>
            <button onClick={handleExchange}>Exchange</button>
          </div>
        </div>
      )}

{ammType === 'palcoin-pbr-pgt' && (
        <div className="amm palcoin-pbr-pgt">
          <h2>Palcoin-PBR-PGT AMM</h2>
          <div className="exchange-form">
            <div>
              <label>Exchange Type:</label>
              <select onChange={(e) => setExchangeType(e.target.value)}>
                <option value="">Select</option>
                <option value="plc-to-pbr">Palcoin (PLC) to PBR</option>
                <option value="pbr-to-plc">PBR to Palcoin (PLC)</option>
                <option value="pgt-to-plc-pbr">PGT to Palcoin (PLC) and PBR</option>
                <option value="plc-pbr-to-pgt">Palcoin (PLC) and PBR to PGT</option>
              </select>
            </div>

            {(exchangeType === 'plc-to-pbr' || exchangeType === 'pbr-to-plc') && (
              <>
                <div>
                  <label>Input Amount:</label>
                  <input
                    type="number"
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                    placeholder="Amount"
                  />
                </div>
                <div>
                  <label>Receive Amount:</label>
                  <input
                    type="number"
                    value={output}
                    readOnly
                    placeholder="Amount"
                  />
                </div>
              </>
            )}

            {exchangeType === 'pgt-to-plc-pbr' && (
              <>
                <div>
                  <label>Input PGT Amount:</label>
                  <input
                    type="number"
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                    placeholder="PGT Amount"
                  />
                </div>
                <div>
                  <label>Receive PLC Amount:</label>
                  <input
                    type="text"
                    value={output}
                    readOnly
                    placeholder="PLC Amount"
                  />
                </div>
                <div>
                  <label>Receive PBR Amount:</label>
                  <input
                    type="text"
                    value={output1}
                    readOnly
                    placeholder="PBR Amount"
                  />
                </div>
              </>
            )}

            {exchangeType === 'plc-pbr-to-pgt' && (
              <>
                <div>
                  <label>Input PLC Amount:</label>
                  <input
                    type="number"
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                    placeholder="PLC Amount"
                  />
                </div>
                <div>
                  <label>Input PBR Amount:</label>
                  <input
                    type="number"
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                    placeholder="PBR Amount"
                  />
                </div>
                <div>
                  <label>Receive PGT Amount:</label>
                  <input
                    type="number"
                    value={output}
                    readOnly
                    placeholder="PGT Amount"
                  />
                </div>
              </>
            )}
            <button onClick={handleExchange}>Exchange</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exchange;