import { PromptGrid } from "@/components/prompt-grid";
import { PromptFilters } from "@/components/prompt-filters";
import { Hero } from "@/components/hero";
import { Sidebar } from "@/components/sidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Discover AI Prompts</h2>
                  <p className="text-gray-600 mt-1">
                    Find the perfect prompts for your AI projects
                  </p>
                </div>
              </div>
              
              {/* Filters */}
              <PromptFilters />
              
              {/* Prompt Grid */}
              <PromptGrid />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="hidden lg:block w-80">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
