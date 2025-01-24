import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    maxAge: 432000,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname.startsWith('/login');

      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;