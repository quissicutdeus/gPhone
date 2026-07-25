<script lang="ts">
    import type { Snippet } from "svelte";
    import ScreenHeader from "./ScreenHeader.svelte";

    let {
        title,
        onback,
        ontitleclick,
        actions,
        overlay,
        children,
        class: className = "",
    } = $props<{
        title: string;
        onback?: () => void;
        ontitleclick?: () => void;
        actions?: Snippet;
        overlay?: Snippet;
        children: Snippet;
        class?: string;
    }>();
</script>

<div class="flex h-full flex-col bg-gray-900 text-white relative {className}">
    <!-- Header -->
    <ScreenHeader {title} {onback} {ontitleclick} {actions} />

    <!-- Content -->
    <div class="flex-1 overflow-y-auto no-scrollbar relative">
        {@render children()}
    </div>

    {#if overlay}
        {@render overlay()}
    {/if}
</div>
