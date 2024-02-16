import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navigation from "../Acceuil/Navigation";

const FournisseurList = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [newFournisseur, setNewFournisseur] = useState({
    raison_sociale: "",
    adresse: "",
    tel: "",
    ville: "",
    abreviation: "",
  });

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/fournisseurs"
      );
      console.log("API Response:", response.data);
      setFournisseurs(response.data.fournisseurs);
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs:", error);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const handleEdit = (id) => {
    const existingFournisseur = fournisseurs.find(
      (fournisseur) => fournisseur.id === id
    );

    Swal.fire({
      title: "Modifier Fournisseur",
      html:
        `<label for="raison_sociale">Raison Sociale</label>` +
        `<input type="text" id="raison_sociale" class="swal2-input" value="${existingFournisseur.raison_sociale}">` +
        `<label for="adresse">Adresse</label>` +
        `<input type="text" id="adresse" class="swal2-input" value="${existingFournisseur.adresse}">` +
        `<label for="tel">Téléphone</label>` +
        `<input type="text" id="tel" class="swal2-input" value="${existingFournisseur.tel}">` +
        `<label for="ville">Ville</label>` +
        `<input type="text" id="ville" class="swal2-input" value="${existingFournisseur.ville}">` +
        `<label for="abreviation">Abréviation</label>` +
        `<input type="text" id="abreviation" class="swal2-input" value="${existingFournisseur.abreviation}">`,
      focusConfirm: false,
      showCancelButton: true, // Affiche le bouton "Annuler"
      cancelButtonText: "Annuler", // Texte du bouton "Annuler"
      preConfirm: () => {
        return {
          raison_sociale: document.getElementById("raison_sociale").value,
          adresse: document.getElementById("adresse").value,
          tel: document.getElementById("tel").value,
          ville: document.getElementById("ville").value,
          abreviation: document.getElementById("abreviation").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Fournisseur modifié:", result.value);
        axios
          .put(`http://localhost:8000/api/fournisseurs/${id}`, result.value)
          .then(() => {
            fetchFournisseurs();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Fournisseur modifié avec succès.",
            });
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la modification du fournisseur:",
              error
            );
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la modification du fournisseur.",
            });
          });
      } else {
        console.log("Modification annulée");
      }
    });
  };

  const handleDelete = (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce fournisseur ?"
    );

    if (isConfirmed) {
      console.log(`Suppression confirmée pour l'ID du fournisseur ${id}`);
      axios
        .delete(`http://localhost:8000/api/fournisseurs/${id}`)
        .then(() => {
          fetchFournisseurs();
          Swal.fire({
            icon: "success",
            title: "Succès!",
            text: "Fournisseur supprimé avec succès.",
          });
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression du fournisseur:", error);
          Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: "Échec de la suppression du fournisseur.",
          });
        });
    } else {
      console.log("Suppression annulée");
    }
  };

  const handleAddFournisseur = () => {
    Swal.fire({
      title: "Ajouter Fournisseur",
      html:
        '<label for="raison_sociale">Raison Sociale</label>' +
        '<input type="text" id="raison_sociale" class="swal2-input" placeholder="Raison Sociale">' +
        '<label for="adresse">Adresse</label>' +
        '<input type="text" id="adresse" class="swal2-input" placeholder="Adresse">' +
        '<label for="tel">Téléphone</label>' +
        '<input type="text" id="tel" class="swal2-input" placeholder="Téléphone">' +
        '<label for="ville">Ville</label>' +
        '<input type="text" id="ville" class="swal2-input" placeholder="Ville">' +
        '<label for="abreviation">Abréviation</label>' +
        '<input type="text" id="abreviation" class="swal2-input" placeholder="Abréviation">',
      confirmButtonText: "Ajouter",
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          raison_sociale: document.getElementById("raison_sociale").value,
          adresse: document.getElementById("adresse").value,
          tel: document.getElementById("tel").value,
          ville: document.getElementById("ville").value,
          abreviation: document.getElementById("abreviation").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Nouveau fournisseur:", result.value);
        axios
          .post("http://localhost:8000/api/fournisseurs", result.value, {
            withCredentials: true,
            headers: {
              'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
            },
          })
          .then(() => {
            fetchFournisseurs();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Fournisseur ajouté avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de l'ajout du fournisseur:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de l'ajout du fournisseur.",
            });
          });
      }
    });
  };
  

  return (
    <div>
      <Navigation />

      <h2>Liste des Fournisseurs</h2>
      <button className="btn btn-primary mb-3" onClick={handleAddFournisseur}>
        Ajouter Fournisseur
      </button>
      {fournisseurs && fournisseurs.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Raison Sociale</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Abréviation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {fournisseurs.map((fournisseur) => (
              <tr key={fournisseur.id}>
                <td>{fournisseur.id}</td>
                <td>{fournisseur.raison_sociale}</td>
                <td>{fournisseur.adresse}</td>
                <td>{fournisseur.tel}</td>
                <td>{fournisseur.ville}</td>
                <td>{fournisseur.abreviation}</td>
                <td>
                  <button
                    className="btn btn-warning ms-2"
                    onClick={() => handleEdit(fournisseur.id)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(fournisseur.id)}
                  >
                    <i className="fas fa-minus-circle"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucun fournisseur disponible</p>
      )}
    </div>
  );
};

export default FournisseurList;
