<script lang="ts">
    import { onMount } from "svelte";
    import { callStore } from "../store/call";
    import { fetchNui } from "../utils/fetchNui";
    import type { Contact } from "@shared/types";

    let { onback } = $props();

    let enteredNumber = $state("");
    let favorites: Contact[] = $state([]);

    const goBack = () => {
        onback?.();
    };

    const handleKeypad = (num: string) => {
        if (enteredNumber.length < 15) {
            enteredNumber += num;
        }
    };

    const handleBackspace = () => {
        enteredNumber = enteredNumber.slice(0, -1);
    };

    const startCall = (number: string, name?: string) => {
        if (!number) return;
        callStore.startCall(number, name);
    };

    const loadFavorites = async () => {
        try {
            const contacts = await fetchNui<Contact[]>("getContacts");
            if (contacts) {
                favorites = contacts.filter((c) => c.favorite);
            }
        } catch (e) {
            console.warn("Failed to load favorites", e);
            if (import.meta.env.DEV) {
                favorites = [
                    {
                        id: 1,
                        citizenid: "1",
                        firstname: "Alice",
                        lastname: "Smith",
                        phone: "555-0100",
                        email: "alice@gphone.site",
                        favorite: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ];
            }
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    onMount(() => {
        loadFavorites();
    });
</script>

<div
    class="flex h-full flex-col bg-gray-900 text-white relative overflow-hidden"
>
    {#if $callStore.status === "idle"}
        <!-- Keypad View -->
        <!-- Header -->
        <div
            class="flex items-center px-4 py-4 bg-gray-800/50 backdrop-blur-md border-b border-gray-700"
        >
            <button
                class="p-2 -ml-2 rounded-full hover:bg-gray-700 transition-colors"
                onclick={goBack}
                aria-label="Go back"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>
            <h1 class="ml-2 text-xl font-semibold">Phone</h1>
        </div>

        <!-- Content -->
        <div class="flex-1 flex flex-col items-center justify-end p-8 pb-12">
            <!-- Favorites Bar -->
            {#if favorites.length > 0}
                <div class="w-full mb-auto mt-4">
                    <div
                        class="text-xs text-gray-400 uppercase font-bold mb-2 ml-1"
                    >
                        Favorites
                    </div>
                    <div
                        class="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide"
                    >
                        {#each favorites as fav}
                            <button
                                class="flex flex-col items-center space-y-1 min-w-[64px]"
                                onclick={() =>
                                    startCall(
                                        fav.phone,
                                        `${fav.firstname} ${fav.lastname || ""}`,
                                    )}
                            >
                                <div
                                    class="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center text-lg font-bold shadow-lg"
                                >
                                    {(fav.firstname[0] || "") +
                                        (fav.lastname?.[0] || "")}
                                </div>
                                <span
                                    class="text-xs text-gray-300 truncate w-full text-center"
                                    >{fav.firstname}</span
                                >
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Number Display -->
            <div class="text-4xl font-light mb-8 h-12 flex items-center">
                {enteredNumber}
            </div>

            <!-- Keypad -->
            <div class="grid grid-cols-3 gap-6 w-full max-w-[280px]">
                {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num}
                    <button
                        class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                        onclick={() => handleKeypad(num.toString())}
                    >
                        {num}
                    </button>
                {/each}
                <button
                    class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                    onclick={() => handleKeypad("*")}>*</button
                >
                <button
                    class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                    onclick={() => handleKeypad("0")}>0</button
                >
                <button
                    class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                    onclick={() => handleKeypad("#")}>#</button
                >
            </div>

            <div
                class="flex items-center justify-center mt-8 w-full max-w-[280px] relative"
            >
                <!-- Place holder to center call button -->
                <div class="w-16"></div>

                <!-- Call Button -->
                <button
                    class="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-colors shadow-lg shadow-green-500/30 mx-auto"
                    aria-label="Call"
                    onclick={() => startCall(enteredNumber)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                    </svg>
                </button>

                <!-- Backspace -->
                <div class="w-16 flex justify-center">
                    {#if enteredNumber}
                        <button
                            class="text-gray-400 hover:text-white transition-colors"
                            onclick={handleBackspace}
                            aria-label="Backspace"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                                />
                            </svg>
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    {:else}
        <!-- In Call View -->
        <div
            class="flex-1 flex flex-col items-center pt-20 pb-12 bg-gradient-to-b from-gray-800 to-gray-900 animate-in fade-in duration-300"
        >
            <!-- Avatar/Icon -->
            <div
                class="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-8 shadow-2xl"
            >
                <span class="text-4xl font-bold text-gray-400">
                    {$callStore.name?.[0] || "#"}
                </span>
            </div>

            <h2 class="text-3xl font-semibold mb-2 text-center px-4">
                {$callStore.name || $callStore.number}
            </h2>
            <p class="text-gray-400 text-lg mb-12">
                {#if $callStore.status === "dialing"}
                    Dialing...
                {:else if $callStore.status === "connected"}
                    {formatDuration($callStore.duration)}
                {:else if $callStore.status === "incoming"}
                    Incoming Call...
                {/if}
            </p>

            <!-- Controls -->
            <div class="grid grid-cols-3 gap-8 w-full max-w-[300px] mt-auto">
                <!-- Mute -->
                <button
                    class="flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Mute"
                >
                    <div class="p-4 rounded-full bg-gray-800">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                        </svg>
                    </div>
                    <span class="text-xs">Mute</span>
                </button>

                <!-- Keypad -->
                <button
                    class="flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Keypad"
                >
                    <div class="p-4 rounded-full bg-gray-800">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                    </div>
                    <span class="text-xs">Keypad</span>
                </button>

                <!-- Speaker -->
                <button
                    class="flex flex-col items-center space-y-2 transition-colors {$callStore.speaker
                        ? 'text-white'
                        : 'text-gray-400'}"
                    onclick={callStore.toggleSpeaker}
                    aria-label="Speaker"
                >
                    <div
                        class="p-4 rounded-full bg-gray-800 {$callStore.speaker
                            ? 'bg-white text-gray-900'
                            : ''}"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                            />
                        </svg>
                    </div>
                    <span class="text-xs">Speaker</span>
                </button>
            </div>

            <!-- End Call -->
            <div class="mt-12 mb-8 flex space-x-8">
                {#if $callStore.status === "incoming"}
                    <button
                        class="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-colors shadow-lg shadow-green-500/30"
                        onclick={() => callStore.answerCall()}
                        aria-label="Answer Call"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-8 w-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                        </svg>
                    </button>
                {/if}

                <button
                    class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-colors shadow-lg shadow-red-500/30"
                    onclick={() => callStore.endCall()}
                    aria-label="End Call"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-8 w-8 text-white transform rotate-135"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    {/if}
</div>
