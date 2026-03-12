import Link from "next/link";
import {
  Clock,
  Smartphone,
  Bell,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  Hospital,
  UserCheck,
  CalendarCheck,
  AlertCircle
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Reserve Your Token</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/patient/login"
                className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                Patient Login
              </Link>
              <Link
                href="/auth/hospital/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Hospital Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100">
              <CheckCircle className="w-4 h-4" />
              Digital Hospital Queue Management
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Skip the Wait,
              <span className="text-blue-600"> Book Your Token</span>
              <br />From Home
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              No more early morning rushes. Book your hospital consultation token online,
              track the queue in real-time, and arrive just in time for your appointment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/patient/register"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg"
              >
                Book Your Token
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/hospital/register"
                className="flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all"
              >
                Register Hospital
                <Hospital className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { label: "Active Hospitals", value: "50+", icon: Hospital },
              { label: "Tokens Booked Daily", value: "500+", icon: CalendarCheck },
              { label: "Time Saved (avg)", value: "2 hrs", icon: Clock },
              { label: "Happy Patients", value: "10K+", icon: Users },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Problem We Solve</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Patients face daily frustrations when visiting hospitals for outpatient consultations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "📞",
                title: "Endless Phone Calls",
                description: "Patients need to call the hospital multiple times just to check doctor availability"
              },
              {
                icon: "🚶",
                title: "Travel Just for Token",
                description: "Patients travel to the hospital only to collect a physical token, then come back again"
              },
              {
                icon: "⏰",
                title: "Unknown Wait Times",
                description: "Patients don't know their turn number until they physically reach the hospital"
              },
              {
                icon: "🏥",
                title: "Long Waiting Queues",
                description: "Hours spent waiting at hospitals for regular checkups due to poor queue management"
              },
              {
                icon: "🚨",
                title: "Emergency Disruptions",
                description: "No way to know if the doctor is attending an emergency or their current availability"
              },
              {
                icon: "💼",
                title: "Med Rep Crowding",
                description: "Medical representatives disrupt patient flow with unstructured hospital visits"
              }
            ].map((problem) => (
              <div key={problem.title} className="p-6 bg-red-50 rounded-2xl border border-red-100">
                <div className="text-3xl mb-4">{problem.icon}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{problem.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Solution</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              A comprehensive digital token booking and live queue management system designed for hospitals
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Smartphone,
                title: "Book From Home",
                description: "Reserve your consultation token online — no travel, no phone calls"
              },
              {
                icon: Clock,
                title: "Live Queue Tracking",
                description: "See real-time queue position and estimated wait time from anywhere"
              },
              {
                icon: Bell,
                title: "Instant Notifications",
                description: "Get notified when your turn is near or if the doctor's status changes"
              },
              {
                icon: BarChart3,
                title: "Smart Analytics",
                description: "Hospitals get revenue insights and workflow management tools"
              }
            ].map((feature) => (
              <div key={feature.title} className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <feature.icon className="w-10 h-10 text-blue-200 mb-4" />
                <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features for Patients */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4 border border-green-100">
                <UserCheck className="w-4 h-4" />
                For Patients
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Your Health, Your Time</h2>
              <div className="space-y-4">
                {[
                  { icon: "🎫", text: "Book token online in seconds" },
                  { icon: "📍", text: "Track live queue from home" },
                  { icon: "🔔", text: "Get notified when it's your turn" },
                  { icon: "👨‍⚕️", text: "See real-time doctor availability" },
                  { icon: "💰", text: "Simple wallet-based payments" },
                  { icon: "⭐", text: "Save favourite doctors & hospitals" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/patient/register"
                className="mt-8 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900">Your Token</span>
                  <span className="text-2xl font-bold text-blue-600">#42</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Dr. Rajesh Kumar • Cardiology</div>
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Current Token: 38 • ~20 min wait
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">4</div>
                  <div className="text-xs text-gray-500">Tokens Ahead</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-green-600">~20m</div>
                  <div className="text-xs text-gray-500">Est. Wait</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Hospitals */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 order-2 lg:order-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                <h3 className="font-semibold text-gray-900 mb-4">Today's Overview</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total", value: "48", color: "text-blue-600" },
                    { label: "Done", value: "32", color: "text-green-600" },
                    { label: "Pending", value: "16", color: "text-yellow-600" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Revenue Today</span>
                  <AlertCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">₹4,800</div>
                <div className="text-xs text-gray-500 mt-1">+12% from yesterday</div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4 border border-blue-100">
                <Hospital className="w-4 h-4" />
                For Hospitals
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Smarter Hospital Management</h2>
              <div className="space-y-4">
                {[
                  { icon: "🏥", text: "Digital queue management system" },
                  { icon: "👩‍⚕️", text: "Doctor schedule & availability control" },
                  { icon: "📊", text: "Revenue analytics & payout tracking" },
                  { icon: "🔔", text: "Auto-notify patients on status changes" },
                  { icon: "✋", text: "Manual token creation for walk-ins" },
                  { icon: "📅", text: "Weekly schedule configuration per doctor" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/hospital/register"
                className="mt-8 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Register Your Hospital
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Hospital Experience?</h2>
          <p className="text-gray-400 text-xl mb-10">
            Join hundreds of hospitals already using Reserve Your Token to improve patient experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/patient/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book a Token Now
            </Link>
            <Link
              href="/auth/hospital/register"
              className="border border-gray-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 transition-colors"
            >
              Register Hospital
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <span className="text-white font-semibold">Reserve Your Token</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
            <div className="text-sm">© 2025 Reserve Your Token. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
