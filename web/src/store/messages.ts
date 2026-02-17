import { writable, get } from "svelte/store";
import { fetchNui } from "../utils/fetchNui";
import type { Conversation, Message } from "@shared/types";

import { citizenid, fetchCitizenId } from "./account";
import { contacts } from "./contacts";

export interface UIConversation extends Conversation {
    target: string; // The phone number or identifier of the other person
    targetName: string; // Display name
    lastMessage: string; // Content string
    lastMessageAt: string; // ISO date
    unreadCount: number;
}

export interface UIMessage extends Message {
    sender: "me" | "other";
}

function createMessagesStore() {
    const { subscribe, set, update } = writable<UIConversation[]>([]);

    // Store messages by conversation ID
    const messagesByConversation = writable<Record<number, UIMessage[]>>({});

    // Helper to resolve display info
    const resolveDisplayInfo = (conv: Conversation, myId: string, currentContacts: any[]) => {
        let target = "";
        let targetName = conv.name || "Unknown";

        if (conv.is_group) {
            target = "group";
            targetName = conv.name || "Group Chat";
        } else {
            // Find other participant
            const other = conv.participants?.find((p) => p.citizenid !== myId);
            if (other) {
                // Try to find phone in contact
                // Assuming participant has contact info hydrated or we match by citizenid?
                // Shared types say Participant has `contact?: Contact`.
                if (other.contact) {
                    target = other.contact.phone;
                    targetName = `${other.contact.firstname} ${other.contact.lastname || ""}`;
                } else {
                    // Try to match from loaded contacts store if not hydrated
                    // This is a bit weak if citizenid is strictly internal, but let's try
                    // If we can't find it, we might be stuck. 
                    // Let's assume for now target is the other citizenid if phone undefined
                    target = other.citizenid;
                }
            }
        }

        // If we have a phone target, try to improve name from address book if conv.name is empty/default
        if (target && target !== "group") {
            const contact = currentContacts.find(c => c.phone === target);
            if (contact) {
                targetName = `${contact.firstname} ${contact.lastname || ""}`;
            }
        }

        return { target, targetName };
    };

    return {
        subscribe,
        messages: { subscribe: messagesByConversation.subscribe },

        loadConversations: async () => {
            // Ensure we have citizenid
            let myId = get(citizenid);
            if (!myId) {
                myId = await fetchCitizenId();
            }
            const currentContacts = get(contacts);

            const data = await fetchNui<Conversation[]>("getConversations", null, { defaultValue: [] });

            // Map to UIConversation
            const mapped: UIConversation[] = (data || []).map(c => {
                const { target, targetName } = resolveDisplayInfo(c, myId, currentContacts);
                return {
                    ...c,
                    target,
                    targetName,
                    lastMessage: c.last_message?.message || "",
                    lastMessageAt: (c.last_message?.created_at || c.updated_at) as string,
                    unreadCount: c.unread_count || 0
                };
            });

            set(mapped);
        },

        loadMessages: async (conversationId: number) => {
            let myId = get(citizenid);
            if (!myId) myId = await fetchCitizenId();

            const data = await fetchNui<Message[]>("getMessages", { conversation_id: conversationId }, { defaultValue: [] });
            const mapped: UIMessage[] = (data || []).map(m => ({
                ...m,
                sender: m.citizenid === myId ? "me" : "other"
            }));

            messagesByConversation.update(msgs => ({
                ...msgs,
                [conversationId]: mapped
            }));
        },

        sendMessage: async (conversationId: number, message: string, attachments: any[] = []) => {
            let myId = get(citizenid);
            const payload = { conversation_id: conversationId, message, attachments };

            try {
                const sent = await fetchNui<Message>("sendMessage", payload);
                if (!sent) return null;

                const uiSent: UIMessage = { ...sent, sender: "me" };

                messagesByConversation.update(msgs => ({
                    ...msgs,
                    [conversationId]: [...(msgs[conversationId] || []), uiSent]
                }));

                // Update conversation last message snippet (optimistic)
                update(convs => convs.map(c => {
                    if (c.id === conversationId) {
                        return {
                            ...c,
                            lastMessage: sent.message,
                            lastMessageAt: sent.created_at as string,
                            last_message: sent
                        };
                    }
                    return c;
                }));

                return sent;
            } catch (e) {
                console.error("Failed to send message:", e);
                throw e;
            }
        },

        startConversation: async (phone: string, isGroup: boolean = false) => {
            let myId = get(citizenid);
            const currentContacts = get(contacts);

            try {
                const newConv = await fetchNui<Conversation>("startConversation", { is_group: isGroup, phone });
                if (!newConv) return null;

                // Map it
                const { target, targetName } = resolveDisplayInfo(newConv, myId, currentContacts);
                const mapped: UIConversation = {
                    ...newConv,
                    target,
                    targetName,
                    lastMessage: "",
                    lastMessageAt: newConv.created_at as string,
                    unreadCount: 0
                };

                update(n => [mapped, ...n]);
                return mapped;
            } catch (e) {
                console.error("Failed to start conversation", e);
                throw e;
            }
        }
    };
}

export const messagesStore = createMessagesStore();
