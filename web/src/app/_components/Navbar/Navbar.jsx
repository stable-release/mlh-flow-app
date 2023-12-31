import NavElements from "./Navbar.Elements";

export default function Navbar({user, setUser}) {
    return (
        <div>
            <NavElements user={user} setUser={setUser}/>
        </div>
    );
}
