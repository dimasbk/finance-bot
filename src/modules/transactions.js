import { supabase } from "../db.js";
import { todayKey, currentMonth } from "../utils/date.js";

export async function addTransaction(type, text) {
    const parts = text.split(" ");
    const amount = parseInt(parts[1]);
    const method = parts[2];
    const note = parts.slice(3).join(" ");

    await supabase.from("transactions").insert({
        type,
        amount,
        method,
        note,
        date: todayKey()
    });

    return `Recorded ${type}: ${amount} (${method}) — ${note}`;
}

export async function dailySummary() {
    const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("date", todayKey());

    if (!data.length) return "No entries for today.";

    let income = 0, expense = 0;
    data.forEach(r =>
        r.type === "income" ? income += r.amount : expense += r.amount
    );

    return (
        `📅 Daily Summary\n` +
        `Income: ${income}\n` +
        `Expenses: ${expense}\n` +
        `Net: ${income - expense}`
    );
}

export async function monthlySummary() {
    const month = currentMonth();

    const { data } = await supabase
        .from("transactions")
        .select("*")
        .like("date", month + "%");

    if (!data.length) return "No entries this month.";

    let income = 0, expense = 0;
    data.forEach(r =>
        r.type === "income" ? income += r.amount : expense += r.amount
    );

    return (
        `📆 Monthly Summary (${month})\n` +
        `Income: ${income}\n` +
        `Expenses: ${expense}\n` +
        `Net: ${income - expense}`
    );
}
