<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        title,
        onback,
        actions,
    }: { title: string; onback?: () => void; actions?: Snippet } = $props();
</script>

<div
    class="flex items-center px-4 py-4 bg-gray-800/50 backdrop-blur-md border-b border-gray-700"
>
    {#if onback}
        <button
            class="p-2 -ml-2 rounded-full hover:bg-gray-700 transition-colors"
            onclick={onback}
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
    {/if}
    <h1 class="ml-2 text-xl font-semibold">{title}</h1>
    {#if actions}
        {@render actions()}
    {/if}
</div>
