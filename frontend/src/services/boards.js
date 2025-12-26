import { supabase } from "../lib/supabase";

export const getBoards = async () => {
    const { data, error } = await supabase
        .from("boards")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
};

export const createBoard = async (title) => {
    const user = (await supabase.auth.getUser()).data.user;

    const { error } = await supabase
        .from("boards")
        .insert([{ title, user_id: user.id }]);

    if (error) throw error;
};

export const deleteBoard = async (id) => {
    const { error } = await supabase
        .from("boards")
        .delete()
        .eq("id", id);

    if (error) throw error;
};
