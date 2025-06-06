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
import { notFound } from "next/navigation";
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

	const userPrompts = await getUserPrompts(user.id);
	
	// Calculate stats
	const publishedPrompts = userPrompts.filter(p => p.published);
	const draftPrompts = userPrompts.filter(p => !p.published);
	const totalUpvotes = userPrompts.reduce((sum, prompt) => sum + (prompt.upvotes || 0), 0);
	const totalViews = userPrompts.reduce((sum, prompt) => sum + (prompt.views || 0), 0);
	const totalCopies = userPrompts.reduce((sum, prompt) => sum + (prompt.copyCount || 0), 0);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Sidebar */}
					<div className="lg:col-span-1">
						<div className="sticky top-8 space-y-6">
							{/* User Profile Card */}
							<Card>
								<CardContent className="pt-6">
									<div className="text-center space-y-4">
										<Avatar className="h-20 w-20 mx-auto">
											<AvatarImage src={user.image || ""} alt={user.name} />
											<AvatarFallback className="text-xl">
												{user.name.split(' ').map(n => n[0]).join('')}
											</AvatarFallback>
										</Avatar>
										
										<div>
											<h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
											<p className="text-sm text-gray-600">{user.email}</p>
											{user.username && (
												<p className="text-xs text-blue-600">@{user.username}</p>
											)}
										</div>
										
										{user.bio && (
											<p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
										)}
										
										<div className="space-y-2">
											<Button variant="outline" size="sm" asChild className="w-full">
												<Link href="/dashboard/settings">
													<User className="h-4 w-4 mr-2" />
													Edit Profile
												</Link>
											</Button>
											{user.username && (
												<Button variant="outline" size="sm" asChild className="w-full">
													<Link href={`/profile/${user.username}`}>
														View Public Profile
													</Link>
												</Button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Stats Card */}
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-lg flex items-center gap-2">
										<BarChart3 className="h-5 w-5" />
										Your Stats
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Total Prompts</span>
										<span className="font-semibold text-gray-900">{userPrompts.length}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Published</span>
										<span className="font-semibold text-green-600">{publishedPrompts.length}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Drafts</span>
										<span className="font-semibold text-yellow-600">{draftPrompts.length}</span>
									</div>
									<Separator />
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
								</CardContent>
							</Card>

							{/* Quick Actions */}
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-lg">Quick Actions</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white">
										<Link href="/dashboard/add-prompt">
											<Plus className="h-4 w-4 mr-2" />
											Create New Prompt
										</Link>
									</Button>
									<Button variant="outline" asChild className="w-full">
										<Link href="/dashboard/settings">
											Settings
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Main Content */}
					<div className="lg:col-span-3">
						<div className="space-y-6">
							{/* Header */}
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-3xl font-bold text-gray-900 mb-2">
										Welcome back, {user.name.split(' ')[0]}!
									</h1>
									<p className="text-gray-600">
										You have {userPrompts.length} prompt{userPrompts.length !== 1 ? 's' : ''} in total
									</p>
								</div>
								<Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
									<Link href="/dashboard/add-prompt">
										<Plus className="h-4 w-4 mr-2" />
										Add Prompt
									</Link>
								</Button>
							</div>

							{/* Recent Activity Summary */}
							{userPrompts.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<TrendingUp className="h-5 w-5" />
											Recent Activity
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="text-center p-4 bg-blue-50 rounded-lg">
												<div className="text-2xl font-bold text-blue-600">{totalViews}</div>
												<div className="text-sm text-blue-800">Total Views</div>
											</div>
											<div className="text-center p-4 bg-green-50 rounded-lg">
												<div className="text-2xl font-bold text-green-600">{totalUpvotes}</div>
												<div className="text-sm text-green-800">Total Upvotes</div>
											</div>
											<div className="text-center p-4 bg-purple-50 rounded-lg">
												<div className="text-2xl font-bold text-purple-600">{totalCopies}</div>
												<div className="text-sm text-purple-800">Total Copies</div>
											</div>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Prompts List */}
							{userPrompts.length === 0 ? (
								<Card>
									<CardContent className="pt-12 pb-12 text-center">
										<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
											<Plus className="h-6 w-6 text-gray-400" />
										</div>
										<h3 className="text-lg font-medium text-gray-900 mb-2">
											No prompts yet
										</h3>
										<p className="text-gray-600 text-sm mb-4">
											Get started by creating your first AI prompt.
										</p>
										<Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
											<Link href="/dashboard/add-prompt">
												Create your first prompt
											</Link>
										</Button>
									</CardContent>
								</Card>
							) : (
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<h2 className="text-xl font-semibold text-gray-900">Your Prompts</h2>
										<div className="flex items-center gap-2 text-sm text-gray-600">
											<span>{publishedPrompts.length} published</span>
											<span>•</span>
											<span>{draftPrompts.length} drafts</span>
										</div>
									</div>
									
									<div className="space-y-4">
										{userPrompts.map((userPrompt) => (
											<Card key={userPrompt.id} className="hover:shadow-md transition-shadow">
												<CardContent className="pt-6">
													<div className="flex flex-col md:flex-row md:items-start gap-4">
														<div className="flex-1">
															<div className="flex items-start justify-between gap-4 mb-3">
																<h3 className="font-semibold text-gray-900 text-lg leading-tight">
																	<Link 
																		href={`/prompts/${userPrompt.slug}`}
																		className="hover:text-gray-700 transition-colors"
																	>
																		{userPrompt.title}
																	</Link>
																</h3>
																<div className="flex items-center gap-2">
																	<Badge 
																		variant="outline" 
																		className={`${getPromptTypeColor(userPrompt.promptType)} text-xs whitespace-nowrap`}
																	>
																		{userPrompt.promptType}
																	</Badge>
																	{!userPrompt.published && (
																		<Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200 bg-yellow-50">
																			Draft
																		</Badge>
																	)}
																</div>
															</div>
															
															<p className="text-gray-600 text-sm mb-4 leading-relaxed">
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
																
																<div className="flex items-center gap-2">
																	<Button variant="outline" size="sm" asChild>
																		<Link href={`/dashboard/edit/${userPrompt.slug}`}>
																			<Edit className="h-4 w-4 mr-1" />
																			Edit
																		</Link>
																	</Button>
																	<Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</div>
															</div>
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
				</div>
			</div>
		</div>
	);
}