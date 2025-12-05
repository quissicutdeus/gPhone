import { writable } from "svelte/store";
import { fetchNui } from "../utils/fetchNui";

export const bankBalance = writable<number>(0);

export const fetchBalance = async () => {
    try {
        const balance = await fetchNui<number>("getBankBalance", null, 12450);
        bankBalance.set(balance);
    } catch (error) {
        console.error("Failed to fetch bank balance:", error);
    }
};
