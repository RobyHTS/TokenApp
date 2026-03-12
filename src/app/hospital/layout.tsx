import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import HospitalNav from "@/components/hospital/HospitalNav";

export default async function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "hospital") {
    redirect("/auth/hospital/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalNav hospitalName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
