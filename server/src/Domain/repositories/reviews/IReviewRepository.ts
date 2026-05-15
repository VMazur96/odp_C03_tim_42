import { ReviewDto } from "../../DTOs/reviews/ReviewDto";

export interface IReviewRepository {
  create(gameId: number, userId: number, title: string, body: string, rating: number): Promise<boolean>;
  getByGameId(gameId: number): Promise<ReviewDto[]>;
  update(id: number, userId: number, title: string, body: string, rating: number): Promise<boolean>;
  delete(id: number, userId: number): Promise<boolean>;
  canUserReview(userId: number, gameId: number): Promise<boolean>;
  getByUserId(userId: number): Promise<ReviewDto[]>;
}