import OptionsV2 from "../contracts/OptionsV2.cdc"

transaction(ID: UInt) {
    let RoundsBucketResource: &OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}?

    prepare(acct: AuthAccount) {
        self.RoundsBucketResource = acct.borrow<&OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}>(from: OptionsV2.RoundsBucketStoragePath)
    }

    execute {
        // Create a new round
        // self.RoundsBucketResource?.ids
        var IDsL: @OptionsV2.RoundsBucket.ids <- self.RoundsBucketResource?.ids
    }
}