import { writable } from "svelte/store";
import { fetchNui } from "../utils/fetchNui";

export type CallStatus = "idle" | "dialing" | "connected" | "incoming";

export interface CallState {
    status: CallStatus;
    number: string;
    name?: string;
    duration: number; // in seconds
    speaker: boolean;
}

const initialState: CallState = {
    status: "idle",
    number: "",
    duration: 0,
    speaker: false,
};

function createCallStore() {
    const { subscribe, set, update } = writable<CallState>(initialState);

    let durationInterval: NodeJS.Timeout | null = null;

    return {
        subscribe,
        startCall: async (number: string, name?: string) => {
            update(state => ({
                ...state,
                status: "dialing",
                number,
                name,
                duration: 0
            }));

            try {
                await fetchNui("startCall", { number });
            } catch (e) {
                console.error("Failed to start call", e);
                // For dev/mocking purposes, we can simulate connection after a delay
                if (import.meta.env.DEV) {
                    setTimeout(() => {
                        update(s => ({ ...s, status: "connected" }));
                        startTimer();
                    }, 2000);
                }
            }
        },
        endCall: async () => {
            stopTimer();
            try {
                await fetchNui("endCall");
            } catch (e) {
                console.error("Failed to end call", e);
            }
            set(initialState);
        },
        answerCall: async () => {
            update(s => ({ ...s, status: "connected" }));
            startTimer();
            try {
                await fetchNui("answerCall");
            } catch (e) {
                console.error("Failed to answer call", e);
            }
        },
        toggleSpeaker: async () => {
            update(s => {
                const newSpeaker = !s.speaker;
                fetchNui("toggleSpeaker", { enabled: newSpeaker }).catch(e => console.error(e));
                return { ...s, speaker: newSpeaker };
            });
        },
        // NUI Event handlers
        setIncoming: (number: string, name?: string) => {
            update(s => ({
                ...s,
                status: "incoming",
                number,
                name,
                duration: 0
            }));
        },
        setStatus: (status: CallStatus) => {
            update(s => {
                if (status === "connected" && s.status !== "connected") {
                    startTimer();
                } else if (status === "idle") {
                    stopTimer();
                    return initialState;
                }
                return { ...s, status };
            });
        }
    };

    function startTimer() {
        if (durationInterval) clearInterval(durationInterval);
        durationInterval = setInterval(() => {
            update(s => ({ ...s, duration: s.duration + 1 }));
        }, 1000);
    }

    function stopTimer() {
        if (durationInterval) {
            clearInterval(durationInterval);
            durationInterval = null;
        }
    }
}

export const callStore = createCallStore();
