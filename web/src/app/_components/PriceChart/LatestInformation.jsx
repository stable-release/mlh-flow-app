"use client";

import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";

export default function LatestInformation({ roundId }) {
    const [user, setUser] = useState({});
    const [price, setPrice] = useState(0);

    useEffect(() => {
        async function returnCurrentUser() {
            const currentUser = await fcl.currentUser.snapshot();
            setUser(currentUser);
        }

        returnCurrentUser();
    }, []);

    const handleGetPrice = () => {
        getPrice()
    }

    useEffect(() => {
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
    
            setPrice(res);
        }

        const intervalId = setInterval(getPrice, 5000);

        return () => clearInterval(intervalId)

    }, [])


    return (
        <div className="flex gap-4 justify-center items-center p-2 pb-5">
            <div className="flex gap-2">
                Pair: <div>Testnet: FLOW-USDT</div>
            </div>
            <div className="flex gap-2">
                Latest Round: <div>{roundId}</div>
            </div>
            <div className="flex gap-2">
                Latest Price: <div>{price}</div>
            </div>
        </div>
    );
}
