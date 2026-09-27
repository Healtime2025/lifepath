import { Pool } from "@neondatabase/serverless";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {

  const connectionString =
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not available."
    );
  }

  const pool = new Pool({
    connectionString,
    max: 1
  });

  const client = await pool.connect();

  let began = false;

  try {

    console.log("");
    console.log("==============================================");
    console.log(" NEON SAME-CLIENT TRANSACTION SMOKE TEST");
    console.log("==============================================");
    console.log("");

    await client.query("BEGIN");
    began = true;

    const identity = await client.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        txid_current() AS transaction_id
    `);

    const before = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM careers)
          AS careers,
        (SELECT COUNT(*)::int FROM qualifications)
          AS qualifications,
        (SELECT COUNT(*)::int FROM career_qualifications)
          AS career_qualification_links,
        (SELECT COUNT(*)::int FROM programmes)
          AS programmes
    `);

    /*
     * No INSERT / UPDATE / DELETE.
     * This proves the exact Pool/client mechanism
     * used by the real master importer.
     */

    await client.query("ROLLBACK");
    began = false;

    const after = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM careers)
          AS careers,
        (SELECT COUNT(*)::int FROM qualifications)
          AS qualifications,
        (SELECT COUNT(*)::int FROM career_qualifications)
          AS career_qualification_links,
        (SELECT COUNT(*)::int FROM programmes)
          AS programmes
    `);

    const beforeRow = before.rows[0];
    const afterRow = after.rows[0];

    if (
      JSON.stringify(beforeRow) !==
      JSON.stringify(afterRow)
    ) {
      throw new Error(
        "Database counts changed during read-only smoke test."
      );
    }

    console.log("Connection          : PASS");
    console.log("BEGIN               : PASS");
    console.log("Same-client query   : PASS");
    console.log("ROLLBACK            : PASS");
    console.log("Post-check          : PASS");
    console.log("");

    console.table(identity.rows);
    console.table(before.rows);

    console.log("");
    console.log("LifePath data writes: ZERO");
    console.log("");
    console.log("🔥 TRANSACTION PATH VERIFIED");

  } catch (error) {

    if (began) {
      try {
        await client.query("ROLLBACK");
      } catch {}
    }

    throw error;

  } finally {

    client.release();
    await pool.end();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
