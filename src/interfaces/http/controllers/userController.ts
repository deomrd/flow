import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterUser } from "../../../usecases/user/registerUser";
import { PrismaUserRepository } from "../../../infrastructure/repositories/userRepository";
import { BadRequestError, UnauthorizedError } from "../../../utils/errors";

// Interface pour le type User
interface UserTokenPayload {
  id_user: number;
  username: string;
  email: string;
  phone: string;
  role?: string;
  password?: string;
}

export class UserController {
  private registerUser: RegisterUser;
  private userRepository: PrismaUserRepository;

  constructor() {
    this.userRepository = new PrismaUserRepository();
    this.registerUser = new RegisterUser(this.userRepository);
  }

  register = async (req: Request, res: Response) => {
    const { username, email, phone, password, fullName } = req.body;

    try {
      if (!username?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
        throw new BadRequestError("Tous les champs sont requis");
      }

      if (!this.validateEmail(email)) {
        throw new BadRequestError("Format d'email invalide");
      }

      if (password.length < 8) {
        throw new BadRequestError("Le mot de passe doit contenir au moins 8 caractères");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await this.registerUser.execute({
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        fullName: fullName.trim(),
        password: hashedPassword,
      });

      const { token, refreshToken } = this.generateTokens(newUser);

      return res.status(201).json({
        success: true,
        token,
        refreshToken,
        user: this.sanitizeUser(newUser),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        throw new BadRequestError("Données de requête invalides");
      }

      const { email = "", password = "", identifier = email } = req.body;
      const cleanIdentifier = String(identifier).trim();
      const cleanPassword = String(password).trim();

      if (!cleanIdentifier || !cleanPassword) {
        throw new BadRequestError("Identifiant et mot de passe requis");
      }

      const user = await this.userRepository.findByIdentifier(cleanIdentifier);
      if (!user) {
        throw new UnauthorizedError("Identifiants incorrects");
      }

      const isMatch = await bcrypt.compare(cleanPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedError("Identifiants incorrects");
      }

      const { token, refreshToken } = this.generateTokens(user);

      return res.json({
        success: true,
        token,
        refreshToken,
        user: this.sanitizeUser(user),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  private generateTokens(user: UserTokenPayload) {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets not configured");
    }

    const token = jwt.sign(
      { userId: user.id_user },
      process.env.JWT_SECRET,
      { expiresIn: "14d" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id_user },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return { token, refreshToken };
  }

  private sanitizeUser(user: UserTokenPayload) {
    const sanitized = { ...user };
    delete sanitized.password;
    return sanitized;
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private handleError(res: Response, error: unknown) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
}

export const userController = new UserController();
