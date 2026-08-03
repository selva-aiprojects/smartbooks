export const config = {
  port: process.env.PORT || 3000,
  jwt_secret_key: process.env.JWT_SECRET || 'smartbooks-secret-key-2026',
  jwt_algorithm: 'HS256',
  jwt_expires_in: '1d',
  database_url: process.env.DATABASE_URL || 'file:./dev.db',
  app_name: 'SmartBooks',
  debug: process.env.NODE_ENV !== 'production',
};
