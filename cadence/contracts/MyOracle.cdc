pub contract MyOracle {
    pub var TokenPrice: UFix64

    pub fun updateTokenPrice(_price: UFix64): UFix64 {
        self.TokenPrice = _price
        return self.TokenPrice
    }

    pub fun getLatestPrice(): UFix64 {
        return self.TokenPrice
    }

    init() {
        self.TokenPrice = 0.0
    }
}