<script lang="ts">
    import { soundService } from "../store/sound";

    export interface SegmentOption {
        id: string;
        label: string;
    }

    let {
        options = [],
        selected = $bindable(""),
        onchange,
    }: {
        options: SegmentOption[];
        selected: string;
        onchange?: (id: string) => void;
    } = $props();

    const select = (id: string) => {
        if (selected === id) return;
        selected = id;
        soundService.play("click");
        onchange?.(id);
    };
</script>

<div
    class="flex w-full rounded-xl bg-gray-800/70 p-1 backdrop-blur-md border border-gray-700/50"
>
    {#each options as opt}
        <button
            type="button"
            class="flex-1 rounded-lg py-1.5 text-center text-xs font-semibold transition-all cursor-pointer {selected ===
            opt.id
                ? 'bg-gray-700 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'}"
            onclick={() => select(opt.id)}
        >
            {opt.label}
        </button>
    {/each}
</div>
