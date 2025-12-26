import { Link } from "react-router-dom";

export default function BoardCard({ board, onDelete }) {
    return (
        <div
            style={{
                padding: 16,
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}
        >
            <strong>
                <Link to={`/board/${board.id}`}>{board.title}</Link>
            </strong>
            <button onClick={() => onDelete(board.id)}>Delete</button>
        </div>
    );
}
