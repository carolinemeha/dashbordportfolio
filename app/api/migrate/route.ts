import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST() {
  try {
    console.log('API: Starting database migration...');
    await seedDatabase();
    console.log('API: Migration successful');
    return NextResponse.json({ success: true, message: 'Migration completed successfully' });
  } catch (error: any) {
    console.error('API: Migration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred during migration' },
      { status: 500 }
    );
  }
}
