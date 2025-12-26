import { useState } from "react";
import { signInWithEmail } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

export default function Login() {
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    if (user) return <Navigate to="/" />;

    const handleLogin = async () => {
        if (!email) {
            toast.error("Please enter your email");
            return;
        }
        try {
            await signInWithEmail(email);
            setSent(true);
            toast.success("Magic link sent!");
        } catch (e) {
            toast.error(e.message);
        }
    };

    return (
        <div className="min-h-screen grid place-items-center bg-gray-50 text-gray-900 font-sans">
            <Toaster position="top-right" />
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-blue-600 mb-2">KanbanX</h2>
                    <p className="text-gray-500 text-sm">Sign in to manage your projects</p>
                </div>

                {!sent ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-md hover:shadow-lg"
                        >
                            Send Login Link
                        </button>
                    </div>
                ) : (
                    <div className="text-center bg-green-50 p-6 rounded-lg border border-green-100">
                        <div className="text-green-600 text-5xl mb-3">📧</div>
                        <h3 className="text-green-800 font-bold text-lg">Check your email</h3>
                        <p className="text-green-600 mt-2 text-sm">We've sent a magic login link to <strong>{email}</strong>.</p>
                        <button
                            onClick={() => setSent(false)}
                            className="mt-6 text-sm text-gray-500 hover:text-gray-900 underline"
                        >
                            Use a different email
                        </button>
                    </div>
                )}
            </div>
            <div className="fixed bottom-4 text-xs text-gray-400">
                © {new Date().getFullYear()} KanbanX. built with Supabase & React.
            </div>
        </div>
    );
}
