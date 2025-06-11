import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  TrendingUp, 
  Target, 
  Mail, 
  CheckCircle, 
  BarChart3,
  Globe,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function AdvertisePage() {
  const stats = [
    { label: "Monthly Visitors", value: "15,000+", icon: Users },
    { label: "Page Views", value: "45,000+", icon: BarChart3 },
    { label: "Community Members", value: "3,200+", icon: Globe },
    { label: "Growth Rate", value: "+25%", icon: TrendingUp },
  ];

  const packages = [
    {
      name: "Sidebar Banner",
      price: "$299",
      period: "per month",
      description: "Premium placement in the right sidebar of all pages",
      features: [
        "300x250 banner placement",
        "Visible on all pages",
        "Click tracking & analytics",
        "Monthly performance report"
      ],
      popular: false
    },
    {
      name: "Featured Listing",
      price: "$499",
      period: "per month", 
      description: "Promote your AI tool or service as a featured listing",
      features: [
        "Featured in homepage hero",
        "Dedicated landing page",
        "Newsletter inclusion",
        "Social media promotion",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Sponsored Content",
      price: "$799",
      period: "per month",
      description: "Native content integration with our editorial team",
      features: [
        "Custom article/tutorial",
        "SEO optimized content",
        "Social media amplification",
        "Newsletter feature",
        "Permanent archive"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Advertise with Promptu
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Reach thousands of AI enthusiasts, developers, and businesses actively seeking 
            AI solutions. Join the leading prompt marketplace and grow your brand.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Advertise */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Why Advertise with Promptu?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Targeted Audience</h3>
                <p className="text-gray-600">
                  Reach AI enthusiasts, developers, and businesses actively looking for AI solutions and tools.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">High Engagement</h3>
                <p className="text-gray-600">
                  Our community is highly engaged with average session times of 4+ minutes and low bounce rates.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Growing Platform</h3>
                <p className="text-gray-600">
                  Join us early as we experience 25% month-over-month growth in users and engagement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Packages */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Advertising Packages
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'border-black' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-black text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{pkg.price}</span>
                    <span className="text-gray-600">/{pkg.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-7 w-7 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${pkg.popular ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="bg-gray-50">
          <CardContent className="text-center py-12">
            <Mail className="h-16 w-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Contact our advertising team to discuss custom packages, bulk discounts, 
              or any questions about advertising with Promptu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:ads@promptu.dev">Contact Advertising Team</a>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/media-kit">Download Media Kit</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-4">
            All advertising packages include detailed analytics, monthly reports, and dedicated support.
          </p>
          <p className="text-sm">
            Custom packages available for enterprise clients. Contact us for volume discounts and long-term partnerships.
          </p>
        </div>
      </div>
    </div>
  );
} 