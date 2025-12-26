import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ListColumn from "../components/ListColumn";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

export default function SharedBoardPage() {
    const { shareId } = useParams();
    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBoardData = async () => {
            try {
                // 1. Fetch Board by share_id
                const { data: boardData, error: boardError } = await supabase
                    .from("boards")
                    .select("*")
                    .eq("share_id", shareId)
                    .eq("is_public", true)
                    .single();

                if (boardError || !boardData) throw new Error("Board not found or private");
                setBoard(boardData);

                // 2. Fetch Lists
                const { data: listsData } = await supabase
                    .from("lists")
                    .select("*")
                    .eq("board_id", boardData.id)
                    .order("position");
                setLists(listsData || []);

                // 3. Fetch Cards
                if (listsData?.length > 0) {
                    const listIds = listsData.map(l => l.id);
                    const { data: cardsData } = await supabase
                        .from("cards")
                        .select("*")
                        .in("list_id", listIds)
                        .order("position");
                    setCards(cardsData || []);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBoardData();
    }, [shareId]);

    if (loading) return <div style={{ padding: 20 }}>Loading shared board...</div>;
    if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;

    return (
        <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                <h2>{board.title} <span style={{ fontSize: 12, background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, color: '#64748b' }}>Read-only View</span></h2>
            </div>

            <DragDropContext onDragEnd={() => { }}>
                <Droppable droppableId="board-lists" direction="horizontal" type="LIST" isDropDisabled={true}>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ display: "flex", gap: 16, marginTop: 20, alignItems: 'flex-start' }}
                        >
                            {lists.map((list, index) => (
                                <ListColumn
                                    key={list.id}
                                    list={list}
                                    index={index}
                                    cards={cards.filter(c => c.list_id === list.id).sort((a, b) => a.position - b.position)}
                                    readOnly={true}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}
