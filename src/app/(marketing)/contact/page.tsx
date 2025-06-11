import { Mail, Twitter, Linkedin, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">Get in Touch</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions, feedback, or want to collaborate? I'd love to hear from you! 
          Reach out through any of the channels below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email */}
        <a 
          href="mailto:meow@nermalcat69.dev"
          className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
              <p className="text-blue-600 group-hover:text-blue-700">meow@nermalcat69.dev</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            For general inquiries, feedback, or business opportunities.
          </p>
        </a>

        {/* Twitter */}
        <a 
          href="https://twitter.com/arjvnz"
          target="_blank"
          rel="noopener noreferrer"
          className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-sky-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-100 rounded-lg group-hover:bg-sky-200 transition-colors">
              <Twitter className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Twitter</h3>
              <p className="text-sky-600 group-hover:text-sky-700">@arjvnz</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Follow for updates, quick questions, and tech discussions.
          </p>
        </a>

        {/* LinkedIn */}
        <a 
          href="https://www.linkedin.com/in/nermalcat69/"
          target="_blank"
          rel="noopener noreferrer"
          className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Linkedin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">LinkedIn</h3>
              <p className="text-blue-600 group-hover:text-blue-700">nermalcat69</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Connect for professional networking and collaboration.
          </p>
        </a>

        {/* Discord/Community */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Community</h3>
              <p className="text-purple-600">Coming Soon</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Join our Discord community for discussions and support.
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About Response Times</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Email:</strong> I typically respond within 24-48 hours</p>
          <p><strong>Twitter:</strong> Best for quick questions and real-time discussions</p>
          <p><strong>LinkedIn:</strong> Great for professional inquiries and partnerships</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Can I contribute prompts or cursor rules?</h3>
            <p className="text-sm text-gray-600">
              Absolutely! Create an account and start sharing your prompts and cursor rules with the community. 
              All contributions are welcome.
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">How can I report issues or bugs?</h3>
            <p className="text-sm text-gray-600">
              Please send detailed bug reports to my email with steps to reproduce the issue. 
              Screenshots are always helpful!
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Do you accept feature requests?</h3>
            <p className="text-sm text-gray-600">
              Yes! I'm always looking to improve Promptu. Feel free to share your ideas via any contact method. 
              Community feedback drives development.
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Is Promptu open source?</h3>
            <p className="text-sm text-gray-600">
              Currently, Promptu is not open source, but I'm considering it for the future. 
              Stay tuned for updates on this front.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 