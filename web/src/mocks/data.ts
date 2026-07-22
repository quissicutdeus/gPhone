import type { Contact, Conversation, Mail, Message, Note } from "@shared/types";

export const mockNotes: Note[] = [
    {
        id: 1,
        citizenid: "1",
        title: "Grocery List",
        content: "- Milk\n- Eggs\n- Bread\n- Butter\n\n1. Number 1\n2. Number 2\n3. Number 3\n\n**Test** thing\n\n*italic*\n\n- item\n- item\n- item\n\n- [ ] task\n- [x] task\n- [ ] task\n\n# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 2,
        citizenid: "1",
        title: "Project Ideas",
        content: "# App Ideas\n\n## A note taking app\n### A weather app\n#### A music player",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

export const mockContacts: Contact[] = [
    {
        id: 1,
        citizenid: "1",
        firstname: "Alice",
        lastname: "Smith",
        phone: "555-0100",
        email: "alice@gphone.site",
        favorite: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 2,
        citizenid: "2",
        firstname: "Bob",
        lastname: "Jones",
        phone: "555-0101",
        email: "bob@gphone.site",
        favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

export const mockConversations: Conversation[] = [
    {
        id: 1,
        citizenid: "1",
        is_group: false,
        name: "Alice Smith",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 2,
        last_message: {
            id: 10,
            conversation_id: 1,
            citizenid: "1",
            status: "active",
            message: "I'm just checking in. Sorry I tried.",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        participants: [
            {
                id: 1,
                conversation_id: 1,
                citizenid: "1", // Alice
                role: "member",
                status: "active",
                last_read: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            // Note: 'Me' participant (myCitizenId) is usually injected or filtered dynamically in real apps, 
            // but for mocks we assume the consuming component handles the "me" logic against these IDs.
        ],
    },
    {
        id: 2,
        citizenid: "1",
        is_group: true,
        name: "Heist Crew",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 0,
        last_message: {
            id: 20,
            conversation_id: 2,
            citizenid: "2",
            status: "active",
            message: "Let's roll.",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        participants: [],
    },
];

export const mockMessages: Record<number, Message[]> = {
    1: [
        {
            id: 1,
            conversation_id: 1,
            citizenid: "1", // Alice
            status: "active",
            message: "Just checking in.",
            created_at: new Date(Date.now() - 1000).toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 2,
            conversation_id: 1,
            citizenid: "my-id", // Placeholder for "Me"
            status: "active",
            message: "Hi Alice, what's up?",
            created_at: new Date(Date.now() - 3500000).toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 3,
            conversation_id: 1,
            citizenid: "1",
            status: "active",
            message: "I'm just checking in. Sorry I tried.",
            created_at: new Date(Date.now() - 1000).toISOString(),
            updated_at: new Date().toISOString(),
        },
    ],
    2: [
        {
            id: 1,
            conversation_id: 2,
            citizenid: "2", // Bob
            status: "active",
            message: "Hey is everyone ready?",
            created_at: new Date(Date.now() - 7100000).toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 2,
            conversation_id: 2,
            citizenid: "my-id", // Placeholder for "Me"
            status: "active",
            message: "Let's roll.",
            created_at: new Date(Date.now() - 7100000).toISOString(),
            updated_at: new Date().toISOString(),
        },
    ],
};

export const mockEmails: Mail[] = [
    {
        id: 1,
        citizenid: "mock-id",
        sender: "Fleeca Bank",
        sender_address: "alerts@fleeca.com",
        subject: "Account Statement Available",
        content: "Your monthly bank statement for account #4242 is now ready to view. Balance: $15,450.00.",
        status: "active",
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: 2,
        citizenid: "mock-id",
        sender: "Los Santos Police Dept",
        sender_address: "no-reply@lspd.gov",
        subject: "Traffic Citation Notice",
        content: "Notice: Citation #90214 has been registered for your vehicle. Please settle all outstanding balances at the City Hall clerk's office.",
        status: "active",
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
        id: 3,
        citizenid: "mock-id",
        sender: "Dynasty 8 Executive",
        sender_address: "sales@dynasty8realestate.com",
        subject: "Property Listing Update",
        content: "New luxury apartment listings are now available in Rockford Hills. Contact an agent for private showings.",
        status: "active",
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
];
