import NextAuth from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import Credentials from "next-auth/providers/credentials"
import GitHub from 'next-auth/providers/github';
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from 'next-auth';
 
export const config = {
    providers: [
        GitHub,
        Google,
        Credentials({
        // You can specify which fields should be submitted, by adding keys to the `credentials` object.
        // e.g. domain, username, password, 2FA token, etc.
        credentials: {
          email: {},
          password: {},
        },
        authorize: async (credentials) => {
          let user = null
   
          // logic to salt and hash password
          const pwHash = saltAndHashPassword(credentials.password)
   
          // logic to verify if user exists
          user = await getUserFromDb(credentials.email, pwHash)
   
          if (!user) {
            // No user found, so this is their first attempt to login
            // meaning this is also the place you could do registration
            throw new Error("User not found.")
          }
   
          // return user object with the their profile data
          return user
        },
      }),
  ],
    adapter: SupabaseAdapter({
      url: process.env.SUPABASE_URL as string,
      secret: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    })
  } satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);