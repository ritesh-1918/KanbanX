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
            <strong>{board.title}</strong>
            <button onClick={() => onDelete(board.id)}>Delete</button>
        </div>
    );
}
