// app/loading.tsx

export default function GlobalLoading() {
  return (
    <div className="min-h-screen w-full bg-slate-50/50 backdrop-blur-sm flex flex-col items-center justify-center p-4 fixed inset-0 z-50">
      <div className="w-full max-w-sm bg-white border border-slate-100/80 rounded-3xl p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center space-y-6">

        {/* Animated Brand Glow & Spinner */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Loading...
          </h3>
          <p className="text-xs text-slate-400">
            Fetching data, please wait a moment.
          </p>
        </div>

        {/* Skeleton Indicator */}
        <div className="w-full space-y-2 pt-2">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full w-2/5 animate-[pulse_1.2s_ease-in-out_infinite]" />
          </div>
        </div>

      </div>
    </div>
  );
}

