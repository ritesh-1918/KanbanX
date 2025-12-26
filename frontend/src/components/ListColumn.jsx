import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ListColumn({ list }) {
    const [cards, setCards] = useState([]);
    const [text, setText] = useState("");

    const loadCards = async () => {
        const { data } = await supabase
            .from("cards")
            .select("*")
            .eq("list_id", list.id)
            .order("position");
        setCards(data || []);
    };

    useEffect(() => {
        loadCards();
    }, []);

    const addCard = async () => {
        if (!text.trim()) return;
        await supabase.from("cards").insert({
            list_id: list.id,
            title: text,
            position: cards.length
        });
        setText("");
        loadCards();
    };

    const deleteCard = async (id) => {
        await supabase.from("cards").delete().eq("id", id);
        loadCards();
    };

    return (
        <div
            style={{
                width: 260,
                background: "#f1f5f9",
                padding: 12,
                borderRadius: 8
            }}
        >
            <strong>{list.title}</strong>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {cards.map((card) => (
                    <div
                        key={card.id}
                        style={{
                            background: "white",
                            padding: 8,
                            borderRadius: 6,
                            display: "flex",
                            justifyContent: "space-between"
                        }}
                    >
                        <span>{card.title}</span>
                        <button onClick={() => deleteCard(card.id)}>×</button>
                    </div>
                ))}
            </div>

            <input
                placeholder="New card"
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ marginTop: 8, width: "100%" }}
            />
            <button onClick={addCard} style={{ marginTop: 6, width: "100%" }}>
                Add Card
            </button>
        </div>
    );
}
