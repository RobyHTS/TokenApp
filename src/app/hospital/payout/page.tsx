"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, CreditCard, Smartphone, ShieldCheck,
  CheckCircle, AlertCircle, IndianRupee,
} from "lucide-react";
import Link from "next/link";

interface PayoutDetails {
  upiId?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: string;
}

const BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
  "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda",
  "Canara Bank", "Union Bank of India", "IndusInd Bank", "YES Bank",
  "IDFC First Bank", "Federal Bank", "South Indian Bank", "Other",
];

export default function PayoutDetailsPage() {
  const router = useRouter();
  const [form, setForm] = useState<PayoutDetails>({
    upiId: "", accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "", accountType: "Current",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/hospital/payout-details")
      .then((r) => r.json())
      .then((data) => {
        if (data?.accountHolderName || data?.upiId) {
          setForm({
            upiId: data.upiId ?? "",
            accountHolderName: data.accountHolderName ?? "",
            bankName: data.bankName ?? "",
            accountNumber: data.accountNumber ?? "",
            ifscCode: data.ifscCode ?? "",
            accountType: data.accountType ?? "Current",
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.upiId && !form.accountNumber) {
      setError("Please provide at least a UPI ID or Bank Account details.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/hospital/payout-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Failed to save. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payout Details</h1>
          <p className="text-sm text-gray-500">Bank & UPI information for revenue payouts</p>
        </div>
      </div>

      {/* Why we ask */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <IndianRupee className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-blue-900 mb-1">Why do we need this?</p>
          <p className="text-sm text-blue-700 leading-relaxed">
            Your hospital earns <strong>30% of every token fee</strong> collected through the platform.
            We use your bank account or UPI ID to transfer your accumulated payout directly to you.
            Your details are stored securely and only used for revenue transfers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* UPI Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">UPI Details</p>
              <p className="text-xs text-gray-500">Fastest way to receive payouts</p>
            </div>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
            <input
              type="text"
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              placeholder="e.g. hospital@paytm, 9876543210@ybl"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-2">
              Accepts all UPI handles: @paytm, @ybl, @okicici, @okhdfcbank, @axl, etc.
            </p>
          </div>
        </div>

        {/* Bank Account Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Bank Account Details</p>
              <p className="text-xs text-gray-500">For NEFT / IMPS transfers</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Holder Name <span className="text-gray-400 font-normal">(as per bank records)</span>
              </label>
              <input
                type="text"
                value={form.accountHolderName}
                onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                placeholder="e.g. Apollo Hospitals Pvt Ltd"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
                <select
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select bank</option>
                  {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
                <select
                  value={form.accountType}
                  onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="Current">Current</option>
                  <option value="Savings">Savings</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                placeholder="Enter account number"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">IFSC Code</label>
              <input
                type="text"
                value={form.ifscCode}
                onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                placeholder="e.g. SBIN0001234"
                maxLength={11}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase"
              />
              <p className="text-xs text-gray-400 mt-1.5">11-character code found on your cheque book or passbook</p>
            </div>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Your payment details are encrypted and stored securely. We never share your information with third parties. Payouts are processed manually by our finance team after verification.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-sm text-green-700 font-medium">Payout details saved successfully!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <CreditCard className="w-4 h-4" />
          {saving ? "Saving..." : "Save Payout Details"}
        </button>
      </form>
    </div>
  );
}
