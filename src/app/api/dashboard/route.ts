import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const account = await prisma.account.findUnique({
    where: { email: session.user.email },
    include: {
      customers: {
        include: { transactions: { orderBy: { date: 'desc' } } },
      },
    },
  });

  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const totalCustomers = account.customers.length;
  const totalBalance = account.customers.reduce((sum, c) => sum + c.balance, 0);
  const totalCredit = account.customers.reduce(
    (sum, c) => sum + c.transactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0),
    0
  );
  const totalDebit = account.customers.reduce(
    (sum, c) => sum + c.transactions.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0),
    0
  );

  const topDebtors = account.customers
    .filter((c) => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)
    .map((c) => ({ id: c.id, name: c.name, phone: c.phone, balance: c.balance }));

  const recentTransactions = account.customers
    .flatMap((c) => c.transactions.map((t) => ({ ...t, customerName: c.name })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return NextResponse.json({
    totalCustomers,
    totalBalance,
    totalCredit,
    totalDebit,
    topDebtors,
    recentTransactions,
  });
}
