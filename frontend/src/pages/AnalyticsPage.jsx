import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getBoardAnalytics, getBoards } from "../services/analytics";
import SimpleChart from "../components/SimpleChart";

export default function AnalyticsPage() {
    const [boards, setBoards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const boardsData = await getBoards();
                setBoards(boardsData || []);
                if (boardsData?.length > 0) {
                    setSelectedBoard(boardsData[0].id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!selectedBoard) return;
        const loadAnalytics = async () => {
            setLoading(true);
            try {
                const data = await getBoardAnalytics(selectedBoard);
                setAnalytics(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, [selectedBoard]);

    return (
        <>
            <Navbar />
            <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                    <h2>Board Analytics</h2>
                    {boards.length > 0 && (
                        <select
                            value={selectedBoard || ""}
                            onChange={(e) => setSelectedBoard(e.target.value)}
                            style={{ padding: 8, borderRadius: 4, minWidth: 200 }}
                        >
                            {boards.map(b => (
                                <option key={b.id} value={b.id}>{b.title}</option>
                            ))}
                        </select>
                    )}
                </div>

                {loading ? <p>Loading insights...</p> : !analytics ? <p>No data found.</p> : (
                    <div style={{ display: "grid", gap: 30 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                            <div style={{ background: "white", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", textAlign: "center" }}>
                                <h3 style={{ fontSize: 32, margin: 0, color: "#2563eb" }}>{analytics.totalCards}</h3>
                                <p style={{ margin: 0, color: "#64748b" }}>Active Cards</p>
                            </div>
                            <div style={{ background: "white", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", textAlign: "center" }}>
                                <h3 style={{ fontSize: 32, margin: 0, color: "#10b981" }}>{analytics.totalActions}</h3>
                                <p style={{ margin: 0, color: "#64748b" }}>Activity Logs (30d)</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>
                            <SimpleChart
                                title="Work in Progress (Cards per List)"
                                data={analytics.cardsPerList}
                                color="#6366f1"
                            />
                            <SimpleChart
                                title="Throughput (Completed per Day)"
                                data={analytics.throughputData}
                                color="#10b981"
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
