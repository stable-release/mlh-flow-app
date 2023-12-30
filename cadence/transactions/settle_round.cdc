import "PublicPriceOracle"
import Options from "../contracts/Options.cdc"

transaction(ID: UInt) {
    let RoundsBucketResource: &Options.RoundsBucket{Options.IRoundsBucket}?

    prepare(acct: AuthAccount) {
        self.RoundsBucketResource = acct.borrow<&Options.RoundsBucket{Options.IRoundsBucket}>(from: Options.RoundsBucketStoragePath)
    }

    execute {
        // Create a new round
        self.RoundsBucketResource?.settleRound(id: ID)
    }
}