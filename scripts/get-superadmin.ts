import { DataSource } from 'typeorm';
import { pgConfig } from '../dbConfig';
import { User } from '../src/entities/users.entity';
import { Role } from '../src/entities/roles.entity';

async function main() {
  const ds = new DataSource(pgConfig);
  await ds.initialize();
  const userRepo = ds.getRepository(User);

  const superadmins = await userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .where('role.name = :role', { role: 'SUPERADMIN' })
    .getMany();

  console.log('SUPERADMIN Accounts:');
  superadmins.forEach(u => {
    console.log(`  Email: ${u.email}`);
  });

  await ds.destroy();
}

main().catch(console.error);
