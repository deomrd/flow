import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id_user: string;
        username: string;
        email: string;
        phone: string;
        role: string;
      };
    }
  }
}
