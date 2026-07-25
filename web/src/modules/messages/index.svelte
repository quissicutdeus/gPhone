<script lang="ts">
    import { onMount, tick } from "svelte";
    import Screen from "../../components/Screen.svelte";
    import {
        messagesStore,
        type UIMessage,
        type UIConversation,
    } from "../../store/messages";
    import { contacts } from "../../store/contacts";
    import { photos } from "../../store/photos";
    import { citizenid } from "../../store/account";
    import { fade, fly } from "svelte/transition";
    import type { Contact, Photo } from "@shared/types";
    import { formatTime, formatRelativeTime } from "../../utils/formatters";
    import { useScrollDetect } from "../../utils/useScrollDetect";
    import PaperclipIcon from "../../components/icons/PaperclipIcon.svelte";
    import CloseIcon from "../../components/icons/CloseIcon.svelte";
    import SendIcon from "../../components/icons/SendIcon.svelte";
    import PhotoIcon from "../../components/icons/PhotoIcon.svelte";
    import LocationIcon from "../../components/icons/LocationIcon.svelte";
    import ChevronRightIcon from "../../components/icons/ChevronRightIcon.svelte";
    import MessageIcon from "../../components/icons/MessageIcon.svelte";
    import EmptyState from "../../components/EmptyState.svelte";
    import SearchBar from "../../components/SearchBar.svelte";
    import ListItem from "../../components/ListItem.svelte";
    import Avatar from "../../components/Avatar.svelte";
    import Button from "../../components/Button.svelte";
    import TrashIcon from "../../components/icons/TrashIcon.svelte";
    import ArchiveIcon from "../../components/icons/ArchiveIcon.svelte";
    import SearchIcon from "../../components/icons/SearchIcon.svelte";
    import MessageStatusIcon from "../../components/icons/MessageStatusIcon.svelte";
    import MessageBubble from "./components/MessageBubble.svelte";
    import ConversationDetailsModal from "./components/ConversationDetailsModal.svelte";
    import PhotoPickerModal from "../../components/PhotoPickerModal.svelte";
    import FloatingActionButton from "../../components/FloatingActionButton.svelte";

    let { onback, initialContact } = $props<{
        onback?: () => void;
        initialContact?: Contact;
    }>();

    // Local state for UI
    let selectedConversationId: number | null = $state(null);
    let isComposing = $state(false);
    let newMessageText = $state("");
    let recipientQuery = $state(""); // For searching contacts when composing
    let showAttachMenu = $state(false);
    let showPhotoPicker = $state(false);
    let selectedAttachments = $state<{ photo_id: number; image: string }[]>([]);
    let viewingArchive = $state(false);
    let showDetailsModal = $state(false);
    let showSearch = $state(false);
    let searchQuery = $state("");
    let initialUnreadCount = $state(0);
    let unreadDividerIndex = $state(-1);
    let isScrolled = $state(false);
    let showInChatSearch = $state(false);
    let inChatSearchQuery = $state("");

    // Derived values
    let conversations = $derived($messagesStore);

    // Store already sorts newest-first on load/send, no need to re-sort here
    let activeConversations = $derived(
        conversations.filter((c) => (c.status || "active") === "active"),
    );
    let archivedConversations = $derived(
        conversations.filter((c) => c.status === "archived"),
    );
    let displayedConversations = $derived(
        viewingArchive ? archivedConversations : activeConversations,
    );
    let filteredConversations = $derived(
        searchQuery.trim()
            ? displayedConversations.filter(
                  (c) =>
                      (c.targetName || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                      (c.target || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                      (c.lastMessage || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
              )
            : displayedConversations,
    );
    let currentConv = $derived(
        selectedConversationId
            ? conversations.find((c) => c.id === selectedConversationId)
            : null,
    );

    // Derived messages for current conversation
    // We must subscribe to the inner store
    const messageStore = messagesStore.messages;
    let messages = $derived(
        selectedConversationId
            ? $messageStore[selectedConversationId] || []
            : [],
    );
    let filteredMessages = $derived(
        inChatSearchQuery.trim()
            ? messages.filter((m) =>
                  (m.message || "")
                      .toLowerCase()
                      .includes(inChatSearchQuery.toLowerCase()),
              )
            : messages,
    );

    const isMessageReadByOther = (msg: UIMessage) => {
        if (
            !currentConv ||
            !currentConv.participants ||
            currentConv.participants.length === 0
        )
            return false;
        const other = currentConv.participants.find(
            (p) => p.citizenid !== $citizenid,
        );
        if (!other || !other.last_read) return false;
        return (
            new Date(msg.created_at).getTime() <=
            new Date(other.last_read).getTime()
        );
    };

    const isConvLastMsgReadByOther = (conv: UIConversation) => {
        if (!conv || !conv.participants || conv.participants.length === 0)
            return false;
        const other = conv.participants.find((p) => p.citizenid !== $citizenid);
        if (!other || !other.last_read || !conv.last_message) return false;
        return (
            new Date(conv.last_message.created_at).getTime() <=
            new Date(other.last_read).getTime()
        );
    };

    let lastReadMyMessageId = $derived.by(() => {
        if (
            !currentConv ||
            !currentConv.participants ||
            filteredMessages.length === 0
        )
            return null;
        const lastMsg = filteredMessages[filteredMessages.length - 1];
        if (
            lastMsg &&
            lastMsg.sender === "me" &&
            isMessageReadByOther(lastMsg)
        ) {
            return lastMsg.id;
        }
        return null;
    });

    // Filter contacts for composition
    let filteredContacts = $derived(
        recipientQuery
            ? $contacts.filter(
                  (c) =>
                      c.firstname
                          .toLowerCase()
                          .includes(recipientQuery.toLowerCase()) ||
                      (c.lastname || "")
                          .toLowerCase()
                          .includes(recipientQuery.toLowerCase()) ||
                      c.phone.includes(recipientQuery),
              )
            : $contacts,
    );

    const goBack = () => {
        if (showDetailsModal) {
            showDetailsModal = false;
        } else if (showInChatSearch) {
            showInChatSearch = false;
            inChatSearchQuery = "";
        } else if (selectedConversationId || isComposing) {
            selectedConversationId = null;
            isComposing = false;
            newMessageText = "";
            recipientQuery = "";
            showAttachMenu = false;
            showPhotoPicker = false;
            selectedAttachments = [];
            showInChatSearch = false;
            inChatSearchQuery = "";
            unreadDividerIndex = -1;
        } else if (showSearch) {
            showSearch = false;
            searchQuery = "";
        } else if (viewingArchive) {
            viewingArchive = false;
        } else {
            onback?.();
        }
    };

    const handleTitleClick = () => {
        if (selectedConversationId && currentConv) {
            showDetailsModal = true;
        }
    };

    const handleSelectConversation = async (id: number) => {
        const conv = $messagesStore.find((c) => c.id === id);
        initialUnreadCount = conv?.unreadCount || 0;
        selectedConversationId = id;
        await messagesStore.loadMessages(id);

        const msgs = $messageStore[id] || [];
        if (initialUnreadCount > 0 && msgs.length > 0) {
            unreadDividerIndex = Math.max(0, msgs.length - initialUnreadCount);
        } else {
            unreadDividerIndex = -1;
        }

        await tick();

        if (initialUnreadCount > 0) {
            scrollToUnreadDivider();
            await messagesStore.markAsRead(id);
        } else {
            scrollToBottom();
        }
    };

    const scrollToUnreadDivider = () => {
        const unreadEl = document.getElementById("unread-divider");
        const container = document.getElementById("messages-container");
        if (unreadEl && container) {
            container.scrollTop = Math.max(0, unreadEl.offsetTop - 16);
        } else {
            scrollToBottom();
        }
    };

    const startNewMessage = () => {
        isComposing = true;
        recipientQuery = "";
    };

    const handleSelectContactRaw = async (contact: Contact) => {
        // Check if conversation already exists
        const existing = $messagesStore.find((c) => c.target === contact.phone);
        if (existing) {
            handleSelectConversation(existing.id);
            isComposing = false;
        } else {
            // Start new conversation via store
            try {
                const newConv = await messagesStore.startConversation(
                    contact.phone,
                );
                if (newConv) {
                    selectedConversationId = newConv.id;
                    isComposing = false;
                }
            } catch (e) {
                console.error("Failed to start conversation", e);
            }
        }
    };

    const openPhotoPicker = async () => {
        await photos.load();
        showPhotoPicker = true;
        showAttachMenu = false;
    };

    const handleSendMessage = async () => {
        if (
            (!newMessageText.trim() && selectedAttachments.length === 0) ||
            !selectedConversationId
        )
            return;

        try {
            await messagesStore.sendMessage(
                selectedConversationId,
                newMessageText,
                selectedAttachments.map((att) => ({
                    photo_id: att.photo_id,
                    attachment: att.image,
                })),
            );
            newMessageText = "";
            selectedAttachments = [];
            await tick();
            scrollToBottom();
        } catch (e) {
            console.error("Failed to send message", e);
        }
    };

    const scrollToBottom = () => {
        const el = document.getElementById("messages-container");
        if (el) el.scrollTop = el.scrollHeight;
    };

    // If initialContact is provided, auto-start conversation
    onMount(() => {
        messagesStore.loadConversations().then(() => {
            if (initialContact) {
                handleSelectContactRaw(initialContact);
            }
        });
    });

    useScrollDetect((v) => (isScrolled = v));

    const getTitle = () => {
        if (isComposing) return "New Message";
        if (currentConv) return currentConv.targetName || currentConv.target;
        if (selectedConversationId) return "Chat";
        return viewingArchive ? "Archived Messages" : "Messages";
    };

    const focus = (el: HTMLInputElement) => el.focus();
</script>

{#snippet headerActions()}
    {#if !selectedConversationId && !isComposing}
        <div class="flex items-center gap-1 ml-auto">
            <button
                class="p-2 rounded-full hover:bg-gray-700 transition-colors {viewingArchive
                    ? 'text-blue-400 bg-gray-800'
                    : 'text-gray-300'}"
                onclick={() => (viewingArchive = !viewingArchive)}
                title={viewingArchive ? "View Inbox" : "View Archive"}
                aria-label="Toggle Archive"
            >
                <ArchiveIcon class="w-5 h-5" />
            </button>
            <button
                class="p-2 rounded-full hover:bg-gray-700 transition-colors {showSearch
                    ? 'text-blue-400 bg-gray-800'
                    : 'text-gray-300'}"
                onclick={() => {
                    showSearch = !showSearch;
                    if (!showSearch) searchQuery = "";
                }}
                title="Search Messages"
                aria-label="Search Messages"
            >
                <SearchIcon class="w-5 h-5" />
            </button>
        </div>
    {:else if selectedConversationId && currentConv}
        <div class="flex items-center gap-1 ml-auto">
            <button
                class="p-1.5 rounded-full hover:bg-gray-700/60 text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                onclick={async () => {
                    if (currentConv) {
                        await messagesStore.deleteConversation(currentConv.id);
                        selectedConversationId = null;
                    }
                }}
                title="Delete Conversation"
                aria-label="Delete Conversation"
            >
                <TrashIcon class="w-5 h-5" />
            </button>
            <button
                class="p-1.5 rounded-full hover:bg-gray-700/60 text-gray-300 hover:text-blue-400 transition-colors cursor-pointer"
                onclick={async () => {
                    if (currentConv) {
                        const isArchived = currentConv.status === "archived";
                        await messagesStore.archiveConversation(
                            currentConv.id,
                            !isArchived,
                        );
                        selectedConversationId = null;
                    }
                }}
                title={currentConv.status === "archived"
                    ? "Unarchive"
                    : "Archive"}
                aria-label="Archive Conversation"
            >
                <ArchiveIcon class="w-5 h-5" />
            </button>
            <button
                class="p-1.5 rounded-full hover:bg-gray-700/60 transition-colors cursor-pointer {showInChatSearch
                    ? 'text-blue-400 bg-gray-800'
                    : 'text-gray-300 hover:text-white'}"
                onclick={() => {
                    showInChatSearch = !showInChatSearch;
                    if (!showInChatSearch) inChatSearchQuery = "";
                }}
                title="Search Messages"
                aria-label="Search Messages"
            >
                <SearchIcon class="w-5 h-5" />
            </button>
        </div>
    {/if}
{/snippet}

{#snippet fabOverlay()}
    {#if !selectedConversationId && !isComposing}
        <FloatingActionButton
            label="Start Chat"
            collapsed={isScrolled}
            onclick={startNewMessage}
        >
            {#snippet icon()}
                <MessageIcon class="w-4 h-4 text-white shrink-0" />
            {/snippet}
        </FloatingActionButton>
    {/if}
{/snippet}

<Screen
    title={getTitle()}
    onback={goBack}
    ontitleclick={selectedConversationId ? handleTitleClick : undefined}
    actions={headerActions}
    overlay={fabOverlay}
>
    {#if !selectedConversationId}
        {#if isComposing}
            <!-- New Message Composition Panel (Sticky overlay directly below header) -->
            <div
                class="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-2xl p-4 space-y-3 animate-in slide-in-from-top duration-200"
            >
                <div
                    class="flex items-center justify-between pb-1 border-b border-gray-800"
                >
                    <h3 class="font-semibold text-base text-white">
                        New Conversation
                    </h3>
                    <button
                        type="button"
                        class="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        onclick={() => (isComposing = false)}
                        aria-label="Close form"
                    >
                        <CloseIcon class="w-5 h-5" />
                    </button>
                </div>

                <SearchBar
                    bind:value={recipientQuery}
                    placeholder="To: Name or Phone Number"
                />

                <div
                    class="max-h-56 overflow-y-auto divide-y divide-gray-800/60 rounded-xl bg-gray-800/40 p-1"
                >
                    {#each filteredContacts as contact}
                        <ListItem
                            class="py-2 hover:bg-gray-800/80 rounded-lg"
                            onclick={() => handleSelectContactRaw(contact)}
                        >
                            <div class="mr-3 shrink-0">
                                <Avatar
                                    src={contact.avatar}
                                    initials={contact.firstname[0]}
                                    size="w-9 h-9"
                                />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div
                                    class="font-medium text-sm text-white truncate"
                                >
                                    {contact.firstname}
                                    {contact.lastname || ""}
                                </div>
                                <div class="text-xs text-gray-400">
                                    {contact.phone}
                                </div>
                            </div>
                        </ListItem>
                    {/each}
                    {#if filteredContacts.length === 0}
                        <div class="text-center text-xs text-gray-400 py-6">
                            No matching contacts found.
                        </div>
                    {/if}
                </div>

                <Button
                    variant="secondary"
                    class="w-full text-xs"
                    onclick={() => (isComposing = false)}
                >
                    Cancel
                </Button>
            </div>
        {/if}
    {/if}

    {#if selectedConversationId}
        <!-- Chat View -->
        <div class="flex flex-col h-full bg-gray-900">
            {#if showInChatSearch}
                <!-- In-Chat Search Bar -->
                <div
                    class="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md p-3 border-b border-gray-800 animate-in slide-in-from-top duration-200"
                >
                    <SearchBar
                        bind:value={inChatSearchQuery}
                        placeholder="Search messages in this chat..."
                    />
                </div>
            {/if}

            <!-- Messages List -->
            <div
                id="messages-container"
                class="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
            >
                {#each filteredMessages as msg, index}
                    {#if unreadDividerIndex >= 0 && index === unreadDividerIndex}
                        <div
                            id="unread-divider"
                            class="flex items-center gap-3 my-4 py-1"
                        >
                            <div class="flex-1 h-px bg-blue-500/40"></div>
                            <span
                                class="text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-950/90 px-3 py-1 rounded-full border border-blue-500/30 shadow-md"
                            >
                                Unread Messages ({initialUnreadCount})
                            </span>
                            <div class="flex-1 h-px bg-blue-500/40"></div>
                        </div>
                    {/if}
                    {#if currentConv}
                        <MessageBubble
                            {msg}
                            {currentConv}
                            isLastReadMyMessage={msg.id === lastReadMyMessageId}
                            isReadByOther={isMessageReadByOther(msg)}
                        />
                    {/if}
                {/each}
                {#if filteredMessages.length === 0}
                    <div class="mt-10">
                        <EmptyState
                            title={inChatSearchQuery.trim()
                                ? "No matching messages found in this chat"
                                : "No messages yet"}
                        />
                    </div>
                {/if}
            </div>

            <!-- Input Area -->
            <div
                class="p-3 bg-gray-800/50 backdrop-blur-md border-t border-gray-700"
            >
                <div class="flex items-end space-x-2 max-w-full">
                    <button
                        class="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-full hover:bg-gray-700/50"
                        onclick={() => (showAttachMenu = !showAttachMenu)}
                        aria-label="Attachments"
                    >
                        <PaperclipIcon />
                    </button>

                    <div class="flex-1 relative">
                        {#if selectedAttachments.length > 0}
                            <div
                                class="flex gap-2 mb-2 p-1 overflow-x-auto no-scrollbar"
                            >
                                {#each selectedAttachments as att}
                                    <div
                                        class="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-600"
                                    >
                                        <img
                                            src={att.image}
                                            alt="Attachment"
                                            class="w-full h-full object-cover"
                                        />
                                        <button
                                            class="absolute top-0 right-0 bg-black/60 text-white p-0.5 rounded-bl-lg hover:bg-black"
                                            onclick={() =>
                                                (selectedAttachments =
                                                    selectedAttachments.filter(
                                                        (a) =>
                                                            a.photo_id !==
                                                            att.photo_id,
                                                    ))}
                                            aria-label="Remove attachment"
                                        >
                                            <CloseIcon class="h-3 w-3" />
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                        <textarea
                            class="w-full bg-gray-700/50 text-white rounded-2xl px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none max-h-32 min-h-[40px] no-scrollbar"
                            placeholder="Message"
                            rows="1"
                            bind:value={newMessageText}
                            onkeydown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        ></textarea>
                    </div>

                    <button
                        class="p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                        onclick={handleSendMessage}
                        disabled={!newMessageText.trim() &&
                            selectedAttachments.length === 0}
                        aria-label="Send"
                    >
                        <SendIcon />
                    </button>
                </div>

                {#if showAttachMenu}
                    <div
                        class="absolute bottom-16 left-4 bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-2 grid grid-cols-2 gap-2 w-48"
                        transition:fly={{ y: 20, duration: 200 }}
                    >
                        <button
                            class="flex flex-col items-center justify-center p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                            onclick={openPhotoPicker}
                        >
                            <div
                                class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1"
                            >
                                <PhotoIcon class="h-5 w-5" />
                            </div>
                            <span class="text-xs">Photo</span>
                        </button>
                        <button
                            class="flex flex-col items-center justify-center p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                            <div
                                class="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-1"
                            >
                                <LocationIcon class="h-5 w-5" />
                            </div>
                            <span class="text-xs">Location</span>
                        </button>
                    </div>
                {/if}
            </div>

            {#if showPhotoPicker}
                <PhotoPickerModal
                    title="Select Photos"
                    multiSelect={true}
                    selectedIds={selectedAttachments.map((a) => a.photo_id)}
                    onmultichange={(photoId, image) => {
                        const existing = selectedAttachments.find(
                            (a) => a.photo_id === photoId,
                        );
                        if (existing) {
                            selectedAttachments = selectedAttachments.filter(
                                (a) => a.photo_id !== photoId,
                            );
                        } else {
                            selectedAttachments = [
                                ...selectedAttachments,
                                { photo_id: photoId, image },
                            ];
                        }
                    }}
                    onclose={() => (showPhotoPicker = false)}
                />
            {/if}
        </div>
    {:else}
        {#if showSearch}
            <!-- Search Dropdown Overlay -->
            <div
                class="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md p-3 border-b border-gray-800 animate-in slide-in-from-top duration-200"
            >
                <SearchBar
                    bind:value={searchQuery}
                    placeholder="Search chats, names, or messages..."
                />
            </div>
        {/if}

        <!-- Conversation List -->
        <div class="divide-y divide-gray-800">
            {#each filteredConversations as conv}
                <ListItem
                    class="items-start hover:bg-gray-800/40"
                    onclick={() => handleSelectConversation(conv.id)}
                >
                    <div class="relative mr-4 shrink-0">
                        <Avatar
                            src={conv.targetAvatar}
                            initials={conv.targetName
                                ? conv.targetName[0]
                                : conv.target[0] || "?"}
                            size="w-12 h-12"
                            textClass="text-lg"
                            bgClass={conv.is_group
                                ? "bg-indigo-700"
                                : "bg-gray-800 border border-gray-700/60"}
                        />
                        {#if conv.unreadCount > 0}
                            <div
                                class="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-blue-500 text-[10px] font-bold flex items-center justify-center px-1 border-2 border-gray-900 shadow-md animate-pulse"
                            >
                                {conv.unreadCount}
                            </div>
                        {/if}
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline mb-1">
                            <span
                                class="font-semibold text-[15px] truncate {conv.unreadCount >
                                0
                                    ? 'text-white font-bold'
                                    : 'text-gray-200'}"
                            >
                                {conv.targetName || conv.target}
                            </span>
                            <span
                                class="text-xs {conv.unreadCount > 0
                                    ? 'text-blue-400 font-semibold'
                                    : 'text-gray-500'} whitespace-nowrap ml-2"
                            >
                                {formatRelativeTime(conv.lastMessageAt)}
                            </span>
                        </div>
                        <div class="flex items-center">
                            {#if conv.last_message?.citizenid === $citizenid}
                                <MessageStatusIcon
                                    status={isConvLastMsgReadByOther(conv)
                                        ? "read"
                                        : "delivered"}
                                    class="w-3.5 h-3.5 mr-1.5 shrink-0"
                                />
                            {/if}
                            <p
                                class="text-sm truncate flex-1 {conv.unreadCount >
                                0
                                    ? 'text-gray-100 font-medium'
                                    : 'text-gray-400'}"
                            >
                                {conv.lastMessage || "No messages"}
                            </p>
                            <ChevronRightIcon
                                class="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                            />
                        </div>
                    </div>
                </ListItem>
            {/each}

            {#if filteredConversations.length === 0}
                <div class="py-16 text-center">
                    <EmptyState
                        title={searchQuery.trim()
                            ? "No matching messages found"
                            : viewingArchive
                              ? "No archived conversations"
                              : "No active conversations"}
                    />
                </div>
            {/if}
        </div>
    {/if}

    {#if showDetailsModal && currentConv}
        <ConversationDetailsModal
            {currentConv}
            onclose={() => (showDetailsModal = false)}
            ondelete={() => {
                showDetailsModal = false;
                selectedConversationId = null;
            }}
        />
    {/if}
</Screen>
