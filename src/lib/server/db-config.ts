import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// These will be replaced with environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    // Only use SSL for remote connections (not localhost)
    ...(process.env.DB_HOST !== 'localhost' && {
        ssl: {
            rejectUnauthorized: false
        }
    })
});

export default pool; 