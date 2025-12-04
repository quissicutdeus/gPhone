<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { is24Hour } from "../store/time";

    const dispatch = createEventDispatcher();

    const goBack = () => {
        dispatch("back");
    };

    const toggleTimeFormat = () => {
        is24Hour.update((v) => !v);
    };
</script>

<div class="flex h-full flex-col bg-gray-900 text-white">
    <!-- Header -->
    <div
        class="flex items-center px-4 py-4 bg-gray-800/50 backdrop-blur-md border-b border-gray-700"
    >
        <button
            class="p-2 -ml-2 rounded-full hover:bg-gray-700 transition-colors"
            on:click={goBack}
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
        <h1 class="ml-2 text-xl font-semibold">Settings</h1>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-6">
            <!-- General Section -->
            <div>
                <h2
                    class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 px-2"
                >
                    General
                </h2>
                <div class="bg-gray-800 rounded-xl overflow-hidden">
                    <div
                        class="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
                    >
                        <div class="flex flex-col">
                            <span class="font-medium">24-Hour Time</span>
                            <span class="text-sm text-gray-400"
                                >Use 24-hour format</span
                            >
                        </div>
                        <button
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                            class:bg-blue-600={$is24Hour}
                            class:bg-gray-600={!$is24Hour}
                            on:click={toggleTimeFormat}
                            aria-label="Toggle 24-hour time"
                        >
                            <span
                                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                class:translate-x-6={$is24Hour}
                                class:translate-x-1={!$is24Hour}
                            ></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
