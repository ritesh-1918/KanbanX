import { supabase } from "../lib/supabase";

export default function CardModal({ card, onClose }) {
    if (!card) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "grid",
                placeItems: "center",
                zIndex: 50
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "white",
                    width: 400,
                    padding: 20,
                    borderRadius: 8
                }}
            >
                <h3>{card.title}</h3>
                <textarea
                    defaultValue={card.description || ""}
                    style={{ width: "100%", height: 120, marginTop: 10, padding: 8 }}
                    placeholder="Add a more detailed description..."
                    onBlur={async (e) => {
                        await supabase
                            .from("cards")
                            .update({ description: e.target.value })
                            .eq("id", card.id);
                    }}
                />
                <button onClick={onClose} style={{ marginTop: 10 }}>
                    Close
                </button>
            </div>
        </div>
    );
}
