import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";

export default function ListColumn({ list, index, cards, onCreateCard, onDeleteCard }) {
    const [text, setText] = useState("");

    const handleAddCard = async () => {
        if (!text.trim()) return;
        await onCreateCard(list.id, text);
        setText("");
    };

    return (
        <Draggable draggableId={list.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                        width: 260,
                        background: "#f1f5f9",
                        padding: 12,
                        borderRadius: 8,
                        ...provided.draggableProps.style
                    }}
                >
                    <div {...provided.dragHandleProps} style={{ marginBottom: 10 }}>
                        <strong>{list.title}</strong>
                    </div>

                    <Droppable droppableId={list.id} type="CARD">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{ minHeight: 20, display: "grid", gap: 8 }}
                            >
                                {cards.map((card, idx) => (
                                    <Draggable draggableId={card.id} index={idx} key={card.id}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    background: "white",
                                                    padding: 8,
                                                    borderRadius: 6,
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                    ...provided.draggableProps.style
                                                }}
                                            >
                                                <span>{card.title}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent drag start when clicking delete
                                                        onDeleteCard(card.id);
                                                    }}
                                                    style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    <input
                        placeholder="New card"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{ marginTop: 8, width: "100%", padding: 4 }}
                    />
                    <button onClick={handleAddCard} style={{ marginTop: 6, width: "100%" }}>
                        Add Card
                    </button>
                </div>
            )}
        </Draggable>
    );
}
