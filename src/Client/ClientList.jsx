import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import "../style.css";
import Navigation from "../Acceuil/Navigation";
import TablePagination from "@mui/material/TablePagination";
import Search from "../Acceuil/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFilePdf,
  faFileExcel,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ClientList = () => {
<<<<<<< HEAD
  const [existingClient, setExistingClient] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredclients, setFilteredclients] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [clients, setclients] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
    const [formData, setFormData] = useState({
    raison_sociale: "",
    adresse: "",
    tele: "",
    ville: "",
    abreviation: "",
    zone: "",
    user_id: "",
  });
=======
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
>>>>>>> 6409aaa26da41d57f404c09ab3e872573da9b7b9

  const fetchclients = async () => {
    try {
<<<<<<< HEAD
      const response = await axios.get(
        "http://localhost:8000/api/clients"
      );

      console.log("API Response:", response.data);

      setclients(response.data.client);

      const usersResponse = await axios.get("http://localhost:8000/api/users");
      setUsers(usersResponse.data);
=======
      const response = await axios.get("http://localhost:8000/api/clients");

      console.log("API Response:", response.data);

      setClients(response.data.client);

      const userResponse = await axios.get("http://localhost:8000/api/user");
      setUsers(userResponse.data.users);
>>>>>>> 6409aaa26da41d57f404c09ab3e872573da9b7b9
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchclients();
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    const filtered = clients.filter((client) =>
      client.raison_sociale
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    setFilteredclients(filtered);
  }, [clients, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleCheckboxChange = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteSelected = () => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ?");

    selectedItems.forEach((id) => {
      if (isConfirmed) {
        axios
          .delete(`http://localhost:8000/api/clients/${id}`)
=======
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
>>>>>>> 6409aaa26da41d57f404c09ab3e872573da9b7b9
          .then(() => {
            fetchclients();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "client supprimé avec succès.",
            });
          })
          .catch((error) => {
            console.error(
<<<<<<< HEAD
              "Erreur lors de la suppression du client:",
=======
              "Erreur lors de la modification du client:",
>>>>>>> 6409aaa26da41d57f404c09ab3e872573da9b7b9
              error
            );
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la suppression du client.",
            });
          });
      } else {
        console.log("Suppression annulée");
      }
    });
<<<<<<< HEAD
    fetchclients();

    setSelectedItems([]);
  };
=======
  }
>>>>>>> 6409aaa26da41d57f404c09ab3e872573da9b7b9

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(clients.map((client) => client.id));
    }
  };

  const printList = (tableId, title, clientList) => {
    const printWindow = window.open(" ", "_blank", " ");

    if (printWindow) {
      const tableToPrint = document.getElementById(tableId);

      if (tableToPrint) {
        const newWindowDocument = printWindow.document;
        newWindowDocument.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <h1 class="h1"> Gestion Commandes </h1>
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
              <style>
  
                body {
                  font-family: 'Arial', sans-serif;
                  margin-bottom: 60px;
                }
  
                .page-header {
                  text-align: center;
                  font-size: 24px;
                  margin-bottom: 20px;
                }
  
                .h1 {
                  text-align: center;
                }
  
                .list-title {
                  font-size: 18px;
                  margin-bottom: 10px;
                }
  
                .header {
                  font-size: 16px;
                  margin-bottom: 10px;
                }
  
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 20px;
                }
  
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
  
                .footer {
                  position: fixed;
                  bottom: 0;
                  width: 100%;
                  text-align: center;
                  font-size: 14px;
                  margin-top: 30px;
                  background-color: #fff;
                }
  
                @media print {
                  .footer {
                    position: fixed;
                    bottom: 0;
                  }
  
                  body {
                    margin-bottom: 0;
                  }
                  .no-print {
                    display: none;
                  }
                }
  
                .content-wrapper {
                  margin-bottom: 100px;
                }
  
                .extra-space {
                  margin-bottom: 30px;
                }
              </style>
            </head>
            <body>
              <div class="page-header print-no-date">${title}</div>
              <ul>
                ${
                  Array.isArray(clientList)
                    ? clientList.map((item) => `<li>${item}</li>`).join("")
                    : ""
                }
              </ul>
              <div class="content-wrapper">
                ${tableToPrint.outerHTML}
              </div>
              <script>
                setTimeout(() => {
                  window.print();
                  window.onafterprint = function () {
                    window.close();
                  };
                }, 1000);
              </script>
            </body>
            </html>
          `);

        newWindowDocument.close();
      } else {
        console.error(`Table with ID '${tableId}' not found.`);
      }
    } else {
      console.error("Error opening print window.");
    }
  };

  const exportToPdf = () => {
    const pdf = new jsPDF();

    // Define the columns and rows for the table
    const columns = [
      "ID",
      "Raison Sociale",
      "Adresse",
      "Téléphone",
      "Ville",
      "Abréviation",
      "Zone",
      "User",
    ];
    const selectedclients = clients.filter((client) =>
      selectedItems.includes(client.id)
    );
    const rows = selectedclients.map((client) => [
      client.id,
      client.raison_sociale,
      client.adresse,
      client.tele,
      client.ville,
      client.abreviation,
      client.zone,
      client.user_id,
    ]);

    // Set the margin and padding
    const margin = 10;
    const padding = 5;

    // Calculate the width of the columns
    const columnWidths = columns.map(
      (col) => pdf.getStringUnitWidth(col) * 5 + padding * 2
    );
    const tableWidth = columnWidths.reduce((total, width) => total + width, 0);

    // Calculate the height of the rows
    const rowHeight = 10;
    const tableHeight = rows.length * rowHeight;

    // Set the table position
    const startX = (pdf.internal.pageSize.width - tableWidth) / 2;
    const startY = margin;

    // Add the table headers
    pdf.setFont("helvetica", "bold");
    pdf.setFillColor(200, 220, 255);
    pdf.rect(startX, startY, tableWidth, rowHeight, "F");
    pdf.autoTable({
      head: [columns],
      startY: startY + padding,
      styles: {
        fillColor: [200, 220, 255],
        textColor: [0, 0, 0],
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: columnWidths[0] },
        1: { cellWidth: columnWidths[1] },
        2: { cellWidth: columnWidths[2] },
        3: { cellWidth: columnWidths[3] },
        4: { cellWidth: columnWidths[4] },
        5: { cellWidth: columnWidths[5] },
        6: { cellWidth: columnWidths[6] },
        7: { cellWidth: columnWidths[7] },
      },
    });

    // Add the table rows
    pdf.setFont("helvetica", "");
    pdf.autoTable({
      body: rows,
      startY: startY + rowHeight + padding * 2,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: columnWidths[0] },
        1: { cellWidth: columnWidths[1] },
        2: { cellWidth: columnWidths[2] },
        3: { cellWidth: columnWidths[3] },
        4: { cellWidth: columnWidths[4] },
        5: { cellWidth: columnWidths[5] },
        6: { cellWidth: columnWidths[6] },
        7: { cellWidth: columnWidths[7] },
      },
    });

    // Save the PDF
    pdf.save("clients.pdf");
  };

  const exportToExcel = () => {
    const selectedclients = clients.filter((client) =>
      selectedItems.includes(client.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedclients);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "clients");
    XLSX.writeFile(wb, "clients.xlsx");
  };

  const handleEdit = (id) => {
    const foundclient = clients.find(
      (client) => client.id === id
    );

    setExistingClient(foundclient);
    setFormData({
      raison_sociale: foundclient.raison_sociale,
      adresse: foundclient.adresse,
      tele: foundclient.tele,
      ville: foundclient.ville,
      abreviation: foundclient.abreviation,
      zone: foundclient.zone,
      user_id: foundclient.user_id,
    });

    setShowEditForm(true); // Show the edit form
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    axios
      .put(
        `http://localhost:8000/api/clients/${existingClient.id}`,
        formData
      )
      .then(() => {
        fetchclients();
        setShowEditForm(false); // Close the edit form after submission
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: "client modifié avec succès.",
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
  };

  
  const handleDelete = (id) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ?");

    if (isConfirmed) {
      axios
        .delete(`http://localhost:8000/api/clients/${id}`)
        .then(() => {
          fetchclients();
          Swal.fire({
            icon: "success",
            title: "Succès!",
            text: "client supprimé avec succès.",
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

<<<<<<< HEAD
  const handleAddclient = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8000/api/clients", formData)
      .then(() => {
        fetchclients();
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: "Client ajouté avec succès.",
        });

        setFormData({
          raison_sociale: "",
          adresse: "",
          tele: "",
          ville: "",
          abreviation: "",
          zone: "",
          user_id: "",
        });

        setShowAddForm(false); // Close the add form after submission
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout du client:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: "Échec de l'ajout du client.",
        });
      });
  };
  // const handleCancel = () => {
  //   setShowForm(false);
  //   setFormData({
  //     raison_sociale: "",
  //     adresse: "",
  //     tele: "",
  //     ville: "",
  //     abreviation: "",
  //     zone: "",
  //     user_id: "",
  //   });
  // };

  return (
    <div>
      <Navigation />
      <div className="container">
        <h1 className="my-4">Liste des clients</h1>
        <div className="search-container mb-3">
          <Search onSearch={handleSearch} />
        </div>
        <div className="add-Ajout-form">
          {!showAddForm && (
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              Ajouter un client
            </Button>
          )}
          {showAddForm && (
            <Form className="col-8 row " onSubmit={handleAddclient}>
              <Button
                className="col-1"
                variant="danger"
                onClick={() => setShowAddForm(false)}
              >
                X
              </Button>
              <h4 className="text-center">Ajouter un client</h4>
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
                <Form.Label>Sélectionnez un utilisateur</Form.Label>
                <Form.Control
                  as="select"
                  name="user_id"
                  value={clients.user_id}
                  onChange={handleChange}
                >
                  {/* Option par défaut avec une valeur nulle */}
                  <option value="">Sélectionnez un utilisateur</option>

                  {/* Options pour les utilisateurs */}
                  {users &&
                    users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="col-7 mt-5">
                <Button className="col-5" variant="primary" type="submit">
                  Ajouter
                </Button>
              </Form.Group>
            </Form>
          )}
        </div>
        <div className="add-Ajout-form">
          {showEditForm && (
            <Form
              className="col-8 row "
              onSubmit={handleEditSubmit}
            >
              <Button
                className="col-1"
                variant="danger"
                onClick={() => setShowEditForm(false)}
              >
                X
              </Button>
              <h4 className="text-center">Modifier un client</h4>
              <Form.Group className="col-6 m-2" controlId="raison_sociale">
                <Form.Label>Raison Sociale</Form.Label>
                <Form.Control
                  type="text"
                  name="raison_sociale"
                  value={formData.raison_sociale}
                  onChange={handleChange}
                  placeholder="Raison Sociale"
                />
              </Form.Group>
              <Form.Group className="col-10 m-2" controlId="adresse">
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Adresse"
                />
              </Form.Group>
              <Form.Group className="col-6 m-2" controlId="tele">
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  type="text"
                  name="tele"
                  value={formData.tele}
                  onChange={handleChange}
                  placeholder="06XXXXXXXX"
                />
              </Form.Group>
              <Form.Group className="col-4 m-2" controlId="ville">
                <Form.Label>Ville</Form.Label>
                <Form.Control
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="Ville"
                />
              </Form.Group>
              <Form.Group className="col-6 m-2" controlId="abreviation">
                <Form.Label>Abréviation</Form.Label>
                <Form.Control
                  type="text"
                  name="abreviation"
                  value={formData.abreviation}
                  onChange={handleChange}
                  placeholder="Abréviation"
                />
              </Form.Group>
              <Form.Group className="col-4 m-2" controlId="zone">
                <Form.Label>Zone</Form.Label>
                <Form.Control
                  type="text"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  placeholder="Zone"
                />
              </Form.Group>
              <Form.Group className="col-4 m-2 mb-3" controlId="user_id">
                <Form.Label>Sélectionnez un utilisateur</Form.Label>
                <Form.Control
                  as="select"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                >
                  {/* Option par défaut avec une valeur nulle */}
                  <option value="">Sélectionnez un utilisateur</option>

                  {/* Options pour les utilisateurs */}
                  {users &&
                    users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="col-7 mt-5">
                <Button className="col-5" variant="primary" type="submit">
                  Modifier
                </Button>
              </Form.Group>
            </Form>
          )}
        </div>
        <table className="table" id="clientsTable">
=======
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
>>>>>>> 6409aaa26da41d57f404c09ab3e872573da9b7b9
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              </th>
              <th>ID</th>
              <th>Raison Sociale</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Abréviation</th>
              <th>Zone</th>
              <th>User</th>
<<<<<<< HEAD
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredclients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((client) => (
                <tr key={client.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(client.id)}
                      onChange={() => handleCheckboxChange(client.id)}
                    />
                  </td>
                  <td>{client.id}</td>
                  <td>{client.raison_sociale}</td>
                  <td>{client.adresse}</td>
                  <td>{client.tele}</td>
                  <td>{client.ville}</td>
                  <td>{client.abreviation}</td>
                  <td>{client.zone}</td>
                  <td>{client.user.name}</td>
                  {/* <td>
                  {client.user.photo && (
                      <img
                        src={client.user.photo}
                        alt="Photo de l'utilisateur"
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "70%",
                        }}
                      />
                    )}
                    </td> */}
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
=======
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
>>>>>>> 6409aaa26da41d57f404c09ab3e872573da9b7b9
          </tbody>
        </table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredclients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <div className="d-flex justify-content-between">
          <div>
            <Button
              variant="danger"
              disabled={selectedItems.length === 0}
              onClick={handleDeleteSelected}
              className="me-2"
            >
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              Supprimer sélection
            </Button>
            <Button variant="info" onClick={exportToPdf} className="me-2">
              <FontAwesomeIcon icon={faFilePdf} className="me-2" />
              Export PDF
            </Button>
            <Button variant="success" onClick={exportToExcel} className="me-2">
              <FontAwesomeIcon icon={faFileExcel} className="me-2" />
              Export Excel
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                printList(
                  "clientsTable",
                  "Liste des clients",
                  clients
                )
              }
            >
              <FontAwesomeIcon icon={faPrint} className="me-2" />
              Imprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClientList;
