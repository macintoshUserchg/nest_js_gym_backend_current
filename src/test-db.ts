import { DataSource } from 'typeorm';
import { pgConfig } from '../dbConfig';

const dataSource = new DataSource(pgConfig);

async function testConnection() {
  try {
    await dataSource.initialize();
    console.log('Successfully connected to the database!');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
}

testConnection();
