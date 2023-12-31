"use client";

import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";

export default function CWButton({ user, setUser }) {
    const [click, setClick] = useState(0);
    const [loggedIn, setLoggedIn] = useState(null);
    const [loginAttempt, setLoginAttempt] = useState(0);

    // snapshot() shows information about our user
    useEffect(() => {
        async function getUser() {
            const currentUser = await fcl.currentUser.snapshot();
            console.log("The Current User", currentUser);
            setLoggedIn(currentUser.loggedIn);
            console.log("logged in: ", loggedIn);
            setUser(currentUser);
        }
        getUser();
    }, [click]);

    const handleLogIn = () => {
        setLoginAttempt(2)
    }

    const handleLogOut = () => {
        setLoginAttempt(1)
    }

    useEffect(() => {
        async function login() {
            fcl.authenticate()
            const currentUser = await fcl.currentUser.snapshot();
            setLoggedIn(currentUser.loggedIn);
        }

        async function logout() {
            fcl.unauthenticate()
            const currentUser = await fcl.currentUser.snapshot();
            setLoggedIn(currentUser.loggedIn);
        }

        if (loginAttempt == 2) {
            console.log("logging in")
            login()
        }

        if (loginAttempt == 1) {
            console.log("logging out")
            logout()
        }

        setLoginAttempt(0)

    }, [loginAttempt])

    const logInButton = loggedIn ? (
        <button onClick={handleLogOut}>Log Out</button>
    ) : (
        <button onClick={handleLogIn}>Log In With Wallet</button>
    );

    return (
        <div>
            {/* {
            !fcl.currentUser.snapshot().loggedIn &&
            <button
                onClick={fcl.authenticate}
            >
            Log In With Wallet
            </button>
        } */}
            {logInButton}
            <button className="mx-4" onClick={() => setClick((prev) => prev + 1)}>
                Debug
            </button>
        </div>
    );
}
