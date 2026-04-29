export class Game {
  public constructor(
    public id: number = 0,
    public name: string = '',
    public description: string = '',
    public min_players: number = 1,
    public max_players: number = 1,
    public duration_min: number = 5,
    public weight: number = 1.0,
    public release_year: number = 2026,
    public publisher: string = '',
    public cover_image: string = ''
  ) {}
}