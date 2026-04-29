export interface GameDto {
  id: number;
  name: string;
  description: string;
  min_players: number;
  max_players: number;
  duration_min: number;
  weight: number;
  release_year: number;
  publisher: string;
  cover_image: string;
}