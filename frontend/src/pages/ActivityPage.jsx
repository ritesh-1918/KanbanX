import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllActivity } from "../services/activity";

export default function ActivityPage() {
    const [activities, setActivities] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const data = await getAllActivity();
                setActivities(data || []);
            } catch (error) {
                console.error("Failed to fetch activity:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const filteredActivities = activities.filter(a => {
        if (filter === "all") return true;
        return a.entity_type === filter;
    });

    // Group by Date
    const grouped = filteredActivities.reduce((acc, log) => {
        const date = new Date(log.created_at).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {});

    return (
        <>
            <Navbar />
            <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2>Activity Timeline</h2>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: 8, borderRadius: 4 }}
                    >
                        <option value="all">All Activity</option>
                        <option value="card">Cards</option>
                        <option value="list">Lists</option>
                        <option value="board">Boards</option>
                    </select>
                </div>

                {loading ? <p>Loading activity...</p> : (
                    Object.keys(grouped).map(date => (
                        <div key={date} style={{ marginBottom: 30 }}>
                            <h4 style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0", paddingBottom: 5, marginBottom: 15 }}>
                                {date}
                            </h4>
                            <div style={{ display: "grid", gap: 15 }}>
                                {grouped[date].map(log => (
                                    <div key={log.id} style={{ display: "flex", gap: 15, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 32, height: 32,
                                            borderRadius: "50%",
                                            background: "#f1f5f9",
                                            display: "grid",
                                            placeItems: "center",
                                            fontSize: 14
                                        }}>
                                            {log.action.includes("Created") ? "➕" :
                                                log.action.includes("Deleted") ? "🗑️" :
                                                    log.action.includes("Moved") || log.action.includes("Reordered") ? "↔️" : "✏️"}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>
                                                {log.action}
                                                {log.metadata?.itemName && <span style={{ fontWeight: "bold" }}> "{log.metadata.itemName}"</span>}
                                            </div>
                                            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                                                Board: {log.boards?.title || "Unknown"} • {new Date(log.created_at).toLocaleTimeString()}
                                            </div>
                                            {log.metadata?.toColumn && (
                                                <div style={{ fontSize: 12, color: "#2563eb", marginTop: 2 }}>
                                                    Moved to list: <strong>{log.metadata.toColumn}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
                {!loading && filteredActivities.length === 0 && <p style={{ color: "#94a3b8", textAlign: "center" }}>No activity found.</p>}
            </div>
        </>
    );
}
