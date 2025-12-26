import { supabase } from "../lib/supabase";

export const signInWithEmail = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin
        }
    });
    if (error) throw error;
};

export const signOut = async () => {
    await supabase.auth.signOut();
};

export const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
};
