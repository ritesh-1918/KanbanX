import { useState } from "react";
import { signInWithEmail } from "../services/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            await signInWithEmail(email);
            setSent(true);
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
            <div style={{ width: 360 }}>
                <h2>KanbanX</h2>
                <p>Sign in with email</p>

                {!sent ? (
                    <>
                        <input
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: "100%", padding: 8 }}
                        />
                        <button onClick={handleLogin} style={{ width: "100%", marginTop: 10 }}>
                            Send Login Link
                        </button>
                    </>
                ) : (
                    <p>Check your email for the login link.</p>
                )}

                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    );
}
