import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import "../style1.css";
import Navigation from "../Acceuil/Navigation";
import Search from "../Acceuil/Search";
import TablePagination from "@mui/material/TablePagination";
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
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import ExportPdfButton from "./exportToPdf";
import PrintList from "./PrintList";
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
    CodeFournisseur: "",
    raison_sociale: "",
    abreviation: "",
    adresse: "",
    tele: "",
    ville: "",
    ice: "",
    code_postal: "",
    user_id: "",
  });
  const [errors, setErrors] = useState({
    CodeFournisseur: "",
    raison_sociale: "",
    abreviation: "",
    adresse: "",
    tele: "",
    ville: "",
    ice: "",
    code_postal: "",
    user_id: "",
  });
  const [formContainerStyle, setFormContainerStyle] = useState({
    right: "-500px",
  });
  const [tableContainerStyle, setTableContainerStyle] = useState({
    marginRight: "0px",
  });

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
      if (error.response && error.response.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Accès refusé",
          text: "Vous n'avez pas l'autorisation de voir la liste des fournisseurs.",
        });
      }
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  useEffect(() => {
    const filtered =
      fournisseurs &&
      fournisseurs.filter((fournisseur) =>
        Object.values(fournisseur).some((value) => {
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          } else if (typeof value === "number") {
            return value.toString().includes(searchTerm.toLowerCase());
          }
          return false;
        })
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
      title: "Êtes-vous sûr de vouloir supprimer ?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Oui",
      denyButtonText: "Non",
      customClass: {
        actions: "my-actions",
        cancelButton: "order-1 right-gap",
        confirmButton: "order-2",
        denyButton: "order-3",
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
                text: "fournisseur supprimé avec succès.",
              });
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la suppression du fournisseur:",
                error
              );

              if (error.response && error.response.status === 403) {
                Swal.fire({
                  icon: "error",
                  title: "Accès refusé",
                  text: "Vous n'avez pas l'autorisation de supprimer un  fournisseur.",
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Erreur!",
                  text: "Échec de la suppression du fournisseur.",
                });
              }
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
      title: "Êtes-vous sûr de vouloir supprimer ce fournisseur ?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Oui",
      denyButtonText: "Non",
      customClass: {
        actions: "my-actions",
        cancelButton: "order-1 right-gap",
        confirmButton: "order-2",
        denyButton: "order-3",
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
                icon: "success",
                title: "Succès!",
                text: "fournisseur supprimé avec succès",
              });
            } else if (response.data.error) {
              // Error occurred
              if (
                response.data.error.includes(
                  "Impossible de supprimer ou de mettre à jour une ligne parent : une contrainte de clé étrangère échoue"
                )
              ) {
                Swal.fire({
                  icon: "error",
                  title: "Erreur!",
                  text: "Impossible de supprimer le fournisseur car il a des produits associés.",
                });
              }
            }
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la suppression du fournisseur:",
              error
            );

            if (error.response && error.response.status === 403) {
              Swal.fire({
                icon: "error",
                title: "Accès refusé",
                text: "Vous n'avez pas l'autorisation de supprimer un  fournisseur.",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression du fournisseur.",
              });
            }
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  };
  //------------------------- fournisseur EDIT---------------------//

  const handleEdit = (fournisseurs) => {
    setEditingFournisseur(fournisseurs); // Set the fournisseurs to be edited
    // Populate form data with fournisseurs details
    setFormData({
      CodeFournisseur: fournisseurs.CodeFournisseur,
      raison_sociale: fournisseurs.raison_sociale,
      abreviation: fournisseurs.abreviation,
      adresse: fournisseurs.adresse,
      tele: fournisseurs.tele,
      ville: fournisseurs.ville,
      ice: fournisseurs.ice,
      code_postal: fournisseurs.code_postal,
      user_id: fournisseurs.user_id,
    });
    if (formContainerStyle.right === "-500px") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
    // Show form
    // setShowForm(true);
  };
  useEffect(() => {
    if (editingFournisseurId !== null) {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    }
  }, [editingFournisseurId]);

  //------------------------- fournisseur SUBMIT---------------------//

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingFournisseur
      ? `http://localhost:8000/api/fournisseurs/${editingFournisseur.id}`
      : "http://localhost:8000/api/fournisseurs";
    const method = editingFournisseur ? "put" : "post";
    axios({
      method: method,
      url: url,
      data: formData,
    })
      .then(() => {
        fetchFournisseurs();
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: `fournisseur ${
            editingFournisseur ? "modifié" : "ajouté"
          } avec succès.`,
        });
        setFormData({
          CodeFournisseur: "",
          raison_sociale: "",
          abreviation: "",
          adresse: "",
          tele: "",
          ville: "",
          ice: "",
          code_postal: "",
          user_id: "",
        });
        setEditingFournisseur(null); // Clear editing fournisseur
        closeForm();
      })
      .catch((error) => {
        if (error.response) {
          const serverErrors = error.response.data.error;
          console.log(serverErrors);
          setErrors({
            CodeFournisseur: serverErrors.CodeFournisseur
              ? serverErrors.CodeFournisseur[0]
              : "",
            raison_sociale: serverErrors.raison_sociale
              ? serverErrors.raison_sociale[0]
              : "",
            abreviation: serverErrors.abreviation
              ? serverErrors.abreviation[0]
              : "",
            adresse: serverErrors.adresse ? serverErrors.adresse[0] : "",
            tele: serverErrors.tele ? serverErrors.tele[0] : "",
            ville: serverErrors.ville ? serverErrors.ville[0] : "",
            ice: serverErrors.ice ? serverErrors.ice[0] : "",
            code_postal: serverErrors.code_postal ? serverErrors.code_postal[0] : "",
          });

          if (error.response.status === 403) {
            Swal.fire({
              icon: "error",
              title: "Accès refusé",
              text: `Vous n'avez pas l'autorisation de ${
                editingFournisseur ? "modifier" : "ajouter"
              } un fournisseur.`,
            });
          }
        } else {
          console.error(error); // Gérez les erreurs qui ne proviennent pas de la réponse du serveur
        }
      });
  };

  //------------------------- fournisseur FORM---------------------//

  const handleShowFormButtonClick = () => {
    if (formContainerStyle.right === "-500px") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
  };

  const closeForm = () => {
    setFormContainerStyle({ right: "-500px" });
    setTableContainerStyle({ marginRight: "0" });
    setShowForm(false); // Hide the form
    setFormData({
      CodeFournisseur: "",
      raison_sociale: "",
      abreviation: "",
      adresse: "",
      tele: "",
      ville: "",
      ice: "",
      code_postal: "",
      user_id: "",
    });
    setErrors({
      CodeFournisseur: "",
      raison_sociale: "",
      abreviation: "",
      adresse: "",
      tele: "",
      ville: "",
      ice: "",
      code_postal: "",
      user_id: "",
    });
    setEditingFournisseur(null); // Clear editing fournisseur
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <h3 className="text-left" style={{ color: "#A31818" }}>
            <BusinessIcon style={{ fontSize: "24px", marginRight: "8px" }} />
            Liste des Fournisseurs
          </h3>
          <div className="d-flex flex-row justify-content-end">
            <div className="btn-group col-2">
            <PrintList
                tableId="fournisseurTable"
                title="Liste des Fournisseurs"
                FournisseurList={fournisseurs}
                filtredFournisseurs={filteredFournisseurs}
              />
              <ExportPdfButton
                fournisseurs={fournisseurs}
                selectedItems={selectedItems}
              />
             <Button
                className="btn btn-success btn-sm ml-2"
                onClick={exportToExcel}
                disabled={selectedItems.length === 0}
              >
                <FontAwesomeIcon icon={faFileExcel} />
              </Button>
            </div>
          </div>
          <div className="search-container d-flex justify-content-center align-items-center mb-3">
            <Search onSearch={handleSearch} />
          </div>

          <div className="container-d-flex justify-content-start">
            <div className="add-Ajout-form">
              <Button
                style={{
                  backgroundColor: "white",
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                }}
                variant="primary"
                className="col-3 btn btn-sm"
                id="showFormButton"
                onClick={handleShowFormButtonClick}
              >
                <BusinessIcon
                  style={{ fontSize: "24px", marginRight: "8px" }}
                />
                Mise a jour Fournisseur
              </Button>

              <div
                id="formContainer"
                className="mt-2"
                style={formContainerStyle}
              >
                <Form className="col row" onSubmit={handleSubmit}>
                  <Form.Label className="text-center m-2">
                    <h5>
                      {editingFournisseur
                        ? "Modifier Fournisseur"
                        : "Ajouter un Fournisseur"}
                    </h5>
                  </Form.Label>
                  <Form.Group className="col-sm-5 m-2 ">
                    <Form.Label> CodeFournisseur</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="CodeFournisseur"
                      name="CodeFournisseur"
                      value={formData.CodeFournisseur}
                      onChange={handleChange}
                    />
                      <Form.Text className="text-danger">
                      {errors.CodeFournisseur}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2 ">
                    <Form.Label>Raison Sociale</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Raison Sociale"
                      name="raison_sociale"
                      value={formData.raison_sociale}
                      onChange={handleChange}
                    />
                      <Form.Text className="text-danger">
                      {errors.raison_sociale}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2 ">
                    <Form.Label>abreviation</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Abréviation"
                      name="abreviation"
                      value={formData.abreviation}
                      onChange={handleChange}
                    />
                      <Form.Text className="text-danger">
                      {errors.abreviation}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-10 m-2">
                    <Form.Label>Adresse</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Adresse"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                    />
                      <Form.Text className="text-danger">
                      {errors.adresse}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Téléphone"
                      name="tele"
                      value={formData.tele}
                      onChange={handleChange}
                    />
                      <Form.Text className="text-danger">
                      {errors.tele}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Ville</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ville"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                    />
                      <Form.Text className="text-danger">
                      {errors.ville}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-4 m-2">
                    <Form.Label>ice</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="ice"
                      name="ice"
                      value={formData.ice}
                      onChange={handleChange}
                    />
                      <Form.Text className="text-danger">
                      {errors.ice}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-4 m-2">
                    <Form.Label>Code Postal</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="code_postal"
                      name="code_postal"
                      value={formData.code_postal}
                      onChange={handleChange}
                    />
                      <Form.Text className="text-danger">
                      {errors.code_postal}
                    </Form.Text>
                  </Form.Group>
                  {/* <Form.Group className="col-sm-4 m-2" controlId="user_id">
                    <Form.Label>Utilisateur</Form.Label>
                    <Form.Control
                      type="text"
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleChange}
                      placeholder="user_id"
                      className="form-control-sm"
                    />
                  </Form.Group> */}
                  <Form.Group className="col m-5 text-center">
                    <Button type="submit" className="btn btn-danger col-6">
                      {editingFournisseur ? "Modifier" : "Ajouter"}
                    </Button>
                    <Button
                      className="btn btn-secondary col-5 offset-1"
                      onClick={closeForm}
                    >
                      Annuler
                    </Button>
                  </Form.Group>
                </Form>
              </div>
            </div>
            <div
              id="tableContainer"
              className="table-responsive-sm"
              style={tableContainerStyle}
            >
              <table className="table" id="fournisseurTable">
                <thead>
                  <tr>
                    <th scope="col">
                      <input type="checkbox" onChange={handleSelectAllChange} />
                    </th>
                    <th scope="col"> CodeFournisseur</th>
                    <th scope="col">Raison Sociale</th>
                    <th scope="col">Adresse</th>
                    <th scope="col">Téléphone</th>
                    <th scope="col">Ville</th>
                    <th scope="col">Abréviation</th>
                    <th scope="col">Code Postal</th>
                    <th scope="col">ICE</th>
                    {/* <th scope="col">User</th> */}
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFournisseurs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((fournisseurs) => (
                      <tr key={fournisseurs.id}>
                        <td>
                          <input
                            type="checkbox"
                            onChange={() =>
                              handleCheckboxChange(fournisseurs.id)
                            }
                            checked={selectedItems.includes(fournisseurs.id)}
                          />
                        </td>
                        <td>{fournisseurs.CodeFournisseur}</td>
                        <td>{fournisseurs.raison_sociale}</td>
                        <td>{fournisseurs.adresse}</td>
                        <td>{fournisseurs.tele}</td>
                        <td>{fournisseurs.ville}</td>
                        <td>{fournisseurs.abreviation}</td>
                        <td>{fournisseurs.code_postal}</td>
                        <td>{fournisseurs.ice}</td>
                        {/* <td>{fournisseurs.user.name}</td> */}
                        <td className="d-inline-flex">
                          <Button
                            className="btn btn-sm btn-info m-1"
                            onClick={() => handleEdit(fournisseurs)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            className="btn btn-danger btn-sm m-1"
                            onClick={() => handleDelete(fournisseurs.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <Button
                className="btn btn-danger btn-sm"
                onClick={handleDeleteSelected}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
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
