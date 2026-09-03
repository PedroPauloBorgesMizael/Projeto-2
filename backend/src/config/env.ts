import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 3000,

  databaseUrl: process.env.DATABASE_URL as string,

  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "superrefreshsecret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "72h",
  },
};