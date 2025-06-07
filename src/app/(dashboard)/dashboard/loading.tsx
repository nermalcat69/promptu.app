export default function Loading() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-5xl mx-auto px-4 lg:px-6 py-4">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
					{/* Main Content Skeleton */}
					<div className="lg:col-span-3 order-2 lg:order-1">
						<div className="space-y-4">
							{/* Header Skeleton */}
							<div className="flex items-center justify-between">
								<div>
									<div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-1"></div>
									<div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
								</div>
								<div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
							</div>

							{/* Prompts Section Skeleton */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
									<div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
								</div>
								
								{/* Prompt Cards Skeleton */}
								<div className="space-y-3">
									{[1, 2, 3, 4].map((i) => (
										<div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
											<div className="flex items-start justify-between gap-3 mb-2">
												<div className="h-5 w-3/4 bg-gray-200 rounded"></div>
												<div className="flex items-center gap-2">
													<div className="h-6 w-16 bg-gray-200 rounded-full"></div>
													<div className="h-6 w-12 bg-gray-200 rounded-full"></div>
												</div>
											</div>
											
											<div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
											<div className="h-4 w-2/3 bg-gray-200 rounded mb-3"></div>
											
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="h-4 w-8 bg-gray-200 rounded"></div>
													<div className="h-4 w-8 bg-gray-200 rounded"></div>
													<div className="h-4 w-8 bg-gray-200 rounded"></div>
													<div className="h-4 w-20 bg-gray-200 rounded"></div>
												</div>
												<div className="h-8 w-16 bg-gray-200 rounded"></div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Sidebar Skeleton */}
					<div className="lg:col-span-1 order-1 lg:order-2">
						<div className="lg:sticky lg:top-6 space-y-4">
							{/* User Profile Card Skeleton */}
							<div className="bg-white rounded-xl border p-4 animate-pulse">
								<div className="text-center space-y-2">
									<div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
									<div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
									<div className="h-3 w-20 bg-gray-200 rounded mx-auto"></div>
									<div className="space-y-1.5">
										<div className="h-7 w-full bg-gray-200 rounded"></div>
										<div className="h-7 w-full bg-gray-200 rounded"></div>
									</div>
								</div>
							</div>

							{/* Stats Card Skeleton */}
							<div className="bg-white rounded-xl border p-4 animate-pulse">
								<div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
								<div className="space-y-1.5">
									{[1, 2, 3, 4, 5].map((i) => (
										<div key={i} className="flex justify-between items-center">
											<div className="h-3 w-16 bg-gray-200 rounded"></div>
											<div className="h-3 w-8 bg-gray-200 rounded"></div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}