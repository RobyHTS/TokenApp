import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: March 2025</p>
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed">We collect your name, phone number, and transaction history to provide our token booking services. We do not collect sensitive medical information.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed">Your information is used solely to operate the token booking system, send notifications about your tokens, and process wallet transactions.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Sharing</h2>
              <p className="text-gray-600 leading-relaxed">We share your name and phone number with the hospital/doctor you book with. We do not sell your data to third parties.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">Your passwords are encrypted and stored securely. Sessions are protected using HTTP-only cookies.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">You can delete your account at any time from the Profile page. Upon deletion, all your personal data will be permanently removed.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
