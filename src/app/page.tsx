import { redirect } from 'next/navigation'

export default async function Home() {
  // For demo purposes, go directly to dashboard
  redirect('/dashboard')
}
