export class SessionPlayer {
  public constructor(
    public sessionId: number = 0,
    public userId: number = 0,
    public score: number | null = null,
    public winner: boolean = false
  ) {}
}