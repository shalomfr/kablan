import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production-12345",
  providers: [
    // Only add Google provider if credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("נא להזין אימייל וסיסמה");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { organization: true },
        });

        if (!user || !user.password) {
          throw new Error("אימייל או סיסמה שגויים");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("אימייל או סיסמה שגויים");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.organizationId = session.organizationId;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth providers, create organization if doesn't exist
      if (account?.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { organization: true },
        });

        if (existingUser && !existingUser.organizationId) {
          // Create a default organization for the user
          const org = await prisma.organization.create({
            data: {
              name: `${existingUser.name || existingUser.email} - עסק`,
              plan: "FREE",
              settings: JSON.stringify({
                currency: "ILS",
                language: "he",
                taxRate: 0.17,
                defaultWasteFactor: 0.1,
                defaultContingency: 0.1,
                companyInfo: {},
              }),
            },
          });

          await prisma.user.update({
            where: { id: existingUser.id },
            data: { organizationId: org.id, role: "ADMIN" },
          });
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Create a default organization for new users
      const org = await prisma.organization.create({
        data: {
          name: `${user.name || user.email} - עסק`,
          plan: "FREE",
          settings: JSON.stringify({
            currency: "ILS",
            language: "he",
            taxRate: 0.17,
            defaultWasteFactor: 0.1,
            defaultContingency: 0.1,
            companyInfo: {},
          }),
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: org.id, role: "ADMIN" },
      });
    },
  },
};

