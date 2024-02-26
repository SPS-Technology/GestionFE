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

const FournisseurList = () => {
  const [existingFournisseur, setExistingFournisseur] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFournisseurs, setFilteredFournisseurs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [fournisseurs, setFournisseurs] = useState([]);
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

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/fournisseurs"
      );

      console.log("API Response:", response.data);

      setFournisseurs(response.data.fournisseur);

      const usersResponse = await axios.get("http://localhost:8000/api/users");
      setUsers(usersResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  useEffect(() => {
    const filtered = fournisseurs.filter((fournisseur) =>
      fournisseur.raison_sociale
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    setFilteredFournisseurs(filtered);
  }, [fournisseurs, searchTerm]);

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
          .delete(`http://localhost:8000/api/fournisseurs/${id}`)
          .then((response) => {
            if (response.data.status === "success") {
              fetchFournisseurs();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: response.data.message,
              });
            } else {
              console.error(response.data.message);
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: response.data.message,
              });
            }
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la suppression du fournisseur:",
              error
            );
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la suppression du fournisseur.",
            });
          });
      } else {
        console.log("Suppression annulée");
      }
    });

    setSelectedItems([]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(fournisseurs.map((fournisseur) => fournisseur.id));
    }
  };

  const printList = (tableId, title, fournisseurList) => {
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
                  Array.isArray(fournisseurList)
                    ? fournisseurList.map((item) => `<li>${item}</li>`).join("")
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
    const selectedFournisseurs = fournisseurs.filter((fournisseur) =>
      selectedItems.includes(fournisseur.id)
    );
    const rows = selectedFournisseurs.map((fournisseur) => [
      fournisseur.id,
      fournisseur.raison_sociale,
      fournisseur.adresse,
      fournisseur.tele,
      fournisseur.ville,
      fournisseur.abreviation,
      fournisseur.zone,
      fournisseur.user_id,
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
    pdf.save("fournisseurs.pdf");
  };

  const exportToExcel = () => {
    const selectedFournisseurs = fournisseurs.filter((fournisseur) =>
      selectedItems.includes(fournisseur.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedFournisseurs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fournisseurs");
    XLSX.writeFile(wb, "fournisseurs.xlsx");
  };

  const handleEdit = (id) => {
    const foundFournisseur = fournisseurs.find(
      (fournisseur) => fournisseur.id === id
    );

    setExistingFournisseur(foundFournisseur);
    setFormData({
      raison_sociale: foundFournisseur.raison_sociale,
      adresse: foundFournisseur.adresse,
      tele: foundFournisseur.tele,
      ville: foundFournisseur.ville,
      abreviation: foundFournisseur.abreviation,
      zone: foundFournisseur.zone,
      user_id: foundFournisseur.user_id,
    });

    setShowEditForm(true); // Show the edit form
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    axios
      .put(
        `http://localhost:8000/api/fournisseurs/${existingFournisseur.id}`,
        formData
      )
      .then(() => {
        fetchFournisseurs();
        setShowEditForm(false); // Close the edit form after submission
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: "Fournisseur modifié avec succès.",
        });
      })
      .catch((error) => {
        console.error("Erreur lors de la modification du fournisseur:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: "Échec de la modification du fournisseur.",
        });
      });
  };

  const handleDelete = (id) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ?");
  
    if (isConfirmed) {
      axios
        .delete(`http://localhost:8000/api/fournisseurs/${id}`)
        .then((response) => {
          if (response.data.message) {
            // La suppression a réussi
            fetchFournisseurs();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: response.data.message,
            });
          } else if (response.data.error) {
            // Une erreur s'est produite
            if (response.data.error.includes("Cannot delete or update a parent row: a foreign key constraint fails")) {
              // Erreur de contrainte d'intégrité violée
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Impossible de supprimer le fournisseur car il a des produits associés.",
              });
            } else {
              // Pour d'autres erreurs
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: response.data.error,
              });
            }
          }
        })
        .catch((error) => {
          // Erreur lors de la requête
          console.error("Erreur lors de la suppression du fournisseur:", error);
          Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: `Échec de la suppression du fournisseur. Veuillez consulter la console pour plus d'informations.`,
          });
        });
    } else {
      console.log("Suppression annulée");
    }
  };
  
  
  
  const handleAddFournisseur = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8000/api/fournisseurs", formData)
      .then(() => {
        fetchFournisseurs();
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: "Fournisseur ajouté avec succès.",
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
        console.error("Erreur lors de l'ajout du fournisseur:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: "Échec de l'ajout du fournisseur.",
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
        <h1 className="my-4">Liste des Fournisseurs</h1>
        <div className="search-container mb-3">
          <Search onSearch={handleSearch} />
        </div>
        <div className="add-Ajout-form">
          {!showAddForm && (
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              Ajouter un fournisseur
            </Button>
          )}
          {showAddForm && (
            <Form className="col-8 row " onSubmit={handleAddFournisseur}>
              <Button
                className="col-1"
                variant="danger"
                onClick={() => setShowAddForm(false)}
              >
                X
              </Button>
              <h4 className="text-center">Ajouter un fournisseur</h4>
              <Form.Group className="col-6 m-2" controlId="raison_sociale">
                <Form.Label>Raison Sociale</Form.Label>
                <Form.Control
                  type="text"
                  name="raison_sociale"
                  value={fournisseurs.raison_sociale}
                  onChange={handleChange}
                  placeholder="Raison Sociale"
                />
              </Form.Group>
              <Form.Group className="col-10 m-2" controlId="adresse">
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                  type="text"
                  name="adresse"
                  value={fournisseurs.adresse}
                  onChange={handleChange}
                  placeholder="Adresse"
                />
              </Form.Group>
              <Form.Group className="col-6 m-2" controlId="tele">
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  type="text"
                  name="tele"
                  value={fournisseurs.tele}
                  onChange={handleChange}
                  placeholder="06XXXXXXXX"
                />
              </Form.Group>
              <Form.Group className="col-4 m-2" controlId="ville">
                <Form.Label>Ville</Form.Label>
                <Form.Control
                  type="text"
                  name="ville"
                  value={fournisseurs.ville}
                  onChange={handleChange}
                  placeholder="Ville"
                />
              </Form.Group>
              <Form.Group className="col-6 m-2" controlId="abreviation">
                <Form.Label>Abréviation</Form.Label>
                <Form.Control
                  type="text"
                  name="abreviation"
                  value={fournisseurs.abreviation}
                  onChange={handleChange}
                  placeholder="Abréviation"
                />
              </Form.Group>

              <Form.Group className="col-4 m-2" controlId="zone">
                <Form.Label>Zone</Form.Label>
                <Form.Control
                  type="text"
                  name="zone"
                  value={fournisseurs.zone}
                  onChange={handleChange}
                  placeholder="Zone"
                />
              </Form.Group>
              {/* <Form.Group className="col-4 m-2" controlId="user_id">
                <Form.Label>user_id</Form.Label>
                <Form.Control
                  type="text"
                  name="user_id"
                  value={fournisseurs.user_id}
                  onChange={handleChange}
                  placeholder="user_id"
                />
              </Form.Group> */}
              <Form.Group className="col-4 m-2 mb-3" controlId="user_id">
                <Form.Label>Sélectionnez un utilisateur</Form.Label>
                <Form.Control
                  as="select"
                  name="user_id"
                  value={fournisseurs.user_id}
                  onChange={handleChange}
                >
                 
                  <option value="">Sélectionnez un utilisateur</option>

                 
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
            <Form className="col-8 row " onSubmit={handleEditSubmit}>
              <Button
                className="col-1"
                variant="danger"
                onClick={() => setShowEditForm(false)}
              >
                X
              </Button>
              <h4 className="text-center">Modifier un fournisseur</h4>
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
        <table className="table" id="fournisseursTable">
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFournisseurs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((fournisseur) => (
                <tr key={fournisseur.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(fournisseur.id)}
                      onChange={() => handleCheckboxChange(fournisseur.id)}
                    />
                  </td>
                  <td>{fournisseur.id}</td>
                  <td>{fournisseur.raison_sociale}</td>
                  <td>{fournisseur.adresse}</td>
                  <td>{fournisseur.tele}</td>
                  <td>{fournisseur.ville}</td>
                  <td>{fournisseur.abreviation}</td>
                  <td>{fournisseur.zone}</td>
                  <td>{fournisseur.user.name}</td>
                  {/* <td>
                  {fournisseur.user.photo && (
                      <img
                        src={fournisseur.user.photo}
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredFournisseurs.length}
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
                  "fournisseursTable",
                  "Liste des Fournisseurs",
                  fournisseurs
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
export default FournisseurList;