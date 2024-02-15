import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navigation from "../Acceuil/Navigation";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({
    raison_sociale: "",
    adresse: "",
    tel: "",
    ville: "",
    abreviation: "",
    zone: "",
  });

  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/clients");
      console.log("API Response:", response.data);
      setClients(response.data.clients);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = (id) => {
    const existingClient = clients.find((client) => client.id === id);

    Swal.fire({
      title: "Modifier Client",
      html:
        `<label for="raison_sociale">Raison Sociale</label>` +
        `<input type="text" id="raison_sociale" class="swal2-input" value="${existingClient.raison_sociale}">` +
        `<label for="adresse">Adresse</label>` +
        `<input type="text" id="adresse" class="swal2-input" value="${existingClient.adresse}">` +
        `<label for="tel">Téléphone</label>` +
        `<input type="text" id="tel" class="swal2-input" value="${existingClient.tel}">` +
        `<label for="ville">Ville</label>` +
        `<input type="text" id="ville" class="swal2-input" value="${existingClient.ville}">` +
        `<label for="abreviation">Abréviation</label>` +
        `<input type="text" id="abreviation" class="swal2-input" value="${existingClient.abreviation}">` +
        `<label for="zone">Zone</label>` +
        `<input type="text" id="zone" class="swal2-input" value="${existingClient.zone}">`,
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
          zone: document.getElementById("zone").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Client modifié:", result.value);
        axios
          .put(`http://localhost:8000/api/clients/${id}`, result.value)
          .then(() => {
            fetchClients();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Client modifié avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de la modification du client:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la modification du client.",
            });
          });
      } else {
        console.log("Modification annulée");
      }
    });
  };

  const handleDelete = (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce client ?"
    );

    if (isConfirmed) {
      console.log(`Suppression confirmée pour l'ID du client ${id}`);
      axios
        .delete(`http://localhost:8000/api/clients/${id}`)
        .then(() => {
          fetchClients();
          Swal.fire({
            icon: "success",
            title: "Succès!",
            text: "Client supprimé avec succès.",
          });
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression du client:", error);
          Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: "Échec de la suppression du client.",
          });
        });
    } else {
      console.log("Suppression annulée");
    }
  };

  const handleAddClient = () => {
    Swal.fire({
      title: "Ajouter Client",
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
        '<input type="text" id="abreviation" class="swal2-input" placeholder="Abréviation">' +
        '<label for="zone">Zone</label>' +
        '<input type="text" id="zone" class="swal2-input" placeholder="Zone">',
      confirmButtonText: "ajouter",
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
          zone: document.getElementById("zone").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Nouveau client:", result.value);
        axios
          .post("http://localhost:8000/api/clients", result.value)
          .then(() => {
            fetchClients();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Client ajouté avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de l'ajout du client:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de l'ajout du client.",
            });
          });
      }
    });
  };

  return (
    <div>
      <Navigation />
      <h2>Liste des Clients</h2>
      <button className="btn btn-primary mb-3" onClick={handleAddClient}>
        Ajouter Client
      </button>
      {clients && clients.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Raison Sociale</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Abréviation</th>
              <th>Zone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.raison_sociale}</td>
                <td>{client.adresse}</td>
                <td>{client.tel}</td>
                <td>{client.ville}</td>
                <td>{client.abreviation}</td>
                <td>{client.zone}</td>
                <td>
                  <button
                    className="btn btn-warning ms-2"
                    onClick={() => handleEdit(client.id)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(client.id)}
                  >
                    <i className="fas fa-minus-circle"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucun client disponible</p>
      )}
    </div>
  );
};

export default ClientList;
