import { supabase } from "../db.js";
import { extractQuoted } from "../utils/parseQuoted.js";
import { dbLog, error } from "../utils/logger.js";

export async function addBill(text) {
    const parts = text.split("-").map(p => p.trim());

    const item = parts[1].replace(/"/g, "");
    const amount = parseInt(parts[2]);
    const dueDay = parseInt(parts[3].split(":")[1]);

    const payload = { item, amount, billing_day: dueDay };

    dbLog("INSERT bills:", payload);

    const { error: dbError } = await supabase.from("bills").insert(payload);
    if (dbError) {
        error("Supabase INSERT error:", dbError);
        return "Failed to add bill.";
    }

    return `Added bill: ${item} — ${amount}/mo (due ${dueDay})`;
}

export async function listBills() {
    dbLog("SELECT bills");

    const { data, error: dbError } = await supabase.from("bills").select("*");

    if (dbError) {
        error("Supabase SELECT error:", dbError);
        return "Failed to fetch bills.";
    }

    if (!data.length) return "No recurring bills.";

    let msg = "📌 Recurring Bills\n\n";
    data.forEach(b => {
        msg += `[${b.id}] ${b.item} — ${b.amount}/mo (due ${b.billing_day})\n`;
    });

    return msg;
}

export async function deleteBillById(id) {
    dbLog("DELETE bill with id:", id);

    await supabase.from("bills").delete().eq("id", id);
    return `Deleted bill ${id}`;
}
