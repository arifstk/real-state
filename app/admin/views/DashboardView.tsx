// "use client";

// import { useEffect, useState } from "react";
// import { Users, Building2, BedDouble, DollarSign, ShoppingBag, ConciergeBell } from "lucide-react";

// interface HotelStat {
//   _id: string;
//   hotelName: string;
//   city: string;
//   totalRooms: number;
//   totalOrders: number;
//   totalRevenue: number;
//   activeServingRooms: number;
// }

// interface DashboardData {
//   summary: {
//     users: number;
//     hotels: number;
//     rooms: number;
//     totalRevenue: number;
//     totalOrders: number;
//     activeServingRooms: number;
//   };
//   hotelStats: HotelStat[];
// }

// export default function AdminDashboardView() {
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("/api/admin/stats")
//       .then((res) => res.json())
//       .then((resData) => setData(resData))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return <div className="p-8 text-slate-400 font-medium">Loading metrics...</div>;
//   }

//   const summary = data?.summary || {
//     users: 0,
//     hotels: 0,
//     rooms: 0,
//     totalRevenue: 0,
//     totalOrders: 0,
//     activeServingRooms: 0,
//   };

//   const cards = [
//     { label: "Total Revenue", count: `$${summary.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
//     { label: "Total Orders", count: summary.totalOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
//     { label: "Active Serving Rooms", count: summary.activeServingRooms, icon: ConciergeBell, color: "text-amber-600 bg-amber-50" },
//     { label: "Total Hotels", count: summary.hotels, icon: Building2, color: "text-teal-600 bg-teal-50" },
//     { label: "Total Rooms", count: summary.rooms, icon: BedDouble, color: "text-purple-600 bg-purple-50" },
//     { label: "Total Users", count: summary.users, icon: Users, color: "text-indigo-600 bg-indigo-50" },
//   ];

//   return (
//     <div className="space-y-8">
//       <div>
//         <h2 className="text-xl font-bold text-slate-800">Overview Dashboard</h2>
//         <p className="text-xs text-slate-500 mt-1">Platform-wide statistics and hotel performance metrics.</p>
//       </div>

//       {/* Metric Cards Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//         {cards.map((card, idx) => {
//           const Icon = card.icon;
//           return (
//             <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
//               <div className={`p-3.5 rounded-xl ${card.color}`}>
//                 <Icon size={22} />
//               </div>
//               <div>
//                 <p className="text-xs font-medium text-slate-500">{card.label}</p>
//                 <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{card.count}</h3>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Hotel-Wise Performance Table */}
//       <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
//         <div className="p-5 border-b border-slate-100">
//           <h3 className="font-bold text-slate-800 text-base">Hotel-Wise Breakdown</h3>
//           <p className="text-xs text-slate-400 mt-0.5">Revenue, active room service, and booking metrics per property.</p>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse text-xs text-slate-600">
//             <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
//               <tr>
//                 <th className="p-4">Hotel Name</th>
//                 <th className="p-4">Location</th>
//                 <th className="p-4 text-center">Total Rooms</th>
//                 <th className="p-4 text-center">Serving Rooms</th>
//                 <th className="p-4 text-center">Total Orders</th>
//                 <th className="p-4 text-right">Total Revenue</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {data?.hotelStats && data.hotelStats.length > 0 ? (
//                 data.hotelStats.map((hotel) => (
//                   <tr key={hotel._id} className="hover:bg-slate-50/50 transition">
//                     <td className="p-4 font-bold text-slate-800">{hotel.hotelName}</td>
//                     <td className="p-4 text-slate-500">{hotel.city || "—"}</td>
//                     <td className="p-4 text-center font-medium">{hotel.totalRooms}</td>
//                     <td className="p-4 text-center">
//                       <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-md">
//                         {hotel.activeServingRooms}
//                       </span>
//                     </td>
//                     <td className="p-4 text-center font-medium">{hotel.totalOrders}</td>
//                     <td className="p-4 text-right font-extrabold text-emerald-600">
//                       ${hotel.totalRevenue.toLocaleString()}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={6} className="p-6 text-center text-slate-400">
//                     No hotel metrics available.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { Users, Building2, Home, DollarSign, ShoppingBag, KeyRound } from "lucide-react";

interface PropertyStat {
  _id: string;
  propertyName: string;
  city: string;
  totalFlats: number;
  totalOrders: number;
  totalRevenue: number;
  activeAvailableFlats: number;
}

interface DashboardData {
  summary: {
    users: number;
    properties: number;
    flats: number;
    totalRevenue: number;
    totalOrders: number;
    activeAvailableFlats: number;
  };
  propertyStats: PropertyStat[];
}

export default function AdminDashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400 font-medium">Loading metrics...</div>;
  }

  const summary = data?.summary || {
    users: 0,
    properties: 0,
    flats: 0,
    totalRevenue: 0,
    totalOrders: 0,
    activeAvailableFlats: 0,
  };

  const cards = [
    { label: "Total Revenue", count: `৳${summary.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Bookings/Orders", count: summary.totalOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    { label: "Available Flats", count: summary.activeAvailableFlats, icon: KeyRound, color: "text-amber-600 bg-amber-50" },
    { label: "Total Properties", count: summary.properties, icon: Building2, color: "text-teal-600 bg-teal-50" },
    { label: "Total Flats", count: summary.flats, icon: Home, color: "text-purple-600 bg-purple-50" },
    { label: "Total Users", count: summary.users, icon: Users, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Overview Dashboard</h2>
        <p className="text-xs text-slate-500 mt-1">Real estate platform-wide statistics and property performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
              <div className={`p-3.5 rounded-xl ${card.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{card.count}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Property-Wise Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">Revenue, available flats, and booking metrics per property project.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-4">Property Name</th>
                <th className="p-4">City</th>
                <th className="p-4 text-center">Total Flats</th>
                <th className="p-4 text-center">Available Flats</th>
                <th className="p-4 text-center">Total Bookings</th>
                <th className="p-4 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.propertyStats && data.propertyStats.length > 0 ? (
                data.propertyStats.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-slate-800">{prop.propertyName}</td>
                    <td className="p-4 text-slate-500">{prop.city || "—"}</td>
                    <td className="p-4 text-center font-medium">{prop.totalFlats}</td>
                    <td className="p-4 text-center">
                      <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                        {prop.activeAvailableFlats}
                      </span>
                    </td>
                    <td className="p-4 text-center font-medium">{prop.totalOrders}</td>
                    <td className="p-4 text-right font-extrabold text-emerald-600">
                      ৳{prop.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No property metrics available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

