<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        label,
        title,
        collapsed = false,
        onclick,
        icon,
    } = $props<{
        label: string;
        title?: string;
        collapsed?: boolean;
        onclick: () => void;
        icon: Snippet;
    }>();
</script>

<button
    type="button"
    class="absolute bottom-5 right-5 z-30 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs rounded-full shadow-xl shadow-blue-600/30 border border-blue-400/20 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer {collapsed
        ? 'w-11 h-11 p-0'
        : 'px-4 py-2.5 gap-2'}"
    {onclick}
    title={title || label}
    aria-label={label}
>
    {@render icon()}
    {#if !collapsed}
        <span class="whitespace-nowrap transition-all duration-300"
            >{label}</span
        >
    {/if}
</button>
