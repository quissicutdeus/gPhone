import { mockContacts, mockConversations, mockMessages, mockNotes } from "./data";
import type { Contact, Conversation, Message, Note } from "@shared/types";

// Helper to simulate delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type MockHandler<T = any> = (data?: any) => Promise<T> | T;

export const mockRegistry: Record<string, MockHandler> = {
    // Contacts
    "getContacts": () => mockContacts,
    "createContact": async (contact: any) => {
        await delay(500);
        return {
            ...contact,
            id: Math.random(),
            citizenid: "mock-id",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as Contact;
    },
    "updateContact": async (contact: Contact) => {
        await delay(500);
        return contact;
    },
    "deleteContact": async () => {
        await delay(500);
        return true;
    },
    "shareContact": async () => {
        await delay(500);
        return true;
    },

    // Notes
    "getNotes": () => mockNotes,
    "createNote": async (note: any) => {
        await delay(300);
        return {
            ...note,
            id: Math.random(),
            citizenid: "mock-id",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as Note;
    },
    "updateNote": async (note: Note) => {
        await delay(300);
        return note;
    },
    "deleteNote": async () => {
        await delay(300);
        return true;
    },

    // Messages
    "getConversations": () => mockConversations,
    "getMessages": ({ conversation_id }: { conversation_id: number }) => {
        return mockMessages[conversation_id] || [];
    },
    "sendMessage": async (payload: any) => {
        await delay(300);
        return {
            id: Math.random(),
            conversation_id: payload.conversation_id,
            citizenid: "my-id",
            status: "active",
            message: payload.message,
            attachments: (payload.attachments || []).map((a: any, i: number) => ({ ...a, id: i })),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as Message;
    },
    "startConversation": async ({ phone, is_group }: any) => {
        await delay(300);
        return {
            id: Math.random(),
            citizenid: "my-id",
            is_group: is_group || false,
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            participants: []
        } as Conversation;
    },

    // Account
    "getCitizenId": () => "my-id",
    "getBankBalance": () => 12450,
    "getTransactions": () => [
        { message: "Store Purchase", amount: -45, time: Math.floor(Date.now() / 1000), title: "Store" },
        { message: "Salary", amount: 1500, time: Math.floor(Date.now() / 1000) - 86400, title: "Job" },
        { message: "Transfer", amount: -200, time: Math.floor(Date.now() / 1000) - 172800, title: "Transfer" }
    ],

    // Call
    "startCall": async () => { await delay(1000); return true; },
    "endCall": async () => { return true; },
    "answerCall": async () => { return true; },
    "toggleSpeaker": async () => { return true; },

    // Camera
    "takePhoto": () => "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // 1x1 transparent pixel

    // Navigation
    "hideFrame": () => { },
};

export async function getMockData(eventName: string, data?: any): Promise<any> {
    const handler = mockRegistry[eventName];
    if (handler) {
        return handler(data);
    }
    console.warn(`[MockRegistry] No handler found for event: ${eventName}`);
    return null;
}
