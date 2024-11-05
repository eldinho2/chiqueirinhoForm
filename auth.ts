import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import prisma from './services/prisma';
 
async function getUser(username: string, password: string): Promise<User | null> {
  try {
    console.log('Buscando usuário:', username);
    
    const user = await prisma.users.findUnique({
      where: { username },
    });

    console.log('Usuário encontrado:', user ? 'Sim' : 'Não');

    if (!user) {
      console.log('Usuário não encontrado');
      return null;
    }

    if (user.password !== password) {
      console.log('Senha incorreta');
      return null;
    }

    const userObject = {
      id: user.id.toString(),
      name: user.username,
    };

    console.log('Retornando usuário:', userObject);
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
          console.log('Iniciando autorização');
          
          if (!credentials?.username || !credentials?.password) {
            console.log('Credenciais faltando');
            return null;
          }

          const user = await getUser(credentials.username as string, credentials.password as string);
          
          console.log('Resultado da autorização:', user ? 'Sucesso' : 'Falha');
          
          return user;
        } catch (error) {
          console.error('Erro na autorização:', error);
          return null;
        }
      },
    }),
  ],
});