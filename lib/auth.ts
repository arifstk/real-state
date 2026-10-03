import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Mobile", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Email/Mobile and Password are required.");
        }

        await connectDB();

        const user = await User.findOne({
          $or: [
            { email: credentials.identifier },
            { mobile: credentials.identifier },
          ],
        }).select("+password");

        if (!user || !user.password) {
          throw new Error("This user could not be found.");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) {
          throw new Error("Invalid password.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();

        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          const totalUsers = await User.countDocuments();
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: "google",
            role: totalUsers === 0 ? "superadmin" : "user",
          });
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      await connectDB();

      // First login
      if (user) {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.picture = dbUser.image;
          token.name = dbUser.name;
        }
      }

      // When update() is called or session is refreshed
      if (trigger === "update" || (!user && token.email)) {
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id.toString();
          token.picture = dbUser.image; // Database-এর নতুন image সেট করবে
          token.name = dbUser.name; // Database-এর নতুন name সেট করবে
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.image = token.picture as string; // Session-এ নতুন ছবি পাঠাবে
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
