import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Composant du formulaire de contact
const Contact: React.FC = () => {
  // Hook pour la navigation programmatique
  const navigate = useNavigate();
  // Référence au formulaire pour réinitialiser les champs de fichiers
  const formRef = useRef<HTMLFormElement>(null);

  // État du formulaire avec les champs et les fichiers
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    photo: null as File | null,
    pdf: null as File | null,
  });

  // État pour la prévisualisation de l'image
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Création d'un objet FormData pour envoyer les fichiers
    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    if (formData.photo) formDataToSend.append("photo", formData.photo);
    if (formData.pdf) formDataToSend.append("pdf", formData.pdf);

    try {
      // Envoi des données au serveur
      const response = await axios.post(
        "http://localhost:3001/api/contact",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Réinitialisation du formulaire et de la prévisualisation
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        photo: null,
        pdf: null,
      });
      setImagePreview(null);

      // Réinitialisation des champs de fichiers
      if (formRef.current) {
        const fileInputs =
          formRef.current.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input) => {
          (input as HTMLInputElement).value = "";
        });
      }

      // Redirection vers la page de confirmation
      navigate(`/confirmation/${response.data.id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Gestionnaire de changement de fichiers
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "pdf"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }));

      // Création de la prévisualisation pour l'image
      if (type === "photo") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    // Conteneur principal du formulaire
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Formulaire de Contact</h1>
      {/* Formulaire avec référence pour la réinitialisation */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Prénom */}
        <div>
          <label className="block mb-1">Prénom</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Champ Nom */}
        <div>
          <label className="block mb-1">Nom</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Champ Email */}
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Champ pour l'upload de photo avec prévisualisation */}
        <div>
          <label className="block mb-1">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "photo")}
            className="w-full p-2 border rounded"
            required
          />
          {/* Zone de prévisualisation de l'image */}
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Prévisualisation"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Champ pour l'upload de PDF */}
        <div>
          <label className="block mb-1">PDF (Annonce Indeed)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange(e, "pdf")}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default Contact;
