import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  console.log("1. MIDDLEWARE: Stigao zahtev! Token postoji:", !!authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Nedostaje token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? ""
    ) as JwtPayload;

    req.user = decoded;
    next();
  } catch (err) {
    console.log("1. MIDDLEWARE GREŠKA: Token je istekao ili je nevažeći!");
    res.status(401).json({ success: false, message: "Nevažeći token" });
  }
};