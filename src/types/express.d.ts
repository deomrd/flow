declare namespace Express {
  export interface Request {
    user?: {
      id_user: number;
      username: string;
      email: string;
      role: string;
    };
  }
}