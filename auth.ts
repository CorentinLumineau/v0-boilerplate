import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Import the specific functions we need
import { getServerSession, NextAuth } from "next-auth/next"

// Define the NextAuth configuration
const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Fetch user from API route
          const response = await fetch(
            `${process.env.NEXTAUTH_URL}/api/user?email=${encodeURIComponent(credentials.email)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          )

          if (!response.ok) {
            return null
          }

          const user = await response.json()

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          // Return user without password
          const { password, ...userWithoutPassword } = user
          return userWithoutPassword
        } catch (error) {
          console.error("Error in authorize function:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
}

// Create the NextAuth handler
const { auth, handlers, signIn, signOut } = NextAuth(authConfig)

// Export the functions
export { auth, handlers, signIn, signOut }

// Helper function to get the session on the server
export const getSession = () => getServerSession(authConfig)
