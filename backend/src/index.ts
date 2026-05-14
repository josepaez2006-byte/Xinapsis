import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRoutes from './routes';

dotenv.config();

// ── Validaciones críticas al inicio ───────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  console.error('Please set JWT_SECRET in your .env file before starting the server.');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// CORS restringido al origen del frontend
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Xinapsis backend listening on port ${port}`);
  console.log(`CORS allowed origin: ${allowedOrigin}`);
});
