import { MailRepository } from '../repositories/MailRepository';
import { ServerApp } from '../lib/ServerApp';
import { Mail } from '@shared/types';

const mailRepo = new MailRepository();
const app = new ServerApp<Mail>('mail', mailRepo, {
    disableGet: true,
    disableCreate: true,
    disableUpdate: true,
    disableDelete: true
});

app.registerEvent('getMail', async (source, cbId, data, citizenid) => {
    return await mailRepo.findAllByCitizenId(citizenid);
});

app.registerEvent('markAsRead', async (source, cbId, data, citizenid) => {
    if (!data.id) throw new Error('Email ID required');
    return await mailRepo.markAsRead(Number(data.id), citizenid);
});

app.registerEvent('archiveMail', async (source, cbId, data, citizenid) => {
    if (!data.id) throw new Error('Email ID required');
    return await mailRepo.archive(Number(data.id), citizenid, data.archive !== false);
});

app.registerEvent('deleteMail', async (source, cbId, data, citizenid) => {
    if (!data.id) throw new Error('Email ID required');
    return await mailRepo.delete(Number(data.id), citizenid);
});



/**
 * Global Server Export: SendSystemEmail
 * Allows external resources (jobs, dispatches, bank alerts, system notifications)
 * to send dispatches or emails directly to a player's phone mailbox.
 */
export const SendSystemEmail = async (
    targetCitizenId: string,
    emailData: {
        sender: string;
        sender_address?: string;
        subject: string;
        content: string;
    }
): Promise<Mail | null> => {
    try {
        const mailItem: Partial<Mail> = {
            citizenid: targetCitizenId,
            sender: emailData.sender,
            sender_address: emailData.sender_address || 'system@gphone.local',
            subject: emailData.subject,
            content: emailData.content,
            status: 'active',
            read: false,
        };

        const id = await mailRepo.create(mailItem);
        const newMail: Mail = {
            ...mailItem,
            id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as Mail;

        // Find online target player to send real-time notification
        const players = exports['qbx_core']?.GetQBPlayers();
        if (players) {
            for (const src in players) {
                if (players[src]?.PlayerData?.citizenid === targetCitizenId) {
                    emitNet('gphone:client:mail:receive', parseInt(src), newMail);
                    break;
                }
            }
        }

        return newMail;
    } catch (error) {
        console.error('Error in SendSystemEmail:', error);
        return null;
    }
};

// Expose server export for external resources
exports('SendSystemEmail', SendSystemEmail);
