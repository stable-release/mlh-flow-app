"use client";

import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";

export default function ClaimAndWithdraw() {
    const [user, setUser] = useState({});
    const [roundID, setRoundID] = useState(0);
    const [amount, setAmount] = useState(0);
    const [isHigh, setIsHigh] = useState(false);

    useEffect(() => {
        async function returnCurrentUser() {
            const currentUser = await fcl.currentUser.snapshot();
            setUser(currentUser);
        }

        returnCurrentUser();
    }, []);

    const attemptClaim = async () => {
        function toDecimalString(number) {
            // Use the Number constructor to convert the input to its decimal form
            var decimalForm = Number(number);

            // Check if the conversion was successful
            if (!isNaN(decimalForm)) {
                // Convert the decimal form to a string with a decimal point
                var decimalString = decimalForm.toFixed(1); // Adjust the argument if you want a different number of decimal places

                return decimalString;
            } else {
                // Handle the case where the input is not a valid number
                console.error("Invalid input. Please provide a valid number.");
                return null;
            }
        }

        const res = await fcl.mutate({
            cadence: `import OptionsV2 from 0x4bbd2449d4663a7a
            import FungibleToken from 0x9a0766d93b6608b7
            import FlowToken from 0x7e60df042a9c0868
            
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
            }`,
            args: (arg, t) => [arg(roundID, t.UInt),arg(isHigh, t.Bool),arg(toDecimalString(amount), t.UFix64),arg("0x4bbd2449d4663a7a", t.Address),],
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz],
        });

        console.log(res);
    };

    const handleClaim = () => {
        attemptClaim();
    };
    return (
        <div className="border border-white p-5 m-10 bg-black text-white text-xl flex flex-col gap-2">
            <div className="flex flex-grow justify-center">Historical Claims</div>
            <div className="flex flex-grow justify-center items-center">
                <div className="flex w-1/2">
                    <label className="bg-black pr-3">Round ID:</label>
                    <input
                        className="bg-black w-1/4"
                        type="number"
                        step="1"
                        value={roundID}
                        onChange={(e) => setRoundID(e.target.value)}
                    />
                </div>
                <div className="flex w-1/2">
                    <label className="bg-black pr-3">Amount:</label>
                    <input
                        className="bg-black w-1/4"
                        type="number"
                        step="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <div className="flex w-1/2">
                    <button className=" max-w-8" onClick={() => setIsHigh((prev) => !prev)}>
                        {isHigh ? "High" : "Low"}
                    </button>
                </div>
                <button
                    className="border rounded-sm bg-yellow-700 p-1"
                    type="button"
                    onClick={handleClaim}
                >
                    Withdraw
                </button>
            </div>
        </div>
    );
}
