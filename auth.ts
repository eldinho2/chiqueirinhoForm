import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import prisma from './services/prisma';
import Discord from "next-auth/providers/discord";
import { admins } from './lib/admins';
export const maxDuration = 60;

interface ProfileInterface {
  id: string;
  username: string;
  email: string;
  name: string;
  global_name: string;
  image_url: string;
  banner: string;
  nickname: string;
}

async function fetchWithRetry(url: string, options?: RequestInit) {
  const retries = 999;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
      }
      console.error(`Erro na tentativa ${i + 1}:`, response.statusText);
    } catch (error) {
      console.error(`Erro na tentativa ${i + 1}:`, error);
      if (i === retries - 1) {
        throw new Error('O bot não está respondendo após várias tentativas.');
      }
    }
  }
}

async function findOrCreateUser(profile: ProfileInterface) {
  try {    
    const data = await fetchWithRetry(`${process.env.NEXT_PUBLIC_BOT_BACKEND_URL}/users/${profile.id}`);

    console.log('=========================data', data);
    
    const nickName = data.nickname.toLowerCase();

    if (!nickName) {
      throw new Error('Nickname não encontrado');
    }

    if (!profile.id || !profile.username) {
      throw new Error('Perfil incompleto: ID, username ou email está faltando.');
    }

    let user = await prisma.users.findUnique({
      where: { name: nickName },
    });

    let role: string | null = null;

    const userRoles = data.roles;
    
    for (const admin of admins) {
      if (userRoles.includes(admin)) {
        role = admin;
        break;
      }
    }

    if (!user) {
      user = await prisma.users.create({
        data: {
          userID: profile.id,
          username: profile.username,
          email: profile.email,
          name: nickName.toLowerCase(),
          nickname: nickName.toLowerCase(),
          image: profile.image_url,
          banner: profile.banner,
          role: role || 'user',
        },
      });
    } else {
      user = await prisma.users.update({
        where: { name: nickName },
        data: {
          userID: profile.id,
          username: profile.username,
          email: profile.email,
          name: nickName.toLowerCase(),
          nickname: nickName.toLowerCase(),
          image: profile.image_url,
          banner: profile.banner,
          role: role || 'user',
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Erro ao encontrar ou criar o usuário:', error);
    throw error;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log('account', account);
      console.log('profile', profile);
      console.log('user', user);
      
      if (account && account.provider === 'discord') {
        if (!profile) {
          console.error('Erro: Profile está vazio ou não foi recebido.');
          return false;
        }

        try {
          user.id = profile.id ?? '';
          user.username = (profile as { username: string }).username ?? '';
          user.banner = profile.banner as string ?? '';
          user.email = profile.email as string ?? '';

          const dbProfile = await findOrCreateUser(profile as any);
          
          user.role = dbProfile.role;
          user.nickname = dbProfile.nickname;
          user.nick = dbProfile.name;

          return true;
        } catch (error) {
          console.error('Erro durante o processo de signIn:', error);
          return false;
        }
      }
      return false;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = String(user.role) || 'user';
        token.id = user.id ?? '';
        token.username = user.username ?? '';
        token.banner = user.banner ?? '';
        token.email = user.email ?? '';
        token.nick = user.nick ?? '';
      }
      return token;
    },

    async session({ session, token }: any) {
      session.user = session.user || {};
      session.user.role = String(token.role) || 'user';
      session.user.id = token.id ?? '';
      session.user.username = token.username ?? '';
      session.user.banner = token.banner ?? '';
      session.user.email = token.email ?? '';
      session.user.nick = token.nick ?? '';
      return session;
    },
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: process.env.DISCORD_URL_REDIRECT,
      issuer: "https://discord.com",
    }),
  ],
});
