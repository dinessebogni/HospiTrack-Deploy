import Image from "next/image";
import HeaderSlider from "../../components/HeaderSlider"; 

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Hôpi Track</h1>
        <div className="space-x-4">
          <a href="/SessionLogin" className="text-sm font-medium hover:underline">
            Se connecter
          </a>
          <a href="/SessionSignup" className="text-sm font-medium hover:underline">
            S&apos;inscrire
          </a>
        </div>
      </header>

      {/* Slider de téléconsultation */}
      <div className="w-full">
        <HeaderSlider />
      </div>

      {/* Contenu principal */}
      <main className="flex-grow flex flex-col md:flex-row min-h-[calc(100vh-500px-64px)]">
        {/* Texte */}
        <div className="flex-1 px-20 py-10 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenue sur Hospi Track
          </h2>
          <p className="text-gray-600 mb-6">
            Plateforme dédiée à votre prise en charge hospitalière
          </p>

          <h3 className="text-xl font-semibold mb-4">Facilitez le suivi de vos soins médicaux</h3>
          <ul className="space-y-2 text-gray-700 list-disc pl-6">
            <li>Consultez vos informations de santé en toute simplicité</li>
            <li>Planifiez vos rendez-vous médicaux</li>
            <li>Échangez avec les professionnels de santé</li>
            <li>Gardez un œil sur vos prescriptions et traitements</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-2">
            Une solution sécurisée et disponible partout, 24h/24
          </h3>
          <p className="text-gray-600">
            Nous mettons un point d’honneur à garantir la confidentialité de vos données
            et vous permettons d’accéder à toutes vos informations depuis smartphone
          </p>

          <div className="text-center mt-10">
            <h4 className="text-lg font-semibold mb-4">Prêt à démarrer ?</h4>
            <a
              href="/SessionSignup"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              S&apos;inscrire maintenant
            </a>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex-1 relative">
          <Image
            src="/images/medecin.png"
            alt="Illustration"
            fill
            className="object-contain"
          />
        </div>
      </main>
    </div>
  );
}
