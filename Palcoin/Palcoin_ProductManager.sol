// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./library_PalcoinStruct.sol";

contract Palcoin_ProductManager{
    mapping(address => bool) IsOwner;
    using PalcoinStruct for PalcoinStruct.Debt_package;
    PalcoinStruct.Debt_package[] public Product;
    
    modifier onlyOwner() {
        require(IsOwner[msg.sender] == true, "You are Not the King of Paru!");
        _;
    }

    constructor(address MsgSender) payable {
        //Our First Debt Package
        PalcoinStruct.Debt_package memory First_Product = PalcoinStruct.Debt_package({
            Name : "ChipiChipi",
            MaxDebtRatio : 8000,           // 0.8
            MaxInitDebtRatio : 7500,       // 0.75
            MinDebtFloor : 1 * 10 ** 18,
            MaxDebtCeil : 100000000 * 10 *18,
            LiquidationPanalty : 2000,     // 0.20
            InterestRate : 1000,           // 0.1
            LiquidationRatio : 2500,       // 0.25
            MinDuration : 10 * 86400,              // 10 day
            active : true
        });
        Product.push(First_Product);
        IsOwner[MsgSender] = true;
        IsOwner[msg.sender] = true;
    }

    // DebtPackageShow show Debt Product[index] 
    function DebtPackageShow(uint index) public view returns(PalcoinStruct.Debt_package memory){
        require(index < Product.length, "Index out of bounds");
        return Product[index];
    }

    function NewProduct(
        string calldata _Name,
        uint256 _MaxDebtRatio, // * 10 ** 4
        uint256 _MaxInitDebtRatio,   // * 10 ** 4
        uint256 _MinDebtFloor,
        uint256 _MaxDebtCeil,
        uint256 _LiquidationPanalty, // * 10 ** 4
        uint256 _InterestRate,       // * 10 ** 4
        uint256 _LiquidationRatio,   // * 10 ** 4
        uint _MinDuration
    ) public onlyOwner {
        PalcoinStruct.Debt_package memory New_Product = PalcoinStruct.Debt_package({
            Name : _Name,
            MaxDebtRatio : _MaxDebtRatio,
            MaxInitDebtRatio : _MaxInitDebtRatio,
            MinDebtFloor : _MinDebtFloor,
            MaxDebtCeil : _MaxDebtCeil,
            LiquidationPanalty : _LiquidationPanalty,
            InterestRate : _InterestRate,
            LiquidationRatio : _LiquidationRatio,
            MinDuration : _MinDuration,
            active : true
        });
        Product.push(New_Product);
    }

    // Product can only be deleted, it cannot be modified. 
    function OfflineProduct(uint Index) public onlyOwner {
        require(Index < Product.length, "Index out of bounds");
        Product[Index].active = false;
    }

}