import { writable } from "svelte/store";
import { fetchNui } from "../utils/fetchNui";

export const bankBalance = writable<number>(0);
export const transactions = writable<any[]>([]);
export const citizenid = writable<string>("");

export const fetchCitizenId = async () => {
    try {
        const id = await fetchNui<string>("getCitizenId", null, { defaultValue: "" });
        citizenid.set(id);
        return id;
    } catch (error) {
        console.error("Failed to fetch citizenid:", error);
        return "";
    }
};

export const fetchBalance = async () => {
    try {
        const balance = await fetchNui<number>("getBankBalance", null, { defaultValue: 0 });
        bankBalance.set(balance);
    } catch (error) {
        console.error("Failed to fetch bank balance:", error);
    }
};

export const fetchTransactions = async () => {
    try {
        const data = await fetchNui<any[]>("getTransactions", null, {
            defaultValue: []
        });
        transactions.set(data);
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
    }
};
