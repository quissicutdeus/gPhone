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
        <h1 class="ml-2 text-xl font-semibold">Phone</h1>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col items-center justify-end p-8 pb-12">
        <!-- Number Display -->
        <div class="text-4xl font-light mb-8">555-0123</div>

        <!-- Keypad -->
        <div class="grid grid-cols-3 gap-6 w-full max-w-[280px]">
            {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num}
                <button
                    class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                >
                    {num}
                </button>
            {/each}
            <button
                class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                >*</button
            >
            <button
                class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                >0</button
            >
            <button
                class="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-2xl font-medium transition-colors"
                >#</button
            >
        </div>

        <!-- Call Button -->
        <button
            class="mt-8 w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-colors shadow-lg shadow-green-500/30"
            aria-label="Call"
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
    </div>
</div>
