import NextAuth from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import Credentials from "next-auth/providers/credentials"
import GitHub from 'next-auth/providers/github';
import type { NextAuthConfig } from 'next-auth';
import { nextAuthClient } from "@/lib/supabase/private";
import bcrypt from 'bcryptjs';

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
          isVerified: true,
        }
      },
    }),
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        try {
          const { data, error } = await nextAuthClient
            .from("users")
            .select("*")
            .or(`username.eq.${credentials.identifier},email.eq.${credentials.identifier}`)

          if (error) {
            console.log("Error", error);
            return {
              type: "error",
              message: "Database Error: Failed to check username.",
            };
          }
          return data[0]

          // const user = await UserModel.findOne({
          //   $or: [
          //     { email: credentials.identifier },
          //     { username: credentials.identifier },
          //   ],
          // });
          // if (!data) {
          //   throw new Error('No user found with this email');
          // }
          // if (!data?.isVerified) {
          //   throw new Error('Please verify your account before logging in');
          // }
          // const isPasswordCorrect = await bcrypt.compare(
          //   credentials.password,
          //   user.password
          // );
          // if (isPasswordCorrect) {
          //   return user;
          // } else {
          //   throw new Error('Incorrect password');
          // }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url,
    secret
  }),
  callbacks: {
    async jwt({ session, token, user }) {
      console.log("jwt", session, token, user)
      if (user) {
        token._id = user.id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      console.log("token", token)
      return token;
    },
    async session({ session, token, user }) {
      console.log("user", user)
      
      if (token) {
        session.user.id = token.sub;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
        // session.accessToken = token.accessToken
      }
      console.log("session", token, session)
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
