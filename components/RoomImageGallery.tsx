"use client";

import { useState } from "react";
import Image from "next/image";

interface RoomImageGalleryProps {
  images: string[];
  roomType: string;
  discountPercent?: number;
}

export default function RoomImageGallery({
  images = [],
  roomType,
  discountPercent = 0,
}: RoomImageGalleryProps) {

  const [selectedImage, setSelectedImage] = useState<string>(
    images[0] || "/placeholder-room.jpg"
  );

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/80">
        <Image src="/placeholder-room.jpg" alt={roomType} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div className="relative aspect-square w-full bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <Image
          src={selectedImage}
          alt={roomType}
          fill
          priority
          className="object-cover transition-all duration-300 ease-in-out"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            -{discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, index) => {
          const isSelected = selectedImage === img;
          return (
            <button
              key={index}
              onClick={() => setSelectedImage(img)}
              type="button"
              className={`relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border-2 transition duration-200 focus:outline-none cursor-pointer ${isSelected
                  ? "border-teal-600 "
                  : "border-transparent opacity-75 hover:opacity-100"
                }`}
            >
              <Image
                src={img}
                alt={`${roomType} thumb ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

