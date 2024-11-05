'use client'

import { signIn } from "next-auth/react"

 
export default function LoginPage() {

    const credentialsAction = (formData: FormData) => {
        signIn("credentials", {
            username: formData.get("username"),
            password: formData.get("password"),
        })
    }

  return (
    <main className="flex flex-col items-center justify-center md:h-screen">
        <h1>Login</h1>
        <div>
        <form action={credentialsAction} className="space-y-3 text-black">
            <div className="flex flex-col items-center justify-center">
                <input 
                    type="text" 
                    name="username"
                    placeholder="username"
                    required
                />
                <input 
                    type="password" 
                    name="password"
                    placeholder="Password"
                    required
                />
            </div>
            <button 
                type="submit"
                className="mt-4 w-full text-white" 
            >
                Log in
            </button>
            <div
                className="flex h-8 items-end space-x-1"
                aria-live="polite"
                aria-atomic="true"
            >
            </div>
        </form>
        </div>
    </main>
  );
}