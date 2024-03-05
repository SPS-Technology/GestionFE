import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import "../style.css";
import Navigation from "../Acceuil/Navigation";
import Search from "../Acceuil/Search";
import TablePagination from '@mui/material/TablePagination';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFilePdf, faFileExcel, faPrint, } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
const FournisseurList = () => {
  // const [existingFournisseur, setExistingFournisseur] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFournisseurs, setFilteredFournisseurs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  //-------------------edit-----------------------//
  const [editingFournisseur, setEditingFournisseur] = useState(null); // State to hold the fournisseur being edited
  const [editingFournisseurId, setEditingFournisseurId] = useState(null);

  //---------------form-------------------//
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    raison_sociale: "",
    abreviation: "",
    adresse: "",
    tele: "",
    ville: "",
    ice: "",
    code_postal: "",
    user_id: "",
  });
  const [formContainerStyle, setFormContainerStyle] = useState({ right: "-500px", });
  const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: "0px", });

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/fournisseurs"
      );

      console.log("API Response:", response.data);

      setFournisseurs(response.data.fournisseurs);

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
    const filtered = fournisseurs && fournisseurs.filter((fournisseur) =>
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
  //------------------------- fournisseur Delete Selected ---------------------//

  const handleDeleteSelected = () => {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer ?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Oui',
      denyButtonText: 'Non',
      customClass: {
        actions: 'my-actions',
        cancelButton: 'order-1 right-gap',
        confirmButton: 'order-2',
        denyButton: 'order-3',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        selectedItems.forEach((id) => {
          axios
            .delete(`http://localhost:8000/api/fournisseurs/${id}`)
            .then((response) => {
              fetchFournisseurs();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: 'fournisseur supprimé avec succès.',
              });
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la suppression du fournisseur:", error);
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: 'Échec de la suppression du fournisseur.',
              });
            });
        });
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
  //------------------------- fournisseur print ---------------------//

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
                ${Array.isArray(fournisseurList)
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
  //------------------------- fournisseur export to pdf ---------------------//

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
      "ice",
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
      fournisseur.ice,
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
  //------------------------- fournisseur export to excel ---------------------//

  const exportToExcel = () => {
    const selectedFournisseurs = fournisseurs.filter((fournisseur) =>
      selectedItems.includes(fournisseur.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedFournisseurs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fournisseurs");
    XLSX.writeFile(wb, "fournisseurs.xlsx");
  };

  //------------------------- fournisseur Delete---------------------//
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer ce fournisseur ?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Oui',
      denyButtonText: 'Non',
      customClass: {
        actions: 'my-actions',
        cancelButton: 'order-1 right-gap',
        confirmButton: 'order-2',
        denyButton: 'order-3',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8000/api/fournisseurs/${id}`)
          .then((response) => {
            if (response.data.message) {
              // Successful deletion
              fetchFournisseurs();
              Swal.fire({
                icon: 'success',
                title: 'Succès!',
                text: "fournisseur supprimé avec succès",
              });
            } else if (response.data.error) {
              // Error occurred
              if (response.data.error.includes("Impossible de supprimer ou de mettre à jour une ligne parent : une contrainte de clé étrangère échoue")) {
                // Violated integrity constraint error
                Swal.fire({
                  icon: 'error',
                  title: 'Erreur!',
                  text: "Impossible de supprimer le fournisseur car il a des produits associés.",
                });
              }
            }
          })
          .catch((error) => {
            // Request error
            console.error("Erreur lors de la suppression du fournisseur:", error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur!',
              text: `Échec de la suppression du fournisseur. Veuillez consulter la console pour plus d'informations.`,
            });
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  }
  //------------------------- fournisseur EDIT---------------------//

  const handleEdit = (fournisseurs) => {
    setEditingFournisseur(fournisseurs); // Set the fournisseurs to be edited
    // Populate form data with fournisseurs details
    setFormData({
      raison_sociale: fournisseurs.raison_sociale,
      abreviation: fournisseurs.abreviation,
      adresse: fournisseurs.adresse,
      tele: fournisseurs.tele,
      ville: fournisseurs.ville,
      ice: fournisseurs.ice,
      code_postal: fournisseurs.code_postal,
      user_id: fournisseurs.user_id,
    });
    if (formContainerStyle.right === '-500px') {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    } else {
      closeForm();
    }
    // Show form
    // setShowForm(true);
  };
  useEffect(() => {
    if (editingFournisseurId !== null) {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    }
  }, [editingFournisseurId]);

  //------------------------- fournisseur SUBMIT---------------------//

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingFournisseur ? `http://localhost:8000/api/fournisseurs/${editingFournisseur.id}` : 'http://localhost:8000/api/fournisseurs';
    const method = editingFournisseur ? 'put' : 'post';
    axios({
      method: method,
      url: url,
      data: formData,
    }).then(() => {
      fetchFournisseurs();
      Swal.fire({
        icon: 'success',
        title: 'Succès!',
        text: `fournisseur ${editingFournisseur ? 'modifié' : 'ajouté'} avec succès.`,
      });
      setFormData({
        raison_sociale: '',
        abreviation: '',
        adresse: '',
        tele: '',
        ville: '',
        ice: '',
        code_postal: '',
        user_id: '',
      });
      setEditingFournisseur(null); // Clear editing fournisseur
      closeForm();
    }).catch((error) => {
      console.error(`Erreur lors de ${editingFournisseur ? 'la modification' : "l'ajout"} du fournisseur:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur!',
        text: `Échec de ${editingFournisseur ? 'la modification' : "l'ajout"} du fournisseur.`,
      });
    });
  };

  //------------------------- fournisseur FORM---------------------//

  const handleShowFormButtonClick = () => {
    if (formContainerStyle.right === '-500px') {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    } else {
      closeForm();
    }
  };

  const closeForm = () => {
    setFormContainerStyle({ right: '-500px' });
    setTableContainerStyle({ marginRight: '0' });
    setShowForm(false); // Hide the form
    setFormData({ // Clear form data
      raison_sociale: '',
      abreviation: '',
      adresse: '',
      tele: '',
      ville: '',
      ice: '',
      code_postal: '',
      user_id: '',
    });
    setEditingFournisseur(null); // Clear editing fournisseur
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: 'flex' }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />

          <div className="container">
            <h3>Liste des Fournisseurs</h3>
            <div className="search-container d-flex flex-row-reverse mb-3">
              <Search onSearch={handleSearch} />
            </div>
            <div className="add-Ajout-form">
              <Button variant="primary" className="col-3 btn btn-sm" id="showFormButton" onClick={handleShowFormButtonClick}>
                {showForm ? 'Modifier le formulaire' : 'Ajouter un fournisseur'}
              </Button>
              <div id="formContainer" className="mt-2" style={formContainerStyle}>
                <Form className="col row" onSubmit={handleSubmit}>
                  <Form.Label className="text-center m-2"><h5>{editingFournisseur ? 'Modifier Fournisseur' : 'Ajouter un Fournisseur'}</h5></Form.Label>
                  <Form.Group className="col-sm-5 m-2 ">
                    <Form.Label>Raison Sociale</Form.Label>
                    <Form.Control type="text" placeholder="Raison Sociale" name="raison_sociale" value={formData.raison_sociale} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2 ">
                    <Form.Label>abreviation</Form.Label>
                    <Form.Control type="text" placeholder="Abréviation" name="abreviation" value={formData.abreviation} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="col-sm-10 m-2">
                    <Form.Label>Adresse</Form.Label>
                    <Form.Control type="text" placeholder="Adresse" name="adresse" value={formData.adresse} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control type="text" placeholder="Téléphone" name="tele" value={formData.tele} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Ville</Form.Label>
                    <Form.Control type="text" placeholder="Ville" name="ville" value={formData.ville} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="col-sm-4 m-2">
                    <Form.Label>ice</Form.Label>
                    <Form.Control type="text" placeholder="ice" name="ice" value={formData.ice} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="col-sm-4 m-2">
                    <Form.Label>Code Postal</Form.Label>
                    <Form.Control type="text" placeholder="code_postal" name="code_postal" value={formData.code_postal} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="col-sm-4 m-2" controlId="user_id">
                  <Form.Label>Utilisateur</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    placeholder="user_id"
                    className="form-control-sm"
                  />
                </Form.Group>
                  <Form.Group className="col m-3 text-center">
                    <Button type="submit" className="btn btn-success col-6">
                      {editingFournisseur ? 'Modifier' : 'Ajouter'}
                    </Button>
                    <Button className="btn btn-secondary col-5 offset-1" onClick={closeForm}>Annuler</Button>
                  </Form.Group>
                </Form>
              </div>
            </div>
            <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
              <table className="table table-responsive table-bordered" id="fournisseurTable">
                <thead>
                  <tr>
                    <th scope="col">
                      <input type="checkbox" onChange={handleSelectAllChange} />
                    </th>
                    <th scope="col">Raison Sociale</th>
                    <th scope="col">Adresse</th>
                    <th scope="col">Téléphone</th>
                    <th scope="col">Ville</th>
                    <th scope="col">Abréviation</th>
                    <th scope="col">Code Postal</th>
                    <th scope="col">ICE</th>
                    <th scope="col">User</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFournisseurs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((fournisseurs) => (
                    <tr key={fournisseurs.id}>
                      <td>
                        <input type="checkbox" onChange={() => handleCheckboxChange(fournisseurs.id)} checked={selectedItems.includes(fournisseurs.id)} />
                      </td>
                      <td>{fournisseurs.raison_sociale}</td>
                      <td>{fournisseurs.adresse}</td>
                      <td>{fournisseurs.tele}</td>
                      <td>{fournisseurs.ville}</td>
                      <td>{fournisseurs.abreviation}</td>
                      <td>{fournisseurs.code_postal}</td>
                      <td>{fournisseurs.ice}</td>
                      <td>{fournisseurs.user.name}</td>
                      <td className="d-inline-flex">
                        <Button className="btn btn-sm btn-info m-1" onClick={() => handleEdit(fournisseurs)}>
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button className="btn btn-danger btn-sm m-1" onClick={() => handleDelete(fournisseurs.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex flex-row">
                <div className="btn-group col-2">
                  <Button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
                    <FontAwesomeIcon icon={faTrash} /></Button>
                  <Button className="btn btn-secondary btn-sm" onClick={() => printList('fournisseurTable', 'Liste des Fournisseurs', fournisseurs)}>
                    <FontAwesomeIcon icon={faPrint} />
                  </Button>
                  <Button className="btn btn-danger btn-sm ml-2" onClick={exportToPdf}>
                    <FontAwesomeIcon icon={faFilePdf} />
                  </Button>
                  <Button className="btn btn-success btn-sm ml-2" onClick={exportToExcel}>
                    <FontAwesomeIcon icon={faFileExcel} />
                  </Button>
                </div>
              </div>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredFournisseurs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default FournisseurList;