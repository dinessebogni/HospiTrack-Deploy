import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-8 border-t border-gray-200 dark:border-gray-700 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Info hôpital */}
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white">HospiTrack</h2>
          <p className="text-sm mt-1">Système de disponibilité en temps réel des médecins</p>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">&copy; 2025 Tous droits réservés</p>
        </div>

        {/* Liens utiles */} 
        <div>
          <h3 className="text-sm font-semibold mb-2 text-black dark:text-white">Liens utiles</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/about" className="hover:underline">A-Propos</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>

        {/* Réseaux sociaux + version */}
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-black dark:text-white">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400" aria-label="Facebook">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.6 9.8v-6.9H8v-2.9h2.4V9.1c0-2.4 1.4-3.8 3.6-3.8 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.4.7-1.4 1.3v1.6h2.7l-.4 2.9H14.5v6.9A10 10 0 0022 12z" /></svg>
              </a>
              <a href="#" className="hover:text-blue-400 dark:hover:text-blue-300" aria-label="Twitter">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.1 1.6A4.5 4.5 0 0022.4.4a9.1 9.1 0 01-2.9 1.1A4.5 4.5 0 0016 0c-2.5 0-4.6 2-4.6 4.6 0 .4 0 .8.1 1.2C7.7 5.5 4.1 3.6 1.7.8a4.6 4.6 0 00-.6 2.3c0 1.6.8 3 2 3.9a4.6 4.6 0 01-2.1-.6v.1c0 2.2 1.6 4 3.6 4.4a4.6 4.6 0 01-2.1.1c.6 1.8 2.3 3.1 4.3 3.1a9.2 9.2 0 01-5.6 1.9c-.4 0-.7 0-1.1-.1a13 13 0 007.1 2.1c8.5 0 13.1-7 13.1-13.1v-.6A9.3 9.3 0 0023 3z" /></svg>
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Version 1.0.3 — Dernière mise à jour : 30 juillet 2025</p>
        </div>
      </div>
    </footer>
  );
}
