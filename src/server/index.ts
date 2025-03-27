import express from "express";
import pkg from "pg";
const { Pool } = pkg;
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";

// Configuration des chemins de fichiers pour ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialisation de l'application Express
const app = express();
const port = 3001;

// Activation de CORS pour permettre les requêtes depuis le frontend
app.use(cors());

// Configuration de la connexion à la base de données PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "contact_db",
  password: "enzo",
  port: 5432,
});

// Création de la table contacts si elle n'existe pas
pool.query(`
  CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    photo_path VARCHAR(255),
    pdf_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

// Configuration de multer pour la gestion des uploads de fichiers
const storage = multer.diskStorage({
  // Définition du dossier de destination pour les fichiers uploadés
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    // Création du dossier uploads s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  // Génération d'un nom de fichier unique pour éviter les conflits
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Initialisation de multer avec la configuration de stockage
const upload = multer({ storage: storage });

// Interface TypeScript pour typer les fichiers uploadés
interface UploadedFiles {
  photo?: Express.Multer.File[];
  pdf?: Express.Multer.File[];
}

// Route POST pour la soumission du formulaire de contact
app.post(
  "/api/contact",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Log des données reçues pour le débogage
      console.log("Données reçues:", req.body);
      console.log("Fichiers reçus:", req.files);

      const { firstName, lastName, email } = req.body;
      const files = req.files as UploadedFiles;
      // Extraction des noms de fichiers uploadés
      const photoPath = files.photo?.[0]?.filename;
      const pdfPath = files.pdf?.[0]?.filename;

      console.log("Données à insérer:", {
        firstName,
        lastName,
        email,
        photoPath,
        pdfPath,
      });

      // Insertion des données dans la base de données
      const result = await pool.query(
        "INSERT INTO contacts (first_name, last_name, email, photo_path, pdf_path) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [firstName, lastName, email, photoPath, pdfPath]
      );

      console.log("Données insérées avec succès:", result.rows[0]);
      // Renvoi de l'ID du contact créé
      res.json({ id: result.rows[0].id });
    } catch (error) {
      console.error("Erreur détaillée:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Route GET pour récupérer les informations d'un contact par son ID
app.get("/api/contact/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contacts WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route GET pour télécharger les fichiers uploadés
app.get("/api/download/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../../uploads", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
