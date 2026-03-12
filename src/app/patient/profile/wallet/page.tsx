"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [addAmount, setAddAmount] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchWallet = async () => {
    const res = await fetch("/api/patient/wallet");
    if (res.ok) {
      const data = await res.json();
      setBalance(data.balance);
      setTransactions(data.transactions);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const res = await fetch("/api/patient/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(addAmount) }),
    });
    setAdding(false);
    if (res.ok) {
      setAddAmount("");
      setShowAddForm(false);
      fetchWallet();
    }
  };

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <div className="space-y-5 pb-20 md:pb-6 md:pl-56">
      <div className="flex items-center gap-3">
        <Link href="/patient/profile" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Wallet</h1>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-6">
        <p className="text-green-100 text-sm mb-1">Available Balance</p>
        <p className="text-4xl font-bold mb-4">₹{balance.toFixed(2)}</p>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Money
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Add Money</h2>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setAddAmount(amount.toString())}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  addAmount === amount.toString()
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-200 text-gray-700 hover:border-green-400"
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>
          <form onSubmit={handleAddMoney} className="flex gap-3">
            <input
              type="number"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter amount"
              min={1}
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">Demo: money added directly to wallet</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">No transactions yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === "CREDIT" ? "bg-green-50" : "bg-red-50"}`}
                  >
                    {tx.type === "CREDIT" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(tx.createdAt), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold text-sm ${tx.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}
                >
                  {tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
