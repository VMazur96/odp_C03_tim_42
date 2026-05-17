export interface SessionPlayerDto {
  userId: number;
  username: string;
  score: number | null;
  winner: boolean;
  profileImage: string | null;
}

export interface SessionDto {
  id: number;
  creatorId: number;
  gameId: number;
  gameName: string;
  coverImage: string | null;
  date: string;
  durationMin: number;
  note: string | null;
  players: SessionPlayerDto[];
}