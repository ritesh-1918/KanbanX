import { Link } from "react-router-dom";

export default function BoardCard({ board, onDelete }) {
    return (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <Link
                to={`/board/${board.id}`}
                className="text-lg font-semibold text-gray-800 hover:text-blue-600 flex-1"
            >
                {board.title}
            </Link>
            <button
                onClick={() => onDelete(board.id)}
                className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
            >
                Delete
            </button>
        </div>
    );
}
