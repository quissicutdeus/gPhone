<script lang="ts">
    import { onMount } from "svelte";
    import Screen from "../../components/Screen.svelte";
    import { mailStore } from "../../store/mail";
    import type { Mail } from "@shared/types";
    import { formatRelativeTime } from "../../utils/formatters";
    import TrashIcon from "../../components/icons/TrashIcon.svelte";
    import ArchiveIcon from "../../components/icons/ArchiveIcon.svelte";
    import EmptyMailIcon from "../../components/icons/EmptyMailIcon.svelte";
    import EmptyState from "../../components/EmptyState.svelte";
    import ListItem from "../../components/ListItem.svelte";

    let { onback, mailId } = $props<{ onback?: () => void; mailId?: number }>();
    let selectedMail = $state<Mail | null>(null);
    let activeTab = $state<"inbox" | "archive">("inbox");

    onMount(() => {
        if ($mailStore.length === 0) {
            mailStore.load();
        }
    });

    $effect(() => {
        if (mailId && $mailStore.length > 0) {
            const found = $mailStore.find(m => m.id === mailId);
            if (found && selectedMail?.id !== mailId) {
                openMail(found);
            }
        }
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
                <TrashIcon class="h-5 w-5" />
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
                <ArchiveIcon class="h-5 w-5" />
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
            <ArchiveIcon class="h-5 w-5" />
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
                    <span class="text-xs text-gray-500">{formatRelativeTime(selectedMail.created_at)}</span>
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
                <EmptyState
                    title={activeTab === "inbox" ? "No inbox messages" : "No archived messages"}
                    description={activeTab === "inbox"
                        ? "System dispatches and official mail will appear here."
                        : "Archived messages will be stored here."}
                >
                    {#snippet icon()}
                        <EmptyMailIcon class="h-12 w-12" />
                    {/snippet}
                </EmptyState>
            {:else}
                {#each displayedEmails as email (email.id)}
                    <ListItem
                        onclick={() => openMail(email)}
                        class="flex items-start space-x-3"
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
                                    {formatRelativeTime(email.created_at)}
                                </span>
                            </div>
                            <h4 class={`text-xs truncate mb-1 ${!email.read ? "text-blue-400 font-semibold" : "text-gray-400"}`}>
                                {email.subject}
                            </h4>
                            <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                {email.content}
                            </p>
                        </div>
                    </ListItem>
                {/each}
            {/if}
        </div>
    {/if}
</Screen>
