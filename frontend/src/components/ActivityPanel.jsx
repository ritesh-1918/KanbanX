import { useEffect, useState } from "react";
import { getBoardActivity } from "../services/activity";
import { supabase } from "../lib/supabase";

export default function ActivityPanel({ boardId }) {
    const [logs, setLogs] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchLogs = async () => {
        try {
            const data = await getBoardActivity(boardId);
            setLogs(data || []);
        } catch (error) {
            console.error("Error fetching activity:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen, boardId]);

    useEffect(() => {
        if (!isOpen) return;

        // Realtime subscription for new logs
        const channel = supabase
            .channel("activity-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "activity_logs", filter: `board_id=eq.${boardId}` },
                (payload) => {
                    setLogs((prev) => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, boardId]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    background: "#0f172a",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
            >
                Activity Log
            </button>
        );
    }

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                right: 0,
                height: "100vh",
                width: 300,
                background: "white",
                boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
                padding: 20,
                overflowY: "auto",
                zIndex: 100
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3>Activity</h3>
                <button onClick={() => setIsOpen(false)}>Close</button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
                {logs.map((log) => (
                    <div key={log.id} style={{ fontSize: 13, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
                        <strong>{log.action}</strong>
                        <div style={{ color: "#666", marginTop: 2 }}>
                            {/* Basic format: "EntityName" (if available in metadata) */}
                            {log.metadata?.itemName ? `"${log.metadata.itemName}"` : ""}
                            {log.metadata?.toColumn ? ` to ${log.metadata.toColumn}` : ""}
                        </div>
                        <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                            {new Date(log.created_at).toLocaleString()}
                        </div>
                    </div>
                ))}
                {logs.length === 0 && <p style={{ color: "#888" }}>No recent activity.</p>}
            </div>
        </div>
    );
}
