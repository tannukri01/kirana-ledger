import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { customerId, type, amount, description } = await req.json();
  if (!customerId || !type || !amount) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (type !== 'CREDIT' && type !== 'DEBIT') {
    return NextResponse.json({ error: 'Type must be CREDIT or DEBIT' }, { status: 400 });
  }

  const amountInPaise = Math.round(parseFloat(amount) * 100);

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        customerId,
        type,
        amount: amountInPaise,
        description: description || '',
      },
    });

    const balanceChange = type === 'CREDIT' ? amountInPaise : -amountInPaise;
    await tx.customer.update({
      where: { id: customerId },
      data: { balance: { increment: balanceChange } },
    });

    return transaction;
  });

  return NextResponse.json(result, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'customerId required' }, { status: 400 });
  }

  const transactions = await prisma.transaction.findMany({
    where: { customerId },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(transactions);
}
