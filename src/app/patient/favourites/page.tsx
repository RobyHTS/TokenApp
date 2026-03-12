"use client";

import { useState, useEffect } from "react";
import { Heart, Stethoscope, MapPin, ChevronRight } from "lucide-react";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface Favorite {
  id: string;
  hospital?: { id: string; name: string; location: string } | null;
  doctor?: {
    id: string;
    name: string;
    specialization: string;
    status: string;
    hospital: { name: string };
  } | null;
}

export default function FavouritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/favourites")
      .then((r) => r.json())
      .then((data) => {
        setFavorites(data);
        setLoading(false);
      });
  }, []);

  const removeFavorite = async (fav: Favorite) => {
    await fetch("/api/patient/favourites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hospitalId: fav.hospital?.id, doctorId: fav.doctor?.id }),
    });
    setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
  };

  if (loading)
    return (
      <div className="flex justify-center py-12 md:pl-56">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="space-y-5 pb-20 md:pb-6 md:pl-56">
      <h1 className="text-2xl font-bold text-gray-900">Favourites</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No favourites yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Mark doctors or hospitals as favourites for quick access
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                  {fav.doctor ? (
                    <Stethoscope className="w-5 h-5 text-pink-600" />
                  ) : (
                    <MapPin className="w-5 h-5 text-pink-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{fav.doctor?.name || fav.hospital?.name}</p>
                  <p className="text-xs text-gray-500">
                    {fav.doctor
                      ? `${fav.doctor.specialization} • ${fav.doctor.hospital.name}`
                      : fav.hospital?.location}
                  </p>
                  {fav.doctor && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getStatusColor(fav.doctor.status)}`}
                    >
                      {getStatusLabel(fav.doctor.status)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeFavorite(fav)}
                  className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
