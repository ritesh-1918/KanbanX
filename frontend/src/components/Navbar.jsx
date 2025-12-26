import { Link } from "react-router-dom";
import { signOut } from "../services/auth";

export default function Navbar() {
    return (
        <nav className="bg-blue-600 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="text-xl font-bold tracking-tight">KanbanX</Link>
                        <div className="flex space-x-4 text-sm font-medium">
                            <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded-md transition-colors">Dashboard</Link>
                            <Link to="/activity" className="hover:bg-blue-700 px-3 py-2 rounded-md transition-colors">Activity</Link>
                            <Link to="/analytics" className="hover:bg-blue-700 px-3 py-2 rounded-md transition-colors">Analytics</Link>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
