import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from 'react-bootstrap';
import Navigation from "../nav/Navigation";
import "../style.css"

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    raison_sociale: '',
    adresse: '',
    tele: '',
    ville: '',
    abreviation: '',
    zone: '',
    user_id: '',
  });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
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

  const handleSubmit = (e) => {
    console.log(handleSubmit);
    e.preventDefault();
    axios
      .post('http://localhost:8000/api/clients', clients)
      .then(() => {
        fetchClients();
        Swal.fire({
          icon: 'success',
          title: 'Succès!',
          text: 'Client ajouté avec succès.',
        });
        setFormData({
          raison_sociale: '',
          adresse: '',
          tele: '',
          ville: '',
          abreviation: '',
          zone: '',
          user_id: '',
        });
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout du client:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: "Échec de l'ajout du client.",
        });
      });
  };


  return (
    <div className="col" >
      <Navigation />

      <h2 className="text-center m-2">Liste des Clients</h2>

      <div className="add-Ajout-form">
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Ajouter un Client
          </Button>
        )}
        {showForm && (
          <Form className="col-8 row " onSubmit={handleSubmit}>
            <Button className="col-1" variant="danger" onClick={() => setShowForm(false)}>
              X
            </Button>
            <h4 className="text-center">Ajouter un Client</h4>
            <Form.Group className="col-6 m-2" controlId="raison_sociale">
              <Form.Label>Raison Sociale</Form.Label>
              <Form.Control
                type="text"
                name="raison_sociale"
                value={clients.raison_sociale}
                onChange={handleChange}
                placeholder="Raison Sociale"
              />
            </Form.Group>
            <Form.Group className="col-10 m-2" controlId="adresse">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type="text"
                name="adresse"
                value={clients.adresse}
                onChange={handleChange}
                placeholder="Adresse"
              />
            </Form.Group>
            <Form.Group className="col-6 m-2" controlId="tele">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="text"
                name="tele"
                value={clients.tele}
                onChange={handleChange}
                placeholder="06XXXXXXXX"
              />
            </Form.Group>
            <Form.Group className="col-4 m-2" controlId="ville">
              <Form.Label>Ville</Form.Label>
              <Form.Control
                type="text"
                name="ville"
                value={clients.ville}
                onChange={handleChange}
                placeholder="Ville"
              />
            </Form.Group>
            <Form.Group className="col-6 m-2" controlId="abreviation">
              <Form.Label>Abréviation</Form.Label>
              <Form.Control
                type="text"
                name="abreviation"
                value={clients.abreviation}
                onChange={handleChange}
                placeholder="Abréviation"
              />
            </Form.Group>

            <Form.Group className="col-4 m-2" controlId="zone">
              <Form.Label>Zone</Form.Label>
              <Form.Control
                type="text"
                name="zone"
                value={clients.zone}
                onChange={handleChange}
                placeholder="Zone"
              />
            </Form.Group>
            <Form.Group className="col-4 m-2 mb-3" controlId="user_id">
              <Form.Label>Utilisateur</Form.Label>
              <Form.Control
                type="text"
                name="user_id"
                value={clients.user_id}
                onChange={handleChange}
                placeholder="user_id"
              />
            </Form.Group>
            <Form.Group className="col-7 mt-5" >
              <Button className="col-5" variant="primary" type="submit">
                Ajouter
              </Button>
            </Form.Group>
          </Form>
        )}
      </div>
      <div className="container mt-5" >
        {clients && clients.length > 0 ? (
          <table className="table table-hover table-bordered">
            <thead className="text-center">
              <tr>
                <th colSpan="2">ID</th>
                <th>Raison Sociale</th>
                <th>Adresse</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Abréviation</th>
                <th>Zone</th>
                <th>User</th>
                <th className="text-center ml-5">Action</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="custom-control custom-checkbox">
                      <input type="checkbox" className="custom-control-input" id="checkbox"></input>
                    </div>
                  </td>
                  <td>{client.id}</td>
                  <td>{client.raison_sociale}</td>
                  <td>{client.adresse}</td>
                  <td>{client.tele}</td>
                  <td>{client.ville}</td>
                  <td>{client.abreviation}</td>
                  <td>{client.zone}</td>
                  <td>{client.user_id}</td>
                  <td className="col-2 text-center">
                    <button
                      className="col-3 btn btn-warning mx-2"
                      onClick={() => handleEdit(client.id)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="col-3 btn btn-danger mx-2"
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
          <div className="text-center"><h5>Loading...</h5></div>
        )}
      </div>
    </div >
  );
};

export default ClientList;
