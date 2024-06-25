import React, { useState, useEffect } from 'react';

const Exchange = ({ account, web3 }) => {
  const [ammType, setAmmType] = useState('ether-palcoin');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [output, setOutput] = useState('');

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
          outputFromChain = (parseFloat(input1) * 1.2).toFixed(2); // Example rate
          break;
        case 'pbr-to-plc':
          outputFromChain = (parseFloat(input1) * 0.8).toFixed(2); // Example rate
          break;
        case 'pgt-to-plc-pbr':
          outputFromChain = `PLC: ${(parseFloat(input1) * 0.6).toFixed(2)}, PBR: ${(parseFloat(input1) * 0.4).toFixed(2)}`;
          break;
        case 'plc-pbr-to-pgt':
          outputFromChain = (parseFloat(input1) * 0.5 + parseFloat(input2) * 0.5).toFixed(2); // Example combined rate
          break;
        default:
          break;
      }
    }
    setOutput(outputFromChain);
  };

  const handleExchange = async () => {
    if (!input1 || isNaN(input1) || parseFloat(input1) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    // Implement the exchange logic with blockchain here

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
                  <label>Receive PLC and PBR Amount:</label>
                  <input
                    type="text"
                    value={output}
                    readOnly
                    placeholder="PLC and PBR Amount"
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
