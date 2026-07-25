import { writable, get } from "svelte/store";
import { fetchNui } from "../utils/fetchNui";
import type { Conversation, Message } from "@shared/types";

import { citizenid, fetchCitizenId } from "./account";
import { contacts } from "./contacts";

export interface UIConversation extends Conversation {
    target: string; // The phone number or identifier of the other person
    targetName: string; // Display name
    targetAvatar?: string; // Contact profile image URL
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
        let targetAvatar: string | undefined = undefined;

        if (conv.is_group) {
            target = "group";
            targetName = conv.name || "Group Chat";
        } else {
            // Find other participant
            const other = conv.participants?.find((p) => p.citizenid !== myId);
            if (other) {
                if (other.contact) {
                    target = other.contact.phone;
                    targetName = `${other.contact.firstname} ${other.contact.lastname || ""}`.trim();
                    targetAvatar = other.contact.avatar;
                } else {
                    target = other.citizenid;
                }
            }
        }

        // If we have a phone target, try to improve name & avatar from address book
        if (target && target !== "group") {
            const contact = currentContacts.find(c => c.phone === target);
            if (contact) {
                targetName = `${contact.firstname} ${contact.lastname || ""}`.trim();
                if (contact.avatar) {
                    targetAvatar = contact.avatar;
                }
            }
        }

        return { target, targetName, targetAvatar };
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

            // Map to UIConversation & sort newest first
            const mapped: UIConversation[] = (data || [])
                .map(c => {
                    const { target, targetName, targetAvatar } = resolveDisplayInfo(c, myId, currentContacts);
                    return {
                        ...c,
                        target,
                        targetName,
                        targetAvatar,
                        lastMessage: c.last_message?.message || "",
                        lastMessageAt: (c.last_message?.created_at || c.updated_at) as string,
                        unreadCount: c.unread_count || 0
                    };
                })
                .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());

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

                // Update conversation last message snippet (optimistic) and sort to top
                update(convs => {
                    const updated = convs.map(c => {
                        if (c.id === conversationId) {
                            return {
                                ...c,
                                lastMessage: sent.message,
                                lastMessageAt: sent.created_at as string,
                                last_message: sent
                            };
                        }
                        return c;
                    });
                    return updated.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
                });

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
                const { target, targetName, targetAvatar } = resolveDisplayInfo(newConv, myId, currentContacts);
                const mapped: UIConversation = {
                    ...newConv,
                    target,
                    targetName,
                    targetAvatar,
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
        },

        markAsRead: async (conversationId: number) => {
            update(convs => convs.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c));
            try {
                await fetchNui("readConversation", { conversation_id: conversationId });
            } catch (e) {
                console.error("Failed to mark conversation read", e);
            }
        },

        archiveConversation: async (conversationId: number, archive: boolean = true) => {
            const nextStatus = archive ? "archived" : "active";
            update(convs => convs.map(c => c.id === conversationId ? { ...c, status: nextStatus } : c));
            try {
                await fetchNui("archiveConversation", { conversation_id: conversationId, status: nextStatus });
            } catch (e) {
                console.error("Failed to archive conversation", e);
            }
        },

        deleteConversation: async (conversationId: number) => {
            update(convs => convs.filter(c => c.id !== conversationId));
            try {
                await fetchNui("deleteConversation", { conversation_id: conversationId });
            } catch (e) {
                console.error("Failed to delete conversation", e);
            }
        },

        renameConversation: async (conversationId: number, name: string) => {
            update(convs => convs.map(c => c.id === conversationId ? { ...c, name, targetName: name } : c));
            try {
                await fetchNui("renameConversation", { conversation_id: conversationId, name });
            } catch (e) {
                console.error("Failed to rename conversation", e);
            }
        }
    };
}

export const messagesStore = createMessagesStore();
