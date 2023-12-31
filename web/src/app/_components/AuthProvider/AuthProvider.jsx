"use client"

import * as fcl from '@onflow/fcl'

import { createContext, useEffect, useState } from "react"
import "./config"

export const AuthProviderContext = createContext(null);

export default function AuthProvider({ children }) {
    const [user, setUser] = useState({});

    useEffect(() => {
        fcl.currentUser().subscribe(setUser)
    }, [])

    return (
        <AuthProviderContext.Provider value={{user}}>
            {children}
        </AuthProviderContext.Provider>
    )
}