import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import ListColumn from "../components/ListColumn";

export default function BoardPage() {
    const { id } = useParams();
    const [lists, setLists] = useState([]);
    const [title, setTitle] = useState("");

    const loadLists = async () => {
        const { data } = await supabase
            .from("lists")
            .select("*")
            .eq("board_id", id)
            .order("position");
        setLists(data || []);
    };

    useEffect(() => {
        loadLists();
    }, [id]);

    const createList = async () => {
        if (!title.trim()) return;
        await supabase.from("lists").insert({
            board_id: id,
            title,
            position: lists.length
        });
        setTitle("");
        loadLists();
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

                <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                    {lists.map((list) => (
                        <ListColumn key={list.id} list={list} />
                    ))}
                </div>
            </div>
        </>
    );
}
