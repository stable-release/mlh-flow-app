import "PublicPriceOracle"
import "FlowToken"
import "FungibleToken"

pub contract Options {
    // The event that is emitted when a round is settled
    pub event Settle(id: UInt)

    // Oracle to be used
    pub let oracle: Address

    // Token Vault
    pub var vault: Capability<&FlowToken.Vault>

    // Resource Path
    pub let RoundsBucketStoragePath: StoragePath
    pub let RoundsBucketPublicPath: PublicPath

    // Round
    pub resource interface IRound {
        // Time Measurement vars
        pub let blocktime_start: UFix64
        pub let blocktime_end: UFix64
        pub let resolution_time: UFix64

        // Price vars
        pub var price_start: UFix64
        pub var price_end: UFix64

        // Positions information
        pub var long_total: UFix64
        pub var short_total: UFix64
    }

    // struct to hold Round information
    // blocktime start :const // 5 minute countdown for positions
    // blocktime end :const // time of positions cutoff
    // resolution_time :const // time of resolution
    // price start :const
    // price end -> after resolve :var
    // total long :var
    // total short :var
    // result -> after resolve :var
    pub resource Round {
        // Time Measurement vars
        pub let blocktime_start: UFix64
        pub let blocktime_end: UFix64
        pub let resolution_time: UFix64

        // Price vars
        pub let price_start: UFix64
        pub(set) var price_end: UFix64

        // Positions information
        pub(set) var long_total: UFix64
        pub(set) var short_total: UFix64

        init() {
            self.blocktime_start = getCurrentBlock().timestamp
            self.blocktime_end = getCurrentBlock().timestamp + 300.0
            self.resolution_time = getCurrentBlock().timestamp + 600.0

            self.price_start = PublicPriceOracle.getLatestPrice(oracleAddr: Options.oracle)
            self.price_end = 0.0

            self.long_total = 0.0
            self.short_total = 0.0
        }        

        // Round management functions
        pub fun updatePriceEnd(_price: UFix64) {
            self.price_end = _price
        }

        // Position management functions
        pub fun updateLongTotal(_amount: UFix64): UFix64 {
            let prevTotal:UFix64 = self.long_total
            self.long_total = prevTotal + _amount
            return self.long_total
        }

        pub fun updateShortTotal(_amount: UFix64): UFix64 {
            let prevTotal:UFix64 = self.short_total
            self.short_total = prevTotal + _amount
            return self.short_total
        }
    }

    // Resource to hold all rounds

    // Rounds Bucket resource interface
    pub resource interface IRoundsBucket {
        pub var incr: UInt

        pub var ids: @{UInt: Round}

        pub fun newRound(): UInt

        pub fun settleRound(id: UInt)

        pub fun changeRound(id: UInt, highAmount: UFix64?, lowAmount: UFix64?)

        pub fun checkRoundSettleTime(id: UInt): Bool

        pub fun checkRoundEndStamp(id: UInt): Bool

        pub fun checkRoundResult(id: UInt): UInt8

        pub fun returnRoundTotals(id: UInt): [UFix64]
    }


    // Mapping round ID (uint64) to round resources
    pub resource RoundsBucket: IRoundsBucket {
        // increment counter from 0
        pub var incr: UInt

        // mapping to store list of rounds
        pub var ids: @{UInt: Round}

        // create new round
        pub fun newRound(): UInt {
            let id = self.incr
            var prevMap <- self.ids[id] <- create Round()
            self.incr = self.incr + 1
            destroy prevMap
            return id
        }

        // settle and endround
        pub fun settleRound(id: UInt) {
            pre {
                self.checkRoundSettleTime(id: id)
            }
            var oldRound <- self.ids[id] <- create Round()
            var oldRoundRef: &Options.Round? = &oldRound as &Options.Round?
            oldRoundRef?.updatePriceEnd(_price: Options.getLatestPrice(oracle: Options.oracle))

            emit Settle(id: id)

            var replacementRound <- self.ids[id] <- oldRound

            destroy replacementRound
        }

        // update round after creation
        pub fun changeRound(id: UInt, highAmount: UFix64?, lowAmount: UFix64?) {
            var oldRound: @Options.Round? <- self.ids[id] <- create Round()
            var oldRoundRef: &Options.Round? = &oldRound as &Options.Round?
            oldRoundRef?.updateLongTotal(_amount: highAmount! > 0.0 ? highAmount! : 0.0)
            oldRoundRef?.updateShortTotal(_amount: lowAmount! > 0.0 ? lowAmount! : 0.0)

            var replacementRound: @Options.Round? <- self.ids[id] <- oldRound

            destroy replacementRound
        }

        pub fun checkRoundSettleTime(id: UInt): Bool {
            var Round: @Options.Round? <- self.ids[id] <-! create Round()
            var RoundRef: &Options.Round? = &Round as &Options.Round?
            var Ready: Bool = getCurrentBlock().timestamp >= RoundRef?.resolution_time!

            var replacementRound: @Options.Round? <- self.ids[id] <- Round

            destroy replacementRound
            return Ready
        }

        pub fun checkRoundEndStamp(id: UInt): Bool {
            var Round: @Options.Round? <- self.ids[id] <-! create Round()
            var RoundRef: &Options.Round? = &Round as &Options.Round?
            var Ready: Bool = getCurrentBlock().timestamp >= RoundRef?.blocktime_end!

            var replacementRound: @Options.Round? <- self.ids[id] <- Round

            destroy replacementRound
            return Ready
        }

        // 2 for High
        // 1 for Low
        // 0 for Unchanged
        pub fun checkRoundResult(id: UInt): UInt8 {
            var Round: @Options.Round? <- self.ids[id] <-! create Round()
            var RoundRef: &Options.Round? = &Round as &Options.Round?
            if RoundRef?.price_end! > RoundRef?.price_start! {
                var replacementRound: @Options.Round? <- self.ids[id] <- Round

                destroy replacementRound
                return 2

            } else if RoundRef?.price_end! < RoundRef?.price_start! {
                var replacementRound: @Options.Round? <- self.ids[id] <- Round

                destroy replacementRound
                return 1

            } else {
                var replacementRound: @Options.Round? <- self.ids[id] <- Round

                destroy replacementRound
                return 0

            }
        }

        // Gives both high and low totals
        pub fun returnRoundTotals(id: UInt): [UFix64] {
            var Round: @Options.Round? <- self.ids[id] <-! create Round()
            var RoundRef: &Options.Round? = &Round as &Options.Round?
            let HighTotal: UFix64 = RoundRef?.long_total!
            let LowTotal: UFix64 = RoundRef?.short_total!

            var replacementRound: @Options.Round? <- self.ids[id] <- Round

            destroy replacementRound
            return [LowTotal, HighTotal]
        }

        init() {
            self.incr = 0
            self.ids <- {}
        }

        destroy() {
            destroy self.ids
        }
    }

    // Positions management

    // Position struct
    // High / Low Binary Options
    pub struct Position {
        pub var High: UFix64
        pub var Low: UFix64

        init() {
            self.High = 0.0
            self.Low = 0.0
        }

        pub fun addHigh(amount: UFix64): UFix64 {
            var prevHigh = self.High
            self.High = prevHigh + amount
            return self.High
        }

        pub fun addLow(amount: UFix64): UFix64 {
            var prevLow = self.Low
            self.Low = prevLow + amount
            return self.Low
        }
    }

    // Struct to hold positions within rounds of an account
    pub struct RoundToPositions {
        pub var Positions: {UInt: Position}

        init() {
            self.Positions = {}
        }
    }

    // mapping of accounts to position
    pub var AccountsPositions: {Address: RoundToPositions}

    // A rounds bucket is created on contract deployment
    init(_oracle: Address) {
        self.oracle = _oracle
        self.AccountsPositions = {}

        // initialize vault
        let vaultCapability = self.account.link<&FlowToken.Vault>(/private/flowTokenVault, target: /storage/flowTokenVault)
        self.vault = vaultCapability!

        // Set named paths
        self.RoundsBucketStoragePath = /storage/RoundsBucketResource
        self.RoundsBucketPublicPath = /public/RoundsBucketResource

        // Create Rounds Bucket and save it to public storage
        let RoundsBucketResource: @RoundsBucket <- self.createRoundsBucket()
        self.account.save(<-RoundsBucketResource, to: self.RoundsBucketStoragePath)

        // Create a public capability for the rounds bucket resource
        self.account.link<&Options.RoundsBucket{Options.IRoundsBucket}>(/public/RoundsBucketResource, target: /storage/RoundsBucketResource)
    }

    // Rounds Bucket and Rounds create calls
    pub fun createRoundsBucket(): @RoundsBucket {
        return <- create RoundsBucket()
    }

    // Template for updating and creating new rounds
    pub fun newRoundInstance(): @Round {
        return <- create Round()
    }

    // Position Management
    // Option Calls

    // Set call option for high
    pub fun modifyHighPosition(account: Address, round_id: UInt, amount: UFix64): UFix64? {
        var RoundToPositions: Options.RoundToPositions? = self.AccountsPositions[account]
        var Position: Options.Position? = RoundToPositions!.Positions[round_id]

        let RoundsBucketResource: &Options.RoundsBucket{Options.IRoundsBucket}? = self.account.borrow<&Options.RoundsBucket{Options.IRoundsBucket}>(from: Options.RoundsBucketStoragePath)

        // If true, then panic
        if (RoundsBucketResource?.checkRoundEndStamp(id: round_id)!) {
            panic("Round already ended")
        }

        RoundsBucketResource?.changeRound(id: round_id, highAmount: amount, lowAmount: 0.0)
        return Position?.addHigh(amount: amount)
    }

    // Set call option for low
    pub fun modifyLowPosition(account: Address, round_id: UInt, amount: UFix64): UFix64? {
        var RoundToPositions: Options.RoundToPositions? = self.AccountsPositions[account]
        var Position: Options.Position? = RoundToPositions!.Positions[round_id]

        let RoundsBucketResource: &Options.RoundsBucket{Options.IRoundsBucket}? = self.account.borrow<&Options.RoundsBucket{Options.IRoundsBucket}>(from: Options.RoundsBucketStoragePath)

        // If true, then panic
        if (RoundsBucketResource?.checkRoundEndStamp(id: round_id)!) {
            panic("Round already ended")
        }        
        
        RoundsBucketResource?.changeRound(id: round_id, highAmount: 0.0, lowAmount: amount)
        return Position?.addLow(amount: amount)
    }

    // Claim Management
    // Withdraw for position
    pub fun claimTokens(account: Address, round_id: UInt, amount: UFix64): @FungibleToken.Vault {
        let vaultRef = self.vault.borrow()!
        // self.account.borrow(from: from)
        // let vaultRef = self.vault.borrow()!
        // vaultRef.withdraw(amount: amount)
        // var hello = Options.vault.borrow()!
        var RoundToPositions: Options.RoundToPositions? = self.AccountsPositions[account]
        var Position: Options.Position? = RoundToPositions!.Positions[round_id]
        let RoundsBucketResource: &Options.RoundsBucket{Options.IRoundsBucket}? = self.account.borrow<&Options.RoundsBucket{Options.IRoundsBucket}>(from: Options.RoundsBucketStoragePath)

        // Check Round settlement state
        // If true, then panic
        if (RoundsBucketResource?.checkRoundSettleTime(id: round_id)!) {
            panic("Round already ended")
        }

        // Check amount
        let roundResult = RoundsBucketResource?.checkRoundResult(id: round_id)

        if roundResult == 2 && Position?.High! > 0.0 {
            // Math
            var totalArray: [UFix64]? = RoundsBucketResource?.returnRoundTotals(id: round_id)
            var lowTotal:UFix64 = totalArray![0]
            var highTotal: UFix64 = totalArray![1]

            // Find fractional of High
            let fractionalHigh = Position?.High! / highTotal

            // Find winnings of Low
            let partitionLow = fractionalHigh * lowTotal

            // Sum of high and low
            var withdrawAmount = fractionalHigh + partitionLow

            // Withdraw
            let vault <- vaultRef.withdraw(amount: withdrawAmount)
            return <- vault

        } else if roundResult == 1 && Position?.Low! > 0.0 {
            // Math
            var totalArray: [UFix64]? = RoundsBucketResource?.returnRoundTotals(id: round_id)
            var lowTotal:UFix64 = totalArray![0]
            var highTotal: UFix64 = totalArray![1]

            // Find fractional of High
            let fractionalLow = Position?.Low! / lowTotal

            // Find winnings of Low
            let partitionHigh = fractionalLow * highTotal

            // Sum of high and low
            var withdrawAmount = fractionalLow + partitionHigh

            // Withdraw
            let vault <- vaultRef.withdraw(amount: withdrawAmount)
            return <- vault
        }

        panic("No tokens to claim")        
        // Do math to calculate amount
    }

    // FLOW - USDT 0xe385412159992e11
    pub fun getLatestPrice(oracle: Address): UFix64 {
        let lastResult = PublicPriceOracle.getLatestPrice(oracleAddr: oracle)

        return lastResult
    }
}