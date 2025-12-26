import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import CardModal from "./CardModal";

export default function ListColumn({ list, index, cards, onCreateCard, onDeleteCard, readOnly = false }) {
    const [text, setText] = useState("");
    const [activeCard, setActiveCard] = useState(null);

    const handleAddCard = async () => {
        if (readOnly) return;
        if (!text.trim()) return;
        await onCreateCard(list.id, text);
        setText("");
    };

    return (
        <>
            <Draggable draggableId={list.id} index={index} isDragDisabled={readOnly}>
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
                        <div {...provided.dragHandleProps} style={{ marginBottom: 10, cursor: readOnly ? "default" : "grab" }}>
                            <strong>{list.title}</strong>
                        </div>

                        <Droppable droppableId={list.id} type="CARD" isDropDisabled={readOnly}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{ minHeight: 20, display: "grid", gap: 8 }}
                                >
                                    {cards.map((card, idx) => (
                                        <Draggable draggableId={card.id} index={idx} key={card.id} isDragDisabled={readOnly}>
                                            {(provided, snapshot) => (
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
                                                        boxShadow: snapshot.isDragging
                                                            ? "0 5px 10px rgba(0,0,0,0.15)"
                                                            : "0 1px 3px rgba(0,0,0,0.1)",
                                                        cursor: readOnly ? "default" : "grab",
                                                        ...provided.draggableProps.style
                                                    }}
                                                >
                                                    <span
                                                        onClick={() => setActiveCard(card)}
                                                        style={{ cursor: "pointer", flexGrow: 1 }}
                                                    >
                                                        {card.title}
                                                    </span>
                                                    {!readOnly && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteCard(card.id);
                                                            }}
                                                            style={{
                                                                cursor: 'pointer',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                color: '#dc2626',
                                                                fontWeight: 'bold',
                                                                marginLeft: 8
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        {!readOnly && (
                            <>
                                <input
                                    placeholder="New card"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    style={{ marginTop: 8, width: "100%", padding: 4 }}
                                />
                                <button onClick={handleAddCard} style={{ marginTop: 6, width: "100%" }}>
                                    Add Card
                                </button>
                            </>
                        )}
                    </div>
                )}
            </Draggable>

            <CardModal card={activeCard} onClose={() => setActiveCard(null)} readOnly={readOnly} />
        </>
    );
}
