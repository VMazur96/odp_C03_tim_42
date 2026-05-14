export interface UserGameDto {
  userId: number;
  gameId: number;
  status: 'owned' | 'wishlist' | 'previously_owned';
  rating: number | null;
  note: string | null;
  gameName: string;
  coverImage: string;
  mechanics?: string[];
}