import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PatientNav from "@/components/patient/PatientNav";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "patient") {
    redirect("/auth/patient/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNav patientName={session.name} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
