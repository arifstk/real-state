
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Star } from "lucide-react";

interface HotelCardProps {
  id: string;
  name: string;
  city: string;
  address: string;
  images: string[];
  phone?: string;
  contactNumber?: string;
  rating?: number;
}

export default function HotelCard({
  id,
  name,
  city,
  address,
  images,
  phone,
  contactNumber,
  rating,
}: HotelCardProps) {
  const displayImage = images && images.length > 0 ? images[0] : "/placeholder-hotel.jpg";
  const displayPhone = contactNumber || phone || "N/A";

  return (
    <div className="group relative h-60 w-full overflow-hidden rounded-2xl border border-slate-200/50 shadow-md hover:shadow-xl transition-all duration-300">
      {/* Background Image */}
      <Image
        src={displayImage}
        alt={name}
        fill
        className="object-cover group-hover:scale-105 transition duration-700 ease-out"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      />

      {/* Top Rating Badge */}
      {typeof rating === "number" && rating > 0 && (
        <div className="absolute top-3.5 right-3.5 z-10 bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white shadow-sm">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <span>{rating.toFixed(1)}</span>
        </div>
      )}

      {/* Dark Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />

      {/* Content Overlay (Bottom Container) */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-3 flex flex-col justify-end space-y-1">
        {/* Hotel Details */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-white tracking-tight line-clamp-1 transition-colors duration-200">
            {name}
          </h3>

          <p className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
            <MapPin size={14} className="text-teal-400 shrink-0" />
            <span className="line-clamp-1">
              {city}{city && address ? ", " : ""}{address}
            </span>
          </p>

          <p className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Phone size={14} className="text-teal-400 shrink-0" />
            <span className="line-clamp-1">{displayPhone}</span>
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href={`/hotels/${id}`}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-white/10 hover:bg-teal-600 border border-white/20 hover:border-teal-500 backdrop-blur-md text-white text-xs font-semibold rounded-xl transition duration-300 shadow-sm"
          >
            View Hotel
          </Link>
        </div>
      </div>
    </div>
  );
}
