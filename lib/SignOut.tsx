'use server'

import { signOut } from "@/auth"

export default async function SignOut() {
  async function handleSignOut() {
    'use server'
    await signOut()
  }

  return (
    <form action={handleSignOut}>
      <button className="text-sm font-medium text-muted-foreground hover:text-primary" type="submit">Sign Out</button>
    </form>
  )
}