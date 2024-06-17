// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract BandProtocolConsumer {
    bytes32 public storedHash;
    function hashAndStore(address _addr, uint256 _num) public {
        storedHash = sha256(abi.encodePacked(_addr, _num));
    }
}