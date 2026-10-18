import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to cwd

const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devhubai',
  jwtSecret: process.env.JWT_SECRET || 'devhub_ai_super_secret_jwt_key_2026_production_grade_auth_token_98234',
  jwtExpire: process.env.JWT_EXPIRE || '7d'
};

export default config;

