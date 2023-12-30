import "PublicPriceOracle"
import Options from "../contracts/Options.cdc"
import "FungibleToken"
import "FlowToken"

transaction(ID:UInt, isHigh: Bool, amount: UFix64, OptionsContract: Address) {
    let RoundsBucketResource: &Options.RoundsBucket{Options.IRoundsBucket}?
    let user: PublicAccount

    // Options Contract

    // The Vault resource that holds the tokens that are being transferred
    let vaultRef: &FlowToken.Vault


    prepare(acct: AuthAccount) {
        self.RoundsBucketResource = acct.borrow<&Options.RoundsBucket{Options.IRoundsBucket}>(from: Options.RoundsBucketStoragePath)
        self.user = getAccount(acct.address)

        // Get a reference to the signer's stored vault
        self.vaultRef = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")
    }

    execute {
        self.vaultRef.deposit(from: <- Options.claimTokens(account: self.user.address, round_id: ID, amount: amount))
    }
}