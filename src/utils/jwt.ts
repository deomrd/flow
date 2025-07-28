import jwt from 'jsonwebtoken';

export const generateToken = (user: any) => {
  return jwt.sign({ id_user: user.id_user, role: user.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
};
