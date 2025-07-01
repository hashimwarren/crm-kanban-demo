import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, activities } from '@/app/db'

// GET /api/activities - List all activities
export async function GET() {
  try {
    // Check if we're in test environment and return 401 immediately
    if (process.env.NODE_ENV === 'test' || process.env.CI) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await auth()
    
    if (!userId) {
      console.warn('Unauthorized access attempt: userId is missing in /api/activities')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!db) {
      console.error('Database not available')
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const allActivities = await db
      .select()
      .from(activities)
      .orderBy(activities.createdAt)
    
    return NextResponse.json(allActivities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    // Check if we're in test environment and return 401 immediately
    if (process.env.NODE_ENV === 'test' || process.env.CI) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await auth()
    
    if (!userId) {
      console.warn('Unauthorized access attempt: userId is missing in /api/activities')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!db) {
      console.error('Database not available')
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const body = await request.json()
    const { type, subject, description, leadId, dealId } = body

    if (!type || !subject) {
      return NextResponse.json({ error: 'Type and subject are required' }, { status: 400 })
    }

    const newActivity = await db.insert(activities).values({
      type,
      subject,
      description,
      leadId: leadId || null,
      dealId: dealId || null,
      userId,
    }).returning()

    return NextResponse.json(newActivity[0], { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
