import { supabase } from "../lib/supabase";
import { logActivity } from "../services/activity";


export default function CardModal({ card, onClose, readOnly = false }) {
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
                    placeholder={readOnly ? "No description provided." : "Add a more detailed description..."}
                    disabled={readOnly}
                    onBlur={async (e) => {
                        if (readOnly) return;
                        if (e.target.value === card.description) return;
                        await supabase
                            .from("cards")
                            .update({ description: e.target.value })
                            .eq("id", card.id);

                        await logActivity({
                            boardId: card.board_id, // IMPORTANT: We need board_id on the card object for this to work.
                            action: "Updated card description",
                            entityType: "card",
                            entityId: card.id,
                            metadata: { itemName: card.title }
                        });
                    }}
                />
                <button onClick={onClose} style={{ marginTop: 10 }}>
                    Close
                </button>
            </div>
        </div>
    );
}
