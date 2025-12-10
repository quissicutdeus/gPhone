import { Repository } from '../lib/Repository';
import { PlayerTransaction } from '@shared/types';

export class TransactionRepository extends Repository<PlayerTransaction> {
    protected tableName = 'player_transactions';
}
