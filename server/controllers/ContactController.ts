import { ContactRepository } from '../repositories/ContactRepository';
import { ServerApp } from '../lib/ServerApp';
import { Contact } from '@shared/types';

const contactRepo = new ContactRepository();
const app = new ServerApp<Contact>('contacts', contactRepo);
