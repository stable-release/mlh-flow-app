import OptionsV2 from "../contracts/OptionsV2.cdc"
import "FungibleToken"
import "FlowToken"

transaction(ID:UInt, isHigh: Bool, amount: UFix64, OptionsV2Contract: Address) {
    let RoundsBucketResource: &OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}?
    let user: PublicAccount

    // OptionsV2 Contract

    // The Vault resource that holds the tokens that are being transferred
    let vaultRef: &FlowToken.Vault


    prepare(acct: AuthAccount) {
        self.RoundsBucketResource = acct.borrow<&OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}>(from: OptionsV2.RoundsBucketStoragePath)
        self.user = getAccount(acct.address)

        // Get a reference to the signer's stored vault
        self.vaultRef = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")
    }

    execute {
        self.vaultRef.deposit(from: <- OptionsV2.claimTokens(account: self.user.address, round_id: ID, amount: amount))
    }
}