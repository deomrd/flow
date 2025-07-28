import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRES_IN = '7d'; // Durée de validité du token

// Définir le type du payload autorisé
interface TokenPayload {
  id_user: string;
  email: string;
  role: string;
  username?: string;
  phone?: string;
  is_verified: boolean;
}

// Fonction de génération de token avec uniquement les champs stricts
export function generateToken(payload: TokenPayload): string {
  const tokenPayload = {
    id_user: payload.id_user,
    email: payload.email,
    role: payload.role,
    username: payload.username,
    phone: payload.phone,
    is_verified: payload.is_verified,
  };

  return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
