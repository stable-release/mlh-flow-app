require("dotenv").config();
const fcl = require("@onflow/fcl");

fcl.config({
    "accessNode.api": "https://rest-testnet.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
    "flow.network": "testnet"
})