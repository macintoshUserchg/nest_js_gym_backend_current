import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../entities/members.entity';
import { Branch } from '../../entities/branch.entity';
import { MembershipPlan } from '../../entities/membership_plans.entity';
import { MemberSubscription } from '../../entities/member_subscriptions.entity';
import { User } from '../../entities/users.entity';
import { Role } from '../../entities/roles.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CsvImportService {
  constructor(
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Branch)
    private branchesRepo: Repository<Branch>,
    @InjectRepository(MembershipPlan)
    private plansRepo: Repository<MembershipPlan>,
    @InjectRepository(MemberSubscription)
    private subscriptionsRepo: Repository<MemberSubscription>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Role)
    private rolesRepo: Repository<Role>,
  ) {}

  parseCsv(csvContent: string): Record<string, string>[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new BadRequestException(
        'CSV must have a header row and at least one data row',
      );
    }

    const headers = lines[0]
      .split(',')
      .map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.length !== headers.length) {
        throw new BadRequestException(
          `Row ${i + 1} has ${values.length} columns, expected ${headers.length}`,
        );
      }
      const row: Record<string, string> = {};
      headers.forEach((header, j) => {
        row[header] = values[j];
      });
      rows.push(row);
    }

    return rows;
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }

  async importMembers(
    rows: Record<string, string>[],
    branchId: string,
    planId: number,
  ) {
    const results = { successful: 0, failed: 0, errors: [] as string[] };

    const branch = await this.branchesRepo.findOne({ where: { branchId } });
    if (!branch) {
      throw new BadRequestException(`Branch with ID ${branchId} not found`);
    }

    const plan = await this.plansRepo.findOne({ where: { id: planId } });
    if (!plan) {
      throw new BadRequestException(
        `Membership plan with ID ${planId} not found`,
      );
    }

    const memberRole = await this.rolesRepo.findOne({
      where: { name: 'MEMBER' },
    });
    if (!memberRole) {
      throw new BadRequestException('MEMBER role not found');
    }

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        const email = row.email?.trim();
        const fullName = row.fullName?.trim();

        if (!email || !fullName) {
          results.errors.push(`Row ${i + 2}: Missing email or fullName`);
          results.failed++;
          continue;
        }

        const existing = await this.membersRepo.findOne({ where: { email } });
        if (existing) {
          results.errors.push(
            `Row ${i + 2}: Member with email ${email} already exists`,
          );
          results.failed++;
          continue;
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationInDays);

        const subscription = this.subscriptionsRepo.create({
          plan,
          startDate,
          endDate,
          isActive: true,
        });
        await this.subscriptionsRepo.save(subscription);

        const memberEntity = this.membersRepo.create({
          fullName,
          email,
          phone: row.phone?.trim() || undefined,
          gender: row.gender ? (row.gender as any) : undefined,
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
          addressLine1: row.addressLine1?.trim() || undefined,
          city: row.city?.trim() || undefined,
          state: row.state?.trim() || undefined,
          branch,
          subscription,
          isActive: row.isActive !== 'false',
        } as any);
        const savedMember = (await this.membersRepo.save(memberEntity)) as any;

        const hashedPassword = await bcrypt.hash('pass@123', 10);
        const user = this.usersRepo.create({
          email,
          passwordHash: hashedPassword,
          role: memberRole,
          branch,
          memberId: String(savedMember.id),
        } as any);
        await this.usersRepo.save(user);

        results.successful++;
      } catch (error) {
        results.errors.push(`Row ${i + 2}: ${(error as Error).message}`);
        results.failed++;
      }
    }

    return results;
  }

  toCsv(data: Record<string, unknown>[], columns: string[]): string {
    const header = columns.join(',');
    const rows = data.map((row) =>
      columns
        .map((col) => {
          const val = row[col] ?? '';
          const str = String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(','),
    );
    return [header, ...rows].join('\n');
  }
}
