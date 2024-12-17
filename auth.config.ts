import type { NextAuthConfig } from 'next-auth';
import { DiscordProfile }  from 'next-auth/providers/discord';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isLoginPage = nextUrl.pathname.startsWith('/login');

      if (isDashboard) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/login', nextUrl));
      }
      
      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;