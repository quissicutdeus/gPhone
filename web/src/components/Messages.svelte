<script lang="ts">
    let { onback } = $props();

    const goBack = () => {
        onback?.();
    };
</script>

<div class="flex h-full flex-col bg-gray-900 text-white">
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
        <h1 class="ml-2 text-xl font-semibold">Messages</h1>
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="New message"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
            </svg>
        </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
        <div class="divide-y divide-gray-800">
            {#each [1, 2, 3] as i}
                <div
                    class="flex items-center p-4 hover:bg-gray-800/50 transition-colors"
                >
                    <div
                        class="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0"
                    ></div>
                    <div class="ml-4 flex-1 min-w-0">
                        <div class="flex items-baseline justify-between">
                            <h3 class="font-medium truncate">Contact {i}</h3>
                            <span class="text-xs text-gray-500">12:3{i} PM</span
                            >
                        </div>
                        <p class="text-sm text-gray-400 truncate">
                            Hey, are we still on for later today?
                        </p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
