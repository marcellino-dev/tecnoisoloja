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
        const { error } = await supabase.from('users').upsert({
          email: user.email,
          name:  user.name  || 'Usuário',
          image: user.image || null,
          role,
        }, { onConflict: 'email', ignoreDuplicates: false });
        if (error) console.error('Supabase upsert error:', error);
      } catch (err) {
        console.error('signIn callback error:', err);
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user?.email) {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from('users')
          .select('id, role')
          .eq('email', session.user.email)
          .single();
        if (data) {
          (session.user as any).id   = data.id;
          (session.user as any).role = data.role;
        }
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
  },
  pages: {
    signIn:   '/auth/signin',
    error:    '/auth/error',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
