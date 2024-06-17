// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Palcoin_PLC.sol";
import "./Palcoin_PBR.sol";
import "./Palcoin_PGT.sol";
import "./library_SafeMath256.sol";

contract Palcoin_ThreeAssetAMM {
    using SafeDecimalMath for uint256;
    address public PLC;
    address public PBR;
    address public PGT;
    uint256 public k;
    uint256 public A;
    mapping(address => uint256) public LPtoken_balances;
    uint256 public LPtoken_total;
    bool private Initialized;
    address public owner;
    // x+y+z+xyz/k=A

    modifier onlyOwner() {
        require(msg.sender == owner, "You are Not the King of Paru!");
        _;
    }

    constructor(address _tokenX, address _tokenY, address _tokenZ) {
        PLC = _tokenX;
        PBR = _tokenY;
        PGT = _tokenZ;
        LPtoken_total = 0;
        Initialized = false;
        owner = msg.sender;
    }

    function init() public {
        require(Initialized == false, "PAMM has been initialized.");
        k = 10 ** 40;
        uint256 PLC_balance = IERC20(PLC).balanceOf(address(this));
        uint256 PBR_balance = IERC20(PBR).balanceOf(address(this));
        uint256 PGT_balance = IERC20(PGT).balanceOf(address(this));
        Initialized = true;
        A = PLC_balance + PBR_balance + PGT_balance + (PLC_balance * PBR_balance * PGT_balance)/k;

        LPtoken_balances[tx.origin] = PLC_balance + PBR_balance;
        // This equition only stand for initialization.

        LPtoken_total = LPtoken_balances[tx.origin];
    }

    // AmmBalancePLC return the PLC balance of amm pool
    function AmmBalancePLC() public view returns (uint256){
        return IERC20(PLC).balanceOf(address(this));
    }

    // AmmBalancePBR return the PBR balance of amm pool
    function AmmBalancePBR() public view returns (uint256){
        return IERC20(PBR).balanceOf(address(this));
    }

    // AmmBalancePGT return the PLC balance of amm pool
    function AmmBalancePGT() public view returns (uint256){
        return IERC20(PGT).balanceOf(address(this));
    }

    // PLC for PBR (Client mostly)
    function PLC_for_PBR(uint256 PLCin, address ReceiveAccount) public payable returns(uint256){
        require(IERC20(PLC).transferFrom(msg.sender, address(this), PLCin), "PLC transfer failed");
        uint256 PBRout = PLC_for_PBR_getamount(0);
        require(IERC20(PBR).transfer(ReceiveAccount, PBRout), "PBR Transfer Fail");
        return (PBRout);
    }

    // PLC for PBR: amount
    function PLC_for_PBR_getamount(uint256 PLCin) public view returns(uint256){
        // return PBRout
        // new y = [ A - (x+dx) - z ] / [ 1 + z(x+dx)/k ] 
        uint256 x = IERC20(PLC).balanceOf(address(this)) + PLCin;
        uint256 y = IERC20(PBR).balanceOf(address(this));
        uint256 z = IERC20(PGT).balanceOf(address(this));
        uint256 numerator = A.sub(x.add(z));
        uint256 denominator = z.mul(x).div(k) + 1;
        return y.sub(numerator.div(denominator));
    }

    // PBR for PLC (Client mostly)
    function PBR_for_PLC(uint256 PBRin, address ReceiveAccount) public payable returns(uint256){
        require(IERC20(PBR).transferFrom(msg.sender, address(this), PBRin), "PBR transfer failed");
        uint256 PLCout = PBR_for_PLC_getamount(0);
        require(IERC20(PLC).transfer(ReceiveAccount, PLCout), "PLC Transfer Fail");
        return (PLCout);
    }

    // PBR for PLC: amount  
    function PBR_for_PLC_getamount(uint256 PBRin) public view returns(uint256){
        // return PLCout
        // new x = [ A - (y+dy) - z ] / [ 1 + z(y+dy)/k ] 
        uint256 x = IERC20(PLC).balanceOf(address(this));
        uint256 y = IERC20(PBR).balanceOf(address(this)) + PBRin;
        uint256 z = IERC20(PGT).balanceOf(address(this));
        uint256 numerator = A.sub(y.add(z));
        uint256 denominator = z.mul(y).div(k) + 1;
        return x.sub(numerator.div(denominator));
    }

    // PLC, PBR for PGT
    function PLCPLB_for_PGT(uint256 PLCin, uint256 PBRin, address ReceiveAccount) public payable returns(uint256){
        require(PLCin.add(PBRin)>0, "Pay in PLC or PBR");
        if(PLCin>0){
            require(IERC20(PLC).transferFrom(msg.sender, address(this), PLCin), "PLC transfer failed");
        }
        if(PBRin>0){
            require(IERC20(PBR).transferFrom(msg.sender, address(this), PBRin), "PBR transfer failed");
        }
        uint256 PGTout = PLCPBR_for_PGT_getamount(0, 0);
        require(IERC20(PGT).transfer(ReceiveAccount, PGTout), "PGT Transfer Fail");
        return (PGTout);
    }

    // PLC, PBR for PGT: amount
    function PLCPBR_for_PGT_getamount(uint256 PLCin, uint256 PBRin) public view returns(uint256){
        // return PGTout
        // new y = [ A - x - y ] / [ 1 + xy/k ]
        uint256 x = IERC20(PLC).balanceOf(address(this)) + PLCin;
        uint256 y = IERC20(PBR).balanceOf(address(this)) + PBRin;
        uint256 z = IERC20(PGT).balanceOf(address(this));
        uint256 numerator = A.sub(x.add(y));
        uint256 denominator = x.mul(y).div(k) + 1;
        return z.sub(numerator.div(denominator));
    }

    // PGT for PLC, PBR (client only)
    function PGT_for_PLCPBR(uint256 PGTin, address ReceiveAccount) public returns(uint256, uint256){
        require(IERC20(PGT).transferFrom(msg.sender, address(this), PGTin), "PGT transfer failed");
        (uint256 PLCout, uint256 PBRout) = PGT_for_PLCPBR_getamount(0);
        require(IERC20(PLC).transfer(ReceiveAccount, PLCout), "PLC Transfer Fail");
        require(IERC20(PBR).transfer(ReceiveAccount, PBRout), "PBR Transfer Fail");
        return (PLCout, PBRout);
    } 
    // PGT for PLC, PBR: amount (client only)
    function PGT_for_PLCPBR_getamount(uint256 PGTin) public view returns(uint256, uint256){
        // return PGTout
        uint256 M = 10 ** 4;
        uint256 x = IERC20(PLC).balanceOf(address(this));
        uint256 y = IERC20(PBR).balanceOf(address(this));
        uint256 z = IERC20(PGT).balanceOf(address(this)) + PGTin;
        uint256 t = x.mul(M).div(y);
        uint256 tmp1 = k.div(t).mul(M).div(z).mul(A.sub(z));
        uint256 tmp2 = k.div(2*t).mul(t.add(M)).div(z);
        uint256 tmp3 = tmp2.mul(tmp2);
        uint256 _PBR = tmp1.add(tmp3);
        _PBR = _PBR.sqrt() - tmp2;
        uint256 _PLC = _PBR.mul(t).div(M);
        return (x - _PLC, y - _PBR);
    }

    // PGT for PLC (governor only)
    function PGT_for_PLC(uint256 PGTin, address ReceiveAccount) public payable onlyOwner returns(uint256){
        require(msg.sender==owner, "");
        require(IERC20(PGT).transferFrom(msg.sender, address(this), PGTin), "PGT transfer failed");
        uint256 PLCout = PGT_for_PLC_getamount(0);
        require(IERC20(PLC).transfer(ReceiveAccount, PLCout), "PLC Transfer Fail");
        return (PLCout);
    }

    // PGT for PLC: amount
    function PGT_for_PLC_getamount(uint256 PGTin) public view returns(uint256){
        // return PBRout
        // new x = [ A - y - z ] / [ 1 + zy/k ] 
        uint256 x = IERC20(PLC).balanceOf(address(this));
        uint256 y = IERC20(PBR).balanceOf(address(this));
        uint256 z = IERC20(PGT).balanceOf(address(this)) + PGTin;
        uint256 numerator = A.sub(y.add(z));
        uint256 denominator = z.mul(y).div(k) + 1;
        return x.sub(numerator.div(denominator));
    }

    // PGT for PBR (governor only)
    function PGT_for_PBR(uint256 PGTin, address ReceiveAccount) public payable onlyOwner returns(uint256){
        require(IERC20(PGT).transferFrom(msg.sender, address(this), PGTin), "PGT transfer failed");
        uint256 PBRout = PGT_for_PBR_getamount(0);
        require(IERC20(PBR).transfer(ReceiveAccount, PBRout), "PBR Transfer Fail");
        return (PBRout);
    }

    // PLC for PBR: amount
    function PGT_for_PBR_getamount(uint256 PGTin) public view returns(uint256){
        // return PBRout
        // new y = [ A - x - z ] / [ 1 + zx/k ] 
        uint256 x = IERC20(PLC).balanceOf(address(this));
        uint256 y = IERC20(PBR).balanceOf(address(this));
        uint256 z = IERC20(PGT).balanceOf(address(this)) + PGTin;
        uint256 numerator = A.sub(x.add(z));
        uint256 denominator = z.mul(x).div(k) + 1;
        return y.sub(numerator.div(denominator));
    }

    // add liquidty: return mint LP token;
    function AddLiquidity(uint256 PLCin, uint256 PBRin, uint256 PGTin) public payable returns(uint256){
        require(PLCin + PBRin + PGTin>0, "Pay something please.");
        if(PLCin>0){
            require(IERC20(PLC).transferFrom(msg.sender, address(this), PLCin), "PLC transfer failed");
        }
        if(PBRin>0){
            require(IERC20(PBR).transferFrom(msg.sender, address(this), PBRin), "PBR transfer failed");
        }
        if(PGTin>0){
            require(IERC20(PGT).transferFrom(msg.sender, address(this), PGTin), "PGT transfer failed");
        }
        uint256 x = IERC20(PLC).balanceOf(address(this));
        uint256 y = IERC20(PBR).balanceOf(address(this));
        uint256 z = IERC20(PGT).balanceOf(address(this));
        uint256 newA = x + y + z + x*y*z/k;
        uint256 LP_mint = LPtoken_total.mul(newA).div(A).sub(LPtoken_total);
        LPtoken_balances[msg.sender] += LP_mint;
        LPtoken_total += LP_mint;
        A = newA;
        return LP_mint;
    }

    // remove liquidity: always return PLC & PBR
    function RemoveLiquidity(uint256 LP_token, address ReceiveAccount) public returns(uint256, uint256){
        require(LPtoken_balances[msg.sender]>=LP_token, "Your Balance isn't enough.");
        LPtoken_balances[msg.sender] -= LP_token;
        uint256 newA = (LPtoken_total - LP_token)*A/LPtoken_total;
        LPtoken_total -= LP_token;
        A = newA;

        uint256 M = 10 ** 18;
        uint256 x = IERC20(PLC).balanceOf(address(this));
        uint256 y = IERC20(PBR).balanceOf(address(this));
        uint256 z = IERC20(PGT).balanceOf(address(this));
        uint256 t = x.mul(M).div(y);
        uint256 tmp1 = k.div(t).mul(M).div(z).mul(A.sub(z));
        uint256 tmp2 = k.div(2*t).mul(t.add(M)).div(z);
        uint256 tmp3 = tmp2.mul(tmp2);
        uint256 _PBR = tmp1.add(tmp3);
        _PBR = _PBR.sqrt() - tmp2;
        uint256 _PLC = _PBR.mul(t).div(M);
        
        require(IERC20(PLC).transfer(ReceiveAccount, x - _PLC), "PLC Transfer Fail");
        require(IERC20(PBR).transfer(ReceiveAccount, y - _PBR), "PBR Transfer Fail");
        return (x - _PLC, y - _PBR);
    }

    // Oracle for PBR-PLC
    function PLCPBR_Oracle() public view returns (uint256){
        // return the spot price of 10**18 PBR in PLC
        // "how many PLC are 10**18 PBR values?"
        // use the partial derivative
        uint256 x = IERC20(PLC).balanceOf(address(this));
        uint256 z = IERC20(PGT).balanceOf(address(this));
        uint256 numerator = k.mul(10**18);
        numerator = numerator.div(z*x+k);
        numerator = numerator.mul(k + z.mul(A-z));
        return numerator.div(z*x+k);
    }

    function ShowAddress() public view returns(address){
        return address(this);
    }
}