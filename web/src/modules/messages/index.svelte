<script lang="ts">
    import { onMount, tick } from "svelte";
    import { fetchNui } from "../../utils/fetchNui";
    import type { Conversation, Message, Contact } from "@shared/types";
    import { callStore } from "../../store/call";
    import { openApp } from "../../store/navigation";
    import ScreenHeader from "../../components/ScreenHeader.svelte";
    import {
        mockConversations,
        mockContacts,
        mockMessages,
    } from "../../mocks/data";

    let {
        onback,
        conversationId = null,
        initialContact = null,
    } = $props<{
        onback?: () => void;
        conversationId?: number;
        initialContact?: Contact;
    }>();

    let view = $state<"list" | "chat" | "new">("list");
    let conversations: Conversation[] = $state([]);
    let contacts: Contact[] = $state([]); // For starting new chat
    let activeConversation: Conversation | null = $state(null);
    let messages: Message[] = $state([]);
    let myCitizenId = $state(""); // To determine self vs other logic (useful for styling)

    // New Message State
    let messageInput = $state("");
    let attachmentFiles: FileList | null = $state(null);
    let isSending = $state(false);

    // New Conversation State
    let selectedContactId = $state("");
    let groupName = $state("");

    // Helper to augment mock conversations with "Me" participant if missing,
    // to prevent logic errors in development if the mock data is too simple.
    const ensureMeParticipant = (convs: Conversation[], myId: string) => {
        return convs.map((c) => {
            const hasMe = c.participants?.some((p) => p.citizenid === myId);
            if (!hasMe && myId) {
                // Return a copy with Me added
                return {
                    ...c,
                    participants: [
                        ...(c.participants || []),
                        {
                            id: 999,
                            conversation_id: c.id,
                            citizenid: myId,
                            role: "member",
                            status: 1,
                            last_read: new Date().toISOString(),
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                    ],
                } as Conversation;
            }
            return c;
        });
    };

    const loadConversations = async () => {
        try {
            conversations = await fetchNui<Conversation[]>("getConversations");
        } catch (e) {
            console.error(e);
            // Mock Data
            // We ensure "Me" is part of it for local testing logic
            conversations = ensureMeParticipant(mockConversations, "my-id");
            if (!myCitizenId) myCitizenId = "my-id";
        }
    };

    const loadContacts = async () => {
        try {
            contacts = await fetchNui<Contact[]>("getContacts");
        } catch (e) {
            // Only use mock data in development environment
            if (import.meta.env.DEV) {
                console.warn("Used mock data for contacts due to error", e);
                contacts = mockContacts;
            } else {
                console.error("Failed to load contacts in Messages:", e);
            }
        }
    };

    const openConversation = async (conv: Conversation) => {
        activeConversation = conv;
        view = "chat";
        await loadMessages(conv.id);
    };

    const loadMessages = async (conversationId: number) => {
        try {
            messages = await fetchNui<Message[]>("getMessages", conversationId);
            await tick();
            scrollToBottom();
        } catch (e) {
            console.error(e);
            // Mock Messages
            messages = mockMessages[conversationId] || [];

            // Fixup mock message citizenids to match the local "Me" id if slightly different in static data
            // In static data we used "my-id", and here we set myCitizenId to "my-id" if failing to fetchNui.
            // So it should align automatically if we are consistent.

            await tick();
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        const el = document.getElementById("chat-container");
        if (el) el.scrollTop = el.scrollHeight;
    };

    const handleSend = async () => {
        if (!activeConversation || (!messageInput && !attachmentFiles)) return;
        isSending = true;

        const attachments: { attachment: string }[] = [];
        if (attachmentFiles) {
            for (let i = 0; i < attachmentFiles.length; i++) {
                const file = attachmentFiles[i];
                const base64 = await toBase64(file);
                attachments.push({ attachment: base64 as string });
            }
        }

        const data = {
            conversation_id: activeConversation.id,
            message: messageInput,
            attachments: attachments,
        };

        try {
            const sent = await fetchNui<Message>("sendMessage", data);
            messages = [...messages, sent];
            messageInput = "";
            attachmentFiles = null;
            await tick();
            scrollToBottom();
        } catch (e) {
            console.error(e);
            // Local echo for mock
            const mockEcho: Message = {
                id: Math.random(),
                conversation_id: activeConversation.id,
                citizenid: myCitizenId,
                status: 1,
                message: messageInput,
                attachments: attachments.map((a, i) => ({ ...a, id: i })), // Add mock IDs
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            messages = [...messages, mockEcho];
            messageInput = "";
            await tick();
            scrollToBottom();
        }
        isSending = false;
    };

    const startConversation = async () => {
        if (!selectedContactId) return;
        // Logic for 1-on-1 for now, group support can be extended
        const target = contacts.find((c) => c.citizenid === selectedContactId);
        if (!target) return;

        try {
            const newConv = await fetchNui<Conversation>("startConversation", {
                is_group: false,
                phone: target.phone, // Use phone lookup
            });
            await loadConversations();
            openConversation(newConv);
        } catch (e) {
            console.error(e);
        }
    };

    const toBase64 = (file: File) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const getDisplayInfo = (conv: Conversation | null) => {
        if (!conv) return { name: "", initials: "" };
        if (conv.is_group) {
            return {
                name: conv.name || "Group Chat",
                initials: "GRP",
            };
        }
        const other = conv.participants?.find(
            (p) => p.citizenid !== myCitizenId,
        );

        // Try to find in local contacts first
        if (other && other.contact) {
            // Match by phone number since citizenid in contacts refers to the owner
            const participantPhone = other.contact.phone;

            const contact = contacts.find((c) => {
                return c.phone === participantPhone;
            });

            if (contact) {
                const name = `${contact.firstname} ${contact.lastname || ""}`;
                const initials =
                    (contact.firstname[0] || "") +
                    (contact.lastname?.[0] || "");
                return { name, initials: initials.toUpperCase() };
            }
        }

        // Fallback to participant info
        if (other?.contact) {
            const name = `${other.contact.firstname} ${
                other.contact.lastname || ""
            }`;
            const initials =
                (other.contact.firstname[0] || "") +
                (other.contact.lastname?.[0] || "");
            return { name, initials: initials.toUpperCase() };
        }
        return {
            name: conv.name || "Private Chat",
            initials: "USR",
        };
    };

    const handleCall = () => {
        if (!activeConversation || activeConversation.is_group) return;

        // Find the other participant's phone number
        // This logic is a bit tricky depending on how complete the data is.
        // We might need to rely on what getDisplayInfo used or data available in participants.

        const other = activeConversation.participants?.find(
            (p) => p.citizenid !== myCitizenId,
        );

        let phoneNumber = "";
        let displayName = getDisplayInfo(activeConversation).name;

        if (other && other.contact && other.contact.phone) {
            phoneNumber = other.contact.phone;
        } else {
            // If we don't have direct phone access here, we might need a separate NUI call or better data.
            // For now assume we can find it via contacts matching or it's in the participant data if we updated the types/backend.
            // Let's try to match with local contacts if loaded
            const contact = contacts.find(
                (c) => c.citizenid === other?.citizenid,
            ); // This citizenid check might be wrong if contact.citizenid is owner.
            // Let's rely on the mock data or structure.
            // If we simulated the conversation data, we might not have phone numbers attached to participants directly unless they are in our contacts list.

            // In a real app we'd probably have `other.phone` or `other.contact.phone`.
            // Let's assume `other.contact.phone` exists as per types (if they do).
            // Based on `getDisplayInfo`, `other.contact` exists.
        }

        // Fallback or explicit check
        if (!phoneNumber && other?.contact?.phone) {
            phoneNumber = other.contact.phone;
        }

        // Manual override for mock testing if needed
        if (
            !phoneNumber &&
            import.meta.env.DEV &&
            activeConversation.id === 1
        ) {
            phoneNumber = "555-0100";
            displayName = "Alice Smith";
        }

        if (phoneNumber) {
            callStore.startCall(phoneNumber, displayName);
            openApp("phone");
        } else {
            console.warn("Could not find phone number for participant");
        }
    };

    onMount(() => {
        // Ensure we reload data when mounting to get latest state
        loadConversations().then(() => {
            if (conversationId) {
                const conv = conversations.find((c) => c.id === conversationId);
                if (conv) {
                    openConversation(conv);
                }
            } else if (initialContact) {
                // Logic to find existing by phone or start new
                const existing = conversations.find(
                    (conv) =>
                        !conv.is_group &&
                        conv.participants?.some(
                            (p) =>
                                p.citizenid !== myCitizenId &&
                                p.contact?.phone === initialContact.phone,
                        ),
                );

                if (existing) {
                    openConversation(existing);
                } else {
                    view = "new";
                    selectedContactId = initialContact.citizenid;
                }
            }
        });
        loadContacts();
        fetchNui<string>("getCitizenId").then((id) => {
            if (id) myCitizenId = id;
        });
    });

    const getTitle = () => {
        if (view === "list") return "Messages";
        if (view === "new") return "New Message";
        return getDisplayInfo(activeConversation).name;
    };

    const handleBack = () => {
        if (view === "list") {
            onback?.();
        } else {
            view = "list";
            loadConversations();
        }
    };
</script>

{#snippet headerActions()}
    {#if view === "chat" && activeConversation && !activeConversation.is_group}
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
            onclick={handleCall}
            aria-label="Call"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
            </svg>
        </button>
    {/if}
    {#if view === "list"}
        <button
            class="ml-auto p-2 rounded-full hover:bg-gray-700 transition-colors"
            onclick={() => (view = "new")}
            aria-label="New message"
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
    {/if}
{/snippet}

<div class="flex h-full flex-col bg-gray-900 text-white">
    <ScreenHeader
        title={getTitle()}
        onback={handleBack}
        actions={headerActions}
    />

    <!-- Content -->
    <div class="flex-1 flex flex-col min-h-0">
        {#if view === "list"}
            <div
                class="flex-1 overflow-y-auto divide-y divide-gray-800 no-scrollbar"
            >
                {#each conversations as conv}
                    <button
                        class="w-full text-left flex items-center p-4 hover:bg-gray-800/50 transition-colors"
                        onclick={() => openConversation(conv)}
                        aria-label="Open conversation"
                    >
                        <div
                            class="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center"
                        >
                            <span class="text-sm font-medium"
                                >{getDisplayInfo(conv).initials}</span
                            >
                        </div>
                        <div class="ml-4 flex-1 min-w-0">
                            <h3 class="font-medium truncate">
                                {getDisplayInfo(conv).name}
                            </h3>
                            <p class="text-sm text-gray-400 truncate">
                                {conv.last_message?.message || "No messages"}
                            </p>
                        </div>
                    </button>
                {/each}
            </div>
        {:else if view === "new"}
            <div class="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                <h3 class="text-lg font-medium">Select Contact</h3>
                <div class="space-y-2">
                    {#each contacts as contact}
                        <button
                            class="w-full text-left p-3 bg-gray-800 rounded hover:bg-gray-700"
                            onclick={() => {
                                selectedContactId = contact.citizenid;
                                startConversation();
                            }}
                            aria-label="Select contact"
                        >
                            {contact.firstname}
                            {contact.lastname || ""}
                            <span class="text-gray-400 text-sm block"
                                >{contact.phone}</span
                            >
                        </button>
                    {/each}
                </div>
            </div>
        {:else if view === "chat"}
            <div
                id="chat-container"
                class="flex-1 overflow-y-auto flex flex-col no-scrollbar"
            >
                <div class="mt-auto p-4 space-y-4 w-full">
                    {#each messages as msg}
                        <div
                            class="flex flex-col {msg.citizenid === myCitizenId
                                ? 'items-end'
                                : 'items-start'}"
                        >
                            <div
                                class="max-w-[80%] rounded-lg p-3 {msg.citizenid ===
                                myCitizenId
                                    ? 'bg-blue-600'
                                    : 'bg-gray-800'}"
                            >
                                {#if msg.message}<p>{msg.message}</p>{/if}
                                {#if msg.attachments}
                                    <div class="mt-2 space-y-1">
                                        {#each msg.attachments as att}
                                            <img
                                                src={att.attachment}
                                                alt="Attachment"
                                                class="max-w-full rounded"
                                            />
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                            <span class="text-xs text-gray-500 mt-1"
                                >{new Date(
                                    msg.created_at,
                                ).toLocaleTimeString()}</span
                            >
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Input Area -->
            <div
                class="p-4 bg-gray-800 border-t border-gray-700 flex-none z-10"
            >
                <div class="flex items-center space-x-2">
                    <input
                        type="file"
                        multiple
                        class="hidden"
                        id="file-upload"
                        onchange={(e) =>
                            (attachmentFiles = e.currentTarget.files)}
                    />
                    <label
                        for="file-upload"
                        class="p-2 cursor-pointer text-gray-400 hover:text-white"
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
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                        </svg>
                    </label>
                    <input
                        class="flex-1 bg-gray-700 rounded-full px-4 py-2 focus:outline-none"
                        placeholder="Message..."
                        bind:value={messageInput}
                        onkeydown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button
                        class="p-2 bg-blue-600 rounded-full hover:bg-blue-500"
                        onclick={handleSend}
                        aria-label="Send message"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 rotate-90"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                            />
                        </svg>
                    </button>
                </div>
                {#if attachmentFiles && attachmentFiles.length > 0}
                    <div class="mt-2 text-xs text-gray-400">
                        {attachmentFiles.length} file(s) selected
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
