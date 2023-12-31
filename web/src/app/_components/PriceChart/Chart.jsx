"use client";

import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";

export default function Chart() {
    const [user, setUser] = useState({});

    useEffect(() => {
        async function returnCurrentUser() {
            const currentUser = await fcl.currentUser.snapshot();
            setUser(currentUser)
        }

        returnCurrentUser()

    }, [])

    useEffect(() => {
        async function printInfo() {
            const nodeapi = await fcl.config.get("accessNode.api")
            console.log(nodeapi)
        }

        printInfo()
    }, [])

    const addOracle = async () => {
        const res = await fcl.mutate({
            cadence: `import PublicPriceOracle from 0x866a9f1e81898147

            transaction() {
                let OracleAdminResource: &PublicPriceOracle.Admin?
            
                prepare(acct: AuthAccount) {
                    self.OracleAdminResource = acct.borrow<&PublicPriceOracle.Admin>(from: PublicPriceOracle.OracleAdminStoragePath)
                }
            
                execute {
                    self.OracleAdminResource?.addOracle(oracleAddr: 0xe385412159992e11)
                }
            }`,
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz]
        })

        console.log(res);
    }

    const getPrice = async () => {
        const res = await fcl.query({
            cadence: `import PriceOracle from 0x2a9b59c3e2b72ee0

            pub fun main(): UFix64{
                return PriceOracle.getLatestPrice(oracleAddr: 0xe385412159992e11)
            }`,
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz]
        })

        console.log(res);
    }

    const handleClick = () => {
        getPrice()
    }
    
    return (
        <div className="flex flex-col">
            Chart placeholder
            {
                user.addr
            }
            <button onClick={handleClick}>
                Click me
            </button>
        </div>
    )
}