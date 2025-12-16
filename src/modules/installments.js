import { supabase } from "../db.js";
import { currentMonth } from "../utils/date.js";
import { dbLog, error } from "../utils/logger.js";

export async function addInstallment(text) {
    const parts = text.split("-").map(p => p.trim());

    const item = parts[1].replace(/"/g, "");
    const monthly = parseInt(parts[2]);
    const due = parseInt(parts[3].split(":")[1]);

    let months = 1;
    let paid = 0;

    parts.slice(4).forEach(p => {
        if (p.startsWith("months:")) months = parseInt(p.split(":")[1]);
        if (p.startsWith("paid:")) paid = parseInt(p.split(":")[1]);
    });

    const remaining = Math.max(months - paid, 0);

    const payload = {
        item,
        monthly_amount: monthly,
        tenor: months,
        remaining_months: remaining,
        billing_day: due,
        last_decrement_month: currentMonth()
    };

    dbLog("INSERT installment:", payload);

    const { error: dbError } = await supabase
        .from("installments")
        .insert(payload);

    if (dbError) {
        error("Supabase INSERT error:", dbError);
        return "Failed to add installment.";
    }

    return (
        `Added installment:\n${item}\n${monthly}/mo, tenor ${months} months\nPaid: ${paid}\nRemaining: ${remaining}\nDue: ${due}`
    );
}

export async function listInstallments() {
    const today = new Date().getDate();
    const month = currentMonth();

    dbLog("SELECT installments");

    const { data: items, error: dbError } = await supabase
        .from("installments")
        .select("*");

    if (dbError) {
        error("Supabase SELECT error:", dbError);
        return "Failed to fetch installments.";
    }

    // Auto-decrement
    for (let inst of items) {
        const shouldDecrement =
        today > inst.billing_day &&
        inst.last_decrement_month !== month;

        if (shouldDecrement) {
        const newRemaining = inst.remaining_months - 1;

        dbLog("AUTO-DECREMENT installment:", inst.id, "→", newRemaining);

        if (newRemaining <= 0) {
            dbLog("DELETE finished installment:", inst.id);

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

    const { data: updated } = await supabase.from("installments").select("*");

    if (!updated.length) return "No active installments.";

    let msg = "📦 Installments\n\n";
    updated.forEach(i => {
        msg += `[${i.id}] ${i.item} — ${i.monthly_amount}/mo (${i.remaining_months} left, due ${i.billing_day})\n`;
    });

    return msg;
}

export async function deleteInstallmentById(id) {
    dbLog("DELETE installment:", id);

    await supabase.from("installments").delete().eq("id", id);
    return `Deleted installment ${id}`;
}
