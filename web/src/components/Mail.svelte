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
        <h1 class="ml-2 text-xl font-semibold">Mail</h1>
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Compose email"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
            </svg>
        </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
        <div class="divide-y divide-gray-800">
            {#each [1, 2, 3, 4] as i}
                <div class="p-4 hover:bg-gray-800/50 transition-colors">
                    <div class="flex items-baseline justify-between mb-1">
                        <h3 class="font-bold text-blue-400">Sender Name</h3>
                        <span class="text-xs text-gray-500">Yesterday</span>
                    </div>
                    <h4 class="font-medium mb-1">Subject Line {i}</h4>
                    <p class="text-sm text-gray-400 line-clamp-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </p>
                </div>
            {/each}
        </div>
    </div>
</div>
