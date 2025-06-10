import { getUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { prompt } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Plus, Calendar, Eye, ThumbsUp, Copy, Edit, Trash2, User, BarChart3, TrendingUp } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

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
			published: prompt.published,
			createdAt: prompt.createdAt,
		})
		.from(prompt)
		.where(eq(prompt.authorId, userId))
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

export const metadata: Metadata = {
	title: "Dashboard - Promptu",
	description: "Manage your AI prompts, view analytics, and create new content on Promptu.",
};

export default async function DashboardPage() {
	const user = await getUser();
	
	if (!user) {
		notFound();
	}

	// Check if user needs onboarding (server-side redirect)
	if (!user.username) {
		redirect("/onboarding");
	}

	const userPrompts = await getUserPrompts(user.id);
	
	// Calculate stats
	const publishedPrompts = userPrompts.filter(p => p.published);
	const draftPrompts = userPrompts.filter(p => !p.published);
	const totalUpvotes = userPrompts.reduce((sum, prompt) => sum + (prompt.upvotes || 0), 0);
	const totalViews = userPrompts.reduce((sum, prompt) => sum + (prompt.views || 0), 0);
	const totalCopies = userPrompts.reduce((sum, prompt) => sum + (prompt.copyCount || 0), 0);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 lg:px-6 py-4">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
					{/* Main Content */}
					<div className="lg:col-span-3 order-2 lg:order-1">
						<div className="space-y-4">
							{/* Header */}
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-xl font-bold text-gray-900 mb-1">
										Welcome back, {user.name.split(' ')[0]}!
									</h1>
									<p className="text-gray-600 text-sm">
										You have {userPrompts.length} prompt{userPrompts.length !== 1 ? 's' : ''} in total
									</p>
								</div>
							</div>



							{/* Prompts List */}
							{userPrompts.length === 0 ? (
								<Card>
									<CardContent className="pt-8 pb-8 text-center">
										<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 mb-3">
											<Plus className="h-5 w-5 text-gray-400" />
										</div>
										<h3 className="font-medium text-gray-900 mb-2">
											No prompts yet
										</h3>
										<p className="text-gray-600 text-sm mb-4">
											Get started by creating your first AI prompt.
										</p>
										<Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
											<Link href="/dashboard/create">
												Create your first prompt
											</Link>
										</Button>
									</CardContent>
								</Card>
							) : (
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<h2 className="text-md font-semibold text-gray-900">Your Prompts</h2>
										<div className="flex items-center gap-2 text-xs text-gray-600">
											<span>{publishedPrompts.length} published</span>
											<span>•</span>
											<span>{draftPrompts.length} drafts</span>
										</div>
									</div>
									
									<div className="space-y-3">
										{userPrompts.map((userPrompt) => (
											<Card key={userPrompt.id} className="hover:bg-gray-50 transition-colors">
												<CardContent className="pt-1 pb-1">
													<div className="flex items-start justify-between gap-3 mb-1">
														<h3 className="font-medium text-gray-900 leading-tight">
															<Link 
																href={`/prompts/${userPrompt.slug}`}
																className="hover:text-gray-700 transition-colors"
															>
																{userPrompt.title}
															</Link>
														</h3>
														<div className="flex items-center gap-1">
															<Badge 
																variant="outline" 
																className={`${getPromptTypeColor(userPrompt.promptType)} text-xs`}
															>
																{userPrompt.promptType}
															</Badge>
															{!userPrompt.published && (
																<Badge variant="secondary" className="text-xs">
																	Draft
																</Badge>
															)}
														</div>
													</div>
													
													<p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
														{userPrompt.excerpt}
													</p>
													
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-3 text-xs text-gray-500">
															<div className="flex items-center gap-1">
																<Eye className="h-3 w-3" />
																<span>{userPrompt.views}</span>
															</div>
															<div className="flex items-center gap-1">
																<ThumbsUp className="h-3 w-3" />
																<span>{userPrompt.upvotes}</span>
															</div>
															<div className="flex items-center gap-1">
																<Copy className="h-3 w-3" />
																<span>{userPrompt.copyCount}</span>
															</div>
															<span>{new Date(userPrompt.createdAt).toLocaleDateString()}</span>
														</div>
														
														<div className="flex items-center gap-2">
															<Button variant="outline" size="sm" asChild>
																<Link href={`/dashboard/edit/${userPrompt.slug}`}>
																	<Edit className="h-3 w-3 mr-1" />
																	Edit
																</Link>
															</Button>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Sidebar - Right Side */}
					<div className="lg:col-span-1 order-1 lg:order-2">
						<div className="lg:sticky lg:top-6 space-y-4">
							{/* User Profile Card */}
							<Card>
								<CardContent className="pt-3 pb-3">
									<div className="text-center space-y-2">
										<Avatar className="h-12 w-12 mx-auto">
											<AvatarImage src={user.image || ""} alt={user.name} />
											<AvatarFallback className="bg-gray-100 text-sm">
												{user.image ? (
													user.name.split(' ').map(n => n[0]).join('')
												) : (
													<User className="h-6 w-6 text-gray-600" />
												)}
											</AvatarFallback>
										</Avatar>
										
										<div>
											<h2 className="text-sm font-medium text-gray-900">{user.name}</h2>
											{user.username && (
												<p className="text-xs text-blue-600">@{user.username}</p>
											)}
										</div>
										
										{user.bio && (
											<p className="text-xs text-gray-700 leading-relaxed">{user.bio}</p>
										)}
										
										<div className="space-y-1.5">
											<Button variant="outline" size="sm" asChild className="w-full h-7 text-xs">
												<Link href="/dashboard/settings">
													<User className="h-3 w-3 mr-1" />
													Settings
												</Link>
											</Button>
											{user.username && (
												<Button variant="outline" size="sm" asChild className="w-full h-7 text-xs">
													<Link href={`/profile/${user.username}`}>
														Public Profile
													</Link>
												</Button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Stats */}
							<Card>
								<CardContent className="pt-3 pb-3">
									<h3 className="text-sm font-medium text-gray-900 mb-2">Stats</h3>
									<div className="space-y-1.5">
										<div className="flex justify-between items-center">
											<span className="text-xs text-gray-600">Prompts</span>
											<span className="text-xs font-medium text-gray-900">{userPrompts.length}</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-xs text-gray-600">Published</span>
											<span className="text-xs font-medium text-gray-900">{publishedPrompts.length}</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-xs text-gray-600">Drafts</span>
											<span className="text-xs font-medium text-gray-900">{draftPrompts.length}</span>
										</div>
										<hr className="my-1.5 border-gray-200" />
										<div className="flex justify-between items-center">
											<span className="text-xs text-gray-600">Total Views</span>
											<span className="text-xs font-medium text-gray-900">{totalViews}</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-xs text-gray-600">Total Upvotes</span>
											<span className="text-xs font-medium text-gray-900">{totalUpvotes}</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-xs text-gray-600">Total Copies</span>
											<span className="text-xs font-medium text-gray-900">{totalCopies}</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}