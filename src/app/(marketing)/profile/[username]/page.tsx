import { db } from "@/lib/db";
import { user, prompt } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { 
  Calendar, 
  Eye, 
  ThumbsUp, 
  Copy, 
  ExternalLink, 
  MapPin,
  Globe,
  User as UserIcon
} from "lucide-react";
import { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

async function getUserByUsername(username: string) {
  const userData = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.image,
      bio: user.bio,
      website: user.website,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  return userData[0] || null;
}

async function getUserPrompts(userId: string) {
  const userPrompts = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      slug: prompt.slug,
      excerpt: prompt.excerpt,
      promptType: prompt.promptType,
      upvotes: prompt.upvotes,
      views: prompt.views,
      copyCount: prompt.copyCount,
      createdAt: prompt.createdAt,
    })
    .from(prompt)
    .where(and(eq(prompt.authorId, userId), eq(prompt.published, true)))
    .orderBy(desc(prompt.createdAt));

  return userPrompts;
}

function getPromptTypeColor(type: string) {
  switch (type) {
    case "system":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "user":
      return "bg-green-100 text-green-800 border-green-200";
    case "developer":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const userData = await getUserByUsername(username);
  
  if (!userData) {
    return {
      title: 'User Not Found - Promptu',
      description: 'The requested user profile could not be found.',
    };
  }

  const userPrompts = await getUserPrompts(userData.id);
  
  return {
    title: `${userData.name} (@${userData.username}) - Promptu`,
    description: userData.bio || `View ${userData.name}'s AI prompts and profile on Promptu. ${userPrompts.length} prompts published.`,
    openGraph: {
      title: `${userData.name} (@${userData.username}) - Promptu`,
      description: userData.bio || `View ${userData.name}'s AI prompts and profile on Promptu. ${userPrompts.length} prompts published.`,
      type: 'profile',
      images: userData.image ? [userData.image] : [],
      url: `https://promptu.app/profile/${userData.username}`,
    },
    twitter: {
      card: 'summary',
      title: `${userData.name} (@${userData.username}) - Promptu`,
      description: userData.bio || `View ${userData.name}'s AI prompts and profile on Promptu.`,
      images: userData.image ? [userData.image] : [],
    },
    alternates: {
      canonical: `https://promptu.app/profile/${userData.username}`,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  
  const userData = await getUserByUsername(username);
  
  if (!userData) {
    notFound();
  }

  const userPrompts = await getUserPrompts(userData.id);
  
  const totalUpvotes = userPrompts.reduce((sum, prompt) => sum + (prompt.upvotes || 0), 0);
  const totalViews = userPrompts.reduce((sum, prompt) => sum + (prompt.views || 0), 0);
  const totalCopies = userPrompts.reduce((sum, prompt) => sum + (prompt.copyCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Avatar className="h-24 w-24 mx-auto">
                      <AvatarImage src={userData.image || ""} alt={userData.name} />
                      <AvatarFallback className="text-2xl">
                        {userData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">{userData.name}</h1>
                      <p className="text-sm text-gray-600">@{userData.username}</p>
                    </div>
                    
                    {userData.bio && (
                      <p className="text-sm text-gray-700 leading-relaxed">{userData.bio}</p>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}</span>
                      </div>
                      
                      {userData.website && (
                        <div className="flex items-center justify-center gap-2">
                          <Globe className="h-4 w-4" />
                          <a 
                            href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {userData.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prompts</span>
                      <span className="font-semibold text-gray-900">{userPrompts.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Upvotes</span>
                      <span className="font-semibold text-gray-900">{totalUpvotes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Views</span>
                      <span className="font-semibold text-gray-900">{totalViews}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Copies</span>
                      <span className="font-semibold text-gray-900">{totalCopies}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {userData.name}'s Prompts
                </h2>
                <p className="text-gray-600">
                  {userPrompts.length} prompt{userPrompts.length !== 1 ? 's' : ''} published
                </p>
              </div>

              {/* Prompts Grid */}
              {userPrompts.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No prompts yet
                    </h3>
                    <p className="text-gray-600">
                      {userData.name} hasn't published any prompts yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userPrompts.map((userPrompt) => (
                    <Card key={userPrompt.id} className="hover:bg-gray-50 transition-colors">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                              <Link 
                                href={`/prompts/${userPrompt.slug}`}
                                className="hover:text-gray-700 transition-colors"
                              >
                                {userPrompt.title}
                              </Link>
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`${getPromptTypeColor(userPrompt.promptType)} text-xs whitespace-nowrap`}
                            >
                              {userPrompt.promptType}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {userPrompt.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{userPrompt.upvotes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{userPrompt.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Copy className="h-4 w-4" />
                                <span>{userPrompt.copyCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(userPrompt.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/prompts/${userPrompt.slug}`}>
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 