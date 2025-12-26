import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BoardCard from "../components/BoardCard";
import { getBoards, createBoard, deleteBoard } from "../services/boards";

export default function Dashboard() {
    const [boards, setBoards] = useState([]);
    const [title, setTitle] = useState("");

    const loadBoards = async () => {
        const data = await getBoards();
        setBoards(data);
    };

    useEffect(() => {
        loadBoards();
    }, []);

    const handleCreate = async () => {
        if (!title.trim()) return;
        await createBoard(title);
        setTitle("");
        loadBoards();
    };

    const handleDelete = async (id) => {
        await deleteBoard(id);
        loadBoards();
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Your Boards</h2>

                    <div className="flex gap-2">
                        <input
                            placeholder="New board title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                        <button
                            onClick={handleCreate}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                        >
                            Create
                        </button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {boards.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No boards yet. Create one to get started!</p>
                        </div>
                    ) : (
                        boards.map((b) => (
                            <BoardCard key={b.id} board={b} onDelete={handleDelete} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
