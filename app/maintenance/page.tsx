// app/maintenance/page.tsx
export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm border border-amber-200">
        🛠️
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        System Under Scheduled Maintenance
      </h1>
      <p className="text-slate-500 max-w-md text-sm leading-relaxed">
        We are currently upgrading LuxuryStays to enhance your booking experience.
        Please check back shortly!
      </p>
    </div>
  );
}

