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
    import { fade, fly } from "svelte/transition";
    import type { Contact, Photo } from "@shared/types";

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

    // Derived values
    let conversations = $derived($messagesStore);

    // Derived messages for current conversation
    // We must subscribe to the inner store
    const messageStore = messagesStore.messages;
    let messages = $derived(
        selectedConversationId
            ? $messageStore[selectedConversationId] || []
            : [],
    );

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
        if (selectedConversationId || isComposing) {
            selectedConversationId = null;
            isComposing = false;
            newMessageText = "";
            recipientQuery = "";
            showAttachMenu = false;
            showPhotoPicker = false;
            selectedAttachments = [];
        } else {
            onback?.();
        }
    };

    const handleSelectConversation = async (id: number) => {
        selectedConversationId = id;
        await messagesStore.loadMessages(id);
        // Scroll to bottom
        setTimeout(scrollToBottom, 50);
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
    onMount(async () => {
        await messagesStore.loadConversations();
        if (initialContact) {
            handleSelectContactRaw(initialContact);
        }
    });

    const getTitle = () => {
        if (isComposing) return "New Message";
        if (selectedConversationId) {
            const conv = $messagesStore.find(
                (c) => c.id === selectedConversationId,
            );
            return conv ? conv.targetName || conv.target : "Chat";
        }
        return "Messages";
    };

    const formatTime = (isoString?: string | number | Date) => {
        if (!isoString) return "";
        const date =
            isoString instanceof Date ? isoString : new Date(isoString);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    const focus = (el: HTMLInputElement) => el.focus();
</script>

{#snippet headerActions()}
    {#if !selectedConversationId && !isComposing}
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
            onclick={startNewMessage}
            aria-label="New Message"
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
                    d="M11 5H6a2 2 0 00-2 2v11l5-5h9a2 2 0 002-2v-6a2 2 0 00-2-2h-5m-4 8l5-5h5a2 2 0 012 2v6a2 2 0 01-2 2H6m-4 8l5-5"
                />
            </svg>
        </button>
    {/if}
{/snippet}

<Screen title={getTitle()} onback={goBack} actions={headerActions}>
    {#if isComposing}
        <!-- New Message User Selection -->
        <div class="flex flex-col h-full">
            <div class="p-2 border-b border-gray-800">
                <input
                    class="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="To: Name or Number"
                    bind:value={recipientQuery}
                    use:focus
                />
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar">
                {#each filteredContacts as contact}
                    <button
                        class="w-full flex items-center p-4 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 text-left"
                        onclick={() => handleSelectContactRaw(contact)}
                    >
                        <div
                            class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold mr-3"
                        >
                            {contact.firstname[0]}
                        </div>
                        <div>
                            <div class="font-medium">
                                {contact.firstname}
                                {contact.lastname || ""}
                            </div>
                            <div class="text-xs text-gray-400">
                                {contact.phone}
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        </div>
    {:else if selectedConversationId}
        <!-- Chat View -->
        <div class="flex flex-col h-full bg-gray-900">
            <!-- Messages List -->
            <div
                id="messages-container"
                class="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
            >
                {#each messages as msg}
                    <div
                        class="flex flex-col {msg.sender === 'me'
                            ? 'items-end'
                            : 'items-start'}"
                    >
                        <div
                            class="max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm relative {msg.sender ===
                            'me'
                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                : 'bg-gray-800 text-gray-100 rounded-tl-sm'}"
                        >
                            {#if msg.attachments && msg.attachments.length > 0}
                                <div class="mb-2 space-y-2">
                                    {#each msg.attachments as attach}
                                        <img
                                            src={attach.attachment}
                                            alt="Attachment"
                                            class="rounded-lg max-w-full"
                                        />
                                    {/each}
                                </div>
                            {/if}
                            <p
                                class="text-sm leading-relaxed whitespace-pre-wrap"
                            >
                                {msg.message}
                            </p>
                            <span
                                class="text-[10px] opacity-70 absolute bottom-1 right-2"
                                >{formatTime(msg.created_at)}</span
                            >
                        </div>
                    </div>
                {/each}
                {#if messages.length === 0}
                    <div class="text-center text-gray-500 mt-10 text-sm">
                        No messages yet
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
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
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
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                class="h-3 w-3"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fill-rule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clip-rule="evenodd"
                                                />
                                            </svg>
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 text-white rotate-90"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                            />
                        </svg>
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </div>
                            <span class="text-xs">Photo</span>
                        </button>
                        <button
                            class="flex flex-col items-center justify-center p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                            <div
                                class="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-1"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </div>
                            <span class="text-xs">Location</span>
                        </button>
                    </div>
                {/if}
            </div>

            {#if showPhotoPicker}
                <div
                    class="absolute inset-0 bg-gray-900 z-50 flex flex-col"
                    transition:fly={{ y: 20, duration: 200 }}
                >
                    <div
                        class="flex items-center justify-between p-4 border-b border-gray-800"
                    >
                        <h3 class="font-semibold text-lg">Select Photo</h3>
                        <button
                            class="p-2 hover:bg-gray-800 rounded-full"
                            onclick={() => (showPhotoPicker = false)}
                            aria-label="Close photo picker"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                    <div
                        class="flex-1 overflow-y-auto p-2 grid grid-cols-3 gap-2 content-start"
                    >
                        {#each $photos as photo}
                            <button
                                class="aspect-square bg-gray-800 rounded-lg overflow-hidden relative"
                                onclick={() => {
                                    selectedAttachments = [
                                        ...selectedAttachments,
                                        {
                                            photo_id: photo.id,
                                            image: photo.image,
                                        },
                                    ];
                                    showPhotoPicker = false;
                                }}
                            >
                                <img
                                    src={photo.image}
                                    class="w-full h-full object-cover"
                                    alt=""
                                />
                            </button>
                        {/each}
                        {#if $photos.length === 0}
                            <div
                                class="col-span-3 text-center text-gray-500 py-10 text-sm"
                            >
                                No photos found.
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        <!-- Conversation List -->
        <div class="divide-y divide-gray-800">
            {#each conversations as conv}
                <button
                    class="w-full flex items-start p-4 hover:bg-gray-800/50 transition-colors text-left group"
                    onclick={() => handleSelectConversation(conv.id)}
                >
                    <div class="relative">
                        <div
                            class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                            bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
                        >
                            {conv.targetName
                                ? conv.targetName[0]
                                : conv.target[0] || "?"}
                        </div>
                        {#if conv.unreadCount > 0}
                            <div
                                class="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-blue-500 text-[10px] font-bold flex items-center justify-center px-1 border-2 border-gray-900"
                            >
                                {conv.unreadCount}
                            </div>
                        {/if}
                    </div>

                    <div class="ml-4 flex-1 min-w-0">
                        <div class="flex justify-between items-baseline mb-1">
                            <span class="font-semibold text-[15px] truncate">
                                {conv.targetName || conv.target}
                            </span>
                            <span
                                class="text-xs text-gray-500 whitespace-nowrap ml-2"
                            >
                                {formatTime(conv.lastMessageAt)}
                            </span>
                        </div>
                        <div class="flex items-center">
                            <p class="text-sm text-gray-400 truncate flex-1">
                                {conv.lastMessage || "No messages"}
                            </p>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</Screen>
