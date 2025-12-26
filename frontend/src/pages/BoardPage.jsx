import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import ListColumn from "../components/ListColumn";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

export default function BoardPage() {
    const { id } = useParams();
    const [lists, setLists] = useState([]);
    const [cards, setCards] = useState([]); // Lifted cards state
    const [title, setTitle] = useState("");

    const fetchData = async () => {
        // Fetch lists
        const { data: listsData } = await supabase
            .from("lists")
            .select("*")
            .eq("board_id", id)
            .order("position");

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
        setTitle("");
        fetchData();
    };

    const createCard = async (listId, cardTitle) => {
        // Optimistic update or just refetch. Using refetch for simplicity as per previous pattern, 
        // but ideally we should update local state.
        // We'll calculate position based on local state for that list.
        const listCards = cards.filter(c => c.list_id === listId);
        await supabase.from("cards").insert({
            list_id: listId,
            title: cardTitle,
            position: listCards.length
        });
        fetchData();
    }

    const deleteCard = async (cardId) => {
        await supabase.from("cards").delete().eq("id", cardId);
        fetchData();
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

        // Handle List Reordering
        if (type === "LIST") {
            const newLists = Array.from(lists);
            const [movedList] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, movedList);

            setLists(newLists); // Optimistic

            // Persist
            const updates = newLists.map((l, index) => ({
                id: l.id,
                position: index,
                board_id: id
            }));

            for (const u of updates) {
                await supabase.from("lists").update({ position: u.position }).eq("id", u.id);
            }
            return;
        }

        // Handle Card Reordering
        const newCards = Array.from(cards);

        // Find the moved card object
        const movedCard = newCards.find(c => c.id === draggableId);
        if (!movedCard) return; // Should not happen

        // Remove from source
        // We need to act on the specific subsets of cards to determine indices correctly relative to the list
        // BUT, the source.index and destination.index from dnd are relative to the droppable (the list).

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

        // Reconstruct the master cards array
        // We filter out all cards from source and dest lists from the master list, then add back the updated arrays.
        // If source == dest, we just do it once.

        let otherCards = newCards.filter(c => c.list_id !== sourceListId && c.list_id !== destListId);

        let finalCards;
        if (sourceListId === destListId) {
            // Update positions
            sourceCards.forEach((c, i) => c.position = i);
            finalCards = [...otherCards, ...sourceCards];

            // Optimistic
            setCards(finalCards);

            // Persist
            for (const c of sourceCards) {
                await supabase.from("cards").update({ position: c.position }).eq("id", c.id);
            }

        } else {
            // Update positions for both lists
            sourceCards.forEach((c, i) => c.position = i);
            destCards.forEach((c, i) => c.position = i);

            finalCards = [...otherCards, ...sourceCards, ...destCards];

            // Optimistic
            setCards(finalCards);

            // Persist source list changes (mostly removals/reordering)
            for (const c of sourceCards) {
                await supabase.from("cards").update({ position: c.position }).eq("id", c.id);
            }
            // Persist dest list changes (additions/reordering + list_id change for moved card)
            for (const c of destCards) {
                await supabase.from("cards").update({ position: c.position, list_id: destListId }).eq("id", c.id);
            }
        }
    };

    return (
        <>
            <Navbar />
            <div style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        placeholder="New list title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <button onClick={createList}>Add List</button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="board-lists" direction="horizontal" type="LIST">
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
                                        onCreateCard={createCard}
                                        onDeleteCard={deleteCard}
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </>
    );
}
