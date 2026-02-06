<script lang="ts">
    import ScreenHeader from "../../components/ScreenHeader.svelte";
    import { mockEmails } from "../../mocks/data";

    let { onback } = $props();

    const goBack = () => {
        onback?.();
    };
</script>

{#snippet headerActions()}
    <button
        class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
        aria-label="Compose email"
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
        </svg>
    </button>
{/snippet}

<div class="flex h-full flex-col bg-gray-900 text-white">
    <!-- Header -->
    <ScreenHeader title="Mail" {onback} actions={headerActions} />

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
        <div class="divide-y divide-gray-800">
            {#each mockEmails as email}
                <div class="p-4 hover:bg-gray-800/50 transition-colors">
                    <div class="flex items-baseline justify-between mb-1">
                        <h3 class="font-bold text-blue-400">{email.sender}</h3>
                        <span class="text-xs text-gray-500">{email.time}</span>
                    </div>
                    <h4 class="font-medium mb-1">{email.subject}</h4>
                    <p class="text-sm text-gray-400 line-clamp-2">
                        {email.content}
                    </p>
                </div>
            {/each}
        </div>
    </div>
</div>
