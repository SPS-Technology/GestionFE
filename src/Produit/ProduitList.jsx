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
      setProduits(produitsResponse.data.produit);

      const fournisseursResponse = await axios.get(
        "http://localhost:8000/api/fournisseurs"
      );
      setFournisseurs(fournisseursResponse.data.fournisseur);
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
      `<label for="type_quantite">Type Quantité</label>` +
      `<input type="text" id="type_quantite" class="swal2-input" value="${existingProduit.type_quantite}">` +
      `<label for="calibre">Calibre</label>` +
      `<input type="text" id="calibre" class="swal2-input" value="${existingProduit.calibre}">` +
      `<label for="user_id">User</label>` +
      `<input type="text" id="user_id" class="swal2-input" value="${existingProduit.user_id}">` +
      `<label for="fournisseur_id">Fournisseur</label>` +
      `<input type="text" id="fournisseur_id" class="swal2-input" value="${existingProduit.fournisseur_id}">`
        ,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          nom: document.getElementById("nom").value,
          type_quantite: document.getElementById("type_quantite").value,
          calibre: document.getElementById("calibre").value,
          fournisseur_id: document.getElementById("fournisseur_id").value,
          user_id: document.getElementById("user_id").value,
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
        `<label for="type_quantite">Type Quantité</label>` +
        `<select id="type_quantite" class="swal2-input">` +
        `<option value="kg">kg</option>` +
        `<option value="unitaire">unitaire</option>` +
        `</select>` +
        `<label for="calibre">Calibre</label>` +
        `<input type="text" id="calibre" class="swal2-input" placeholder="Calibre">` +
        `<label for="user_id">user</label>` +
        `<input type="text" id="user_id" class="swal2-input" placeholder="user_id">` +
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
          type_quantite: document.getElementById("type_quantite").value,
          calibre: document.getElementById("calibre").value,
          fournisseur_id: document.getElementById("fournisseur").value,
          user_id: document.getElementById("user_id").value,
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
      <h2 class="text-center m-2">Liste des Produits</h2>
      <button className="btn btn-primary col-2 m-2 " onClick={handleAddProduit}>
        Ajouter Produit
      </button>
      {produits && produits.length > 0 ? (
        <table className="table table-hover table-bordered">
          <thead class="text-center">
            <tr>
              <th colSpan={2}>ID</th>
              <th>Nom</th>
              <th>Type Quantité</th>
              <th>Calibre</th>
              <th>fournisseur</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="text-center">
            {produits.map((produit) => {
              const fournisseur = fournisseurs.find(
                
                (fournisseur) => fournisseur.id === produit.fournisseur_id,

              );

              return (
                <tr key={produit.id}>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="checkbox"></input>
                  </div>
                  <td>{produit.id}</td>
                  <td>{produit.nom}</td>
                  <td>{produit.type_quantite}</td>
                  <td>{produit.calibre}</td>
                  <td>
                    {fournisseur ? (
                      <>{fournisseur.raison_sociale}</>
                    ) : (
                      <div>No Fournisseur found</div>
                    )}
                  </td>
                  <td class="col-2 text-center">
                    <button
                      className="col-3 btn btn-warning mx-2"
                      onClick={() => handleEdit(produit.id)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="col-3 btn btn-danger mx-2"
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
        <div class="text-center"><h5>Loading...</h5></div>
      )}
    </div>
  );
};

export default ProduitList;
