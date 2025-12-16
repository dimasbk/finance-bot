import { supabase } from "../db.js";
import { extractQuoted } from "../utils/parseQuoted.js";

export async function addBill(text) {
    const item = extractQuoted(text);
    if (!item) return `Use quotes: bill "wifi rumah" 350000/mo due:10`;

    const cleaned = text.replace(/"[^"]+"/, "").trim();
    const parts = cleaned.split(" ");

    const amount = parseInt(parts[1]);
    const billing_day = parseInt(parts[2].split(":")[1]);

    await supabase.from("bills").insert({
        item,
        amount,
        billing_day
    });

    return `Added bill: ${item} — ${amount}/mo (due ${billing_day})`;
}

export async function listBills() {
    const { data } = await supabase.from("bills").select("*");

    if (!data.length) return "No recurring bills.";

    let msg = "📌 Recurring Bills\n\n";
    data.forEach(b => {
        msg += `[${b.id}] ${b.item} — ${b.amount}/mo (due ${b.billing_day})\n`;
    });

    return msg;
}

export async function deleteBillById(id) {
    await supabase.from("bills").delete().eq("id", id);
    return `Deleted bill ${id}`;
}
