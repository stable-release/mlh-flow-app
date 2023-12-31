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

    const updatePrice = async () => {
        const res = await fcl.mutate({
            cadence: `import MyOracle from 0x4bbd2449d4663a7a

            transaction(price: UFix64) {
                
            
                prepare(acct: AuthAccount) {
                    
                }
            
                execute {
                    let x: UFix64 = MyOracle.updateTokenPrice(_price: price)
                    log(x)
                }
            }`,
            args: (arg, t) => [arg("10.0", t.UFix64)],
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz]
        })

        console.log(res);
    }

    const getPrice = async () => {
        const res = await fcl.query({
            cadence: `import MyOracle from 0x4bbd2449d4663a7a

            pub fun main(): UFix64{
                return MyOracle.getLatestPrice()
            }`,
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz]
        })

        console.log(res);
    }

    const handleGetPrice = () => {
        getPrice()
    }

    const handleUpdatePrice = () => {
        updatePrice()
    }

    const txObject = async () => {
        const tx = await fcl.send([
            fcl.getTransaction(
                "ba68b5edaab1e21cc5382253f3892f1b89dba054f7f6132802a51eb6a89aae19"
            ),
        ]).then(fcl.decode);

        console.log(tx);
    }

    const handleTransactionObject = () => {
        txObject()
    }
    
    return (
        <div className="flex flex-col">
            <button onClick={handleGetPrice}>
                Get Price
            </button>
            <button onClick={handleUpdatePrice}>
                Update Price
            </button>
            <button onClick={handleTransactionObject}>
                ViewTx
            </button>
        </div>
    )
}