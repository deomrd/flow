import { UserRepository } from '../../infrastructure/repositories/userRepository';
import { BadRequestError } from '../../utils/errors';

export class RegisterUser {
    constructor(private userRepository: UserRepository) {}

    async execute(userData: {
        username: string;
        email: string;
        phone: string;
        password: string;
    }) {
        const existingUser = await this.userRepository.findExistingUser(
            userData.username,
            userData.email,
            userData.phone
        );

        if (existingUser) {
            if (existingUser.username === userData.username) {
                throw new BadRequestError("Ce nom d'utilisateur est déjà utilisé");
            }
            if (existingUser.email === userData.email) {
                throw new BadRequestError("Cet email est déjà utilisé");
            }
            if (existingUser.phone === userData.phone) {
                throw new BadRequestError("Ce numéro de téléphone est déjà utilisé");
            }
        }

        return this.userRepository.create(userData);
    }
}