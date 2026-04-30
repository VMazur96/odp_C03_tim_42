export class UserGame {
  public constructor(
    public userId: number = 0,
    public gameId: number = 0,
    public status: string = 'owned', 
    public rating: number | null = null,
    public note: string = '',
    public gameName: string = '',
    public coverImage: string = ''
  ) {}
}