import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navigation from "../Acceuil/Navigation";

const FournisseurList = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/fournisseurs");

      console.log("API Response:", response.data);

      setFournisseurs(response.data.fournisseur);

      const userResponse = await axios.get("http://localhost:8000/api/user");
      setUsers(userResponse.data.users);
    } catch (error) {
      console.error("Error fetching data:", error);
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
      html: `
        <label for="raison_sociale">Raison Sociale</label>
        <input type="text" id="raison_sociale" class="swal2-input" value="${existingFournisseur.raison_sociale
        }">

        <label for="adresse">Adresse</label>
        <input type="text" id="adresse" class="swal2-input" value="${existingFournisseur.adresse
        }">

        <label for="tele">Téléphone</label>
        <input type="text" id="tele" class="swal2-input" value="${existingFournisseur.tele
        }">

        <label for="ville">Ville</label>
        <input type="text" id="ville" class="swal2-input" value="${existingFournisseur.ville
        }">

        <label for="abreviation">Abréviation</label>
        <input type="text" id="abreviation" class="swal2-input" value="${existingFournisseur.abreviation
        }">

        <label for="zone">Zone</label>
        <input type="text" id="zone" class="swal2-input" value="${existingFournisseur.zone
        }">

        <label for="user_id">user_id</label>
        <input type="text" id="user_id" class="swal2-input" value="${existingFournisseur.user_id
        }">

      `,
      confirmButtonText: "Modifer",
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          raison_sociale: document.getElementById("raison_sociale").value,
          adresse: document.getElementById("adresse").value,
          tele: document.getElementById("tele").value,
          ville: document.getElementById("ville").value,
          abreviation: document.getElementById("abreviation").value,
          zone: document.getElementById("zone").value,
          user_id: document.getElementById("user_id").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
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
  }
  const handleDelete = (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce fournisseur ?"
    );

    if (isConfirmed) {
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
      html: `
        <label for="raison_sociale">Raison Sociale</label>
        <input type="text" id="raison_sociale" class="swal2-input" placeholder="Raison Sociale">
        
        <label for="adresse">Adresse</label>
        <input type="text" id="adresse" class="swal2-input" placeholder="Adresse">
        
        <label for="tele">Téléphone</label>
        <input type="text" id="tele" class="swal2-input" placeholder="Téléphone">
        
        <label for="ville">Ville</label>
        <input type="text" id="ville" class="swal2-input" placeholder="Ville">
        
        <label for="abreviation">Abréviation</label>
        <input type="text" id="abreviation" class="swal2-input" placeholder="Abréviation">
        
        <label for="zone">Zone</label>
        <input type="text" id="zone" class="swal2-input" placeholder="Zone">
        
        <label for="user_id">user_id</label>
        <input type="text" id="user_id" class="swal2-input" placeholder="user_id">
    
      `,
      confirmButtonText: "Ajouter",
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          raison_sociale: document.getElementById("raison_sociale").value,
          adresse: document.getElementById("adresse").value,
          tele: document.getElementById("tele").value,
          ville: document.getElementById("ville").value,
          abreviation: document.getElementById("abreviation").value,
          zone: document.getElementById("zone").value,
          user_id: document.getElementById("user_id").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post("http://localhost:8000/api/fournisseurs", result.value, {
            withCredentials: true,
            headers: {
              "X-CSRF-TOKEN": document.head.querySelector(
                'meta[name="csrf-token"]'
              ).content,
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
    <div class="col">
      <Navigation />

      <h2 class="text-center m-2">Liste des Fournisseurs</h2>
      <button class="btn btn-primary col-2 m-2 "onClick={handleAddFournisseur}>
        Ajouter Fournisseur
      </button>
      <div class="container" >
      {fournisseurs && fournisseurs.length > 0 ? (
        <table className="table table-hover table-bordered">
          <thead class="text-center">
            <tr>
              <th colSpan={2} class="text-center" >ID</th>
              <th>Raison Sociale</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Abréviation</th>
              <th>Zone</th>
              <th>User</th>
              <th colSpan={2} >Action</th>
            </tr>
          </thead>
          <tbody class="text-center">
            {fournisseurs.map((fournisseur) => (
              <tr key={fournisseur.id}>
                <td>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="checkbox"></input>
                  </div>
                </td>
                <td>{fournisseur.id}</td>
                <td>{fournisseur.raison_sociale}</td>
                <td>{fournisseur.adresse}</td>
                <td>{fournisseur.tele}</td>
                <td>{fournisseur.ville}</td>
                <td>{fournisseur.abreviation}</td>
                <td>{fournisseur.zone}</td>
                <td>{fournisseur.user_id}</td>
                <td class="col-2 text-center">
                  <button
                    className="col-3 btn btn-warning mx-2"
                    onClick={() => handleEdit(fournisseur.id)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="col-3 btn btn-danger mx-2"
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
        <div class="text-center"><h5>Loading...</h5></div>
      )}
    </div>
    </div>
  );

}
export default FournisseurList;
