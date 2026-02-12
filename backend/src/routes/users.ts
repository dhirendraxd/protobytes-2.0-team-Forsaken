import { Router, Request, Response } from 'express';

const router = Router();

type User = { id: string; name: string; email: string };

// In-memory store for demo purposes
const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' }
];

// List users
router.get('/', (_req: Request, res: Response) => {
  res.json(users);
});

// Get user by id
router.get('/:id', (req: Request, res: Response) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Create user
router.post('/', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Missing name or email' });
  const id = String(Date.now());
  const user: User = { id, name, email };
  users.push(user);
  res.status(201).json(user);
});

// Update user
router.put('/:id', (req: Request, res: Response) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { name, email } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  res.json(user);
});

// Delete user
router.delete('/:id', (req: Request, res: Response) => {
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'User not found' });
  users.splice(index, 1);
  res.status(204).send();
});

// Simple auth example: login by email (demo only)
router.post('/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  // Return a dummy token for demo
  res.json({ token: `dummy-token-for-${user.id}`, user });
});

export default router;
