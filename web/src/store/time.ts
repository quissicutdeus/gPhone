import { writable, derived } from "svelte/store";

interface TimeState {
    hours: number;
    minutes: number;
}

export const time = writable<TimeState>({ hours: 0, minutes: 0 });
export const is24Hour = writable<boolean>(false);

export const formattedTime = derived(
    [time, is24Hour],
    ([$time, $is24Hour]) => {
        const { hours, minutes } = $time;
        const paddedMinutes = minutes < 10 ? "0" + minutes : minutes;

        if ($is24Hour) {
            const paddedHours = hours < 10 ? "0" + hours : hours;
            return `${paddedHours}:${paddedMinutes}`;
        } else {
            const period = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${paddedMinutes} ${period}`;
        }
    }
);
