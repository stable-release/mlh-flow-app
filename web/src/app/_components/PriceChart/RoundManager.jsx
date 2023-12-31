"use client";

import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";

export default function RoundManager({ roundID }) {
    const [user, setUser] = useState({});
    const [time, setTime] = useState(5 * 60);
    const [resetTime, setResetTime] = useState(false);

    useEffect(() => {
        async function returnCurrentUser() {
            const currentUser = await fcl.currentUser.snapshot();
            setUser(currentUser);
        }

        returnCurrentUser();
    }, []);

    const startRound = async () => {
        const res = await fcl.mutate({
            cadence: `import OptionsV2 from 0x4bbd2449d4663a7a

            transaction {
                let RoundsBucketResource: &OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}?
            
                prepare(acct: AuthAccount) {
                    self.RoundsBucketResource = acct.borrow<&OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}>(from: OptionsV2.RoundsBucketStoragePath)
                }
            
                execute {
                    // Create a new round
                    let ID: UInt? = self.RoundsBucketResource?.newRound()
                    log(ID)
                }
            }`,
            args: (arg, t) => [],
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz],
        });

        console.log(res);
    };

    const handleStartRound = () => {
        setResetTime((prev) => !prev)
        startRound();
    };

    const settleRound = async () => {
        console.log(roundID);
        const res = await fcl.mutate({
            cadence: `import OptionsV2 from 0x4bbd2449d4663a7a

            transaction(ID: UInt) {
                let RoundsBucketResource: &OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}?
            
                prepare(acct: AuthAccount) {
                    self.RoundsBucketResource = acct.borrow<&OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}>(from: OptionsV2.RoundsBucketStoragePath)
                }
            
                execute {
                    // Create a new round
                    self.RoundsBucketResource?.settleRound(id: ID)
                }
            }`,
            args: (arg, t) => [arg(roundID, t.UInt)],
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz],
        });

        console.log(res);
    };

    const handleSettleRound = () => {
        setResetTime((prev) => !prev)
        settleRound();
    };

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [resetTime]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        const formattedMinutes = String(minutes).padStart(2, "0");
        const formattedSeconds = String(remainingSeconds).padStart(2, "0");

        return `${formattedMinutes}:${formattedSeconds}`;
    };

    return (
        <div className="flex flex-col justify-center">
            <div className="flex gap-4">
                <button
                    className="border rounded-sm bg-yellow-700 p-1"
                    type="button"
                    onClick={handleStartRound}
                >
                    Start New Round
                </button>
                <button
                    className="border rounded-sm bg-yellow-700 p-1"
                    type="button"
                    onClick={handleSettleRound}
                >
                    Settle Round
                </button>
            </div>
            <div>
                Est. Time Left: {formatTime(0)}
            </div>
        </div>
    );
}
