import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Contact from "./pages/Contact";
import Confirmation from "./pages/Confirmation";

// Composant principal de l'application
const App: React.FC = () => {
  return (
    // Configuration du routeur pour la navigation
    <Router>
      {/* Conteneur principal avec fond gris clair */}
      <div className="min-h-screen bg-gray-100">
        {/* Barre de navigation */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between">
              <div className="flex space-x-7">
                {/* Logo/Titre de l'application */}
                <div>
                  <Link to="/" className="flex items-center py-4">
                    <span className="font-semibold text-gray-500 text-lg">
                      Formulaire de Contact
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Conteneur principal pour le contenu de l'application */}
        <div className="container mx-auto px-4 py-8">
          {/* Configuration des routes de l'application */}
          <Routes>
            {/* Route principale vers le formulaire de contact */}
            <Route path="/" element={<Contact />} />
            {/* Route vers la page de confirmation avec un paramètre ID */}
            <Route path="/confirmation/:id" element={<Confirmation />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
