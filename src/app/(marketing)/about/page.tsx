export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-start py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              About Promptu
            </h1>
            <p className="text-gray-600 text-sm">
              A simple place to find and share AI prompts
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Promptu is a website where people can find prompts and share prompts. 
                It's designed to help you live a better co-existing life with AI and 
                let AI understand your prompts better.
              </p>

              <p className="text-gray-700 leading-relaxed">
                Whether you're looking for system prompts, user prompts, or developer prompts, 
                you can discover high-quality examples from our community or contribute your own.
              </p>

              <p className="text-gray-700 leading-relaxed">
                Join our community and make AI interactions more effective for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 