import { ApiProperty } from '@nestjs/swagger';

export class MemberDashboardDto {
  @ApiProperty({
    description: 'Member profile information',
    example: {
      id: 123,
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      isActive: true,
      branch: {
        branchId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Main Branch',
      },
    },
  })
  member: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    isActive: boolean;
    attachmentUrl?: string;
    freezeMember: boolean;
    branch?: {
      branchId: string;
      name: string;
    };
  };

  @ApiProperty({
    description: 'Active subscription information',
    example: {
      id: 456,
      planName: 'Premium Monthly',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
      status: 'active',
    },
  })
  subscription: {
    id: number;
    planName?: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'inactive';
  } | null;

  @ApiProperty({
    description: 'Current month attendance statistics',
    example: {
      currentMonthCount: 8,
    },
  })
  attendance: {
    currentMonthCount: number;
  };

  @ApiProperty({
    description: 'Recent payment history',
    example: [
      {
        transactionId: 'txn_123',
        amount: 4999,
        method: 'card',
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        invoiceId: 'inv_456',
      },
    ],
  })
  paymentHistory: {
    transactionId: string;
    amount: number;
    method: string;
    status: string;
    createdAt: Date;
    invoiceId: string;
  }[];

  @ApiProperty({
    description: 'Total classes attended this month',
    example: 8,
  })
  currentMonthClasses: number;

  @ApiProperty({
    description: 'Membership status summary',
    example: 'active',
  })
  membershipStatus: string;
}
