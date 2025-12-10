export interface Contact {
    id: number;
    citizenid: string;
    firstname: string;
    lastname?: string;
    phone: string;
    avatar?: string; // Base64 string from blob
    favorite: boolean;
    created_at: Date | string;
    updated_at: Date | string;
}

export interface Conversation {
    id: number;
    is_group: boolean;
    name?: string;
    status: number; // 1=Active, -1=Moderated, 0=Archived, 2=Deleted
    created_at: Date | string;
    updated_at: Date | string;
    participants?: Participant[];
    last_message?: Message;
    unread_count?: number;
}

export interface Participant {
    id: number;
    conversation_id: number;
    citizenid: string;
    role: 'admin' | 'member';
    status: number; // 1=Active, -1=Moderated, 0=Left, 2=Removed
    last_read: Date | string;
    created_at: Date | string;
    left_at?: Date | string | null;
    updated_at: Date | string;
    contact?: Contact; // hydrated
}

export interface Message {
    id: number;
    conversation_id: number;
    citizenid: string; // Sender
    status: number; // 1=Live, -1=Moderated, 0=Deleted
    message: string;
    created_at: Date | string;
    updated_at: Date | string;
    attachments?: { id: number; attachment: string }[]; // attachment is base64
}

export interface PlayerTransaction {
    id: number;
    citizenid: string;
    transactions: Transaction[];
}

export interface Transaction {
    type: 'inbound' | 'outbound';
    amount: number;
    id: number;
    time: number;
    reason: string;
}
