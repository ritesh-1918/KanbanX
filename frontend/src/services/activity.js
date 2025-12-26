import { supabase } from "../lib/supabase";

export const logActivity = async ({ boardId, action, entityType, entityId, metadata = {} }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("activity_logs").insert({
        board_id: boardId,
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata
    });

    if (error) console.error("Error logging activity:", error);
};

export const getBoardActivity = async (boardId) => {
    const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("board_id", boardId)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) throw error;
    return data;
};
