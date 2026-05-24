import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const account = await prisma.account.findUnique({
    where: { email: session.user.email },
    include: { customers: { orderBy: { createdAt: 'desc' } } },
  });

  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  return NextResponse.json(account.customers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const account = await prisma.account.findUnique({ where: { email: session.user.email } });
  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const { name, phone, address } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: { name, phone, address, accountId: account.id },
  });

  return NextResponse.json(customer, { status: 201 });
}

// ✅ NEW: DELETE customer
export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('id');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
  }

  // Verify customer belongs to this user
  const account = await prisma.account.findUnique({
    where: { email: session.user.email },
    include: { customers: { where: { id: customerId } } },
  });

  if (!account || account.customers.length === 0) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  // Check balance is 0 before deleting
  const customer = account.customers[0];
  if (customer.balance !== 0) {
    return NextResponse.json({ error: 'Cannot delete: Balance is not zero. Clear all udhaar first.' }, { status: 400 });
  }

  await prisma.customer.delete({ where: { id: customerId } });

  return NextResponse.json({ success: true, message: 'Customer deleted' });
}
