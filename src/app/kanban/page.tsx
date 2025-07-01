'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Plus, MoreHorizontal, DollarSign, Calendar, User } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  probability: number
  expectedCloseDate: string | null
  createdAt: string
  leadName: string | null
  leadLastName: string | null
  leadCompany: string | null
}

const columns = [
  { id: 'prospecting', title: 'Prospecting', color: 'bg-blue-100' },
  { id: 'qualification', title: 'Qualification', color: 'bg-yellow-100' },
  { id: 'proposal', title: 'Proposal', color: 'bg-orange-100' },
  { id: 'negotiation', title: 'Negotiation', color: 'bg-purple-100' },
  { id: 'closed_won', title: 'Closed Won', color: 'bg-green-100' },
  { id: 'closed_lost', title: 'Closed Lost', color: 'bg-red-100' },
]

export default function KanbanPage() {
  const { user, isLoaded } = useUser()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch deals from API
  useEffect(() => {
    if (isLoaded && user) {
      fetchDeals()
    }
  }, [isLoaded, user])

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals')
      if (response.ok) {
        const data = await response.json()
        setDeals(data)
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }

  // Redirect to sign-in if not authenticated
  if (isLoaded && !user) {
    window.location.href = '/sign-in'
    return null
  }

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  // Group deals by stage
  const dealsByStage = columns.reduce((acc, column) => {
    acc[column.id] = deals.filter(deal => deal.stage === column.id)
    return acc
  }, {} as Record<string, Deal[]>)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData('text/plain')
    
    // Find the deal and update its stage
    const deal = deals.find(d => d.id === dealId)
    if (deal && deal.stage !== newStage) {
      // TODO: Implement API call to update deal stage
      // For now, just update locally
      setDeals(prevDeals => 
        prevDeals.map(d => 
          d.id === dealId ? { ...d, stage: newStage } : d
        )
      )
    }
  }

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId)
  }

  const DealCard = ({ deal }: { deal: Deal }) => (
    <Card 
      className="mb-3 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => handleDragStart(e, deal.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm leading-tight">{deal.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Deal</DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="w-3 h-3 mr-1" />
            {deal.leadCompany || `${deal.leadName || ''} ${deal.leadLastName || ''}`.trim() || 'No Company'}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-green-600">
              <DollarSign className="w-3 h-3 mr-1" />
              ${(deal.value / 100).toLocaleString()}
            </div>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'No date'}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Probability</span>
              <span className="font-medium">{deal.probability}%</span>
            </div>
            <Progress value={deal.probability} className="h-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Deal Pipeline</h1>
            <p className="text-muted-foreground">
              Drag and drop deals to update their stage
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Deal
          </Button>
        </div>

        {/* Pipeline Summary */}
        <div className="grid gap-4 md:grid-cols-6">
          {columns.map(column => {
            const columnDeals = dealsByStage[column.id] || []
            const totalValue = columnDeals.reduce((sum, deal) => sum + deal.value, 0) / 100
            
            return (
              <Card key={column.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {column.title}
                    <Badge variant="secondary" className="text-xs">
                      {columnDeals.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">${totalValue.toLocaleString()}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {columns.map(column => (
            <div key={column.id} className="space-y-4">
              <div className={`p-3 rounded-lg ${column.color}`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">{column.title}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {dealsByStage[column.id]?.length || 0}
                  </Badge>
                </div>
              </div>
              
              <div 
                className="min-h-[400px] space-y-3"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {dealsByStage[column.id]?.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
                
                {(!dealsByStage[column.id] || dealsByStage[column.id].length === 0) && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No deals in this stage
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
