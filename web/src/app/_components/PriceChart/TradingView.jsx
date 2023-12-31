"use client";

import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";
import LatestInformation from "./LatestInformation";
import RoundManager from "./RoundManager";
import ClaimAndWithdraw from "./ClaimWithdrawals";

export default function TradingView() {
    const [user, setUser] = useState({});

    useEffect(() => {
        async function returnCurrentUser() {
            const currentUser = await fcl.currentUser.snapshot();
            setUser(currentUser);
        }

        returnCurrentUser();
    }, []);

    // State to store the input values
    const [testnetPrice, setTestnetPrice] = useState(1.1);
    const [amount, setAmount] = useState(0.0);
    const [roundId, setRoundID] = useState(0);

    const toDecimalString = (number) => {
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

    const newLongPosition = async () => {
        const res = await fcl.mutate({
            cadence: `import OptionsV2 from 0x4bbd2449d4663a7a
            import FungibleToken from 0x9a0766d93b6608b7
            import FlowToken from 0x7e60df042a9c0868
            
            transaction(ID:UInt, isHigh: Bool, amount: UFix64, OptionsContract: Address) {
                let RoundsBucketResource: &OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}?
                let user: PublicAccount
            
                // The Vault resource that holds the tokens that are being transferred
                let sentVault: @FungibleToken.Vault
            
            
                prepare(acct: AuthAccount) {
                    self.RoundsBucketResource = acct.borrow<&OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}>(from: OptionsV2.RoundsBucketStoragePath)
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
                    let newBalance: UFix64? = isHigh ? OptionsV2.modifyHighPosition(account: userAddress, round_id: ID, amount: amount) : OptionsV2.modifyLowPosition(account: userAddress, round_id: ID, amount: amount)
                    log(newBalance)
                }
            }`,
            args: (arg, t) => [
                arg(roundId, t.UInt),
                arg(true, t.Bool),
                arg(toDecimalString(amount), t.UFix64),
                arg("0x4bbd2449d4663a7a", t.Address),
            ],
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz],
        });

        console.log(res);
    };

    const newShortPosition = async () => {
        const res = await fcl.mutate({
            cadence: `import OptionsV2 from 0x4bbd2449d4663a7a
            import FungibleToken from 0x9a0766d93b6608b7
            import FlowToken from 0x7e60df042a9c0868
            
            transaction(ID:UInt, isHigh: Bool, amount: UFix64, OptionsContract: Address) {
                let RoundsBucketResource: &OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}?
                let user: PublicAccount
            
                // The Vault resource that holds the tokens that are being transferred
                let sentVault: @FungibleToken.Vault
            
            
                prepare(acct: AuthAccount) {
                    self.RoundsBucketResource = acct.borrow<&OptionsV2.RoundsBucket{OptionsV2.IRoundsBucket}>(from: OptionsV2.RoundsBucketStoragePath)
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
                    let newBalance: UFix64? = isHigh ? OptionsV2.modifyHighPosition(account: userAddress, round_id: ID, amount: amount) : OptionsV2.modifyLowPosition(account: userAddress, round_id: ID, amount: amount)
                    log(newBalance)
                }
            }`,
            args: (arg, t) => [
                arg(roundId, t.UInt),
                arg(false, t.Bool),
                arg(toDecimalString(amount), t.UFix64),
                arg("0x4bbd2449d4663a7a", t.Address),
            ],
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz],
        });

        console.log(res);
    };

    // Event handler for long position
    const handleLongPosition = () => {
        newLongPosition();
    };

    // Event handler for the short position
    const handleShortPosition = () => {
        newShortPosition();
    };

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
            args: (arg, t) => [arg(toDecimalString(testnetPrice), t.UFix64)],
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz],
        });

        console.log(res);
    };

    const handleUpdatePrice = () => {
        updatePrice();
    };

    return (
        <div>
            <div className="border border-white p-5 m-10 bg-black text-white text-xl flex flex-col gap-2">
                <LatestInformation roundId={roundId} />
                <form className="flex flex-col gap-2 justify-center">
                    <div className="flex justify-center gap-5">
                        <label>Testnet Price Update:</label>
                        <input
                            className="bg-black border border-white rounded-sm"
                            type="number"
                            step="0.01"
                            value={testnetPrice}
                            onChange={(e) => setTestnetPrice(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-center gap-5">
                        <label>Prediction Amount:</label>
                        <input
                            className="bg-black border border-white rounded-sm"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-center gap-5">
                        <label>Round ID:</label>
                        <input
                            className="bg-black border border-white rounded-sm"
                            type="number"
                            step="1"
                            value={roundId}
                            onChange={(e) => setRoundID(e.target.value)}
                        />
                    </div>
                </form>
                <div>
                    <div className="flex flex-col justify-center items-center gap-5">
                        <button
                            className="border rounded-lg bg-green-900 p-1 w-[50%] flex justify-center items-center"
                            type="button"
                            onClick={handleLongPosition}
                        >
                            Long
                        </button>
                        <button
                            className="border rounded-lg bg-red-900 p-1 w-[50%] flex justify-center items-center"
                            type="button"
                            onClick={handleShortPosition}
                        >
                            Short
                        </button>
                        <button
                            className="border rounded-sm bg-yellow-700 p-1"
                            type="button"
                            onClick={handleUpdatePrice}
                        >
                            Oracle Update
                        </button>
                        <RoundManager roundID={roundId} />
                    </div>
                </div>
            </div>
            <ClaimAndWithdraw />
        </div>
    );
}
