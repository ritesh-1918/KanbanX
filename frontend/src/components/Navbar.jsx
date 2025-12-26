import { signOut } from "../services/auth";

export default function Navbar() {
    return (
        <div
            style={{
                height: 56,
                background: "#0f172a",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px"
            }}
        >
            <div>
                <Link to="/" style={{ color: "white", textDecoration: "none", marginRight: 15 }}>Dashboard</Link>
                <Link to="/activity" style={{ color: "white", textDecoration: "none", marginRight: 15 }}>Activity</Link>
            </div>
            <button onClick={signOut}>Logout</button>
        </div>
    );
}
