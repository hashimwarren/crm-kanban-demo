import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, Users, DollarSign, Target } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// Helper function to fetch data from our API
async function fetchDashboardData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    const [leadsRes, dealsRes] = await Promise.all([
      fetch(`${baseUrl}/api/leads`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/deals`, { cache: 'no-store' })
    ])

    const leads = leadsRes.ok ? await leadsRes.json() : []
    const deals = dealsRes.ok ? await dealsRes.json() : []

    return { leads, deals }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return { leads: [], deals: [] }
  }
}

// Helper function to calculate stats from real data
function calculateStats(leads: Lead[], deals: Deal[]) {
  const totalLeads = leads.length
  const activeDeals = deals.filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage)).length
  const revenue = deals
    .filter(deal => deal.stage === 'closed_won')
    .reduce((sum, deal) => sum + (deal.value || 0), 0) / 100 // Convert from cents
  
  const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length
  const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads * 100).toFixed(1) : '0.0'

  return [
    {
      title: 'Total Leads',
      value: totalLeads.toString(),
      change: '+0%', // TODO: Calculate based on previous period
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Deals',
      value: activeDeals.toString(),
      change: '+0%', // TODO: Calculate based on previous period
      icon: Target,
      color: 'text-green-600',
    },
    {
      title: 'Revenue',
      value: `$${revenue.toLocaleString()}`,
      change: '+0%', // TODO: Calculate based on previous period
      icon: DollarSign,
      color: 'text-yellow-600',
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      change: '+0%', // TODO: Calculate based on previous period
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ]
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  qualified: 'bg-green-100 text-green-800',
  proposal: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-gray-100 text-gray-800',
}

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  status: string
  createdAt: string
}

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  leadName: string | null
  leadLastName: string | null
  leadCompany: string | null
}

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const { leads, deals } = await fetchDashboardData()
  const stats = calculateStats(leads, deals)
  
  // Get recent leads (last 5)
  const recentLeads = leads
    .sort((a: Lead, b: Lead) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((lead: Lead) => ({
      id: lead.id,
      name: `${lead.firstName} ${lead.lastName}`,
      company: lead.company || 'No Company',
      status: lead.status,
      value: '$0', // We don't have value directly on leads
    }))

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your CRM.</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/leads/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600">
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>
                Latest leads added to your pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeads.map((lead: { id: string; name: string; company: string; status: string; value: string }) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {lead.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-600">{lead.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                        {lead.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">{lead.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/leads">
                  <Button variant="outline" className="w-full">
                    View All Leads
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/leads/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Lead
                  </Button>
                </Link>
                <Link href="/kanban">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    View Kanban Board
                  </Button>
                </Link>
                <Link href="/deals">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Manage Deals
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
