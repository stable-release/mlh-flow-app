import CWButton from "./CWButton";

export default function ConnectWalletButton({user, setUser}) {
    return (
        <div>
            <CWButton user={user} setUser={setUser} />
        </div>
    )
}