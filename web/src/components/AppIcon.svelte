<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        name,
        icon: Icon,
        color,
        onclick,
    }: {
        name: string;
        icon: any;
        color: string;
        onclick: () => void;
    } = $props();
</script>

<button class="flex flex-col items-center gap-2 group" {onclick}>
    <div
        class="w-14 h-14 rounded-2xl {color} flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-lg"
    >
        <Icon />
    </div>
    <span class="text-xs font-medium text-gray-300">{name}</span>
</button>
