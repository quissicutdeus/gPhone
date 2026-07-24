<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        onclick: (event: MouseEvent) => void;
        children: Snippet;
        class?: string;
    }

    let { onclick, children, class: className = "" }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    class="w-full flex items-center p-4 hover:bg-gray-800/50 transition-colors cursor-pointer group {className}"
    {onclick}
    role="button"
    tabindex="0"
>
    {@render children()}
</div>
