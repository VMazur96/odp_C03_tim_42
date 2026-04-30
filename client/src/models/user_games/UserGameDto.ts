export interface UserGameDto {
  userId: number;
  gameId: number;
  status: string;
  rating: number | null;
  gameName: string;
  coverImage: string;
}