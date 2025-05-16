export class User {
  constructor(
    public readonly id_user: number,
    public readonly email: string,
    public readonly username: string,
    public password: string
  ) {}

  static create(email: string, username: string, password: string): User {
    if (!email.includes('@')) throw new Error("Invalid email");
    return new User(0, email, username, password);
  }
}