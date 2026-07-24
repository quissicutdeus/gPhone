<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        title: string;
        description?: string;
        icon?: Snippet;
        class?: string;
    }

    let { title, description, icon, class: className = "" }: Props = $props();
</script>

<div
    class="flex flex-col items-center justify-center flex-1 text-gray-500 pb-20 {className}"
>
    {#if icon}
        <div class="mb-4 opacity-50">
            {@render icon()}
        </div>
    {/if}
    <p class="text-lg font-medium">{title}</p>
    {#if description}
        <p class="text-sm text-gray-600 mt-1 max-w-[80%] text-center leading-relaxed">
            {description}
        </p>
    {/if}
</div>
