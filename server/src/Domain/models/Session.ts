export class Session {
  public constructor(
    public id: number = 0,
    public creatorId: number = 0,
    public gameId: number = 0,
    public date: Date = new Date(),
    public durationMin: number = 0,
    public note: string | null = null
  ) {}
}