declare namespace Express {
  interface Request {
    user?: {
      id_user: number;
      username: string;
      email: string;
      phone: string;
      role: string;
    };
  }
}
