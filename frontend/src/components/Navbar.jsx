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
            <strong>KanbanX</strong>
            <button onClick={signOut}>Logout</button>
        </div>
    );
}
