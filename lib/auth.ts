import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
        tenantId: { label: 'Tenant', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api$/, '');
          console.log(`[NextAuth] Fetching from: ${apiBase}/api/auth/login`);
          const res = await fetch(
            `${apiBase}/api/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
                ...(credentials?.tenantId ? { tenantId: credentials.tenantId } : {}),
              }),
            },
          );

          if (!res.ok) return null;

          const data = await res.json();
          const userData = data.data || data;

          // Same email+password matched more than one tenant and none was
          // specified — the login page is responsible for showing a picker
          // before calling signIn again with a tenantId, so this isn't a
          // successful sign-in yet.
          if (userData.requiresTenantSelection) return null;

          return {
            id: userData.user.id || userData.user._id,
            email: userData.user.email,
            name: userData.user.name,
            role: userData.user.role,
            tenantId: userData.user.tenantId,
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken,
          };
        } catch (e: any) {
          console.error('LOGIN_ERROR_DETAILS:', e.message, e.cause);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
});
