<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let closePhone: () => void;

    const dispatch = createEventDispatcher();
</script>

<div
    class="flex h-full flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-white"
>
    <h1 class="mb-8 text-4xl font-bold tracking-tight">gphone</h1>

    <div class="grid grid-cols-4 gap-4 w-full px-4">
        <!-- Phone -->
        <button
            class="flex flex-col items-center gap-2 group"
            on:click={() => dispatch("openApp", "phone")}
        >
            <div
                class="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-lg"
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
            </div>
            <span class="text-xs font-medium text-gray-300">Phone</span>
        </button>

        <!-- Messages -->
        <button
            class="flex flex-col items-center gap-2 group"
            on:click={() => dispatch("openApp", "messages")}
        >
            <div
                class="w-14 h-14 rounded-2xl bg-green-400 flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-lg"
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
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                </svg>
            </div>
            <span class="text-xs font-medium text-gray-300">Messages</span>
        </button>

        <!-- Contacts -->
        <button
            class="flex flex-col items-center gap-2 group"
            on:click={() => dispatch("openApp", "contacts")}
        >
            <div
                class="w-14 h-14 rounded-2xl bg-gray-500 flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-lg"
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            </div>
            <span class="text-xs font-medium text-gray-300">Contacts</span>
        </button>

        <!-- Mail -->
        <button
            class="flex flex-col items-center gap-2 group"
            on:click={() => dispatch("openApp", "mail")}
        >
            <div
                class="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-lg"
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
            </div>
            <span class="text-xs font-medium text-gray-300">Mail</span>
        </button>

        <!-- Bank -->
        <button
            class="flex flex-col items-center gap-2 group"
            on:click={() => dispatch("openApp", "bank")}
        >
            <div
                class="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-lg"
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
            <span class="text-xs font-medium text-gray-300">Bank</span>
        </button>

        <!-- Calculator -->
        <button
            class="flex flex-col items-center gap-2 group"
            on:click={() => dispatch("openApp", "calculator")}
        >
            <div
                class="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-lg"
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
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
            </div>
            <span class="text-xs font-medium text-gray-300">Calc</span>
        </button>

        <!-- Settings App Icon -->
        <button
            class="flex flex-col items-center gap-2 group"
            on:click={() => dispatch("openApp", "settings")}
        >
            <div
                class="w-14 h-14 rounded-2xl bg-gray-700 flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-lg"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            </div>
            <span class="text-xs font-medium text-gray-300">Settings</span>
        </button>
    </div>

    <div class="mt-auto mb-8">
        <button
            class="rounded-full bg-gray-700/50 px-6 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-colors hover:bg-gray-700"
            on:click={closePhone}
        >
            Close Phone
        </button>
    </div>
</div>
