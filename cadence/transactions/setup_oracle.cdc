import "PublicPriceOracle"

transaction() {
    let OracleAdminResource: &PublicPriceOracle.Admin?

    prepare(acct: AuthAccount) {
        self.OracleAdminResource = acct.borrow<&PublicPriceOracle.Admin>(from: PublicPriceOracle.OracleAdminStoragePath)
    }

    execute {
        self.OracleAdminResource?.addOracle(oracleAddr: 0xe385412159992e11)
    }
}