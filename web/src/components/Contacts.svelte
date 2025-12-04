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
        <h1 class="ml-2 text-xl font-semibold">Contacts</h1>
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Add contact"
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
                    d="M12 4v16m8-8H4"
                />
            </svg>
        </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
        <div class="divide-y divide-gray-800">
            {#each ["Alice", "Bob", "Charlie", "David", "Eve"] as name}
                <div
                    class="flex items-center p-4 hover:bg-gray-800/50 transition-colors"
                >
                    <div
                        class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold"
                    >
                        {name[0]}
                    </div>
                    <span class="ml-4 font-medium">{name}</span>
                </div>
            {/each}
        </div>
    </div>
</div>
