"use client";

import ConnectWalletButton from "./ConnectWalletButton";

export default function NavElements({user, setUser}) {

    return (
        <div className="relative font-sans">
            <div className="py-6 justify-between">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                    <div className="text-white text-4xl font-extrabold">
                        MLH X WEB3
                    </div>
                    <div className="flex">
                        <div className="p-2 rounded-full justify-start items-center gap-2 flex">
                            <div className="text-white text-2xl font-medium uppercase leading-tight tracking-wide">
                                Binary Options
                            </div>
                        </div>
                        <div className="p-2 rounded-full justify-start items-center gap-2 flex">
                            <div className="text-white text-base font-medium uppercase leading-tight tracking-wide hover:underline">
                                <ConnectWalletButton user={user} setUser={setUser} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
