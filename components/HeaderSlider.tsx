"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      title: "Consultez un médecin en quelques clics",
      description:
        "Accédez à des consultations médicales à distance, où que vous soyez, en toute simplicité.",
      imgSrc: "/images/image1.jpg",
    },
    {
      id: 2,
      title: "Rendez-vous en temps réel",
      description:
        "Prenez ou modifiez vos rendez-vous instantanément grâce à notre interface intuitive.",
      imgSrc: "/images/image2.jpg",
    },
    {
      id: 3,
      title: "Des médecins toujours disponibles",
      description:
        "Consultez la disponibilité en direct et choisissez le praticien qui vous convient.",
      imgSrc: "/images/image3.png",
    },
    {
      id: 4,
      title: "Une expérience patient connectée",
      description:
        "Dialogue en vidéo, prescription numérique, et suivi personnalisé à portée de main.",
      imgSrc: "/images/image4.png",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#F0F4FA] py-8 md:px-14 px-8 mt-6 rounded-xl min-w-full"
          >
            {/* Texte */}
            <div className="md:pl-8 mt-10 md:mt-0 max-w-lg">
              <h1 className="md:text-[36px] md:leading-[44px] text-2xl font-semibold text-gray-800">
                {slide.title}
              </h1>
              <p className="mt-4 text-gray-600 text-base md:text-lg">
                {slide.description}
              </p>
            </div>

            {/* Image */}
            <div className="flex items-center flex-1 justify-center">
              <Image
                src={slide.imgSrc}
                alt={`Slide ${index + 1}`}
                width={400}
                height={300}
                className="object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Indicateurs */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 w-2.5 rounded-full cursor-pointer transition-all ${
              currentSlide === index ? "bg-blue-600 scale-110" : "bg-gray-400"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
