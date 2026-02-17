<script lang="ts">
    import type { Snippet } from "svelte";
    import ScreenHeader from "./ScreenHeader.svelte";

    let {
        title,
        onback,
        actions,
        children,
        class: className = "",
    } = $props<{
        title: string;
        onback?: () => void;
        actions?: Snippet;
        children: Snippet;
        class?: string;
    }>();
</script>

<div class="flex h-full flex-col bg-gray-900 text-white {className}">
    <!-- Header -->
    <ScreenHeader {title} {onback} {actions} />

    <!-- Content -->
    <div class="flex-1 overflow-y-auto no-scrollbar relative">
        {@render children()}
    </div>
</div>
