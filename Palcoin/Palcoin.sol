// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Palcoin_TestAgent.sol";
import "./Palcoin_DebtManager.sol";

contract Palcoin_Platform{

    using SafeDecimalMath for uint256;
    address public owner;
    PLC_token public PLC;
    PBR_token public PBR;
    PGT_token public PGT;
    Palcoin_ProductManager public ProductManager;
    Palcoin_DebtManager public DebtManager;
    Palcoin_ThreeAssetAMM public PAMM;
    Palcoin_TestAgent public TestAgent;   //only for test
    uint256 public PGTstake;

    modifier onlyOwner() {
        require(msg.sender == owner, "You are Not the King of Paru!");
        _;
    }

    constructor () payable {
        owner = msg.sender;
        PLC = new PLC_token(200 * 10 ** 18);  // 100 for Pamm, 100 for agent
        PBR = new PBR_token(200 * 10 ** 18);  // 100 for Pamm, 100 for agent
        PGT = new PGT_token(100000000 * 10 ** 18);
        ProductManager = new Palcoin_ProductManager(owner);
        PGTstake = 0;
    }

    // Suppose we have deploy PAMM contract and DebtManager
    function Pamm_and_DebtManager_Init(address _PAMM, address _DebtManager) public {
        PAMM = Palcoin_ThreeAssetAMM(_PAMM);
        IERC20(address(PLC)).transfer(address(PAMM), 100 * 10 ** 18);
        IERC20(address(PBR)).transfer(address(PAMM), 100 * 10 ** 18);
        IERC20(address(PGT)).transfer(address(PAMM), 100 * 10 ** 18);
        IERC20(address(PGT)).transfer(owner, 99999800 * 10 ** 18);
        PAMM.init();
        DebtManager = Palcoin_DebtManager(_DebtManager);
        PLC.ChangeOwner(address(DebtManager));
    }
    
    // Test Agent contract initialize
    function TestAgentInitialize() public onlyOwner {
        TestAgent = new Palcoin_TestAgent(
            address(PLC), 
            address(PBR), 
            address(PGT), 
            address(PAMM), 
            owner,
            address(DebtManager)
        );
        PLC.transfer(address(TestAgent), 100 * 10 ** 18);
        PBR.transfer(address(TestAgent), 100 * 10 ** 18);
        PGT.transfer(address(TestAgent), 100 * 10 ** 18);
    }

    function MinePBR(uint256 PGTamount)public onlyOwner {
        require(PGT.transferFrom(msg.sender, address(this), PGTamount), "PGT transfer failed");
        PBR.mint(address(this), PGTamount);
        require(PBR.transfer(msg.sender, PGTamount), "PBR transfer failed");
        PGTstake += PGTamount;
    }

    function RetrievePGTstake(uint256 PGTamount)public onlyOwner {
        require(PBR.transferFrom(msg.sender, address(this), PGTamount), "PBR transfer failed");
        PBR.burn(PGTamount);
        require(PGT.transfer(msg.sender, PGTamount), "PGT transfer failed");
        PGTstake -= PGTamount;
    }

    receive() external payable {}
    fallback() external payable {}
}