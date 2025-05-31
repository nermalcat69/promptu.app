import { PromptDetail } from "@/components/prompt-detail";
import { PromptComments } from "@/components/prompt-comments";
import { RelatedPrompts } from "@/components/related-prompts";

interface PageProps {
  params: {
    id: string;
  };
}

export default function PromptPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <PromptDetail promptId={params.id} />
            <PromptComments promptId={params.id} />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <RelatedPrompts promptId={params.id} />
          </div>
        </div>
      </div>
    </div>
  );
} 