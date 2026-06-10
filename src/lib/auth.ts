import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        const appPassword = process.env.APP_PASSWORD;

        if (!appPassword) {
          throw new Error("APP_PASSWORD が設定されていません");
        }

        if (credentials?.password === appPassword) {
          // シングルユーザーなので固定のユーザーオブジェクトを返す
          return { id: "1", name: "Owner", email: "owner@bodylog.local" };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
