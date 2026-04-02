export class User {
  public constructor(
    public id: number = 0,
    public username: string = '',
    public email: string = '',
    public password_hash: string = '',
    public full_name: string = '',
    public profile_image: string | null = null,
    public role: string = 'player'
  ) {}
}