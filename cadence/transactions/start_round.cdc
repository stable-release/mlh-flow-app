import OptionsV2 from "../contracts/OptionsV2.cdc"

transaction {
    let RoundsBucketResource: &OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}?

    prepare(acct: AuthAccount) {
        self.RoundsBucketResource = acct.borrow<&OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}>(from: OptionsV2.RoundsBucketStoragePath)
    }

    execute {
        // Create a new round
        let ID: UInt? = self.RoundsBucketResource?.newRound()
        log(ID)
    }
}