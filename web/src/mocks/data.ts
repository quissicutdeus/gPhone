import type { Contact, Conversation, Message, Note } from "@shared/types";

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
        is_group: false,
        name: "Alice Smith",
        status: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 2,
        last_message: {
            id: 10,
            conversation_id: 1,
            citizenid: "1",
            status: 1,
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
                status: 1,
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
        is_group: true,
        name: "Heist Crew",
        status: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 0,
        last_message: {
            id: 20,
            conversation_id: 2,
            citizenid: "2",
            status: 1,
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
            status: 1,
            message: "Just checking in.",
            created_at: new Date(Date.now() - 1000).toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 2,
            conversation_id: 1,
            citizenid: "my-id", // Placeholder for "Me"
            status: 1,
            message: "Hi Alice, what's up?",
            created_at: new Date(Date.now() - 3500000).toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 3,
            conversation_id: 1,
            citizenid: "1",
            status: 1,
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
            status: 1,
            message: "Hey is everyone ready?",
            created_at: new Date(Date.now() - 7100000).toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 2,
            conversation_id: 2,
            citizenid: "my-id", // Placeholder for "Me"
            status: 1,
            message: "Let's roll.",
            created_at: new Date(Date.now() - 7100000).toISOString(),
            updated_at: new Date().toISOString(),
        },
    ],
};

export const mockEmails = [
    {
        id: 1,
        sender: "Boss",
        subject: "Project Update",
        content: "We need to discuss the latest metrics. They are looking good but we can do better.",
        time: "10:30 AM",
        read: false,
    },
    {
        id: 2,
        sender: "HR",
        subject: "Benefits Enrollment",
        content: "Just a reminder that benefits enrollment ends this Friday.",
        time: "Yesterday",
        read: true,
    },
    {
        id: 3,
        sender: "Newsletter",
        subject: "Weekly Tech Digest",
        content: "Top stories: New AI models, Rust in the kernel, and more.",
        time: "Yesterday",
        read: true,
    },
    {
        id: 4,
        sender: "Spam Bot",
        subject: "You won a prize!",
        content: "Click here to claim your $1,000,000 prize now!",
        time: "2 days ago",
        read: true,
    },
];
