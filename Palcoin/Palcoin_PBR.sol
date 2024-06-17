// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PBR_token is ERC20 {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "You are Not the King of Paru!");
        _;
    }

    constructor(uint256 initialSupply) ERC20("Paru Borrowing Right of Paru Lending", "PBR") {
        _mint(msg.sender, initialSupply);
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function ChangeOwner(address NewOwner) public onlyOwner{
        owner = NewOwner;
    }
}