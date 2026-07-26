import { writable } from "svelte/store";
import { isBrowser } from "../utils/isBrowser";

export const devToolsVisible = writable<boolean>(isBrowser());

export const toggleDevTools = () => {
    devToolsVisible.update((v) => !v);
};

export const showDevTools = () => {
    devToolsVisible.set(true);
};

export const hideDevTools = () => {
    devToolsVisible.set(false);
};
