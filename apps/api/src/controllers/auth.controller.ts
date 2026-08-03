import { Request, Response } from 'express';
import { loginUser, registerUser, getUserById } from '../services/auth.service';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, companyName } = req.body;
    const user = await registerUser(email, password, companyName);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    res.json({ token, user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const user = await getUserById(req.user.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
}
