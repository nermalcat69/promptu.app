import { getUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { prompt } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Calendar, Eye, ThumbsUp, Copy, Edit, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";

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

export default async function DashboardPage() {
	const user = await getUser();
	
	if (!user) {
		notFound();
	}

	const userPrompts = await getUserPrompts(user.id);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
				<div className="space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between py-8">
						<div>
							<h1 className="text-2xl font-semibold text-gray-900 mb-2">
								My Prompts
							</h1>
							<p className="text-gray-600 text-sm">
								You have {userPrompts.length} prompt{userPrompts.length !== 1 ? 's' : ''}
							</p>
						</div>
						<Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
							<Link href="/dashboard/add-prompt">
								<Plus className="h-4 w-4 mr-2" />
								Add Prompt
							</Link>
						</Button>
					</div>

					{/* Prompts List */}
					{userPrompts.length === 0 ? (
						<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
							{/* Empty State */}
							<div className="p-12 text-center">
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
							</div>
						</div>
					) : (
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
					)}
				</div>
			</div>
		</div>
	);
}