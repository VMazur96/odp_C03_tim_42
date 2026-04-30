import { Request, Response, NextFunction } from 'express';

export const authRegistracijaValidator = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, password, fullName } = req.body;

  if (!username || username.length < 3 || username.length > 40) {
    res.status(400).json({ success: false, message: 'Korisničko ime nije validno (3-40 karaktera).' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'Email format nije validan.' });
    return;
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    res.status(400).json({ success: false, message: 'Lozinka mora imati najmanje 8 karaktera, jedno veliko slovo i jedan broj.' });
    return;
  }

  if (!fullName) {
    res.status(400).json({ success: false, message: 'Ime i prezime je obavezno.' });
    return;
  }

  next();
};