import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import prisma from './services/prisma';
import Discord from "next-auth/providers/discord"

const scopes = ['identify'].join(' ')

 
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

    console.log(user);
    

    const userObject = {
      id: user.id.toString(),
      name: user.username,
      role: user.role
    };

    console.log(userObject);
    

    return userObject;

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: "https://discord.com/oauth2/authorize?client_id=1298754230013923468&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fdiscord&scope=identify",
    }),
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
          
          console.log(user);
          
          
          return user;
        } catch (error) {
          console.error('Erro na autorização:', error);
          return null;
        }
      },
    }),
  ],
});