import express from 'express';
import cors from 'cors';
import { IAuthService } from './Domain/services/auth/IAuthService';
import { AuthService } from './Services/auth/AuthService';
import { IUserRepository } from './Domain/repositories/users/IUserRepository';
import { UserRepository } from './Database/repositories/users/UserRepository';
import { AuthController } from './WebAPI/controllers/AuthController';
import { IUserService } from './Domain/services/users/IUserService';
import { UserService } from './Services/users/UserService';
import { UserController } from './WebAPI/controllers/UserController';
import { IGameRepository } from './Domain/repositories/games/IGameRepository';
import { GameRepository } from './Database/repositories/games/GameRepository';
import { IGameService } from './Domain/services/games/IGameService';
import { GameService } from './Services/games/GameService';
import { GameController } from './WebAPI/controllers/GameController';
import { IUserGameService } from './Domain/services/user_games/IUserGameService';
import { UserGameRepository } from './Database/repositories/user_games/UserGameRepository';
import { UserGameService } from './Services/user_games/UserGameService';
import { UserGameController } from './WebAPI/controllers/UserGameController';
import { SessionRepository } from './Database/repositories/sessions/SessionRepository';
import { SessionService } from './Services/sessions/SessionService';
import { SessionController } from './WebAPI/controllers/SessionController';
import { ReviewRepository } from "./Database/repositories/reviews/ReviewRepository";
import { ReviewService } from "./Services/reviews/ReviewService";
import { ReviewController } from "./WebAPI/controllers/ReviewController";
import { MechanicRepository } from './Database/repositories/mechanics/MechanicRepository';
import { MechanicService } from './Services/mechanics/MechanicService';
import { MechanicController } from './WebAPI/controllers/MechanicController';
import { AuditRepository } from './Database/repositories/audits/AuditRepository';
import { AuditService } from './Services/audits/AuditService';
import { AuditController } from './WebAPI/controllers/AuditController';

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// Repositories
const userRepository: IUserRepository = new UserRepository();
const gameRepository: IGameRepository = new GameRepository();
const userGameRepository = new UserGameRepository();
const sessionRepository = new SessionRepository();
const reviewRepository = new ReviewRepository();
const mechanicRepository = new MechanicRepository();
const auditRepository = new AuditRepository();

// Services
const authService: IAuthService = new AuthService(userRepository);
const userService: IUserService = new UserService(userRepository);
const gameService: IGameService = new GameService(gameRepository);
const userGameService = new UserGameService(userGameRepository);
const sessionService = new SessionService(sessionRepository, userGameRepository);
const reviewService = new ReviewService(reviewRepository);
const mechanicService = new MechanicService(mechanicRepository);
const auditService = new AuditService(auditRepository);

// WebAPI routes
const authController = new AuthController(authService, auditService);
const userController = new UserController(userService);
const gameController = new GameController(gameService);
const userGameController = new UserGameController(userGameService);
const sessionController = new SessionController(sessionService);
const reviewController = new ReviewController(reviewService);
const mechanicController = new MechanicController(mechanicService);
const auditController = new AuditController(auditService);

// Registering routes
app.use('/api/v1', authController.getRouter());
app.use('/api/v1', userController.getRouter());
app.use('/api/v1', gameController.getRouter());
app.use('/api/v1/collection', userGameController.getRouter());
app.use('/api/v1/sessions', sessionController.router);
app.use("/api/v1/reviews", reviewController.router);
app.use('/api/v1/mechanics', mechanicController.getRouter());
app.use('/api/v1/audits', auditController.getRouter());

export default app;