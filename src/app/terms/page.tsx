import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-500 mb-8">Last updated: March 2025</p>
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">By using Reserve Your Token, you agree to these terms and conditions. If you do not agree, please do not use our service.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Service Description</h2>
              <p className="text-gray-600 leading-relaxed">Reserve Your Token is a digital platform that allows patients to book hospital consultation tokens online and track queue status in real-time.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Wallet & Payments</h2>
              <p className="text-gray-600 leading-relaxed">All token bookings require payment from your wallet. Cancelled tokens are eligible for full refunds to your wallet. We do not process external bank transfers.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. User Responsibilities</h2>
              <p className="text-gray-600 leading-relaxed">You are responsible for providing accurate information, maintaining the security of your account, and arriving at the hospital within a reasonable time of your token being called.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">We are not liable for delays caused by hospital operations, doctor emergencies, or circumstances beyond our control.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
