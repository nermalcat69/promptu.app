export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Privacy Policy</h1>
      
      <div className="prose prose-neutral max-w-none">
        <p className="text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">Our Commitment to Privacy</h2>
        <p className="mb-4">
          At Promptu, we take your privacy seriously. This policy describes what personal information we collect and how we use it. Our primary goal is to provide a secure and trustworthy platform for sharing and discovering AI prompts and cursor rules.
        </p>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">Information We Collect</h2>
        <p className="mb-4">
          We collect the following types of information:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Account Information:</strong> When you create an account, we collect your email, name, username, and authentication details.</li>
          <li><strong>User Content:</strong> Prompts, cursor rules, descriptions, and other content you choose to share on our platform.</li>
          <li><strong>Interaction Data:</strong> Information about your interactions with content, such as upvotes, copies, and views.</li>
          <li><strong>Usage Data:</strong> Information about how you use our website, such as the features you access and the time spent on the site.</li>
          <li><strong>Device Information:</strong> Information about the device and browser you use to access our service.</li>
        </ul>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Provide and maintain our platform</li>
          <li>Display your content to other users when you choose to share it</li>
          <li>Improve and personalize your experience</li>
          <li>Communicate with you about your account or our service</li>
          <li>Monitor usage patterns to improve our platform</li>
          <li>Protect against unauthorized access and security threats</li>
          <li>Generate analytics about popular content and user engagement</li>
        </ul>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">Information Sharing</h2>
        <p className="mb-4">
          When you publish content on Promptu, it becomes publicly visible to other users. This includes:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Your published prompts and cursor rules</li>
          <li>Your username and profile information</li>
          <li>Public statistics like upvotes and copy counts</li>
        </ul>
        <p className="mb-4">
          We do not sell your personal information to third parties. We may share aggregated, anonymized data for analytics purposes.
        </p>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, secure authentication systems, and regular security audits.
        </p>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">Data Retention</h2>
        <p className="mb-4">
          We retain your personal information and content only for as long as necessary to fulfill the purposes outlined in this privacy policy, or as required by law. You can delete your account and associated content at any time through your account settings.
        </p>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">Third-Party Services</h2>
        <p className="mb-4">
          Promptu uses third-party services for authentication, analytics, and platform functionality. These services may collect information sent by your browser as part of their operations. We carefully select services that maintain strong privacy practices.
        </p>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">Your Rights</h2>
        <p className="mb-4">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your personal information and content</li>
          <li>Object to our processing of your information</li>
          <li>Request a copy of your information in a structured, machine-readable format</li>
          <li>Control the visibility of your content (public/private settings)</li>
        </ul>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">Cookies and Tracking</h2>
        <p className="mb-4">
          We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze usage patterns. You can control cookie settings through your browser, though some features may not work properly if cookies are disabled.
        </p>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">Changes to This Policy</h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we may also notify users via email.
        </p>
        
        <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, concerns about your data, or requests regarding your personal information, please contact us at <a href="mailto:meow@nermalcat69.dev" className="text-blue-700 underline hover:text-blue-800">meow@nermalcat69.dev</a>.
        </p>
        
        <p className="text-sm text-muted-foreground mt-10">
          This privacy policy is effective as of the date listed above and applies to all users of the Promptu platform.
        </p>
      </div>
    </div>
  );
} 