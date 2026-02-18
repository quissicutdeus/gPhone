import { NoteRepository } from '../repositories/NoteRepository';
import { ServerApp } from '../lib/ServerApp';
import { Note } from '@shared/types';

const noteRepo = new NoteRepository();
const app = new ServerApp<Note>('notes', noteRepo);
