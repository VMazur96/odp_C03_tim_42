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
import { UserGameRepository } from './Database/repositories/user_games/UserGameRepository';
import { UserGameService } from './Services/user_games/UserGameService';
import { UserGameController } from './WebAPI/controllers/UserGameController';
import { SessionRepository } from './Database/repositories/sessions/SessionRepository';
import { SessionService } from './Services/sessions/SessionService';
import { SessionController } from './WebAPI/controllers/SessionController';

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

// Services
const authService: IAuthService = new AuthService(userRepository);
const userService: IUserService = new UserService(userRepository);
const gameService: IGameService = new GameService(gameRepository);
const userGameService = new UserGameService(userGameRepository);
const sessionService = new SessionService(sessionRepository);

// WebAPI routes
const authController = new AuthController(authService);
const userController = new UserController(userService);
const gameController = new GameController(gameService);
const userGameController = new UserGameController(userGameService);
const sessionController = new SessionController(sessionService);

// Registering routes (Vraćeno na tvoj originalni dizajn)
app.use('/api/v1', authController.getRouter());
app.use('/api/v1', userController.getRouter());
app.use('/api/v1', gameController.getRouter());
app.use('/api/v1/user-games', userGameController.getRouter());
app.use('/api/v1/sessions', sessionController.router);

export default app;