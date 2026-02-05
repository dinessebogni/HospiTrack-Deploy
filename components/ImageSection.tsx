"use client";
import Image from "next/image";
import doctorsImage from "../public/images/groupe-medecin.png";

export default function ImageSection() {
  return (
    <div className="flex justify-center">
      <Image
        src={doctorsImage}
        alt="Médecins"
        className="w-full max-w-lg md:max-w-xl"
        priority
      />
    </div>
  );
}
