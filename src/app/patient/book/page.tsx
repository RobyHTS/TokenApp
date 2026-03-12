"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, ChevronRight, Stethoscope } from "lucide-react";
import Link from "next/link";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
  doctors: Doctor[];
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  status: string;
  tokenEnabled: boolean;
}

export default function BookTokenPage() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [search, setSearch] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/hospitals").then((r) => r.json()).then(setHospitals);
  }, []);

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleBook = async () => {
    if (!selectedDoctor) return;
    setBooking(true);
    setError("");

    const res = await fetch("/api/patient/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: selectedDoctor.id }),
    });

    const data = await res.json();
    setBooking(false);

    if (res.ok) {
      router.push("/patient/tokens");
    } else {
      setError(data.error || "Booking failed");
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6 md:pl-56">
      <div className="flex items-center gap-3">
        <Link href="/patient/home" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {selectedDoctor
            ? "Confirm Booking"
            : selectedHospital
            ? "Select Doctor"
            : "Select Hospital"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Step 1: Hospital */}
      {!selectedHospital && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Search hospitals..."
            />
          </div>
          <div className="space-y-2">
            {filteredHospitals.map((hospital) => (
              <button
                key={hospital.id}
                onClick={() => setSelectedHospital(hospital)}
                className="w-full text-left bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:border-green-200 hover:bg-green-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{hospital.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{hospital.location}</p>
                  <p className="text-xs text-gray-400 mt-1">{hospital.doctors.length} doctor(s)</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>
            ))}
            {filteredHospitals.length === 0 && (
              <p className="text-center text-gray-500 py-8 text-sm">No hospitals found</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Doctor */}
      {selectedHospital && !selectedDoctor && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedHospital(null)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {selectedHospital.name}
          </button>
          <div className="space-y-2">
            {selectedHospital.doctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => (doctor.tokenEnabled ? setSelectedDoctor(doctor) : null)}
                disabled={!doctor.tokenEnabled}
                className={`w-full text-left bg-white rounded-xl p-4 border shadow-sm transition-colors flex items-center justify-between ${
                  doctor.tokenEnabled
                    ? "border-gray-100 hover:border-green-200 hover:bg-green-50 cursor-pointer"
                    : "border-gray-100 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doctor.name}</p>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(doctor.status)}`}>
                    {getStatusLabel(doctor.status)}
                  </span>
                  {!doctor.tokenEnabled && <span className="text-xs text-red-400">Off</span>}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {selectedDoctor && selectedHospital && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedDoctor.name}</p>
                  <p className="text-sm text-gray-500">{selectedDoctor.specialization}</p>
                  <p className="text-xs text-gray-400">{selectedHospital.name}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm px-1">
                <span className="text-gray-600">Token Fee</span>
                <span className="font-semibold text-gray-900">₹100</span>
              </div>
              <div className="flex justify-between text-sm px-1 pb-2 border-b border-gray-100">
                <span className="text-gray-600">Payment</span>
                <span className="text-green-600 font-medium">Wallet</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleBook}
              disabled={booking}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {booking ? "Booking..." : "Confirm & Book"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
