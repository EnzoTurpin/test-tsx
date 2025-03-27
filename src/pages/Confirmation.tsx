import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configuration du worker PDF.js pour le rendu des PDFs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Interface TypeScript pour typer les données du contact
interface ContactData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  photo_path: string;
  pdf_path: string;
  created_at: string;
}

const Confirmation: React.FC = () => {
  // Récupération de l'ID depuis l'URL
  const { id } = useParams<{ id: string }>();

  // États pour gérer les données et l'interface utilisateur
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [viewMode, setViewMode] = useState<"single" | "scroll">("single");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Effet pour charger les données du contact au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for ID:", id);
        const response = await axios.get(
          `http://localhost:3001/api/contact/${id}`
        );
        console.log("Received data:", response.data);
        setContactData(response.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Fonction pour télécharger la photo
  const handleDownloadPhoto = () => {
    if (contactData?.photo_path) {
      window.open(
        `http://localhost:3001/api/download/${contactData.photo_path}`
      );
    }
  };

  // Fonction pour télécharger le PDF
  const handleDownloadPdf = () => {
    if (contactData?.pdf_path) {
      window.open(`http://localhost:3001/api/download/${contactData.pdf_path}`);
    }
  };

  // Callback appelé quand le PDF est chargé avec succès
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Fonctions pour la navigation entre les pages du PDF
  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  const nextPage = () => {
    changePage(1);
  };

  // Affichage du loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 font-medium">
              Chargement...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur si une erreur est survenue
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-lg font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage d'un message si aucune donnée n'est trouvée
  if (!contactData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-lg font-medium text-yellow-800">
                  Aucune donnée trouvée
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendu principal du composant
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section des informations du contact avec image */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">
              Informations du contact
            </h3>
          </div>
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Colonne de gauche : Informations */}
              <div className="space-y-6">
                <dl className="grid grid-cols-1 gap-6">
                  <div className="bg-gray-50 px-6 py-5 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">
                      Nom complet
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {contactData.first_name} {contactData.last_name}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-6 py-5 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {contactData.email}
                    </dd>
                  </div>
                </dl>
                {/* Boutons de téléchargement */}
                <div className="flex flex-wrap gap-4">
                  {contactData.photo_path && (
                    <button
                      onClick={handleDownloadPhoto}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Télécharger la photo
                    </button>
                  )}
                  {contactData.pdf_path && (
                    <button
                      onClick={handleDownloadPdf}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Télécharger le PDF
                    </button>
                  )}
                </div>
              </div>

              {/* Colonne de droite : Image */}
              <div className="flex items-center justify-center">
                {contactData.photo_path && (
                  <div className="relative w-full max-w-sm">
                    <img
                      src={`http://localhost:3001/api/download/${contactData.photo_path}`}
                      alt="Photo du contact"
                      className="w-48 h-48 object-cover shadow-lg border-4 border-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section de prévisualisation du PDF */}
        {contactData.pdf_path && (
          <div className="mt-8 bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-8 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  Prévisualisation du PDF
                </h3>
                <div className="flex items-center space-x-4">
                  {/* Bouton pour changer le mode d'affichage */}
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "single" ? "scroll" : "single")
                    }
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    {viewMode === "single" ? "Mode défilement" : "Mode page"}
                  </button>
                  {/* Contrôles de zoom */}
                  <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-lg">
                    <button
                      onClick={() => setScale(scale - 0.1)}
                      className="text-gray-600 hover:text-gray-900 focus:outline-none"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => setScale(scale + 0.1)}
                      className="text-gray-600 hover:text-gray-900 focus:outline-none"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Zone d'affichage du PDF */}
            <div className="px-6 py-8 bg-gray-50">
              <div
                className={`${
                  viewMode === "scroll" ? "space-y-8" : "flex justify-center"
                }`}
              >
                <Document
                  file={`http://localhost:3001/api/download/${contactData.pdf_path}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                  }
                  error={
                    <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                      Erreur lors du chargement du PDF
                    </div>
                  }
                >
                  {viewMode === "single" ? (
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  ) : (
                    Array.from(new Array(numPages), (el, index) => (
                      <div key={`page_${index + 1}`} className="shadow-lg">
                        <Page
                          pageNumber={index + 1}
                          scale={scale}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                        />
                      </div>
                    ))
                  )}
                </Document>
              </div>
              {/* Navigation entre les pages en mode page unique */}
              {viewMode === "single" && numPages && numPages > 1 && (
                <div className="mt-6 flex justify-center items-center space-x-4">
                  <button
                    onClick={previousPage}
                    disabled={pageNumber <= 1}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Page précédente
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    Page {pageNumber} sur {numPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={pageNumber >= numPages}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Page suivante
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Confirmation;
