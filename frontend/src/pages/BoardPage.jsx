import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import ListColumn from "../components/ListColumn";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import ActivityPanel from "../components/ActivityPanel";
import { logActivity } from "../services/activity";
import { Toaster, toast } from "react-hot-toast";

export default function BoardPage() {
    const { id } = useParams();
    const [lists, setLists] = useState([]);
    const [cards, setCards] = useState([]); // Lifted cards state
    const [title, setTitle] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [shareId, setShareId] = useState(null);

    const fetchData = async () => {
        // Fetch lists
        const { data: listsData } = await supabase
            .from("lists")
            .select("*")
            .eq("board_id", id)
            .order("position");

        // Fetch board details for sharing info
        const { data: boardData } = await supabase
            .from("boards")
            .select("is_public, share_id")
            .eq("id", id)
            .single();

        if (boardData) {
            setIsPublic(boardData.is_public);
            setShareId(boardData.share_id);
        }

        setLists(listsData || []);

        // Fetch all cards for this board's lists
        if (listsData?.length > 0) {
            const listIds = listsData.map(l => l.id);
            const { data: cardsData } = await supabase
                .from("cards")
                .select("*")
                .in("list_id", listIds)
                .order("position");
            setCards(cardsData || []);
        } else {
            setCards([]);
        }
    };

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel("kanban-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "lists" },
                () => fetchData()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "cards" },
                () => fetchData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    const createList = async () => {
        if (!title.trim()) return;
        await supabase.from("lists").insert({
            board_id: id,
            title,
            position: lists.length
        });

        await logActivity({
            boardId: id,
            action: "Created list",
            entityType: "list",
            entityId: null, // we don't have the ID easily unless we select it back, okay to skip for now or fetch
            metadata: { itemName: title }
        });

        setTitle("");
        fetchData();
    };

    const createCard = async (listId, cardTitle) => {
        await supabase.from("cards").insert({
            list_id: listId,
            title: cardTitle,
            position: 1000, // naive position for now
            board_id: id // Ensure board_id is saved on card for easier access later
        });

        await logActivity({
            boardId: id,
            action: "Created card",
            entityType: "card",
            entityId: null,
            metadata: { itemName: cardTitle }
        });

        fetchData();
    }

    const updateCard = async (cardId, updates) => {
        // Optimistic Update
        const previousCards = [...cards];
        const updatedCards = cards.map(c => c.id === cardId ? { ...c, ...updates } : c);
        setCards(updatedCards);

        try {
            const { error } = await supabase
                .from("cards")
                .update(updates)
                .eq("id", cardId);

            if (error) throw error;
        } catch (error) {
            // Rollback
            setCards(previousCards);
            toast.error("Failed to update card");
            console.error(error);
        }
    };

    const deleteCard = async (cardId) => {
        const previousCards = [...cards];
        setCards(cards.filter(c => c.id !== cardId)); // Optimistic delete

        try {
            await supabase.from("cards").delete().eq("id", cardId);

            await logActivity({
                boardId: id,
                action: "Deleted card",
                entityType: "card",
                entityId: cardId,
            });
        } catch (error) {
            setCards(previousCards);
            toast.error("Failed to delete card");
        }
    }

    const onDragEnd = async (result) => {
        const { source, destination, draggableId, type } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // Capture previous state for rollback
        const previousLists = [...lists];
        const previousCards = [...cards];

        // Handle List Reordering
        if (type === "LIST") {
            const newLists = Array.from(lists);
            const [movedList] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, movedList);

            setLists(newLists); // Optimistic

            try {
                // Persist
                const updates = newLists.map((l, index) => ({
                    id: l.id,
                    position: index,
                    board_id: id
                }));

                for (const u of updates) {
                    await supabase.from("lists").update({ position: u.position }).eq("id", u.id);
                }
            } catch (error) {
                setLists(previousLists);
                toast.error("Failed to reorder lists");
            }
            return;
        }

        // Handle Card Reordering
        const newCards = Array.from(cards);

        // Find the moved card object
        const movedCard = newCards.find(c => c.id === draggableId);
        if (!movedCard) return; // Should not happen

        const sourceListId = source.droppableId;
        const destListId = destination.droppableId;

        const sourceCards = newCards.filter(c => c.list_id === sourceListId).sort((a, b) => a.position - b.position);
        const destCards = (sourceListId === destListId)
            ? sourceCards
            : newCards.filter(c => c.list_id === destListId).sort((a, b) => a.position - b.position);

        // Remove from source array
        sourceCards.splice(source.index, 1);

        // Update moved card list_id if changed
        const updatedMovedCard = { ...movedCard, list_id: destListId };

        // Insert into destination array
        destCards.splice(destination.index, 0, updatedMovedCard);

        // Reconstruct
        let otherCards = newCards.filter(c => c.list_id !== sourceListId && c.list_id !== destListId);

        let finalCards;
        if (sourceListId === destListId) {
            sourceCards.forEach((c, i) => c.position = i);
            finalCards = [...otherCards, ...sourceCards];
        } else {
            sourceCards.forEach((c, i) => c.position = i);
            destCards.forEach((c, i) => c.position = i);
            finalCards = [...otherCards, ...sourceCards, ...destCards];
        }

        // Apply Optimistic Update
        setCards(finalCards);

        try {
            if (sourceListId === destListId) {
                // Persist
                for (const c of sourceCards) {
                    await supabase.from("cards").update({ position: c.position }).eq("id", c.id);
                }

                // Log move (same list)
                if (source.index !== destination.index) {
                    await logActivity({
                        boardId: id,
                        action: "Reordered card",
                        entityType: "card",
                        entityId: movedCard.id,
                        metadata: { itemName: movedCard.title }
                    });
                }

            } else {
                // Persist source list changes
                for (const c of sourceCards) {
                    await supabase.from("cards").update({ position: c.position }).eq("id", c.id);
                }
                // Persist dest list changes
                for (const c of destCards) {
                    await supabase.from("cards").update({ position: c.position, list_id: destListId }).eq("id", c.id);
                }

                // Log move (cross list)
                const destListName = lists.find(l => l.id === destListId)?.title || "unknown list";
                await logActivity({
                    boardId: id,
                    action: "Moved card",
                    entityType: "card",
                    entityId: movedCard.id,
                    metadata: { itemName: movedCard.title, toColumn: destListName }
                });
            }
        } catch (error) {
            console.error(error);
            setCards(previousCards);
            toast.error("Failed to move card");
        }
    };

    const handleShareToggle = async () => {
        const newValue = !isPublic;
        const { error } = await supabase
            .from("boards")
            .update({ is_public: newValue })
            .eq("id", id);

        if (!error) setIsPublic(newValue);
    };

    return (
        <>
            <Navbar />
            <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            placeholder="New list title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <button onClick={createList}>Add List</button>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {isPublic && (
                            <span style={{ fontSize: 12, background: "#e2e8f0", padding: "4px 8px", borderRadius: 4 }}>
                                Public Link: <a href={`/share/${shareId}`} target="_blank" rel="noreferrer">/share/{shareId?.slice(0, 8)}...</a>
                            </span>
                        )}
                        <button onClick={handleShareToggle} style={{ background: isPublic ? "#dc2626" : "#2563eb" }}>
                            {isPublic ? "Unshare Board" : "Share Board"}
                        </button>
                    </div>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="board-lists" direction="horizontal" type="LIST">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{ display: "flex", gap: 16, marginTop: 20, alignItems: 'flex-start' }}
                            >
                                {lists.map((list, index) => <ListColumn
                                    key={list.id}
                                    list={list}
                                    index={index}
                                    cards={cards.filter(c => c.list_id === list.id).sort((a, b) => a.position - b.position)}
                                    onCreateCard={createCard}
                                    onDeleteCard={deleteCard}
                                    onUpdateCard={updateCard}
                                />
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <ActivityPanel boardId={id} />
                <Toaster position="bottom-right" />
            </div>
        </>
    );
}
