import "PublicPriceOracle"
import Options from "../contracts/Options.cdc"
import "FungibleToken"
import "FlowToken"

transaction(ID:UInt, isHigh: Bool, amount: UFix64, OptionsContract: Address) {
    let RoundsBucketResource: &Options.RoundsBucket{Options.IRoundsBucket}?
    let user: PublicAccount

    // The Vault resource that holds the tokens that are being transferred
    let sentVault: @FungibleToken.Vault


    prepare(acct: AuthAccount) {
        self.RoundsBucketResource = acct.borrow<&Options.RoundsBucket{Options.IRoundsBucket}>(from: Options.RoundsBucketStoragePath)
        self.user = getAccount(acct.address)
        // Get a reference to the signer's stored vault
        let vaultRef: &FlowToken.Vault = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")

        // Withdraw tokens from the signer's stored vault
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        // Get a reference to the recipient's Receiver
        let receiverRef: &AnyResource{FungibleToken.Receiver} =  getAccount(OptionsContract)
            .getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
			?? panic("Could not borrow receiver reference to the recipient's Vault")

        // Deposit the withdrawn tokens in the recipient's receiver
        receiverRef.deposit(from: <-self.sentVault)

        // Set position
        let userAddress: Address = self.user.address
        let newBalance: UFix64? = isHigh ? Options.modifyHighPosition(account: userAddress, round_id: ID, amount: amount) : Options.modifyLowPosition(account: userAddress, round_id: ID, amount: amount)
    }
}