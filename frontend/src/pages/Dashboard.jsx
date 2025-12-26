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
        <>
            <Navbar />
            <div style={{ padding: 24 }}>
                <h2>Your Boards</h2>

                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <input
                        placeholder="New board title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <button onClick={handleCreate}>Create</button>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                    {boards.map((b) => (
                        <BoardCard key={b.id} board={b} onDelete={handleDelete} />
                    ))}
                </div>
            </div>
        </>
    );
}
