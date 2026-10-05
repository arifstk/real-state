import { cache } from "react";
import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import PropertyCard from "@/components/cards/PropertyCard";

type PropertyType = {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  images: string[];
  rating?: number;
};

interface PropertiesSectionProps {
  limit?: number;
  title?: string;
  subtitle?: string;
}

const getPropertiesData = cache(async (limit: number) => {
  await connectDB();

  const propertiesData = await Property.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(propertiesData)) as PropertyType[];
});

export default async function PropertiesSection({
  limit = 4,
  title = "Featured Properties",
  subtitle = "Discover luxury real estate projects and modern developments.",
}: PropertiesSectionProps) {
  const properties = await getPropertiesData(limit);

  if (!properties || properties.length === 0) {
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
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            id={property._id}
            name={property.name}
            city={property.city}
            address={property.address}
            phone={property.phone}
            images={property.images}
            rating={property.rating}
          />
        ))}
      </div>
    </section>
  );
}

