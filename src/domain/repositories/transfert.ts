
export interface Transfer {
  senderId: number;
  receiverId: number;
  amount: number;
  fee: number;
  status?: string;
  createdAt?: Date;
}
