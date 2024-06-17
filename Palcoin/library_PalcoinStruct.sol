// library_PalcoinStruct.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

library PalcoinStruct{
    struct Debt_package{
        string Name;
        uint256 MaxDebtRatio; // * 10 ** 4
        uint256 MaxInitDebtRatio;   // * 10 ** 4
        uint256 MinDebtFloor;
        uint256 MaxDebtCeil;
        uint256 LiquidationPanalty; // * 10 ** 4
        uint256 InterestRate;       // * 10 ** 4
        uint256 LiquidationRatio;   // * 10 ** 4
        uint256 MinDuration;
        bool active;
    }
    
    struct Debt_Info{
        uint index;
        uint256 ETH_collateral;
        uint256 PLC_debt;
        uint256 BeginDate;
        uint256 ExpireDate;
        uint256 PBR_remain;
        uint256 MaxLiquidationAmount;
        uint256 HealthyFactor;      // * 10 ** 4
        bool active;
    }
}