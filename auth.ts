import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import prisma from './services/prisma';
import Discord from "next-auth/providers/discord";
import { admins } from './lib/admins';

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

async function findOrCreateUser(profile: ProfileInterface) {
  try {
    const response = await fetch(`http://localhost:8000/users/${profile.id}`);
    const data = await response.json();
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

    console.log(user);
    

    if (!user) {
      user = await prisma.users.create({
        data: {
          userID: profile.id,
          username: profile.username,
          email: profile.email,
          name: profile.name,
          nickname: nickName.toLowerCase(),
          image: profile.image_url,
          banner: profile.banner,
          role: role,
        },
      });
    } else {
      user = await prisma.users.update({
        where: { name: nickName },
        data: {
          userID: profile.id,
          username: profile.username,
          email: profile.email,
          name: profile.name,
          nickname: nickName.toLowerCase(),
          image: profile.image_url,
          banner: profile.banner,
          role: role,
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
    async signIn({ user, account, profile }) {
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

          const dbProfile = await findOrCreateUser(profile as unknown as ProfileInterface);
          console.log(dbProfile);
          
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

    async session({ session, token }) {
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
      authorization: "https://discord.com/oauth2/authorize?client_id=1298754230013923468&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fdiscord&scope=identify",
      issuer: "https://discord.com",
    }),
  ],
});
