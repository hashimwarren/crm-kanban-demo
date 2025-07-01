import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, users } from '@/app/db'
import { eq } from 'drizzle-orm'

// GET /api/users - List all users
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      console.warn('Unauthorized access attempt: userId is missing in /api/users')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allUsers = await db.select().from(users).orderBy(users.createdAt)
    
    return NextResponse.json(allUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/users - Create or sync a user from Clerk
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      console.warn('Unauthorized access attempt: userId is missing in /api/users')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, email, firstName, lastName, role } = body

    if (!id || !email) {
      return NextResponse.json({ error: 'ID and email are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.id, id))
    
    if (existingUser.length > 0) {
      // Update existing user
      const updatedUser = await db.update(users)
        .set({
          email,
          firstName,
          lastName,
          role: role || 'sales',
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning()
      
      return NextResponse.json(updatedUser[0])
    } else {
      // Create new user
      const newUser = await db.insert(users).values({
        id,
        email,
        firstName,
        lastName,
        role: role || 'sales',
      }).returning()

      return NextResponse.json(newUser[0], { status: 201 })
    }
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
