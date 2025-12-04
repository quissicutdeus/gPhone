<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    const goBack = () => {
        dispatch("back");
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
        <h1 class="ml-2 text-xl font-semibold">Calculator</h1>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col p-4">
        <!-- Display -->
        <div
            class="flex-1 flex items-end justify-end text-6xl font-light mb-8 break-all"
        >
            0
        </div>

        <!-- Keypad -->
        <div class="grid grid-cols-4 gap-3">
            {#each ["C", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "="] as btn}
                <button
                    class="aspect-square rounded-full text-2xl font-medium transition-all active:scale-95 flex items-center justify-center
          {['÷', '×', '-', '+', '='].includes(btn)
                        ? 'bg-orange-500 hover:bg-orange-400'
                        : ['C', '±', '%'].includes(btn)
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-800 hover:bg-gray-700'}
          {btn === '0' ? 'col-span-2 aspect-auto rounded-full' : ''}"
                >
                    {btn}
                </button>
            {/each}
        </div>
    </div>
</div>
