"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

const dollar = (n: number) => `$${Number(n || 0).toLocaleString("en-US")}`;

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}

// Defined at module level (NOT inside FlatEmiCalculator) so it isn't re-created on every render
function Slider({ label, value, min, max, step, suffix, onChange }: SliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-600"
      />
    </div>
  );
}

export default function FlatEmiCalculator({ price }: { price: number }) {
  const [downPct, setDownPct] = useState(30);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(15);

  const { loan, down, emi, total } = useMemo(() => {
    const down = (price * downPct) / 100;
    const loan = price - down;
    const r = rate / 100 / 12;
    const n = years * 12;
    const emi =
      loan <= 0 ? 0 : r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { loan, down, emi, total: emi * n };
  }, [price, downPct, rate, years]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator size={16} className="text-teal-600" />
        <h3 className="text-sm font-bold text-slate-800">Home Loan Calculator</h3>
      </div>

      <Slider label="Down payment" value={downPct} min={10} max={80} step={5} suffix="%" onChange={setDownPct} />
      <Slider label="Interest rate" value={rate} min={5} max={20} step={0.5} suffix="%" onChange={setRate} />
      <Slider label="Loan term" value={years} min={1} max={25} step={1} suffix=" yrs" onChange={setYears} />

      <div className="bg-teal-50 rounded-xl p-4 text-center">
        <p className="text-[11px] text-teal-700 font-medium">Estimated monthly EMI</p>
        <p className="text-2xl font-extrabold text-teal-700">{dollar(emi)}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Down payment", v: down },
          { l: "Loan amount", v: loan },
          { l: "Total payable", v: total },
        ].map(({ l, v }) => (
          <div key={l} className="bg-slate-50 rounded-lg p-2">
            <p className="text-[10px] text-slate-400">{l}</p>
            <p className="text-[11px] font-bold text-slate-800">{dollar(v)}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400">Estimate only. Actual rates depend on your bank.</p>
    </div>
  );
}

