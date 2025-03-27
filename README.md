# Pour initier le projet:

- À la racine: `npm install`.

# Pour démarrer le projet

- Dans un terminal (toujours à la racine): `npm run dev`.

- Ensuite dans un autre terminal (toujours à la racine): `npm run client`.

# Fonctionnement du projet

- Le projet envoie en base de données PostgréSQL les informations suviantes: `Nom` `Prénom` `Email` `Image` `PDF`.

- Une fois le formulaire remplie et validé, il va rediriger automatiquement vers un id qui aura été ajouté lors de la validation.

- Les informations sont visible à l'URL: `http://localhost:3000/confirmation/[ID]`.

- L'utilisateur à la possibilité de télécharger la photo ainsi que le PDF.

- L'image et le PDF sont visible directement sur la page.
