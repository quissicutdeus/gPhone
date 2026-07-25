<script lang="ts">
    import { fly, fade } from "svelte/transition";
    import { soundService } from "../store/sound";

    export interface ActionSheetOption {
        id: string;
        label: string;
        style?: "default" | "destructive" | "cancel";
        icon?: any;
        onClick: () => void;
    }

    let {
        title,
        actions = [],
        show = false,
        onclose,
    }: {
        title?: string;
        actions: ActionSheetOption[];
        show: boolean;
        onclose: () => void;
    } = $props();

    const handleAction = (action: ActionSheetOption) => {
        soundService.play("click");
        action.onClick();
        onclose();
    };
</script>

{#if show}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
        transition:fade={{ duration: 150 }}
        onclick={onclose}
        role="presentation"
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
            class="w-full max-w-sm space-y-2 animate-in slide-in-from-bottom duration-200"
            transition:fly={{ y: 100, duration: 200 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            tabindex="-1"
            aria-modal="true"
        >
            <div
                class="overflow-hidden rounded-2xl bg-gray-800/90 backdrop-blur-xl divide-y divide-gray-700/60 shadow-2xl border border-gray-700/50"
            >
                {#if title}
                    <div
                        class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400"
                    >
                        {title}
                    </div>
                {/if}
                {#each actions.filter((a) => a.style !== "cancel") as action}
                    <button
                        type="button"
                        class="w-full px-4 py-3.5 text-center text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-700/50 {action.style ===
                        'destructive'
                            ? 'text-rose-400 hover:text-rose-300'
                            : 'text-blue-400 hover:text-blue-300'}"
                        onclick={() => handleAction(action)}
                    >
                        {#if action.icon}
                            {@const IconComp = action.icon}
                            <IconComp class="w-4 h-4" />
                        {/if}
                        <span>{action.label}</span>
                    </button>
                {/each}
            </div>

            {#each actions.filter((a) => a.style === "cancel") as cancelAction}
                <button
                    type="button"
                    class="w-full rounded-2xl bg-gray-800/90 backdrop-blur-xl px-4 py-3.5 text-center text-sm font-semibold text-white hover:bg-gray-700 transition-colors shadow-xl cursor-pointer border border-gray-700/50"
                    onclick={() => handleAction(cancelAction)}
                >
                    {cancelAction.label}
                </button>
            {/each}
        </div>
    </div>
{/if}
