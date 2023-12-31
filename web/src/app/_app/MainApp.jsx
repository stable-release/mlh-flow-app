"use client";

import { useState } from "react";
import { AuthProviderContext } from "../_components/AuthProvider/AuthProvider";
import Navbar from "../_components/Navbar";
import PriceChart from "../_components/PriceChart";

export default function MainApp() {
    const [user, setUser] = useState({});

    return (
            <AuthProviderContext.Provider value={{user}}>
                <Navbar user={user} setUser={setUser}/>
                <div className="flex flex-col flex-grow items-center content-center">
                {
                    user.loggedIn &&
                    <PriceChart user={user} setUser={setUser}/>
                }
                </div>
            </AuthProviderContext.Provider>
    )
}