import { supabase } from "../db.js";
import { extractQuoted } from "../utils/parseQuoted.js";
import { currentMonth } from "../utils/date.js";

export async function addInstallment(text) {
    const item = extractQuoted(text);
    if (!item) return `Use quotes: bill "ps5" 1200000/mo due:15 6x paid:2`;

    const cleaned = text.replace(/"[^"]+"/, "").trim();
    const parts = cleaned.split(" ");

    const monthly = parseInt(parts[1]);
    const billing_day = parseInt(parts[2].split(":")[1]);
    const tenor = parseInt(parts[3]);

    let paid = 0;
    const paidTag = parts.find(p => p.includes("paid:"));
    if (paidTag) paid = parseInt(paidTag.split(":")[1]);

    const remaining = Math.max(tenor - paid, 0);

    await supabase.from("installments").insert({
        item,
        monthly_amount: monthly,
        tenor,
        remaining_months: remaining,
        billing_day,
        last_decrement_month: currentMonth()
    });

    return (
        `Added installment:\n` +
        `${item}\n` +
        `${monthly}/mo, tenor ${tenor} months\n` +
        `Already paid: ${paid}\n` +
        `Remaining: ${remaining}\n` +
        `Due: ${billing_day}`
    );
}

export async function listInstallments() {
    const today = new Date().getDate();
    const month = currentMonth();

    const { data: items } = await supabase.from("installments").select("*");

    // Auto-decrement logic
    for (let inst of items) {
        if (today > inst.billing_day && inst.last_decrement_month !== month) {
        const newRemaining = inst.remaining_months - 1;

        if (newRemaining <= 0) {
            await supabase.from("installments").delete().eq("id", inst.id);
            continue;
        }

        await supabase
            .from("installments")
            .update({
            remaining_months: newRemaining,
            last_decrement_month: month
            })
            .eq("id", inst.id);
        }
    }

    // Fetch updated list
    const { data } = await supabase.from("installments").select("*");

    if (!data.length) return "No active installments.";

    let msg = "📦 Installments\n\n";
    data.forEach(i => {
        msg += `[${i.id}] ${i.item} — ${i.monthly_amount}/mo (${i.remaining_months} left, due ${i.billing_day})\n`;
    });

    return msg;
}

export async function deleteInstallmentById(id) {
    await supabase.from("installments").delete().eq("id", id);
    return `Deleted installment ${id}`;
}
