import { z } from 'zod';

export const BusinessTypeEnum = z.enum([
  'AGENCE_DE_VOYAGE', 'AGENCE_IMMOBILIERE', 'AUTRE', 'BOULANGERIE', 'BOUTIQUE',
  'CABINET_MEDICAL', 'CENTRE_SPORTIF', 'CHARCUTERIE', 'COIFFURE', 'ECOLE',
  'ENTREPRISE', 'ETABLISSEMENT', 'HOPITAL', 'HOTEL', 'LIBRAIRIE',
  'PHARMACIE', 'RESTAURANT', 'SALON_DE_BEAUTE', 'SERVICE_INFORMATIQUE',
  'STATION_SERVICE', 'SUPERMARCHE', 'TRANSPORT', 'UNIVERSITE'
], {
    errorMap: () => ({
      message: "Type de business invalide. Veuillez choisir une valeur parmi les types autorisés."
    })
  });

export const createBusinessSchema = z.object({
  name: z.string().min(3, 'Le nom du business est obligatoire'),
  type: BusinessTypeEnum,
  email: z.string().email('Email invalide'),

  pointOfSale: z.object({
    name: z.string().min(3, 'Le nom du point de vente est obligatoire'),
    location: z.string().min(1, 'La localisation du point de vente est obligatoire')
  }),

  user: z.object({
    name: z.string().min(3, `Le nom de l'utilisateur est obligatoire`),
    username: z.string().min(3, 'Le nom d’utilisateur doit contenir au moins 3 caractères'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
  })
});
