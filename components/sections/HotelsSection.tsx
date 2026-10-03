
import { cache } from "react";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Hotel";
import HotelCard from "@/components/cards/HotelCard";

type HotelType = {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  images: string[];
  rating?: number;
};

interface HotelsSectionProps {
  limit?: number;
  title?: string;
  subtitle?: string;
}

// Cached database fetching function
const getHotelsData = cache(async (limit: number) => {
  await connectDB();

  const hotelsData = await Hotel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(hotelsData)) as HotelType[];
});

export default async function HotelsSection({
  limit = 4,
  title = "All Hotels",
  subtitle = "Discover luxury hotels and comfortable stays around the globe.",
}: HotelsSectionProps) {
  const hotels = await getHotelsData(limit);

  if (!hotels || hotels.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-2">
      <div className="flex items-center justify-between mb-8 mt-2 md:mt-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel._id}
            id={hotel._id}
            name={hotel.name}
            city={hotel.city}
            address={hotel.address}
            phone={hotel.phone}
            images={hotel.images}
            rating={hotel.rating}
          />
        ))}
      </div>
    </section>
  );
}

