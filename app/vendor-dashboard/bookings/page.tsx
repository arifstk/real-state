// app/vendor-dashboard/bookings/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Hotel from "@/models/Hotel";
import Room from "@/models/Room";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import VendorBookingStatusActions from "./VendorBookingStatusActions";
import { Building2, Calendar, CreditCard, HotelIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VendorBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/vendor-dashboard/bookings");
  }

  await connectDB();

  const _register = [Room, User];

  const vendorHotels = await Hotel.find({ owner: session.user.id }).select("_id");
  const hotelIds = vendorHotels.map((h) => h._id);

  const vendorRooms = await Room.find({ hotel: { $in: hotelIds } }).select("_id");
  const roomIds = vendorRooms.map((r) => r._id);

  const bookingsData = await Booking.find({ room: { $in: roomIds } })
    .populate("user", "name email image")
    .populate("room", "roomType pricePerNight")
    .populate("hotel", "name city")
    .sort({ createdAt: -1 })
    .lean();

  const bookings = JSON.parse(JSON.stringify(bookingsData));

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
              <HotelIcon size={16} /> Vendor Dashboard
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800">Room Bookings Signal</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage and monitor room reservations across all your listed hotels.
            </p>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 w-fit">
            <span className="text-xs text-slate-500 font-medium">Total Received Bookings:</span>
            <span className="text-base font-extrabold text-teal-600">{bookings.length}</span>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <Building2 className="mx-auto text-slate-300" size={40} />
            <h3 className="text-base font-bold text-slate-700">No Booking Signals Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When customers book rooms in your hotels, their reservation details will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <div
                key={booking._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col lg:flex-row gap-6 lg:items-center justify-between transition hover:shadow-xs"
              >
                {/* Customer & Room Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 font-bold text-[10px] rounded-md uppercase tracking-wide">
                      {booking.hotel?.name || "Hotel"}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-700">
                      {booking.room?.roomType || "Room"}
                    </span>
                  </div>

                  {/* Customer Profile Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                      {booking.user?.name ? booking.user.name.charAt(0).toUpperCase() : <User size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {booking.user?.name || "Guest User"}
                      </h4>
                      <p className="text-xs text-slate-500">{booking.user?.email || "No email provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Dates & Payment Info */}
                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 border-y lg:border-y-0 lg:border-x border-slate-100 py-3 lg:py-0 lg:px-8">
                  <div className="space-y-1">
                    <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                      <Calendar size={13} /> Check-In / Out
                    </span>
                    <p className="font-bold text-slate-800">
                      {new Date(booking.checkIn).toLocaleDateString()} —{" "}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                      <CreditCard size={13} /> Amount Received
                    </span>
                    <p className="font-extrabold text-slate-800 text-sm">
                      ${booking.totalPrice}
                    </p>
                  </div>
                </div>

                {/* Booking Actions & Status Buttons */}
                <VendorBookingStatusActions
                  bookingId={booking._id}
                  currentStatus={booking.status}
                  paymentStatus={booking.paymentStatus}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

