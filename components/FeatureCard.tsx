"use client";
import Image, { StaticImageData } from "next/image";

interface FeatureCardProps {
  icon: StaticImageData | string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-center gap-5">
      <Image src={icon} alt={title} width={48} height={48} />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-500 text-sm md:text-base">{description}</p>
      </div>
    </div>
  );
}
