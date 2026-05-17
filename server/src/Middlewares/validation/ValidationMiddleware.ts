import { Request, Response, NextFunction } from 'express';

export const authRegistracijaValidator = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, password, fullName } = req.body;

  if (!username || username.length < 3 || username.length > 40) {
    res.status(400).json({ success: false, message: 'Korisničko ime nije validno ili je zauzeto.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'Email je već zauzet.' });
    return;
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    res.status(400).json({ success: false, message: 'Lozinka ne ispunjava uslove.' });
    return;
  }

  if (!fullName) {
    res.status(400).json({ success: false, message: 'Ime i prezime je obavezno.' });
    return;
  }

  next();
};