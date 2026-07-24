<script lang="ts">
    import type { Snippet } from "svelte";
    import ChevronLeftIcon from "./icons/ChevronLeftIcon.svelte";

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
            <ChevronLeftIcon class="h-6 w-6" />
        </button>
    {/if}
    <h1 class="ml-2 text-xl font-semibold">{title}</h1>
    {#if actions}
        {@render actions()}
    {/if}
</div>
