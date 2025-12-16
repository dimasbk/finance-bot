import { addTransaction, dailySummary, monthlySummary } from "./modules/transactions.js";
import { addBill, listBills, deleteBillById } from "./modules/bills.js";
import { addInstallment, listInstallments, deleteInstallmentById } from "./modules/installments.js";

export async function handleMessage(chatId, text) {
    text = text.trim();

    if (text.startsWith("spent")) return addTransaction("expense", text);
    if (text.startsWith("income")) return addTransaction("income", text);

    if (text === "daily") return dailySummary();
    if (text === "monthly") return monthlySummary();

    if (text.startsWith("bill ") && text.includes("x")) return addInstallment(text);
    if (text.startsWith("bill ")) return addBill(text);

    if (text === "bills") return listBills();
    if (text.startsWith("delete bill")) return deleteBillById(text.split(" ")[2]);

    if (text === "installments") return listInstallments();
    if (text.startsWith("delete installment")) return deleteInstallmentById(text.split(" ")[2]);

    return "Unknown command.";
}
