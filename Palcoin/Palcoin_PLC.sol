// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PLC_token is ERC20 {
    address public owner;
    uint256 public Circulation;

    modifier onlyOwner() {
        require(msg.sender == owner, "You are Not the King of Paru!");
        _;
    }

    constructor(uint256 initialSupply) ERC20("Palcoin of Paru Lending", "PLC") {
        _mint(msg.sender, initialSupply);
        owner = msg.sender;
        Circulation = initialSupply;
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
        Circulation -= amount;
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
        Circulation += amount;
    }

    function ChangeOwner(address NewOwner) public onlyOwner{
        owner = NewOwner;
    }

}