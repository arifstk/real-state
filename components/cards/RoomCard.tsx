
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

interface RoomCardProps {
  id: string;
  hotelName: string;
  city?: string;
  address?: string;
  roomType: string;
  pricePerNight: number;
  discountPercent?: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable: boolean;
}

export default function RoomCard({
  id,
  hotelName,
  city,
  address,
  roomType,
  pricePerNight,
  discountPercent = 0,
  images,
  rating = 0,
  reviewCount = 0,
  isAvailable,
}: RoomCardProps) {
  const effectivePrice = discountPercent
    ? Math.round(pricePerNight - (pricePerNight * discountPercent) / 100)
    : pricePerNight;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs group flex flex-col justify-between">
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <Link href={`/rooms/${id}`}>
            <Image
              src={images[0] || "/placeholder-room.jpg"}
              alt={roomType}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          </Link>

          {/* Dynamic Availability Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {isAvailable ? (
              <span className="bg-emerald-500/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                AVAILABLE
              </span>
            ) : (
              <span className="bg-rose-500/65 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                BOOKED
              </span>
            )}

            {discountPercent > 0 && (
              <span className="bg-rose-500/60 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Rating Badge */}
          {rating > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>{rating}</span>
              <span className="text-slate-400 text-[10px]">({reviewCount})</span>
            </div>
          )}
        </div>

        <div className="px-4 pt-2 space-y-1">
          <p className="text-xs text-slate-400 font-medium">{hotelName}</p>
          <h3 className="font-bold text-slate-800 text-base">{roomType}</h3>
        </div>
        <div className="flex flex-row items-center gap-1 px-4">
          <MapPin size={14} className="text-teal-500 shrink-0" />
          <p className="text-[10px] text-slate-400">{address}</p>
          <p className="text-[10px] text-slate-300">|</p>
          <p className="text-[10px] text-slate-400">{city}</p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-slate-50">
        <div>
          {discountPercent > 0 && (
            <span className="text-xs text-slate-400 line-through block">${pricePerNight}</span>
          )}
          <span className="text-lg font-extrabold text-slate-800">${effectivePrice}</span>
          <span className="text-xs text-slate-400 font-normal">/night</span>
        </div>

        {/* Dynamic Action Button */}
        <Link
          href={`/rooms/${id}`}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition ${isAvailable
            ? "btn-primary text-white"
            : "bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none"
            }`}
        >
          {isAvailable ? "View Details" : "Unavailable"}
        </Link>
      </div>
    </div>
  );
}
