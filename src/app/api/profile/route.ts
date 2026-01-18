import { NextResponse } from 'next/server';

import { getUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/profile - Get current user's profile
 * Also creates the profile if it doesn't exist
 */
export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Upsert profile (create if not exists, update if exists)
  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    update: {
      email: user.email!,
      fullName: user.user_metadata?.full_name || undefined,
    },
    create: {
      id: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name || null,
    },
  });

  return NextResponse.json(profile);
}
