import { Pool } from "pg";

const connectDb = async (url: string) => {
    const pool = new Pool({ connectionString: url });

    await pool.query("SELECT 1");

    console.log("Database connected successfully");

    return pool;
};

export default connectDb;