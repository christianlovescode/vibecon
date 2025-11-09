"use client";

import Link from "next/link";
import Logo from "@/components/logo";
import Image from "next/image";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "var(--font-geist-mono, monospace)" }}
    >
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/dashboard">
              <button className="v2-button-secondary text-sm">Sign In</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-12 md:py-24 overflow-hidden">
        {/* Background with dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.12) 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
          <div
            className="inline-block px-3 py-1 bg-gray-100 border border-gray-900 mb-6"
            style={{ borderRadius: 0 }}
          >
            <span className="text-xs font-medium text-gray-900">
              AI-POWERED LEAD GENERATION
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-gray-900 mb-6 leading-tight font-sans">
            Outreach that feels like you&apos;ve read their mind.
          </h1>

          <p className="text-base md:text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed font-sans">
            Cold emails shouldn&apos;t feel personalized – they should just feel
            relevant. Show prospects you understand their world without spending
            hours on research. Start your first campaign today.
          </p>

          {/* Email Capture */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="you@example.com"
                className="v2-input w-full sm:flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email) {
                    router.push(
                      `/dashboard?email=${encodeURIComponent(email)}`
                    );
                  }
                }}
              />
              <button
                className="v2-button-primary flex items-center justify-center gap-2 px-6 w-full sm:w-auto"
                style={{
                  backgroundColor: "black",
                  color: "#fff",
                  borderColor: "black",
                }}
                onClick={() => {
                  if (email) {
                    router.push(
                      `/dashboard?email=${encodeURIComponent(email)}`
                    );
                  }
                }}
                disabled={!email}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-black py-20">
        <section className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left: Header */}
            <div className="lg:sticky lg:top-8">
              <div
                className="inline-block px-3 py-1 bg-black border border-white mb-8"
                style={{ borderRadius: 0 }}
              >
                <span className="text-xs font-medium text-gray-300">
                  AI-POWERED WARM INTRODUCTIONS
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white font-sans leading-tight">
                Vibecon&apos;s workflow has added millions in ARR for hundreds
                of founders.
              </h2>
            </div>

            {/* Right: Steps List */}
            <div>
              <div className="space-y-8">
                <div className="border-b border-gray-800 pb-6">
                  <p className="text-sm text-gray-500 mb-2">STEP 1:</p>
                  <p className="text-lg text-gray-200 font-sans">
                    Add your target prospects via LinkedIn URLs
                  </p>
                </div>

                <div className="border-b border-gray-800 pb-6">
                  <p className="text-sm text-gray-500 mb-2">STEP 2:</p>
                  <p className="text-lg text-gray-200 font-sans">
                    AI finds and ranks your mutual connections to each prospect
                  </p>
                </div>

                <div className="border-b border-gray-800 pb-6">
                  <p className="text-sm text-gray-500 mb-2">STEP 3:</p>
                  <p className="text-lg text-gray-200 font-sans">
                    Personalized intro requests generated in your voice
                  </p>
                </div>

                <div className="border-b border-gray-800 pb-6">
                  <p className="text-sm text-gray-500 mb-2">STEP 4:</p>
                  <p className="text-lg text-gray-200 font-sans">
                    You review, edit, and approve before anything sends
                  </p>
                </div>

                <div className="pb-6">
                  <p className="text-sm text-gray-500 mb-2">STEP 5:</p>
                  <p className="text-lg text-gray-200 font-sans">
                    Track which intros convert to meetings and optimize
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-3 font-sans">
            Pricing
          </h2>
          <p className="text-lg text-gray-600 font-sans">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lite Plan */}
          <div className="v2-card">
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">
              Lite
            </h3>
            <p className="text-3xl font-bold text-gray-900 mb-1 font-sans">
              $49
              <span className="text-lg text-gray-500 font-normal">/month</span>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Sprinkle in warm outbound to your sales process
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                150 leads per month
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                AI finds mutual connections
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                Message generation
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                Email support
              </li>
            </ul>

            <Link href="/dashboard">
              <button className="v2-button-primary w-full">Get started</button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="v2-card border-2 border-gray-900">
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">
              Pro
            </h3>
            <p className="text-3xl font-bold text-gray-900 mb-1 font-sans">
              $300
              <span className="text-lg text-gray-500 font-normal">/month</span>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              For founders and sales teams wanting to scale warm outbound
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                Unlimited leads
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                All Lite features
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                Priority support
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                Advanced analytics
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                Conversion tracking
              </li>
            </ul>

            <Link href="/dashboard">
              <button className="v2-button-primary w-full">Get started</button>
            </Link>
          </div>

          {/* Agency Plan */}
          <div className="v2-card bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">
              Agency
            </h3>
            <p className="text-3xl font-bold text-gray-900 mb-1 font-sans">
              $999+
              <span className="text-lg text-gray-500 font-normal">/month</span>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Hands-off, done-for-you warm outreach service
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                Strategy & targeting
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                Lead sourcing & outreach
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                Message optimization
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                Weekly performance reviews
              </li>
            </ul>

            <a href="mailto:contact@vibecon.com?subject=Agency Plan Inquiry">
              <button className="v2-button-secondary w-full">
                Let&apos;s chat
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-3 font-sans">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <details
              className="bg-white border border-gray-200 p-4"
              style={{ borderRadius: 0 }}
            >
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How does Vibecon find mutual connections?
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </summary>
              <p className="text-sm text-gray-600 mt-3">
                After you connect your LinkedIn account, Vibecon syncs your
                connections and uses LinkedIn&apos;s API to find which of your
                connections know your target prospects. We then score each
                relationship based on how well they know each other.
              </p>
            </details>

            <details
              className="bg-white border border-gray-200 p-4"
              style={{ borderRadius: 0 }}
            >
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                Will this spam my LinkedIn network?
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </summary>
              <p className="text-sm text-gray-600 mt-3">
                No. You approve every message before it sends. Vibecon spaces
                out requests (max 30/day) and tracks who you&apos;ve contacted
                to avoid over-asking. We also blacklist any mutuals who prefer
                not to be contacted.
              </p>
            </details>

            <details
              className="bg-white border border-gray-200 p-4"
              style={{ borderRadius: 0 }}
            >
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                Can I customize the messages?
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </summary>
              <p className="text-sm text-gray-600 mt-3">
                Yes! Configure your company info, writing style guidelines, and
                tone preferences in Settings. You can also edit any generated
                message before approving it. The AI learns from your
                preferences.
              </p>
            </details>

            <details
              className="bg-white border border-gray-200 p-4"
              style={{ borderRadius: 0 }}
            >
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What if I don&apos;t have many connections?
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </summary>
              <p className="text-sm text-gray-600 mt-3">
                Vibecon works best with 200+ connections, but you can start with
                fewer. We find mutuals wherever they exist and maximize your
                existing network. As you grow your LinkedIn network, Vibecon
                becomes more effective.
              </p>
            </details>

            <details
              className="bg-white border border-gray-200 p-4"
              style={{ borderRadius: 0 }}
            >
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How long until I see results?
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </summary>
              <p className="text-sm text-gray-600 mt-3">
                Most users get their first intro request approved within 24-48
                hours. Mutuals typically respond within 3-5 days. You can track
                everything in real-time through the dashboard.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 font-sans">
          Ready to stop cold emailing?
        </h2>
        <p className="text-lg text-gray-600 mb-8 font-sans">
          Join founders using warm intros to book more meetings.
        </p>
        <Link href="/dashboard">
          <button className="v2-button-primary text-base px-8 py-3 flex items-center gap-2 mx-auto">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2025 Vibecon. All rights reserved.
            </p>
            <div className="flex gap-4 md:gap-6 text-center">
              <a
                href="mailto:support@vibecon.com"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Support
              </a>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Documentation
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
