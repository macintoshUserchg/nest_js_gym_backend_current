import { DataSource } from 'typeorm';
import { pgConfig } from '../dbConfig';

async function resetDatabase() {
  const dataSource = new DataSource(pgConfig);

  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected');

    // Get all table names
    const tables = await dataSource.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT LIKE '%migration%'
      ORDER BY tablename;
    `);

    console.log(`📋 Found ${tables.length} tables`);

    // Disable triggers
    await dataSource.query(`SET session_replication_role = 'replica';`);

    // Truncate all tables
    for (const table of tables) {
      const tableName = table.tablename;
      try {
        await dataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
        console.log(`  ✅ Truncated ${tableName}`);
      } catch (e) {
        console.log(`  ⚠️  Skipped ${tableName}: ${e.message}`);
      }
    }

    // Re-enable triggers
    await dataSource.query(`SET session_replication_role = 'DEFAULT';`);

    console.log('✅ Database reset complete');

    // Reset sequences
    const sequences = await dataSource.query(`
      SELECT sequence_name FROM information_schema.sequences
      WHERE sequence_schema = 'public';
    `);

    for (const seq of sequences) {
      await dataSource.query(`ALTER SEQUENCE "${seq.sequence_name}" RESTART WITH 1;`);
    }

    console.log('✅ Sequences reset');

    await dataSource.destroy();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetDatabase();
