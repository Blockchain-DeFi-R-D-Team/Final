// library_SafeMath256.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

library SafeDecimalMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeDecimalMath: addition overflow");
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeDecimalMath: subtraction overflow");
        uint256 c = a - b;
        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0 || b == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c <= type(uint256).max, "SafeDecimalMath: multiplication overflow");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeDecimalMath: division by zero");
        uint256 c = a/ b;
        return c;
    }

    function pow(uint256 base, uint256 exponent) internal pure returns (uint256) {
        if (exponent == 0) {
            return 1;
        }
        uint256 result = base;
        result=base**exponent;
        return result;
    }
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        // Initial guess
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        // Newton's iteration
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}