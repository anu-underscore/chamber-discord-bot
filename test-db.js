import "dotenv/config";
import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 1,
  connectTimeout: 10000,
});

try {
  const connection = await pool.getConnection();

  console.log("✅ MySQL connected successfully!");

  const result = await connection.query("SELECT 1 AS test");

  console.log("✅ SELECT 1:", result);

  connection.release();
} catch (error) {
  console.error("❌ MySQL connection failed:");
  console.error(error);
} finally {
  await pool.end();
}
