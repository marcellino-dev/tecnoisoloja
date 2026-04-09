import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createAdminClient } from '@/lib/supabase/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcelinosouza.dev@gmail.com';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        const supabase = createAdminClient();
        const role = user.email === ADMIN_EMAIL ? 'admin' : 'user';
        const { data: existing } = await supabase
          .from('users').select('id, role').eq('email', user.email).single();
        if (existing) {
          await supabase.from('users').update({
            name:  user.name  || 'Usuário',
            image: user.image || null,
            role:  user.email === ADMIN_EMAIL ? 'admin' : existing.role,
          }).eq('email', user.email);
        } else {
          await supabase.from('users').insert({
            email: user.email,
            name:  user.name  || 'Usuário',
            image: user.image || null,
            role,
          });
        }
      } catch (err) {
        console.error('signIn callback error:', err);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from('users').select('id, role').eq('email', user.email).single();
        if (data) { token.id = data.id; token.role = data.role; }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id   = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  pages: { signIn: '/auth/signin', error: '/auth/error' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};