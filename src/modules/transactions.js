import { supabase } from "../db.js";
import { todayKey, currentMonth } from "../utils/date.js";
import { dbLog, error } from "../utils/logger.js";

export async function addTransaction(type, text) {
    const parts = text.split("-").map(p => p.trim());

    const amount = parseInt(parts[1]);
    const method = parts[2];
    const note = parts[3] || "";

    const payload = {
        type,
        amount,
        method,
        note,
        date: todayKey()
    };

    dbLog("INSERT transactions:", payload);

    const { error: dbError } = await supabase.from("transactions").insert(payload);

    if (dbError) {
        error("Supabase error:", dbError);
        return "Failed to record transaction.";
    }

    return `Recorded ${type}: ${amount} (${method}) — ${note}`;
}

export async function dailySummary() {
    dbLog("SELECT daily summary for date:", todayKey());

    const { data, error: dbError } = await supabase
        .from("transactions")
        .select("*")
        .eq("date", todayKey());

    if (dbError) {
        error("Supabase SELECT error:", dbError);
        return "Error fetching daily summary.";
    }

    if (!data.length) return "No entries for today.";

    let income = 0, expense = 0;
    data.forEach(r =>
        r.type === "income" ? (income += r.amount) : (expense += r.amount)
    );

    return (
        `📅 Daily Summary\n` +
        `Income: ${income}\nExpenses: ${expense}\nNet: ${income - expense}`
    );
}

export async function monthlySummary() {
    const month = currentMonth();
    dbLog("SELECT monthly summary for month:", month);

    const { data, error: dbError } = await supabase
        .from("transactions")
        .select("*")
        .like("date", month + "%");

    if (dbError) {
        error("Supabase SELECT error:", dbError);
        return "Error fetching monthly summary.";
    }

    if (!data.length) return "No entries this month.";

    let income = 0, expense = 0;
    data.forEach(r =>
        r.type === "income" ? (income += r.amount) : (expense += r.amount)
    );

    return (
        `📆 Monthly Summary (${month})\nIncome: ${income}\nExpenses: ${expense}\nNet: ${income - expense}`
    );
}
