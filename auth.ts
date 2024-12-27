import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import prisma from './services/prisma';
import Discord from "next-auth/providers/discord"
import { admins } from './lib/admins';

interface ProfileInterface {
  id: string;
  username: string;
  email: string;
  name: string;
  global_name: string;
  image_url: string;
  banner: string;
}

async function findOrCreateUser(profile: ProfileInterface) {
  try {
    const response = await fetch(`http://localhost:8000/users/${profile.id}`);
    const data = await response.json();
    const nickName = data.nickname;

    if (!nickName) {
      throw new Error('Nickname não encontrado');
    }

    let user = await prisma.users.findUnique({
      where: { name: nickName },
    });

    let role = 'user';

    const roleResponse = await fetch(`http://localhost:8000/roles/${profile.id}`);
    const roleData = await roleResponse.json();

    if (Array.isArray(roleData) && roleData.length > 0) {
      for (const roleName of admins) {
        if (roleData.includes(roleName)) {
          role = roleName;
          break;
        }
      }
    }

    if (!user) {
      user = await prisma.users.create({
        data: {
          userID: profile.id,
          username: profile.username,
          email: profile.email,
          name: nickName.toLowerCase(),
          image: profile.image_url,
          banner: profile.banner,
          role: role,
          createdAt: new Date(),
        },
      });
    } else {
      user = await prisma.users.update({
        where: { name: nickName },
        data: {
          userID: profile.id,
          username: profile.username,
          name: nickName.toLowerCase(),
          image: profile.image_url,
          banner: profile.banner,
          role: role,
          updatedAt: new Date(),
        },
      });
    }

    return user;
  } catch (error) {
    console.log('Erro ao encontrar ou criar o usuário:', error);
    throw error;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && account.provider === 'discord') {
        if (profile) {
          user.id = profile.id ?? '';
          user.username = (profile as { username: string }).username;
          user.banner = profile.banner as string;
        }        
        const dbProfile = await findOrCreateUser(profile as unknown as ProfileInterface);
        user.role = dbProfile.role;

      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = String(user.role) || 'user';
        token.id = user.id; 
        token.username = user.username; 
        token.banner = user.banner; 
      }
      return token;
    },

    async session({ session, token }) {
      if (token.role) {
        session.user.role = String(token.role) || 'user';
      }
      session.user.id = token.id as string; 
      session.user.username = token.username as string; 
      session.user.banner = token.banner as string; 
      return session;
    },
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: "https://discord.com/oauth2/authorize?client_id=1298754230013923468&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fdiscord&scope=identify",
      issuer: "https://discord.com",
    }),
  ],
});