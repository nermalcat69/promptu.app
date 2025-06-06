import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface ExtendedUser {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    username?: string | null;
    bio?: string | null;
    website?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export const getSession = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    return session;
}

export const getUser = async (): Promise<ExtendedUser | null> => {
    const session = await getSession();
    if (!session?.user) return null;

    // Get the complete user profile from the database
    try {
        const userProfile = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                image: user.image,
                username: user.username,
                bio: user.bio,
                website: user.website,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            })
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);

        if (userProfile[0]) {
            return userProfile[0] as ExtendedUser;
        }

        // Fallback to session user data with null values for missing fields
        return {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            emailVerified: session.user.emailVerified,
            image: session.user.image,
            username: null,
            bio: null,
            website: null,
            createdAt: session.user.createdAt,
            updatedAt: session.user.updatedAt,
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        // Return basic user data with null values for missing fields
        return {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            emailVerified: session.user.emailVerified,
            image: session.user.image,
            username: null,
            bio: null,
            website: null,
            createdAt: session.user.createdAt,
            updatedAt: session.user.updatedAt,
        };
    }
}