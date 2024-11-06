'use server';
 
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
 
 
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {

    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Usuário ou senha inválidos.';
        default:
          return 'Algo de errado aconteceu.';
      }
    }
    throw error;
  }
}