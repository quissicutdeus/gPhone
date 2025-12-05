import { writable } from "svelte/store";
import { fetchNui } from "../utils/fetchNui";

export const bankBalance = writable<number>(0);
export const transactions = writable<any[]>([]);

export const fetchBalance = async () => {
    try {
        const balance = await fetchNui<number>("getBankBalance", null, 12450);
        bankBalance.set(balance);
    } catch (error) {
        console.error("Failed to fetch bank balance:", error);
    }
};

export const fetchTransactions = async () => {
    try {
        const data = await fetchNui<any[]>("getTransactions", null, [
            { message: "Store Purchase", amount: -45, time: Math.floor(Date.now() / 1000), title: "Store" },
            { message: "Salary", amount: 1500, time: Math.floor(Date.now() / 1000) - 86400, title: "Job" },
            { message: "Transfer", amount: -200, time: Math.floor(Date.now() / 1000) - 172800, title: "Transfer" }
        ]);
        transactions.set(data);
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
    }
};
