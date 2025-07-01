import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, deals, leads } from '@/app/db'
import { eq } from 'drizzle-orm'

// GET /api/deals - List all deals
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Join deals with leads to get lead information
    const allDeals = await db
      .select({
        id: deals.id,
        leadId: deals.leadId,
        title: deals.title,
        value: deals.value,
        stage: deals.stage,
        probability: deals.probability,
        expectedCloseDate: deals.expectedCloseDate,
        actualCloseDate: deals.actualCloseDate,
        assignedTo: deals.assignedTo,
        createdAt: deals.createdAt,
        updatedAt: deals.updatedAt,
        leadName: leads.firstName,
        leadLastName: leads.lastName,
        leadCompany: leads.company,
        leadEmail: leads.email,
      })
      .from(deals)
      .leftJoin(leads, eq(deals.leadId, leads.id))
      .orderBy(deals.createdAt)
    
    return NextResponse.json(allDeals)
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/deals - Create a new deal
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { leadId, title, value, stage, probability, expectedCloseDate } = body

    if (!title || value === undefined) {
      return NextResponse.json({ error: 'Title and value are required' }, { status: 400 })
    }

    const newDeal = await db.insert(deals).values({
      leadId: leadId || null,
      title,
      value: Math.round(value * 100), // Store in cents
      stage: stage || 'prospecting',
      probability: probability || 0,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      assignedTo: userId,
    }).returning()

    return NextResponse.json(newDeal[0], { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
