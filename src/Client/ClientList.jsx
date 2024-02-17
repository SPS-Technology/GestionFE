import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navigation from "../Acceuil/Navigation";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/clients");

      console.log("API Response:", response.data);

      setClients(response.data.client);

      const userResponse = await axios.get("http://localhost:8000/api/user");
      setUsers(userResponse.data.users);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = (id) => {
    const existingClient = clients.find(
      (client) => client.id === id
    );


    Swal.fire({
      title: "Modifier Client",
      html: `
        <label for="raison_sociale">Raison Sociale</label>
        <input type="text" id="raison_sociale" class="swal2-input" value="${existingClient.raison_sociale
        }">

        <label for="adresse">Adresse</label>
        <input type="text" id="adresse" class="swal2-input" value="${existingClient.adresse
        }">

        <label for="tele">Téléphone</label>
        <input type="text" id="tele" class="swal2-input" value="${existingClient.tele
        }">

        <label for="ville">Ville</label>
        <input type="text" id="ville" class="swal2-input" value="${existingClient.ville
        }">

        <label for="abreviation">Abréviation</label>
        <input type="text" id="abreviation" class="swal2-input" value="${existingClient.abreviation
        }">

        <label for="zone">Zone</label>
        <input type="text" id="zone" class="swal2-input" value="${existingClient.zone
        }">

        <label for="user_id">user</label>
        <input type="text" id="user_id" class="swal2-input" value="${existingClient.user_id
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
            console.error(
              "Erreur lors de la modification du client:",
              error
            );
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
  }

  const handleDelete = (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce client ?"
    );

    if (isConfirmed) {
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
        
        <label for="user_id">user</label>
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
          .post("http://localhost:8000/api/clients", result.value, {
            withCredentials: true,
            headers: {
              "X-CSRF-TOKEN": document.head.querySelector(
                'meta[name="csrf-token"]'
              ).content,
            },
          })
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
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.raison_sociale}</td>
                <td>{client.adresse}</td>
                <td>{client.tele}</td>
                <td>{client.ville}</td>
                <td>{client.abreviation}</td>
                <td>{client.zone}</td>
                <td>{client.user_id}</td>
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
