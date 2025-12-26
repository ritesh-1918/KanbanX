import { supabase } from "../lib/supabase";

export const getBoardRole = async (boardId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from("board_members")
        .select("role")
        .eq("board_id", boardId)
        .eq("user_id", user.id)
        .single();

    return data?.role || null;
};

export const inviteMember = async (boardId, email, role = "VIEWER") => {
    // 1. Find user by email from public profiles
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

    if (profileError || !profile) {
        throw new Error("User not found. They must sign up for KanbanX first.");
    }

    // 2. Insert into board_members
    const { error } = await supabase
        .from("board_members")
        .insert({
            board_id: boardId,
            user_id: profile.id,
            role
        });

    if (error) {
        if (error.code === '23505') throw new Error("User is already a member.");
        throw error;
    }
};

export const getMembers = async (boardId) => {
    const { data, error } = await supabase
        .from("board_members")
        .select(`
            id, role,
            profiles ( email )
        `)
        .eq("board_id", boardId);

    if (error) throw error;
    return data.map(m => ({
        id: m.id,
        role: m.role,
        email: m.profiles.email
    }));
};
