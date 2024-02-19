import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navigation from "../Acceuil/Navigation";

const CommandeList = () => {
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [ligne_commandes, setLigne] = useState([]);
  const [produits, setproduits] = useState([]);
  const [statusCommandes, setStatusCommandes] = useState([]);

  const fetchCommandes = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/commandes");
      console.log("API Response:", response.data);
      setCommandes(response.data.commandes);

      const clientsResponse = await axios.get(
        "http://localhost:8000/api/clients"
      );
      setClients(clientsResponse.data.client);

      const ligneCommandesResponse = await axios.get(
        "http://localhost:8000/api/ligne_commandes"
      );
      setLigne(ligneCommandesResponse.data.ligne_commandes);

      const statusCommandesResponse = await axios.get(
        "http://localhost:8000/api/status_commandes"
      );
      setStatusCommandes(statusCommandesResponse.data.status_commandes);

      const ProduitsResponse = await axios.get(
        "http://localhost:8000/api/produits"
      );
      console.log("Produits", ProduitsResponse);
      setproduits(ProduitsResponse.data.produit);

      const userResponse = await axios.get("http://localhost:8000/api/user");
      setUsers(userResponse.data.users);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const handleEditCommande = (id) => {
    const existingCommande = commandes.find((cmd) => cmd.id === id);

    const ClientsOptions = clients.map((client) => ({
      value: client.id,
      label: client.raison_sociale,
    }));

    Swal.fire({
      title: "Modifier Commande",
      html: `
            <label for="dateCommande">Date Commande</label>
            <input type="text" id="dateCommande" class="swal2-input" value="${
              existingCommande.dateCommande
            }" disabled>

            <label for="client_id">Clients</label>
            <select id="client_id" class="swal2-input">${ClientsOptions.map(
              (option) =>
                `<option value="${option.value}" ${
                  existingCommande.client_id === option.value ? "selected" : ""
                }>${option.label}</option>`
            )}</select>

            <label for="user_id">User</label>
            <input type="text" id="user_id" class="swal2-input" value="${
              existingCommande.user_id
            }">

            <label for="status">Statut</label>
            <input type="text" id="status" class="swal2-input" value="${
              existingCommande.status
            }">

            <label for="quantite">Quantité</label>
            <input type="text" id="quantite" class="swal2-input" value="${
              existingCommande.ligne_commandes
                ? existingCommande.ligne_commandes.quantite
                : ""
            }">

            <label for="prix_unitaire">Prix unitaire</label>
            <input type="text" id="prix_unitaire" class="swal2-input" value="${
              existingCommande.ligne_commandes
                ? existingCommande.ligne_commandes.prix_unitaire
                : ""
            }">

            <label for="status_commande">Statut Commande</label>
            <input type="text" id="status_commande" class="swal2-input" value="${
              existingCommande.status_commandes
                ? existingCommande.status_commandes.status
                : ""
            }">

            <label for="date_status">Date Status</label>
            <input type="text" id="date_status" class="swal2-input" value="${
              existingCommande.status_commandes
                ? existingCommande.status_commandes.date_status
                : ""
            }">
        `,
      confirmButtonText: "Modifier",
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          dateCommande: document.getElementById("dateCommande").value,
          client_id: document.getElementById("client_id").value,
          user_id: document.getElementById("user_id").value,
          status: document.getElementById("status").value,
          ligne_commandes: {
            quantite: document.getElementById("quantite").value,
            prix_unitaire: document.getElementById("prix_unitaire").value,
          },
          status_commandes: {
            status: document.getElementById("status_commande").value,
            date_status: document.getElementById("date_status").value,
          },
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`http://localhost:8000/api/commandes/${id}`, result.value)
          .then(() => {
            fetchCommandes();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Commande modifiée avec succès.",
            });
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la modification de la commande:",
              error
            );
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la modification de la commande.",
            });
          });
      } else {
        console.log("Modification annulée");
      }
    });
  };

  const handleDeleteCommande = (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette commande ?"
    );

    if (isConfirmed) {
      axios
        .delete(`http://localhost:8000/api/commandes/${id}`)
        .then(() => {
          fetchCommandes();
          Swal.fire({
            icon: "success",
            title: "Succès!",
            text: "Commande supprimée avec succès.",
          });
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression de la commande:", error);
          Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: "Échec de la suppression de la commande.",
          });
        });
    } else {
      console.log("Suppression annulée");
    }
  };

  const handleAddCommande = () => {
    const ClientsOptions = clients.map((client) => ({
      value: client.id,
      label: client.raison_sociale,
    }));
    const ProduitsOptions = produits.map((produit) => ({
      value: produit.id,
      label: produit.nom,
    }));
    Swal.fire({
      title: "Ajouter Commande",
      html: `
            <label for="dateCommande">Date Commande</label>
            <input type="date" id="dateCommande" class="swal2-input" placeholder="Date Commande">

            <label for="client_id">Clients</label>
            <select id="client_id" class="swal2-input">${ClientsOptions.map(
              (option) =>
                `<option value="${option.value}">${option.label}</option>`
            )}</select>

            <label for="user_id">User</label>
            <input type="text" id="user_id" class="swal2-input" placeholder="User">

            <label for="produits_id">Produits</label>
      <select id="produits_id" class="swal2-input">${ProduitsOptions.map(
        (option) => `<option value="${option.value}">${option.label}</option>`
      )}</select>

            <label for="status">Statut</label>
            <input type="text" id="status" class="swal2-input" placeholder="Statut">

            <label for="quantite">Quantité</label>
            <input type="text" id="quantite" class="swal2-input" placeholder="Quantité">

            <label for="prix_unitaire">Prix unitaire</label>
            <input type="text" id="prix_unitaire" class="swal2-input" placeholder="Prix unitaire">

            <label for="status_commande">Statut Commande</label>
            <input type="text" id="status_commande" class="swal2-input" placeholder="Statut Commande">

            <label for="date_status">Date Status</label>
            <input type="date" id="date_status" class="swal2-input" placeholder="Date Status">

           
        `,
      confirmButtonText: "Ajouter",
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          dateCommande: document.getElementById("dateCommande").value,
          client_id: document.getElementById("client_id").value,
          user_id: document.getElementById("user_id").value,
          status: document.getElementById("status").value,
          quantite: document.getElementById("quantite").value,
          prix_unitaire: document.getElementById("prix_unitaire").value,
          status_commande: document.getElementById("status_commande").value,
          date_status: document.getElementById("date_status").value,
          produits_id: document.getElementById("produits_id").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post("http://localhost:8000/api/commandes", result.value)
          .then(() => {
            fetchCommandes();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Commande ajoutée avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de l'ajout de la commande:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de l'ajout de la commande.",
            });
          });
      }
    });
  };

  return (
    <div>
      <Navigation />
      <h2>Liste des Commandes</h2>
      <button className="btn btn-primary mb-3" onClick={handleAddCommande}>
        Ajouter Commande
      </button>
      {commandes && commandes.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date Commande</th>
              <th>User</th>
              <th>Client</th>
              <th>Status</th>
              <th>Quantite</th>
              <th>Prix unitaire</th>
              <th>Product name</th>
              <th>Status Commande</th>
              <th>Status Date</th>

              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((cmd) => (
              <tr key={cmd.id}>
                <td>{cmd.id}</td>
                <td>{cmd.dateCommande}</td>
                <td>{cmd.user.name}</td>
                <td>{cmd.client.raison_sociale}</td>
                <td>{cmd.status}</td>
                <td>
                  {cmd.lignes_commandes && cmd.lignes_commandes.length > 0 ? (
                    cmd.lignes_commandes.map((ligne) => (
                      <div key={ligne.id}>{ligne.quantite}</div>
                    ))
                  ) : (
                    <p></p>
                  )}
                </td>
                <td>
                  {cmd.lignes_commandes && cmd.lignes_commandes.length > 0 ? (
                    cmd.lignes_commandes.map((ligne) => (
                      <div key={ligne.id}>{ligne.prix_unitaire}</div>
                    ))
                  ) : (
                    <p></p>
                  )}
                </td>
                <td>
                  {cmd.lignes_commandes && cmd.lignes_commandes.length > 0 ? (
                    cmd.lignes_commandes.map((ligne) => {
                      // Find the product based on produit_id
                      const produit = produits.find(
                        (prod) => prod.id === ligne.produit_id
                      );

                      return (
                        <div key={ligne.id}>
                          {produit ? produit.nom : "Produit non trouvé"}
                        </div>
                      );
                    })
                  ) : (
                    <p></p>
                  )}
                </td>

                <td>
                  {cmd.status_commande && (
                    <div>{cmd.status_commande.status}</div>
                  )}
                </td>
                <td>
                  {cmd.status_commande && (
                    <div>{cmd.status_commande.date_status}</div>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-warning ms-2"
                    onClick={() => handleEditCommande(cmd.id)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteCommande(cmd.id)}
                  >
                    <i className="fas fa-minus-circle"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucune commande disponible</p>
      )}
    </div>
  );
};

export default CommandeList;
