export interface ReviewDto {
  id: number;
  game_id: number;
  userId: number;
  title: string;
  body: string;
  rating: number;
  createdAt: Date;
  username: string;
  profileImage: string | null;
}