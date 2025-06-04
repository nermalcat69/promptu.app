import { PromptGrid } from "@/components/prompt-grid";
import { PromptFilters } from "@/components/prompt-filters";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <div className="space-y-6">
          <div className="text-start py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Confused about how to interact with AI?
            </h1>
            <p className="text-gray-600 text-sm">
              Discover and share high-quality prompts for AI models
            </p>
          </div>
          
          {/* Filters */}
          <PromptFilters />
          
          {/* Prompt Grid */}
          <PromptGrid />
        </div>
      </div>
    </div>
  );
}
