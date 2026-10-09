// app/vendor-dashboard/bookings/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Flat from "@/models/Flat";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import VendorBookingStatusActions from "./VendorBookingStatusActions";
import {
  Building2,
  Calendar,
  Banknote,
  Home,
  Phone,
  Mail,
  MessageCircle,
  MessageSquareText,
  User as UserIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

const formatBDT = (n: number) => `৳${Math.round(n).toLocaleString("en-BD")}`;

const toWhatsAppNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `88${digits}` : digits;
};

export default async function VendorBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/vendor-dashboard/bookings");
  }

  await connectDB();

  // session.user.id may be missing – fall back to an email lookup
  let vendorId: string | undefined = (session.user as any).id;
  if (!vendorId && session.user.email) {
    const u: any = await User.findOne({ email: session.user.email }).select("_id").lean();
    vendorId = u?._id?.toString();
  }
  if (!vendorId) {
    redirect("/login?callbackUrl=/vendor-dashboard/bookings");
  }

  const vendorFlats = await Flat.find({ vendor: vendorId }).select("_id").lean();
  const flatIds = vendorFlats.map((f: any) => f._id);

  const bookingsData = await Booking.find({ flat: { $in: flatIds } })
    .populate("flat", "title flatType city isSold")
    .sort({ createdAt: -1 })
    .lean();

  const bookings = JSON.parse(JSON.stringify(bookingsData));

  const count = (s: string) => bookings.filter((b: any) => b.status === s).length;
  const stats = [
    { label: "Pending", value: count("pending"), cls: "text-amber-600" },
    { label: "Confirmed", value: count("confirmed"), cls: "text-emerald-600" },
    { label: "Sold", value: count("completed"), cls: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
              <Home size={16} /> Vendor Dashboard
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800">Flat Booking Requests</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Contact interested buyers, confirm requests and mark a flat as SOLD once the deal is done.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 text-center min-w-20"
              >
                <p className={`text-lg font-extrabold ${s.cls}`}>{s.value}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <Building2 className="mx-auto text-slate-300" size={40} />
            <h3 className="text-base font-bold text-slate-700">No booking requests yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When buyers request a booking or site visit for your flats, their details will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <div
                key={booking._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col lg:flex-row gap-6 lg:items-center justify-between transition hover:shadow-xs"
              >
                {/* Flat + buyer */}
                <div className="space-y-3 lg:w-1/3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 font-bold text-[10px] rounded-md uppercase tracking-wide">
                      {booking.flat?.flatType || "Flat"}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {booking.flat?.title || "Flat"}
                    </span>
                    {booking.flat?.isSold && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-extrabold text-[10px] rounded-md">
                        SOLD
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                      {booking.name ? booking.name.charAt(0).toUpperCase() : <UserIcon size={18} />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">
                        {booking.name || "Buyer"}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{booking.email || "No email provided"}</p>
                    </div>
                  </div>

                  {/* Contact the buyer */}
                  <div className="flex flex-wrap items-center gap-2">
                    {booking.phone && (
                      <>
                        <a
                          href={`tel:${booking.phone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
                        >
                          <Phone size={13} /> {booking.phone}
                        </a>
                        <a
                          href={`https://wa.me/${toWhatsAppNumber(booking.phone)}?text=${encodeURIComponent(
                            `Hi ${booking.name}, regarding your booking request for "${booking.flat?.title ?? "the flat"}".`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                      </>
                    )}
                    {booking.email && (
                      <a
                        href={`mailto:${booking.email}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                      >
                        <Mail size={13} /> Email
                      </a>
                    )}
                  </div>
                </div>

                {/* Visit / price / message */}
                <div className="flex flex-col gap-3 text-xs text-slate-600 border-y lg:border-y-0 lg:border-x border-slate-100 py-3 lg:py-0 lg:px-8 lg:flex-1">
                  <div className="flex flex-wrap gap-8">
                    <div className="space-y-1">
                      <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                        <Calendar size={13} /> Preferred Visit
                      </span>
                      <p className="font-bold text-slate-800">
                        {booking.visitDate
                          ? new Date(booking.visitDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                          : "Not specified"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                        <Banknote size={13} /> Listing Price
                      </span>
                      <p className="font-extrabold text-slate-800 text-sm">
                        {formatBDT(booking.totalPrice)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 font-semibold text-[11px]">Requested On</span>
                      <p className="font-bold text-slate-800">
                        {new Date(booking.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3">
                      <MessageSquareText size={14} className="text-slate-400 shrink-0 mt-px" />
                      <p className="text-xs text-slate-600 leading-relaxed">{booking.message}</p>
                    </div>
                  )}
                </div>

                {/* Status + actions */}
                <VendorBookingStatusActions bookingId={booking._id} currentStatus={booking.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

