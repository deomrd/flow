import { z } from "zod";
import { validateZodSchema } from "../middlewares/validateZod.middleware";

// 1. Création utilisateur
export const createUserSchema = z.object({
  username: z.string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(20, "Le nom d'utilisateur ne peut excéder 20 caractères")
    .regex(/^[a-zA-Z0-9_]+$/, "Caractères alphanumériques et underscores seulement"),
  
  email: z.string()
    .email("Email invalide")
    .max(100, "L'email ne peut excéder 100 caractères"),
  
  phone: z.string()
    .min(8, "Numéro de téléphone invalide")
    .regex(/^\+?[\d\s-]{8,15}$/, "Format de téléphone invalide"),
  password: z.string()
    .min(1, "Le mot de passe est requis"),
    
  pin: z.string()
    .length(4, "Le code PIN doit contenir exactement 4 chiffres")
    .regex(/^\d+$/, "Le code PIN ne doit contenir que des chiffres"),
  
  profile: z.object({
    full_name: z.string()
      .max(100, "Le nom complet ne peut excéder 100 caractères")
      .optional(),
    
    phone_number: z.string()
      .min(8, "Numéro de téléphone invalide")
      .optional(),
    
    address: z.string()
      .max(200, "L'adresse ne peut excéder 200 caractères")
      .optional(),
    
    date_of_birth: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
      .optional()
  }).optional()
}).strict(); 


// 2. Connexion (email, username ou phone accepté comme identifiant)
export const loginSchema = z.object({
  identifier: z.string().min(1, "Identifiant requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

// 3. Mise à jour du profil utilisateur connecté
export const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  phone_number: z
    .string()
    .min(8, "Numéro de téléphone invalide")
    .optional(),
  address: z.string().optional(),
});

// 4. Mise à jour du mot de passe
export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Ancien mot de passe requis"),
  newPassword: z.string().min(6, "Le nouveau mot de passe doit faire au moins 6 caractères"),
});

export const searchUserSchema = z.object({
  q: z.string().min(1, "Le terme de recherche est requis"),
});


// Exporte les middlewares de validation
export const validateCreateUser = validateZodSchema(createUserSchema);
export const validateLogin = validateZodSchema(loginSchema);
export const validateUpdateProfile = validateZodSchema(updateProfileSchema);
export const validatePasswordUpdate = validateZodSchema(updatePasswordSchema);
export const validateSearchUser = validateZodSchema(searchUserSchema, 'query');

