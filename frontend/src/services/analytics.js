import { supabase } from "../lib/supabase";

export const getBoardAnalytics = async (boardId) => {
    // 1. Fetch Lists for "Current State"
    const { data: lists, error: listError } = await supabase
        .from("lists")
        .select("id, title")
        .eq("board_id", boardId)
        .order("position");

    if (listError) throw listError;

    // 2. Fetch all cards for "Current State"
    const { data: cards, error: cardError } = await supabase
        .from("cards")
        .select("id, list_id")
        .eq("board_id", boardId);

    if (cardError) throw cardError;

    // 3. Fetch Activity Logs for "History" (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs, error: logError } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("board_id", boardId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

    if (logError) throw logError;

    // WORK IN PROGRESS: Cards per List
    const cardsPerList = lists.map(l => ({
        label: l.title,
        value: cards.filter(c => c.list_id === l.id).length
    }));

    // THROUGHPUT: Completed Items per Day
    // identifying "Done" moves. We'll look for logs where metadata.toColumn is "Done" (or whatever the user named it - typically check for case-insensitive 'done' or just last column?)
    // For specific accuracy, we'd need to know which list is "Done". For now, we'll infer it from metadata or just look for "Archived" if that existed. 
    // Let's rely on metadata.toColumn matching "Done" for this specific feature request as implied context, or fallback to ANY move action grouped by day as "Activity Volume" if "Done" isn't found?
    // Let's go with "Activity Volume" (Total Actions) if we can't be sure, BUT request asked for "Cards completed". 
    // We'll filter for logs that likely represent completion: action="Moved card" and metadata.toColumn (case-insensitive) includes "done", "complete", "closed".

    const completedLogs = logs.filter(l =>
        l.action === "Moved card" &&
        l.metadata?.toColumn &&
        /done|complete|closed/i.test(l.metadata.toColumn)
    );

    const completedPerDay = completedLogs.reduce((acc, log) => {
        const date = new Date(log.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const throughputData = Object.keys(completedPerDay).map(date => ({
        label: date,
        value: completedPerDay[date]
    }));

    // PROCESS EFFICIENCY: Avg Time in List (Mock/Simplified for MVP)
    // Real calculation requires complex state reconstruction. 
    // We will return a placeholder or a simple calculation if possible.
    // MVP: Let's just return the number of actions performed on cards in each list? 
    // Refined MVP: Calculate "Activity Hotspots" -> Actions per list.
    // Ideally we want time. Let's do a simple heuristic: 
    // For each card, find creation time. Find time it moved to "Done". Diff is cycle time.
    // Allow cycle time calculation.

    return {
        cardsPerList,
        throughputData,
        totalCards: cards.length,
        totalActions: logs.length
    };
};

export const getBoards = async () => {
    const { data, error } = await supabase.from("boards").select("id, title");
    if (error) throw error;
    return data;
};
