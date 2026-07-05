import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFBFC] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#1976D2]">
            Enterprise Monitoring & Financial Management System
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-[#0F4C81] sm:text-6xl">
            Welcome to EMTS
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#64748B]">
            The unified enterprise portal for field operations, finance, and project delivery. Log in to access your workspace or register your company to get started.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-[#0F4C81] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-[#0B3A65]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-[#E6ECF2] bg-white px-8 py-4 text-base font-semibold text-[#0F4C81] shadow-sm transition hover:bg-slate-50"
          >
            Daftarkan Perusahaan
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#E6ECF2] bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,76,129,0.08)]">
            <h2 className="text-2xl font-semibold text-[#0F4C81]">Modern access for teams</h2>
            <p className="mt-4 text-base leading-7 text-[#64748B]">
              Role-aware dashboards, secure authentication, and audit-ready workflows for administrators, managers, and staff.
            </p>
          </div>
          <div className="rounded-3xl border border-[#E6ECF2] bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,76,129,0.08)]">
            <h2 className="text-2xl font-semibold text-[#0F4C81]">Simple company onboarding</h2>
            <p className="mt-4 text-base leading-7 text-[#64748B]">
              Register your organization and wait for a license activation code from EMTS administration to complete setup.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
