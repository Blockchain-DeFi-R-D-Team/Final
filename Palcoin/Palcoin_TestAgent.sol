// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Palcoin_AMM.sol";

contract Palcoin_TestAgent{
    address public PLC;
    address public PBR;
    address public PGT;
    address public PAMM;
    Palcoin_ThreeAssetAMM public amm;
    address public DebtManager;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "You are Not the King of Paru!");
        _;
    }

    constructor(
        address _PLC,
        address _PBR,
        address _PGT,
        address _PAMM,
        address _owner,
        address _DebtManager
    )payable {
        PLC = _PLC;
        PBR = _PBR;
        PGT = _PGT;
        PAMM = _PAMM;
        amm = Palcoin_ThreeAssetAMM(_PAMM);
        owner = _owner;
        DebtManager = _DebtManager;
    }

    function ShowBalancePLC() public onlyOwner view returns(uint256){
        return IERC20(PLC).balanceOf(address(this));
    }

    function ShowBalancePBR() public onlyOwner view returns(uint256){
        return IERC20(PBR).balanceOf(address(this));
    }

    function ShowBalancePGT() public onlyOwner view returns(uint256){
        return IERC20(PGT).balanceOf(address(this));
    }

    function TestAMM_PLC_for_PBR(uint256 PLC_InAmount) public onlyOwner returns(uint256){
        IERC20(PLC).approve(PAMM, PLC_InAmount);
        uint256 tmp = amm.PLC_for_PBR(PLC_InAmount, address(this));
        return tmp;
    }

    function TestAMM_PBR_for_PLC(uint256 PBR_InAmount) public onlyOwner returns(uint256){
        IERC20(PBR).approve(PAMM, PBR_InAmount);
        uint256 tmp = amm.PBR_for_PLC(PBR_InAmount, address(this));
        return tmp;
    }

    function TestAMM_PLCPLB_for_PGT(uint256 PLC_InAmount, uint256 PBR_InAmount) public onlyOwner returns(uint256){
        IERC20(PLC).approve(PAMM, PLC_InAmount);
        IERC20(PBR).approve(PAMM, PBR_InAmount);
        uint256 tmp = amm.PLCPLB_for_PGT(PLC_InAmount, PBR_InAmount, address(this));
        return tmp;
    }

    function TestAMM_PGT_for_PLCPBR(uint256 PGT_InAmount) public onlyOwner returns(uint256, uint256){
        IERC20(PGT).approve(PAMM, PGT_InAmount);
        return amm.PGT_for_PLCPBR(PGT_InAmount, address(this));
    }

    function TestAMM_PGT_for_PLC(uint256 PGT_InAmount) public onlyOwner returns(uint256){
        IERC20(PGT).approve(PAMM, PGT_InAmount);
        return amm.PGT_for_PLC(PGT_InAmount, address(this));
    }

    function TestAMM_PGT_for_PBR(uint256 PGT_InAmount) public onlyOwner returns(uint256){
        IERC20(PGT).approve(PAMM, PGT_InAmount);
        return amm.PGT_for_PBR(PGT_InAmount, address(this));
    }

    function TestAMM_AddLiquidity(
        uint256 PLC_InAmount, 
        uint256 PBR_InAmount, 
        uint256 PGT_InAmount
        ) public onlyOwner returns(uint256){
        IERC20(PLC).approve(PAMM, PLC_InAmount);
        IERC20(PBR).approve(PAMM, PBR_InAmount);
        IERC20(PGT).approve(PAMM, PGT_InAmount);
        return amm.AddLiquidity(PLC_InAmount, PBR_InAmount, PGT_InAmount);
    }

    function TestAMM_RemoveLiquidity(uint256 LP_token) public onlyOwner returns(uint256, uint256){
        return amm.RemoveLiquidity(LP_token, address(this));
    }
    
    receive() external payable {}
    fallback() external payable {}

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

}