import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Add subscription info to session
        const userWithSubscription = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            subscriptionStatus: true,
            subscriptionPlan: true,
            subscriptionEndsAt: true,
            itemsCount: true,
            cardsCount: true,
          },
        })
        
        if (userWithSubscription) {
          session.user.subscriptionStatus = userWithSubscription.subscriptionStatus
          session.user.subscriptionPlan = userWithSubscription.subscriptionPlan
          session.user.subscriptionEndsAt = userWithSubscription.subscriptionEndsAt
          session.user.itemsCount = userWithSubscription.itemsCount
          session.user.cardsCount = userWithSubscription.cardsCount
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Auto-create user with free plan
      if (account?.provider && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })
        
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              subscriptionPlan: "free",
              subscriptionStatus: "active",
            },
          })
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
}
