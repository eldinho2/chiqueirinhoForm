import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import prisma from './services/prisma';
 
async function getUser(username: string, password: string): Promise<User | null> {
  try {    
    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    if (user.password !== password) {
      return null;
    }

    const userObject = {
      id: user.id.toString(),
      name: user.username,
    };

    return userObject;

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {          
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          const user = await getUser(credentials.username as string, credentials.password as string);
          
          
          return user;
        } catch (error) {
          console.error('Erro na autorização:', error);
          return null;
        }
      },
    }),
  ],
});