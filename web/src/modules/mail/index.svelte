<script lang="ts">
    import { onMount } from "svelte";
    import Screen from "../../components/Screen.svelte";
    import { mailStore } from "../../store/mail";
    import type { Mail } from "@shared/types";

    let { onback } = $props<{ onback?: () => void }>();
    let selectedMail = $state<Mail | null>(null);
    let activeTab = $state<"inbox" | "archive">("inbox");

    onMount(() => {
        mailStore.load();
    });

    let activeEmails = $derived(
        $mailStore.filter(m => (m.status || "active") === "active")
    );

    let archivedEmails = $derived(
        $mailStore.filter(m => m.status === "archived")
    );

    let displayedEmails = $derived(
        activeTab === "inbox" ? activeEmails : archivedEmails
    );

    function openMail(email: Mail) {
        selectedMail = email;
        if (!email.read) {
            mailStore.markAsRead(email.id);
        }
    }

    function closeDetail() {
        selectedMail = null;
    }

    function handleArchive(email: Mail) {
        const isArchived = email.status === "archived";
        mailStore.archive(email.id, !isArchived);
        if (selectedMail && selectedMail.id === email.id) {
            selectedMail = { ...selectedMail, status: !isArchived ? "archived" : "active" };
        }
    }

    function handleDelete(emailId: number) {
        mailStore.delete(emailId);
        if (selectedMail && selectedMail.id === emailId) {
            selectedMail = null;
        }
    }

    function formatDate(dateStr: Date | string) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
</script>

{#snippet headerActions()}
    {#if selectedMail}
        {@const isArchived = selectedMail.status === "archived"}
        <div class="ml-auto flex items-center space-x-1">
            <button
                class="p-2 rounded-full hover:bg-red-600/20 text-red-400 transition-colors"
                onclick={() => handleDelete(selectedMail!.id)}
                aria-label="Delete message"
                title="Delete message"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
            <button
                class={`p-2 rounded-full transition-colors ${
                    isArchived
                        ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                        : "hover:bg-gray-700 text-gray-300 hover:text-white"
                }`}
                onclick={() => handleArchive(selectedMail!)}
                aria-label={isArchived ? "Move to Inbox" : "Archive message"}
                title={isArchived ? "Move to Inbox" : "Archive message"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            </button>
        </div>
    {:else}
        <button
            class={`ml-auto p-2 rounded-full transition-colors ${
                activeTab === "archive"
                    ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                    : "hover:bg-gray-700 text-gray-300 hover:text-white"
            }`}
            onclick={() => (activeTab = activeTab === "inbox" ? "archive" : "inbox")}
            aria-label={activeTab === "inbox" ? "View Archive" : "View Inbox"}
            title={activeTab === "inbox" ? "View Archive" : "View Inbox"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
        </button>
    {/if}
{/snippet}

<Screen
    title={selectedMail ? "Message" : activeTab === "inbox" ? "Mail" : "Archived Mail"}
    onback={selectedMail ? closeDetail : onback}
    actions={headerActions}
>
    {#if selectedMail}
        <!-- Detail View -->
        <div class="p-4 flex flex-col h-full">
            <div class="border-b border-gray-800 pb-3 mb-4">
                <div class="flex items-start justify-between mb-2">
                    <div>
                        <h2 class="text-lg font-bold text-white">{selectedMail.sender}</h2>
                        {#if selectedMail.sender_address}
                            <p class="text-xs text-gray-400">{selectedMail.sender_address}</p>
                        {/if}
                    </div>
                    <span class="text-xs text-gray-500">{formatDate(selectedMail.created_at)}</span>
                </div>
                <h3 class="text-md font-semibold text-blue-400 mt-2">{selectedMail.subject}</h3>
            </div>

            <div class="flex-1 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed overflow-y-auto">
                {selectedMail.content}
            </div>
        </div>
    {:else}
        <!-- Email List -->
        <div class="divide-y divide-gray-800">
            {#if displayedEmails.length === 0}
                <div class="p-8 text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p class="text-sm font-medium">
                        {activeTab === "inbox" ? "No inbox messages" : "No archived messages"}
                    </p>
                    <p class="text-xs text-gray-600 mt-1">
                        {activeTab === "inbox"
                            ? "System dispatches and official mail will appear here."
                            : "Archived messages will be stored here."}
                    </p>
                </div>
            {:else}
                {#each displayedEmails as email (email.id)}
                    <button
                        onclick={() => openMail(email)}
                        class="w-full p-4 text-left hover:bg-gray-800/50 transition-colors flex items-start space-x-3 group"
                    >
                        <div class="pt-1">
                            {#if !email.read && activeTab === "inbox"}
                                <span class="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span>
                            {:else}
                                <span class="w-2.5 h-2.5 rounded-full bg-transparent block"></span>
                            {/if}
                        </div>

                        <div class="flex-1 min-w-0">
                            <div class="flex items-baseline justify-between mb-0.5">
                                <h3 class={`text-sm truncate font-medium ${!email.read ? "text-white font-bold" : "text-gray-300"}`}>
                                    {email.sender}
                                </h3>
                                <span class="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                    {formatDate(email.created_at)}
                                </span>
                            </div>
                            <h4 class={`text-xs truncate mb-1 ${!email.read ? "text-blue-400 font-semibold" : "text-gray-400"}`}>
                                {email.subject}
                            </h4>
                            <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                {email.content}
                            </p>
                        </div>
                    </button>
                {/each}
            {/if}
        </div>
    {/if}
</Screen>
