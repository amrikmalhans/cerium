import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const db = drizzle(process.env.DATABASE_URL!, { schema });

// Export the database instance
export default db;

// Export all schema tables for direct usage
export * from './schema';