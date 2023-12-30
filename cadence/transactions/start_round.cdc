import "PublicPriceOracle"
import Options from "../contracts/Options.cdc"

transaction {
    let RoundsBucketResource: &Options.RoundsBucket{Options.IRoundsBucket}?

    prepare(acct: AuthAccount) {
        self.RoundsBucketResource = acct.borrow<&Options.RoundsBucket{Options.IRoundsBucket}>(from: Options.RoundsBucketStoragePath)
    }

    execute {
        // Create a new round
        let ID: UInt? = self.RoundsBucketResource?.newRound()
        log(ID)
    }
}