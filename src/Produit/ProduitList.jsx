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

const ProduitList = () => {
  const [existingProduct, setExistingProduct] = useState({});
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [users, setUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    type_quantite: "",
    calibre: "",
    fournisseur_id: "",
    user_id: "",
  });

  const fetchProduits = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/produits");
      console.log("API Response:", response.data);
      setProduits(response.data.produit);

      const fournisseursResponse = await axios.get(
        "http://localhost:8000/api/fournisseurs"
      );
      setFournisseurs(fournisseursResponse.data.fournisseur);

      const usersResponse = await axios.get("http://localhost:8000/api/users");
      setUsers(usersResponse.data);
      console.log("users", users);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  useEffect(() => {
    // Filter fournisseurs based on the search term
    const filtered = produits.filter((prod) =>
      prod.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);
  }, [produits, searchTerm]);

  const handleSearch = (term) => {
    //setCurrentPage(1); // Reset to the first page when searching
    setSearchTerm(term);
  };

  const handleDelete = (id) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ?");

    if (isConfirmed) {
      axios
        .delete(`http://localhost:8000/api/produits/${id}`)
        .then(() => {
          fetchProduits();
          Swal.fire({
            icon: "success",
            title: "Succès!",
            text: "Fournisseur supprimé avec succès.",
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
    } else {
      console.log("Suppression annulée");
    }
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
          .delete(`http://localhost:8000/api/produits/${id}`)
          .then(() => {
            fetchProduits();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Produits supprimé avec succès.",
            });
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
    fetchProduits();

    setSelectedItems([]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (id) => {
    const foundProduits = produits.find((prod) => prod.id === id);

    setExistingProduct(foundProduits);
    setFormData({
      nom: foundProduits.nom,
      type_quantite: foundProduits.type_quantite,
      calibre: foundProduits.calibre,
      fournisseur_id: foundProduits.fournisseur_id,
      user_id: foundProduits.user_id,
    });

    setShowEditForm(true); // Show the edit form
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    axios
      .put(`http://localhost:8000/api/produits/${existingProduct.id}`, formData)
      .then(() => {
        fetchProduits();
        setShowEditForm(false); // Close the edit form after submission
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
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(produits.map((prod) => prod.id));
    }
  };

  const printList = (tableId, title, ProduitsList) => {
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
                  Array.isArray(ProduitsList)
                    ? ProduitsList.map((item) => `<li>${item}</li>`).join("")
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
    const columns = ["ID", "nom", "type_quantite", "calibre", "fournisseur_id"];
    const selectedProduits = produits.filter((prod) =>
      selectedItems.includes(prod.id)
    );
    const rows = selectedProduits.map((prod) => [
      prod.id,
      prod.nom,
      prod.type_quantite,
      prod.calibre,
      prod.fournisseur_id,
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
      },
    });

    // Save the PDF
    pdf.save("produits.pdf");
  };

  const exportToExcel = () => {
    const selectedProduits = produits.filter((prod) =>
      selectedItems.includes(prod.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedProduits);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produits");
    XLSX.writeFile(wb, "produits.xlsx");
  };

  //   const handleEdit = (id) => {
  //     const existingProduit = produits.find((produit) => produit.id === id);

  //     const fournisseurOptions = fournisseurs.map((fournisseur) => ({
  //       value: fournisseur.id,
  //       label: fournisseur.raison_sociale,
  //     }));

  //     Swal.fire({
  //       title: "Modifier Produit",
  //       html:
  //         `<label for="nom">Nom</label>` +
  //         `<input type="text" id="nom" class="swal2-input" value="${existingProduit.nom}">` +
  //         `<label for="type_quantite">Type Quantité</label>` +
  //         `<input type="text" id="type_quantite" class="swal2-input" value="${existingProduit.type_quantite}">` +
  //         `<label for="calibre">Calibre</label>` +
  //         `<input type="text" id="calibre" class="swal2-input" value="${existingProduit.calibre}">` +
  //         `<label for="user_id">User</label>` +
  //         `<input type="text" id="user_id" class="swal2-input" value="${existingProduit.user_id}">` +
  //         `<label for="fournisseur">Fournisseur</label>` +
  //         `<select id="fournisseur" class="swal2-input">
  //   <option value="">Aucun</option>
  //   ${fournisseurOptions.map(
  //     (option) => `<option value="${option.value}">${option.label}</option>`
  //   )}
  // </select>`,

  //       confirmButtonText: "modifier",
  //       focusConfirm: false,
  //       showCancelButton: true,
  //       cancelButtonText: "Annuler",
  //       preConfirm: () => {
  //         return {
  //           nom: document.getElementById("nom").value,
  //           type_quantite: document.getElementById("type_quantite").value,
  //           calibre: document.getElementById("calibre").value,
  //           fournisseur_id: document.getElementById("fournisseur").value,
  //           user_id: document.getElementById("user_id").value,
  //         };
  //       },
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         axios
  //           .put(`http://localhost:8000/api/produits/${id}`, result.value)
  //           .then(() => {
  //             fetchProduits();
  //             Swal.fire({
  //               icon: "success",
  //               title: "Succès!",
  //               text: "Produit modifié avec succès.",
  //             });
  //           })
  //           .catch((error) => {
  //             console.error("Erreur lors de la modification du produit:", error);
  //             Swal.fire({
  //               icon: "error",
  //               title: "Erreur!",
  //               text: "Échec de la modification du produit.",
  //             });
  //           });
  //       }
  //     });
  //   };

  const handleAddProduit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8000/api/produits", formData)
      .then(() => {
        fetchProduits();
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: "Produits ajouté avec succès.",
        });
        setFormData({
          nom: "",
          type_quantite: "",
          calibre: "",
          fournisseur_id: "",
          user_id: "",
        });
        setShowAddForm(false);
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout du produit:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: "Échec de l'ajout du produit.",
        });
      });
  };

  // const handleCancel = () => {
  //   setShowForm(false);
  //   setFormData({
  //     nom: "",
  //     type_quantite: "",
  //     calibre: "",
  //     fournisseur_id: "",
  //     user_id: "",
  //   });
  // };

  return (
    <div>
      <Navigation />
      <div className="container">
        <h1 className="my-4">Liste des Produits</h1>
        <div className="search-container mb-3">
          <Search onSearch={handleSearch} />
        </div>
        <div className="add-Ajout-form">
          {!showAddForm && (
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              Ajouter un Produit
            </Button>
          )}
          {showAddForm && (
            <Form className="col-8 row " onSubmit={handleAddProduit}>
              <Button
                className="col-1"
                variant="danger"
                onClick={() => setShowAddForm(false)}
              >
                X
              </Button>
              <h4 className="text-center">Ajouter un Produit</h4>
              <Form.Group className="col-6 m-2" controlId="nom">
                <Form.Label>Nom du Produit</Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={produits.nom}
                  onChange={handleChange}
                  placeholder="Nom du Produit"
                />
              </Form.Group>
              <Form.Group className="col-4 m-2" controlId="type_quantite">
                <Form.Label>Type de Quantité</Form.Label>
                <Form.Control
                  as="select"
                  name="type_quantite"
                  value={produits.type_quantite}
                  onChange={handleChange}
                >
                  <option value="">Sélectionnez un type de quantite</option>
                  <option value="kg">kg</option>
                  <option value="unitaire">unitaire</option>
                </Form.Control>
              </Form.Group>

              <Form.Group className="col-4 m-2" controlId="calibre">
                <Form.Label>calibre</Form.Label>
                <Form.Control
                  type="text"
                  name="calibre"
                  value={produits.calibre}
                  onChange={handleChange}
                  placeholder="calibre"
                />
              </Form.Group>
              <Form.Group className="col-4 m-2 mb-3" controlId="user_id">
                <Form.Label>Sélectionnez un utilisateur</Form.Label>
                <Form.Control
                  as="select"
                  name="user_id"
                  value={produits.user_id}
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

              <Form.Group className="col-4 m-2 mb-3" controlId="fournisseur_id">
                <Form.Label>Sélectionnez un fournisseur</Form.Label>
                <Form.Control
                  as="select"
                  name="fournisseur_id"
                  value={produits.fournisseur_id}
                  onChange={handleChange}
                >
                  <option value="">Sélectionnez un fournisseur</option>
                  {fournisseurs.map((fournisseur) => (
                    <option key={fournisseur.id} value={fournisseur.id}>
                      {fournisseur.raison_sociale}
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
              <h4 className="text-center">Modifier un Produit</h4>
              <Form.Group className="col-6 m-2" controlId="nom">
                <Form.Label>Nom du Produit</Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Nom du Produit"
                />
              </Form.Group>
              <Form.Group className="col-4 m-2" controlId="type_quantite">
                <Form.Label>Type de Quantité</Form.Label>
                <Form.Control
                  as="select"
                  name="type_quantite"
                  value={formData.type_quantite}
                  onChange={handleChange}
                >
                  <option value="">Sélectionnez un type de quantite</option>
                  <option value="kg">kg</option>
                  <option value="unitaire">unitaire</option>
                </Form.Control>
              </Form.Group>

              <Form.Group className="col-4 m-2" controlId="calibre">
                <Form.Label>calibre</Form.Label>
                <Form.Control
                  type="text"
                  name="calibre"
                  value={formData.calibre}
                  onChange={handleChange}
                  placeholder="calibre"
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

              <Form.Group className="col-4 m-2 mb-3" controlId="fournisseur_id">
                <Form.Label>Sélectionnez un fournisseur</Form.Label>
                <Form.Control
                  as="select"
                  name="fournisseur_id"
                  value={formData.fournisseur_id}
                  onChange={handleChange}
                >
                  <option value="">Sélectionnez un fournisseur</option>
                  {fournisseurs &&
                    fournisseurs.map((fournisseur) => (
                      <option key={fournisseur.id} value={fournisseur.id}>
                        {fournisseur.raison_sociale}
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

        <table className="table" id="ProduitsTable">
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
              <th>Nom du Produit</th>
              <th>Type de Quantite</th>
              <th>Calibre</th>
              <th>User</th>
              <th>Fournisseur</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((prod) => {
                const selectedFournisseur = fournisseurs.find(
                  (fournisseur) => fournisseur.id === prod.fournisseur_id
                );
                const selectedUser = users.find(
                  (user) => user.id === prod.user_id
                );
                return (
                  <tr key={prod.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(prod.id)}
                        onChange={() => handleCheckboxChange(prod.id)}
                      />
                    </td>
                    <td>{prod.id}</td>
                    <td>{prod.nom}</td>
                    <td>{prod.type_quantite}</td>
                    <td>{prod.calibre}</td>
                    <td>
                      {selectedUser ? (
                        <>{selectedUser.name}</>
                      ) : (
                        <div>No user found</div>
                      )}
                    </td>
                    <td>
                      {selectedFournisseur ? (
                        <>{selectedFournisseur.raison_sociale}</>
                      ) : (
                        <div>No Fournisseur found</div>
                      )}
                    </td>

                    <td className="col-2 text-center">
                      <button
                        className="col-3 btn btn-warning mx-2"
                        onClick={() => handleEdit(prod.id)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="col-3 btn btn-danger mx-2"
                        onClick={() => handleDelete(prod.id)}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
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

export default ProduitList;
