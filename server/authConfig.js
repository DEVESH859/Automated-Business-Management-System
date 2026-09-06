function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== 'production') return 'development-only-secret';
  return null;
}

module.exports = { getJwtSecret };
