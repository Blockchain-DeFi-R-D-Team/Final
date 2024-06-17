// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./library_PalcoinStruct.sol";
import "./library_SafeMath256.sol";
import "./Palcoin_PLC.sol";
import "./Palcoin_PBR.sol";
import "./Palcoin_PGT.sol";
import "./Palcoin_AMM.sol";
import "./Palcoin_ProductManager.sol";

contract Palcoin_DebtManager{
    using SafeDecimalMath for uint256;
    using PalcoinStruct for PalcoinStruct.Debt_package;
    using PalcoinStruct for PalcoinStruct.Debt_Info;
    uint256 public PBRbenefit;
    uint256 public ETHbenefit;
    address public owner;
    PLC_token public PLC;
    PBR_token public PBR;
    PGT_token public PGT;
    Palcoin_ProductManager public ProductManager;
    Palcoin_ThreeAssetAMM public PAMM;
    
    mapping(bytes32 => PalcoinStruct.Debt_Info) public Debt;
    // bytes32 is the combination of address and Debt Package Info

    constructor(address _PLC, address _PBR, address _PGT)payable {
        PLC = PLC_token(_PLC);
        PBR = PBR_token(_PBR);
        PGT = PGT_token(_PGT);
        owner = msg.sender;
        ProductManager = new Palcoin_ProductManager(owner);
        PBRbenefit = 0;
        ETHbenefit = 0;
    }

    // GetPBRPLCprice return the spot price of 10**18 PBR in PLC
    function GetPBRPLCprice() public view returns(uint256){
        return PAMM.PLCPBR_Oracle();
    }

    // getEthUsdPrice return 10**4 ETH price in USD  (10 ** 22 wei) TEST ONLY!!!
    function getEthUsdPrice() public pure returns (uint256) {
        uint256 rate = 38151678;
        return rate;
    }

    // Function to hash an address and a uint256 using sha256 and store the result
    function HashDebtIndex(address _addr, uint256 _num) public pure returns(bytes32){
        return sha256(abi.encodePacked(_addr, _num));
    }

    // DebtShow returns Debt info
    function DebtShow(address _addr, uint index) public view returns(PalcoinStruct.Debt_Info memory){
        return Debt[HashDebtIndex(_addr, index)];
    }

    // HF_formul returns HF * 10**4
    // pure only in test
    function HF_formula(uint256 ETHamount, uint256 PLCamount, uint256 DebtRatio)public pure returns(uint256){
        if(PLCamount==0 || ETHamount==0){
            return 0;
        }
        uint256 HF = ETHamount.mul(DebtRatio).div(10**4).mul( getEthUsdPrice() ).div(PLCamount);
        return HF;
    }

    uint256 ExpectDuration;  //local variable
    uint256 PBR_consumption; //local variable

    // Borrow locks ETH and mint PLC
    function Borrow(
        uint index, //Product index
        uint256 PLC_debt_,
        uint256 PBR_ 
    )public payable returns(
        uint256,    // healthy factor * 10 ** 4
        uint256    // expire Date;    
    ){
        PalcoinStruct.Debt_package memory Product = ProductManager.DebtPackageShow(index);
        bytes32 DebtHash = HashDebtIndex(msg.sender, index);
        require(Debt[DebtHash].active != true, "Same debt exist.");
        require(msg.value >= Product.MinDebtFloor && msg.value <= Product.MaxDebtCeil, "Debt amount error.");

        // InitHF = Debt / (ETH.value*ETH.price*MaxInitDebtRatio) * 10 ** 4
        // The loan requested does not exceed the initial loan limit 
        // This ensures HF>1
        uint256 InitHF = HF_formula(msg.value, PLC_debt_, Product.MaxInitDebtRatio);
        require( InitHF >= 10 ** 4, "Debt value exceeds MaxInitDebtRatio, please ask for less Debt.");

        require(IERC20(PBR).transferFrom(msg.sender, address(this), PBR_), "PBR transfer failed");
        // The loan duration cannot be too short
        ExpectDuration = PBR_.mul(365 * 10 ** 4).div(Product.InterestRate).div(PLC_debt_);
        require(ExpectDuration >= Product.MinDuration, "Expected Duration too short");

        uint256 HF = HF_formula(msg.value, PLC_debt_, Product.MaxDebtRatio);
        uint256 _ExpireDate = block.timestamp + ExpectDuration * 86400;

        Debt[DebtHash] = PalcoinStruct.Debt_Info({
            index: index,
            ETH_collateral: msg.value,
            PLC_debt: PLC_debt_,
            BeginDate: block.timestamp,
            ExpireDate: _ExpireDate,
            PBR_remain: PBR_,
            MaxLiquidationAmount: msg.value.mul(Product.LiquidationRatio).div(10**4),
            HealthyFactor: HF,
            active: true
        });

        PLC.mint(msg.sender, PLC_debt_);
        return (HF, _ExpireDate);
    }

    // AddDebt provides PLC debt
    function AddDebt(
        uint index, //Product index
        uint256 PLC_debt_, // increased amount
        uint256 PBR_  // Add PBR (can be 0)
    )public payable returns(
        uint256,    // healthy factor * 10 ** 4
        uint256    // expire Date;    
    ){
        PalcoinStruct.Debt_package memory Product = ProductManager.DebtPackageShow(index);
        bytes32 DebtHash = HashDebtIndex(msg.sender, index);
        require(Debt[DebtHash].active == true, "Debt doesn't exist.");
        require(Debt[DebtHash].ETH_collateral + msg.value <= Product.MaxDebtCeil, "Debt amount error.");
        Debt[DebtHash].ETH_collateral += msg.value;

        if(PBR_ != 0){
            require(IERC20(PBR).transferFrom(msg.sender, address(this), PBR_), "PBR transfer failed");
        }
        PBR_consumption = Debt[DebtHash].PLC_debt / 365 * Product.InterestRate / 10**4;
        PBR_consumption = PBR_consumption.mul( block.timestamp.sub( Debt[DebtHash].BeginDate ) ).div(86400);
        require(Debt[DebtHash].PBR_remain + PBR_ >= PBR_consumption, "Out of PBR"); //Total PBR isn't enough for comsume.
        Debt[DebtHash].PBR_remain = Debt[DebtHash].PBR_remain + PBR_ - PBR_consumption;
        PBRbenefit += PBR_consumption;

        Debt[DebtHash].PLC_debt += PLC_debt_;
        ExpectDuration = Debt[DebtHash].PBR_remain.div(Product.InterestRate).mul(365 * 10 ** 4).div(Debt[DebtHash].PLC_debt);

        uint256 HF = HF_formula(Debt[DebtHash].ETH_collateral, Debt[DebtHash].PLC_debt, Product.MaxDebtRatio);
        Debt[DebtHash].HealthyFactor = HF;
        require(HF >= 10**4, "Debt too large");
        Debt[DebtHash].ExpireDate = block.timestamp + ExpectDuration * 86400;
        Debt[DebtHash].BeginDate = block.timestamp;

        PLC.mint(msg.sender, PLC_debt_);
        return (HF, Debt[DebtHash].ExpireDate);
    }

    // RepayDebt retrive PLC. If debt is cleared, collateral returns automatically.
    function RepayDebt(
        uint index, //Product index
        uint256 PLC_debt_, // Repay amount
        uint256 PBR_  // Add PBR (can be 0)
    )public payable returns(
        uint256,    // healthy factor * 10 ** 4
        uint256    // expire Date;    
    ){
        PalcoinStruct.Debt_package memory Product = ProductManager.DebtPackageShow(index);
        bytes32 DebtHash = HashDebtIndex(msg.sender, index);
        require(Debt[DebtHash].active == true, "Debt doesn't exist.");
        require(IERC20(PLC).transferFrom(msg.sender, address(this), PLC_debt_), "PLC transfer failed");

        if(PBR_ != 0){
            require(IERC20(PBR).transferFrom(msg.sender, address(this), PBR_), "PBR transfer failed");
        }

        PBR_consumption = Debt[DebtHash].PLC_debt / 365 * Product.InterestRate / 10**4;
        PBR_consumption = PBR_consumption.mul( block.timestamp.sub( Debt[DebtHash].BeginDate ) ).div(86400);
        require(Debt[DebtHash].PBR_remain + PBR_ >= PBR_consumption, "Out of PBR"); //Total PBR isn't enough for comsume.
        Debt[DebtHash].PBR_remain = Debt[DebtHash].PBR_remain + PBR_ - PBR_consumption;
        PBRbenefit += PBR_consumption;

        Debt[DebtHash].PLC_debt -= PLC_debt_;
        if(Debt[DebtHash].PLC_debt == 0){
            // Debt Cleared
            payable(msg.sender).transfer(Debt[DebtHash].ETH_collateral);
            Debt[DebtHash].ETH_collateral = 0;
            require(PBR.transfer(msg.sender, Debt[DebtHash].PBR_remain), "PBR return Fail");
            Debt[DebtHash].PBR_remain = 0;
            Debt[DebtHash].active = false;
            Debt[DebtHash].HealthyFactor = 0;
            Debt[DebtHash].ExpireDate = block.timestamp;
        }else{
            ExpectDuration = Debt[DebtHash].PBR_remain.div(Product.InterestRate).mul(365 * 10 ** 4).div(Debt[DebtHash].PLC_debt);
            uint256 HF = HF_formula(Debt[DebtHash].ETH_collateral, Debt[DebtHash].PLC_debt, Product.MaxDebtRatio);
            Debt[DebtHash].HealthyFactor = HF;
            Debt[DebtHash].ExpireDate = block.timestamp + ExpectDuration * 86400;
            Debt[DebtHash].BeginDate = block.timestamp;
        }

        PLC.burn(PLC_debt_);
        return (Debt[DebtHash].HealthyFactor, Debt[DebtHash].ExpireDate);
    }

    // AddPBRETH add PBR or ETH
    function AddPBRETH(
        uint index, //Product index
        uint256 PBR_ // if you want add collateral only, PBR_ == 0
    )public payable returns(
        uint256,    // healthy factor * 10 ** 4
        uint256    // expire Date;    
    ){
        PalcoinStruct.Debt_package memory Product = ProductManager.DebtPackageShow(index);
        bytes32 DebtHash = HashDebtIndex(msg.sender, index);
        require(Debt[DebtHash].active == true, "Debt doesn't exist.");

        if(PBR_ != 0){
            // This function will not update BeginDate 
            require(IERC20(PBR).transferFrom(msg.sender, address(this), PBR_), "PBR transfer failed");
            Debt[DebtHash].PBR_remain += PBR_;
            ExpectDuration = Debt[DebtHash].PBR_remain.div(Product.InterestRate).mul(365 * 10 ** 4).div(Debt[DebtHash].PLC_debt);
            Debt[DebtHash].ExpireDate = Debt[DebtHash].BeginDate + ExpectDuration * 86400;
        }
        
        if(msg.value != 0){
            require(Debt[DebtHash].ETH_collateral + msg.value <= Product.MaxDebtCeil, "Debt amount error.");
            Debt[DebtHash].ETH_collateral += msg.value;
            uint256 HF = HF_formula(Debt[DebtHash].ETH_collateral, Debt[DebtHash].PLC_debt, Product.MaxDebtRatio);
            Debt[DebtHash].HealthyFactor = HF;

            uint256 TmpLiquidationAmount = Debt[DebtHash].ETH_collateral.mul(Product.LiquidationRatio).div(10**4);
            if( TmpLiquidationAmount > Debt[DebtHash].MaxLiquidationAmount ){
                Debt[DebtHash].MaxLiquidationAmount = TmpLiquidationAmount;
            }
        }

        return (Debt[DebtHash].HealthyFactor, Debt[DebtHash].ExpireDate);
    }

    function RemovePBRETH(
        uint index,   // Product index
        uint256 PBR_, // Remoce PBR amount
        uint256 ETH_  // Remove ETH amount
    )public returns(
        uint256,    // healthy factor * 10 ** 4
        uint256    // expire Date;  
    ){
        PalcoinStruct.Debt_package memory Product = ProductManager.DebtPackageShow(index);
        bytes32 DebtHash = HashDebtIndex(msg.sender, index);
        require(Debt[DebtHash].active == true, "Debt doesn't exist.");

        require(Debt[DebtHash].ETH_collateral >= ETH_, "Out of ETH collateral");
        Debt[DebtHash].ETH_collateral -= ETH_;
        if( Debt[DebtHash].PLC_debt != 0 ){
            uint256 HF = HF_formula(Debt[DebtHash].ETH_collateral, Debt[DebtHash].PLC_debt, Product.MaxDebtRatio);
            Debt[DebtHash].HealthyFactor = HF;
            require(HF >= 10**4, "Debt too large");
        }else{
            Debt[DebtHash].HealthyFactor = 0;
        }
        payable(msg.sender).transfer(ETH_);

        PBR_consumption = Debt[DebtHash].PLC_debt / 365 * Product.InterestRate / 10**4;
        PBR_consumption = PBR_consumption.mul( block.timestamp.sub( Debt[DebtHash].BeginDate ) ).div(86400);
        require(Debt[DebtHash].PBR_remain >= PBR_consumption + PBR_, "Out of PBR"); //Total PBR isn't enough for comsume.
        Debt[DebtHash].PBR_remain = Debt[DebtHash].PBR_remain - PBR_ - PBR_consumption;
        require(PBR.transfer(msg.sender, PBR_), "PBR transfer Fail");
        PBRbenefit += PBR_consumption;
        if( Debt[DebtHash].PLC_debt != 0 ){
            ExpectDuration = Debt[DebtHash].PBR_remain.div(Product.InterestRate).mul(365 * 10 ** 4).div(Debt[DebtHash].PLC_debt);
            require(ExpectDuration * 86400 >= Product.MinDuration, "Expect Duration too short.");
            Debt[DebtHash].ExpireDate = block.timestamp + ExpectDuration * 86400;
            Debt[DebtHash].BeginDate = block.timestamp;
        }

        return (Debt[DebtHash].HealthyFactor, block.timestamp);
    }
    
    uint256 PLCPaytoLiquidator = 0;
    uint256 ETHPaytoLiquidator = 0;
    uint256 PBRPaytoDebt = 0;
    uint256 PLCPaytoDebt = 0;

    // OutofPBRLiquidation provide PBR and get PLC, which may increase Debt and lower HF
    function Liquidation(
        uint index,        // Product index
        address Debtor,    // Debt owner
        uint256 PBR_,     // PBR paid to the debt
        uint256 PLC_      // PLC paid to the debt
    )public returns(
        uint256,  // healthy factor * 10 ** 4
        uint256,  // new expire date
        uint256,  // PLC reward
        uint256,  // ETH reward
        uint256,  // PBR consumption
        uint256   // PLC consumption
    ){
        PalcoinStruct.Debt_package memory Product = ProductManager.DebtPackageShow(index);
        bytes32 DebtHash = HashDebtIndex(Debtor, index);
        require(Debt[DebtHash].active == true, "Debt doesn't exist.");

        PLCPaytoLiquidator = 0;
        ETHPaytoLiquidator = 0;
        PBRPaytoDebt = 0;
        PLCPaytoDebt = 0;

        if(PBR_>0){
            // Liquidator provide some PBR
            if(block.timestamp > Debt[DebtHash].ExpireDate){
                // External PBR needed.
                // Check if Bad Debt happend
                uint256 PBR_request = Debt[DebtHash].PLC_debt.div(10 ** 4).mul(Product.InterestRate);
                PBR_request = PBR_request.mul( (block.timestamp - Debt[DebtHash].ExpireDate)/86400 ).div(365);
                uint256 MaxDebtablePLC = Product.MaxDebtRatio.mul( Debt[DebtHash].ETH_collateral ).div(10 ** 4);

                if( 
                    MaxDebtablePLC >= 
                    Debt[DebtHash].PLC_debt + 
                    PBR_request.mul( GetPBRPLCprice() ).div(10 ** 22).mul(Product.LiquidationPanalty + 10**4)
                    ){
                    // Dangerous Debt, will not cause ETH liquidation, repay PBR with PLC only;
                    uint256 MaxDebtablePLC_Append =  
                        MaxDebtablePLC - Debt[DebtHash].PLC_debt;
                    // MaxDebtablePLC_Append shows extractable PLC until HF=1
                    uint256 MaxRepayPBR_TimeLimit = Debt[DebtHash].PLC_debt.div(10 ** 4).mul(Product.InterestRate);
                    MaxRepayPBR_TimeLimit = 
                        MaxRepayPBR_TimeLimit.mul( (block.timestamp - Debt[DebtHash].ExpireDate)/86400 + 365 ).div(365);
                    // MaxRepayPBR_TimeLimit ask that Liquidators cannot pay interest to users for more than one year

                    if( MaxRepayPBR_TimeLimit > PBR_ ){
                        MaxRepayPBR_TimeLimit = PBR_;
                        // MaxRepayPBR cannot exceed PBR that user agree to pay
                    }
                    uint256 MaxRepayPBR_PLCLimit = MaxDebtablePLC_Append.mul( 10**18 ).div( GetPBRPLCprice() ); // PBR value
                    MaxRepayPBR_PLCLimit = MaxRepayPBR_PLCLimit.mul(10 ** 4).div(Product.LiquidationPanalty + 10**4);
                    // PBR value will less than PLC with same value, for LiquidationPanalty.
                    if( MaxRepayPBR_TimeLimit > MaxRepayPBR_PLCLimit ){
                        MaxRepayPBR_TimeLimit = MaxRepayPBR_PLCLimit;
                        // MaxRepayPBR's value cannot exceed the value of MaxDebtablePLC.
                    }
                    require(IERC20(PBR).transferFrom(msg.sender, address(this), MaxRepayPBR_TimeLimit), "PBR transfer failed");
                    PBRPaytoDebt = MaxRepayPBR_TimeLimit;
                    Debt[DebtHash].PBR_remain += MaxRepayPBR_TimeLimit;
                    //calculate PBR consumption before PLC debt added.
                    PBR_consumption = Debt[DebtHash].PLC_debt / 365 * Product.InterestRate / 10**4;
                    PBR_consumption = PBR_consumption.mul( block.timestamp.sub( Debt[DebtHash].BeginDate ) ).div(86400);
                    require(Debt[DebtHash].PBR_remain >= PBR_consumption, "Out of PBR"); 
                    // Total PBR isn't enough for comsume.
                    // This shouldn't happen. We assume that the liquidator provide enough PBR.
                    Debt[DebtHash].PBR_remain -= PBR_consumption;
                    PBRbenefit += PBR_consumption;

                    // PLC return 
                    PLCPaytoLiquidator = 
                        MaxRepayPBR_TimeLimit.mul( GetPBRPLCprice() ).
                        div(10 ** 22).mul(10**4 + Product.LiquidationPanalty);
                    Debt[DebtHash].PLC_debt += PLCPaytoLiquidator;
                    PLC.mint(msg.sender, PLCPaytoLiquidator);
                    uint256 HF = HF_formula(Debt[DebtHash].ETH_collateral, Debt[DebtHash].PLC_debt, Product.MaxDebtRatio);
                    Debt[DebtHash].HealthyFactor = HF;
                    ExpectDuration = Debt[DebtHash].PBR_remain.div(Product.InterestRate);
                    ExpectDuration = ExpectDuration.mul(365 * 10 ** 4).div(Debt[DebtHash].PLC_debt);
                    Debt[DebtHash].ExpireDate = block.timestamp + ExpectDuration * 86400;
                    Debt[DebtHash].BeginDate = block.timestamp;
                    // ETH liquidation will not happen.
                    // PBR in, PLC out
                }else{
                    // Bad Debt, always cause ETH liquidation, repay PBR with PLC & ETH;
                    // Always add PBR to block.timestamp 
                    require(IERC20(PBR).transferFrom(msg.sender, address(this), PBR_request), "PBR transfer failed");
                    PBRPaytoDebt = PBR_request;
                    Debt[DebtHash].PBR_remain += PBR_request;
                    PBR_consumption = Debt[DebtHash].PLC_debt / 365 * Product.InterestRate / 10**4;
                    PBR_consumption = PBR_consumption.mul( block.timestamp.sub( Debt[DebtHash].BeginDate ) ).div(86400);
                    require(Debt[DebtHash].PBR_remain >= PBR_consumption, "Out of PBR"); 
                    // Total PBR isn't enough for comsume.
                    // This shouldn't happen. We assume that the liquidator provide enough PBR.
                    Debt[DebtHash].PBR_remain -= PBR_consumption;
                    PBRbenefit += PBR_consumption;
                    
                    ETHPaytoLiquidator = PBR_request.mul( GetPBRPLCprice() ).
                        div(10 ** 22).mul(10**4 + Product.LiquidationPanalty);
                    ETHPaytoLiquidator = ETHPaytoLiquidator.mul(10**4).div( getEthUsdPrice() );
                    require(Debt[DebtHash].ETH_collateral >= ETHPaytoLiquidator, "Out of ETH");
                    Debt[DebtHash].ETH_collateral -= ETHPaytoLiquidator;
                    payable(msg.sender).transfer(ETHPaytoLiquidator);

                    // ETH liquidation function
                    uint256 ETH_EarnedByPayPLC;
                    (PLCPaytoDebt, ETH_EarnedByPayPLC) =Liquidation_ETH(index, Debtor, PLC_, msg.sender);
                    ETHPaytoLiquidator += ETH_EarnedByPayPLC;
                    // PBR + PLC in, ETH out 
                }
            }else{
                // External PBR provided but not needed.
                PBR_consumption = Debt[DebtHash].PLC_debt / 365 * Product.InterestRate / 10**4;
                PBR_consumption = PBR_consumption.mul( block.timestamp.sub( Debt[DebtHash].BeginDate ) ).div(86400);
                require(Debt[DebtHash].PBR_remain >= PBR_consumption, "Out of PBR"); 
                // Total PBR isn't enough for comsume.
                Debt[DebtHash].PBR_remain -= PBR_consumption;
                PBRbenefit += PBR_consumption;
                // ETH liquidation function
                (PLCPaytoDebt, ETHPaytoLiquidator) =Liquidation_ETH(index, Debtor, PLC_, msg.sender);
                // PLC in, ETH out
            }
        }else{
            require(block.timestamp <= Debt[DebtHash].ExpireDate, "Debt expire! Provide some PBR to continue.");
            // ETH liquidation requires Interest has been payed.
            PBR_consumption = Debt[DebtHash].PLC_debt / 365 * Product.InterestRate / 10**4;
            PBR_consumption = PBR_consumption.mul( block.timestamp.sub( Debt[DebtHash].BeginDate ) ).div(86400);
            require(Debt[DebtHash].PBR_remain >= PBR_consumption, "Out of PBR"); 
            // Total PBR isn't enough for comsume.
            Debt[DebtHash].PBR_remain -= PBR_consumption;
            PBRbenefit += PBR_consumption;
            // ETH liquidation function
            (PLCPaytoDebt, ETHPaytoLiquidator) =Liquidation_ETH(index, Debtor, PLC_, msg.sender);
            // PLC in, ETH out
        }

        return (
            Debt[DebtHash].HealthyFactor,
            Debt[DebtHash].ExpireDate,
            PLCPaytoLiquidator = 0,
            ETHPaytoLiquidator = 0,
            PBRPaytoDebt = 0,
            PLCPaytoDebt = 0
        );
    }

    function Liquidation_ETH(
        uint index,        // Product index
        address Debtor,    // Debt hash
        uint256 PLC_,      // PLC paid
        address Liquidator // liquidator address
    )internal returns(
        uint256,   // PLC consumption
        uint256    // ETH earn
    ){
        PalcoinStruct.Debt_package memory Product = ProductManager.DebtPackageShow(index);
        bytes32 DebtHash = HashDebtIndex(Debtor, index);
        uint256 unit = Debt[DebtHash].MaxLiquidationAmount;  // ETH
        uint256 Liquidate_amount = 0;                        // ETH
        uint256 Liquidate_amount_ceil = PLC_.mul(10**4 + Product.LiquidationPanalty).div( getEthUsdPrice() );
        if( Liquidate_amount_ceil>Debt[DebtHash].ETH_collateral )Liquidate_amount_ceil = Debt[DebtHash].ETH_collateral;
        uint256 PLC_consume = 0;
        uint256 HF = HF_formula(Debt[DebtHash].ETH_collateral, Debt[DebtHash].PLC_debt, Product.MaxDebtRatio);
        bool flag = false;
        while(HF < 10**4){
            if(Liquidate_amount + unit > Liquidate_amount_ceil){
                Liquidate_amount = Liquidate_amount_ceil;
                flag = true;
            }else{
                Liquidate_amount += unit;
            }
            PLC_consume = Liquidate_amount.mul(10**8).div( getEthUsdPrice() ).div(10**4 + Product.LiquidationPanalty);
            // pay less PLC, for LiquidationPanalty
            if(PLC_consume > Debt[DebtHash].PLC_debt)PLC_consume = Debt[DebtHash].PLC_debt;
            HF = HF_formula( Debt[DebtHash].ETH_collateral-Liquidate_amount, PLC_consume, Product.MaxDebtRatio);
            if(HF==0 || flag)break;
        }
        require(IERC20(PLC).transferFrom(Liquidator, address(this), PLC_consume), "PLC transfer failed");
        PLC.burn(PLC_consume);
        payable(msg.sender).transfer(Liquidate_amount);
        Debt[DebtHash].ETH_collateral -= PLC_consume;
        Debt[DebtHash].PLC_debt -= PLC_consume;
        Debt[DebtHash].HealthyFactor = HF;
        if( HF==0 ){
            if(Debt[DebtHash].ETH_collateral != 0){
                payable(Debtor).transfer(Debt[DebtHash].ETH_collateral);
            }
            if(Debt[DebtHash].PBR_remain != 0){
                IERC20(PBR).transfer(Debtor, Debt[DebtHash].PBR_remain);
            }
            Debt[DebtHash].BeginDate = block.timestamp;
            Debt[DebtHash].ExpireDate = block.timestamp;
            Debt[DebtHash].active = false;
        }else{
            Debt[DebtHash].BeginDate = block.timestamp;
            ExpectDuration = 
                Debt[DebtHash].PBR_remain.div(Product.InterestRate).mul(365 * 10 ** 4).div(Debt[DebtHash].PLC_debt);
            Debt[DebtHash].ExpireDate = block.timestamp + ExpectDuration * 86400;
        }
        return (PLC_consume, Liquidate_amount);
    }

}
