export default function SimpleChart({ data, title, color = "#3b82f6", type = "bar" }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ padding: 20, textAlign: "center", border: "1px dashed #ccc", borderRadius: 8 }}>
                <h4>{title}</h4>
                <p style={{ color: "#888" }}>No data available</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div style={{ background: "white", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h4 style={{ marginBottom: 20 }}>{title}</h4>
            <div style={{
                display: "flex",
                alignItems: "flex-end",
                height: 200,
                gap: 10,
                borderBottom: "1px solid #eee",
                paddingBottom: 10
            }}>
                {data.map((item, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <div
                            style={{
                                width: "100%",
                                backgroundColor: color,
                                height: `${(item.value / maxValue) * 100}%`,
                                borderRadius: "4px 4px 0 0",
                                minHeight: 4, // Ensure visibility
                                transition: "height 0.3s ease"
                            }}
                            title={`${item.label}: ${item.value}`}
                        />
                        <div style={{ fontSize: 11, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 50 }}>
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
