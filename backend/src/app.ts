import express, { Request, Response } from 'express';
import cors from 'cors';
import usersRouter from './routes/users';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', usersRouter);

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello from TypeScript Express backend');
});

export default app;
