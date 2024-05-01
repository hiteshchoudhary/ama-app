import NextAuth from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import GitHub from 'next-auth/providers/github';
import type { NextAuthConfig } from 'next-auth';

let url = process.env.SUPABASE_URL as string
let secret = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export const config = {
  providers: [
    GitHub({
      async profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          emailVerified: false
        }
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url,
    secret
  })
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
