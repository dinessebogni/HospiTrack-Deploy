"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface LoginData {
  email: string;
  password: string;
}

interface SignupData extends LoginData {
  name: string;
}

interface AuthFormLoginProps {
  mode: "login";
  onSubmit: (data: LoginData) => Promise<void>;
  disabled?: boolean;
}

interface AuthFormSignupProps {
  mode: "signup";
  onSubmit: (data: SignupData) => Promise<void>;
  disabled?: boolean;
}

type AuthFormProps = AuthFormLoginProps | AuthFormSignupProps;

export default function AuthForm({ mode, onSubmit, disabled }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode === "signup") {
      await onSubmit({ name, email, password });
    } else {
      await onSubmit({ email, password });
    }
  }

  const imageSrc = "/images/bg.png";
  const logoSrc = "/images/logo.png";
  const imageAlt = mode === "login" ? "Image Connexion" : "Image Inscription";

  return (
    <section className="w-full h-screen flex">
      {/* Left section */}
      <div className="w-[60%] h-full xl:flex hidden">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageSrc})` }}
        ></div>
      </div>

      {/* Right section */}
      <div className="xl:w-[40%] w-full bg-white flex items-center justify-center overflow-y-scroll">
        <form
          onSubmit={handleSubmit}
          className="sm:w-[70%] w-[90%] flex flex-col items-start"
        >
          <Image
            src={logoSrc}
            width={150}
            height={150}
            alt={imageAlt}
            className="block mb-0 p-4"
          />

          <p className="mt-0 sm:text-[36px] text-[24px] font-bold text-[#525252]">
            {mode === "signup" ? "Inscrivez-vous !" : "Connectez-vous !"}
          </p>
          <p className="text-normal font-normal text-[#525252]">
            {mode === "signup"
              ? "et commencez à profiter de la plateforme"
              : "Veuillez entrer vos informations pour vous connecter"}
          </p>

          {mode === "signup" && (
            <div className="w-full mt-8">
              <label className="text-normal font-normal text-[#525252]">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez votre nom"
                className="focus:outline-none w-full border rounded-md h-[45px] border-[#b1b2b9] text-black px-[10px] placeholder:text-[12px] placeholder:text-gray"
                required
              />
            </div>
          )}

          {/* Email */}
          <div className="w-full mt-7">
            <label className="text-normal font-normal text-[#525252]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre adresse email"
              className="focus:outline-none w-full border rounded-md h-[45px] border-[#b1b2b9] text-black px-[10px] placeholder:text-[12px] placeholder:text-gray"
              required
            />
          </div>

          {/* Mot de passe */}
          <div className="w-full mt-7">
            <label className="text-normal font-normal text-[#525252]">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              className="focus:outline-none w-full border rounded-md h-[45px] border-[#b1b2b9] text-black px-[10px] placeholder:text-[12px] placeholder:text-gray"
              required
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={disabled}
            className={`mt-10 w-full rounded-md h-[50px] flex items-center justify-center text-white font-extrabold ${
              disabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-700"
            }`}
          >
            {disabled
              ? mode === "signup"
                ? "Inscription..."
                : "Connexion..."
              : mode === "signup"
              ? "S'inscrire"
              : "Se connecter"}
          </button>

          {/* Lien vers l'autre page */}
          <div className="w-full flex justify-center mt-10">
            <p className="text-[18px] font-normal text-[#828282]">
              {mode === "login" ? (
                <>
                  Vous n'avez pas de compte ?
                  <Link
                    href="/SessionSignup"
                    className="text-[18px] font-semibold text-[#2f265B] ml-2 hover:underline"
                  >
                    Inscrivez-vous !
                  </Link>
                </>
              ) : (
                <>
                  Vous avez déjà un compte ?
                  <Link
                    href="/SessionLogin"
                    className="text-[18px] font-semibold text-[#2f265B] ml-2 hover:underline"
                  >
                    Connectez-vous !
                  </Link>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
