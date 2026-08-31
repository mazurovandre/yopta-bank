export class TransferBalanceEvent {
  constructor(
    public readonly senderId: number,
    public readonly recipientId: number,
    public readonly amount: number,
  ) {}
}
