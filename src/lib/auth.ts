import { auth, currentUser } from '@clerk/nextjs/server'
import { db, users } from '@/app/db'
import { eq } from 'drizzle-orm'

export async function syncUserWithDatabase() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if database is available (might be null in test environment)
    if (!db) {
      console.warn('Database not available - skipping user sync')
      return { success: true }
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId))
    
    if (existingUser.length === 0) {
      // Create new user
      await db.insert(users).values({
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: 'sales',
      })
    } else {
      // Update existing user
      await db.update(users)
        .set({
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    }

    return { success: true }
  } catch (error) {
    console.error('Error syncing user:', error)
    return { success: false, error: 'Failed to sync user' }
  }
}
