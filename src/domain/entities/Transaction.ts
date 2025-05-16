export class Transaction {
  constructor(
    public id: number | null,
    public userId: number,
    public type: 'transfer' | 'deposit' | 'withdrawal',
    public amount: number,
    public status: 'pending' | 'completed' | 'failed',
    public initiatedAt: Date,
    public completedAt?: Date,
    public feeId?: number,
  ) {}
}
