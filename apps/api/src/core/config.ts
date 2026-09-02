function resolveJwtSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be set in production');
    }
    return process.env.JWT_SECRET;
  }
  return process.env.JWT_SECRET || 'smartbooks-secret-key-2026';
}

export const config = {
  port: process.env.PORT || 3000,
  jwt_secret_key: resolveJwtSecret(),
  jwt_algorithm: 'HS256',
  jwt_expires_in: '1d',
  database_url: process.env.DATABASE_URL || 'file:./dev.db',
  app_name: 'SmartBooks',
  debug: process.env.NODE_ENV !== 'production',
};
