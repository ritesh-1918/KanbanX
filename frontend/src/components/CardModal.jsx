import { supabase } from "../lib/supabase";
import { logActivity } from "../services/activity";


export default function CardModal({ card, onClose, readOnly = false, onUpdateCard }) {
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
                {readOnly ? (
                    <h3>{card.title}</h3>
                ) : (
                    <input
                        defaultValue={card.title}
                        style={{
                            fontSize: '1.17em',
                            fontWeight: 'bold',
                            width: '100%',
                            border: 'none',
                            borderBottom: '1px solid #ddd',
                            padding: 4,
                            marginBottom: 10
                        }}
                        onBlur={(e) => {
                            if (e.target.value !== card.title) {
                                onUpdateCard(card.id, { title: e.target.value });
                            }
                        }}
                    />
                )}
                <textarea
                    defaultValue={card.description || ""}
                    style={{ width: "100%", height: 120, marginTop: 10, padding: 8 }}
                    placeholder={readOnly ? "No description provided." : "Add a more detailed description..."}
                    disabled={readOnly}
                    onBlur={async (e) => {
                        if (readOnly) return;
                        if (e.target.value === card.description) return;

                        // Use handler if provided (Optimistic), else fallback (though in this flow handler is expected)
                        if (onUpdateCard) {
                            onUpdateCard(card.id, { description: e.target.value });

                            await logActivity({
                                boardId: card.board_id,
                                action: "Updated card description",
                                entityType: "card",
                                entityId: card.id,
                                metadata: { itemName: card.title }
                            });
                        }
                    }}
                />
                <button onClick={onClose} style={{ marginTop: 10 }}>
                    Close
                </button>
            </div>
        </div>
    );
}
