import Link from "next/link";
import { ArrowRight, Zap, Paintbrush, Code, Rocket } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Zap className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">AI Website Builder</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
            Log In
          </Link>
          <Link 
            href="/auth/signup" 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Build Websites with
            <span className="text-indigo-600"> AI Magic</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create full-stack web applications without coding. Design visually, generate code with AI, 
            and deploy instantly. Perfect for founders, entrepreneurs, and creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center group"
            >
              Start Building Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/demo"
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-600 hover:text-white transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Paintbrush className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Visual Design</h3>
            <p className="text-gray-600">
              Drag and drop components to design your website visually. No design experience needed.
            </p>
          </div>

          <div className="text-center p-8 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Code className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Code Generation</h3>
            <p className="text-gray-600">
              Our AI generates production-ready React components and full-stack applications from your designs.
            </p>
          </div>

          <div className="text-center p-8 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">One-Click Deploy</h3>
            <p className="text-gray-600">
              Deploy your website instantly to production with integrated hosting and database setup.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center bg-white rounded-2xl p-12 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Build Your Dream Website?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of founders who are building without code
          </p>
          <Link 
            href="/auth/signup"
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center group"
          >
            Get Started for Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
//   );
// }
