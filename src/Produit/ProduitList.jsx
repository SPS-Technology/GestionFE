import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navigation from "../Acceuil/Navigation";

const ProduitList = () => {
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  const fetchProduits = async () => {
    try {
      const produitsResponse = await axios.get(
        "http://localhost:8000/api/produits"
      );
      setProduits(produitsResponse.data.produits);

      const fournisseursResponse = await axios.get(
        "http://localhost:8000/api/fournisseurs"
      );
      setFournisseurs(fournisseursResponse.data.fournisseurs);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const handleEdit = (id) => {
    const existingProduit = produits.find((produit) => produit.id === id);

    const fournisseurOptions = fournisseurs.map((fournisseur) => ({
      value: fournisseur.id,
      label: fournisseur.raison_sociale,
    }));

    Swal.fire({
      title: "Modifier Produit",
      html:
        `<label for="nom">Nom</label>` +
        `<input type="text" id="nom" class="swal2-input" value="${existingProduit.nom}">` +
        `<label for="Quantite">Quantité</label>` +
        `<input type="text" id="Quantite" class="swal2-input" value="${existingProduit.Quantite}">` +
        `<label for="typeQuantite">Type Quantité</label>` +
        `<input type="text" id="typeQuantite" class="swal2-input" value="${existingProduit.typeQuantite}">` +
        `<label for="calibre">Calibre</label>` +
        `<input type="text" id="calibre" class="swal2-input" value="${existingProduit.calibre}">` +
        `<label for="fournisseur">Fournisseur</label>` +
        `<select id="fournisseur" class="swal2-input">${fournisseurOptions.map(
          (option) =>
            `<option value="${option.value}" ${
              option.value === existingProduit.idFournisseur ? "selected" : ""
            }>${option.label}</option>`
        )}</select>`,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          nom: document.getElementById("nom").value,
          Quantite: document.getElementById("Quantite").value,
          typeQuantite: document.getElementById("typeQuantite").value,
          calibre: document.getElementById("calibre").value,
          idFournisseur: document.getElementById("fournisseur").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`http://localhost:8000/api/produits/${id}`, result.value)
          .then(() => {
            fetchProduits();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Produit modifié avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de la modification du produit:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la modification du produit.",
            });
          });
      }
    });
  };

  const handleDelete = (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce produit ?"
    );

    if (isConfirmed) {
      axios
        .delete(`http://localhost:8000/api/produits/${id}`)
        .then(() => {
          fetchProduits();
          Swal.fire({
            icon: "success",
            title: "Succès!",
            text: "Produit supprimé avec succès.",
          });
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression du produit:", error);
          Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: "Échec de la suppression du produit.",
          });
        });
    }
  };

  const handleAddProduit = () => {
    const fournisseurOptions = fournisseurs.map((fournisseur) => ({
      value: fournisseur.id,
      label: fournisseur.raison_sociale,
    }));

    Swal.fire({
      title: "Ajouter Produit",
      html:
        `<label for="nom">Nom</label>` +
        `<input type="text" id="nom" class="swal2-input" placeholder="Nom">` +
        `<label for="Quantite">Quantité</label>` +
        `<input type="text" id="Quantite" class="swal2-input" placeholder="Quantité">` +
        `<label for="typeQuantite">Type Quantité</label>` +
        `<input type="text" id="typeQuantite" class="swal2-input" placeholder="Type Quantité">` +
        `<label for="calibre">Calibre</label>` +
        `<input type="text" id="calibre" class="swal2-input" placeholder="Calibre">` +
        `<label for="fournisseur">Fournisseur</label>` +
        `<select id="fournisseur" class="swal2-input">${fournisseurOptions.map(
          (option) => `<option value="${option.value}">${option.label}</option>`
        )}</select>`,
        confirmButtonText: "ajouter",
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          nom: document.getElementById("nom").value,
          Quantite: document.getElementById("Quantite").value,
          typeQuantite: document.getElementById("typeQuantite").value,
          calibre: document.getElementById("calibre").value,
          idFournisseur: document.getElementById("fournisseur").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post("http://localhost:8000/api/produits", result.value)
          .then(() => {
            fetchProduits();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Produit ajouté avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de l'ajout du produit:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de l'ajout du produit.",
            });
          });
      }
    });
  };

  return (
    <div>
      <Navigation />
      <h2>Liste des Produits</h2>
      <button className="btn btn-primary mb-3" onClick={handleAddProduit}>
        Ajouter Produit
      </button>
      {produits && produits.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Quantité</th>
              <th>Type Quantité</th>
              <th>Calibre</th>
              <th>fournisseur</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {produits.map((produit) => {
              const fournisseur = fournisseurs.find(
                (fournisseur) => fournisseur.id === produit.idFournisseur
              );

              return (
                <tr key={produit.id}>
                  <td>{produit.id}</td>
                  <td>{produit.nom}</td>
                  <td>{produit.Quantite}</td>
                  <td>{produit.typeQuantite}</td>
                  <td>{produit.calibre}</td>
                  <td>
                    {fournisseur ? (
                      <>{fournisseur.raison_sociale}</>
                    ) : (
                      <div>No Fournisseur found</div>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-warning ms-2"
                      onClick={() => handleEdit(produit.id)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(produit.id)}
                    >
                      <i className="fas fa-minus-circle"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>Aucun produit disponible</p>
      )}
    </div>
  );
};

export default ProduitList;
