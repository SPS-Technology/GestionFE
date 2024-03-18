import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import "../style.css";
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
import { FaCar } from "react-icons/fa";
import PrintList from "./PrintList";
import ExportPdfButton from "./exportToPdf";
const VehiculeList = () => {
  // const [existingFournisseur, setExistingFournisseur] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVehicules, setFilteredVehicules] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [vehicules, setVehicules] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  //-------------------edit-----------------------//
  const [editingVehicule, setEditingVehicule] = useState(null); // State to hold the fournisseur being edited
  const [editingVehiculeId, setEditingVehiculeId] = useState(null);

  //---------------form-------------------//
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    marque: "",
    matricule: "",
    model: "",
    capacite: "",
  });
  const [errors, setErrors] = useState({
    marque: "",
    matricule: "",
    model: "",
    capacite: "",
  });
  const [formContainerStyle, setFormContainerStyle] = useState({
    right: "-500px",
  });
  const [tableContainerStyle, setTableContainerStyle] = useState({
    marginRight: "0px",
  });
  const tableHeaderStyle = {
    background: "#f2f2f2",
    padding: "10px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
  };

  const fetchVehicules = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/vehicules");

      console.log("API Response:", response.data);

      setVehicules(response.data.vehicules);

      const usersResponse = await axios.get("http://localhost:8000/api/users");
      setUsers(usersResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  useEffect(() => {
    const filtered = vehicules.filter((vehicule) => {
      const marqueMatch = vehicule.marque
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matriculeMatch = vehicule.matricule
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const modelMatch = vehicule.model
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const capaciteMatch = vehicule.capacite
        .toString()
        .includes(searchTerm.toString());

      return marqueMatch || matriculeMatch || modelMatch || capaciteMatch;
    });

    setFilteredVehicules(filtered);
  }, [vehicules, searchTerm]);

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
            .delete(`http://localhost:8000/api/vehicules/${id}`)
            .then((response) => {
              fetchVehicules();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "Vehicule supprimé avec succès.",
              });
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la suppression du Vehicule:",
                error
              );
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression du Vehicule.",
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
      setSelectedItems(vehicules.map((livreur) => livreur.id));
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
                  Array.isArray(VehiculeList)
                    ? VehiculeList.map((item) => `<li>${item}</li>`).join("")
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
    const columns = ["ID", "marque", "matricule", "model", "capacite"];
    const selectedVehicules = vehicules.filter((vehicule) =>
      selectedItems.includes(vehicule.id)
    );
    const rows = selectedVehicules.map((vehicule) => [
      vehicule.id,
      vehicule.marque,
      vehicule.matricule,
      vehicule.model,
      vehicule.capacite,
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
    pdf.save("vehicules.pdf");
  };
  //------------------------- fournisseur export to excel ---------------------//

  const exportToExcel = () => {
    const selectedVehicules = vehicules.filter((vehicule) =>
      selectedItems.includes(vehicule.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedVehicules);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vehicules");
    XLSX.writeFile(wb, "vehicules.xlsx");
  };

  //------------------------- fournisseur Delete---------------------//
  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer cette véhicule ?",
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
          .delete(`http://localhost:8000/api/vehicules/${id}`)
          .then((response) => {
            if (response.data.message) {
              // Successful deletion
              fetchVehicules();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "Véhicule supprimé avec succès",
              });
            }
          })
          .catch((error) => {
            // Check for integrity constraint violation
            if (error.response && error.response.status === 500) {
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Impossible de supprimer le véhicule car il est affecter a un livreur.",
              });
            } else {
              // Other request errors
              console.error(
                "Erreur lors de la suppression du Véhicule:",
                error
              );
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: `Échec de la suppression du Véhicule. Veuillez consulter la console pour plus d'informations.`,
              });
            }
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  };

  //------------------------- fournisseur EDIT---------------------//

  const handleEdit = (vehicule) => {
    setEditingVehicule(vehicule); // Set the fournisseurs to be edited
    // Populate form data with fournisseurs details
    setFormData({
      marque: vehicule.marque,
      model: vehicule.model,
      matricule: vehicule.matricule,
      capacite: vehicule.capacite,
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
    if (editingVehiculeId !== null) {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    }
  }, [editingVehiculeId]);

  //------------------------- fournisseur SUBMIT---------------------//

  useEffect(() => {
    fetchVehicules();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingVehicule
      ? `http://localhost:8000/api/vehicules/${editingVehicule.id}`
      : "http://localhost:8000/api/vehicules";
    const method = editingVehicule ? "put" : "post";
    axios({
      method: method,
      url: url,
      data: formData,
    })
      .then(() => {
        fetchVehicules();
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: `Vehicule ${
            editingVehicule ? "modifié" : "ajouté"
          } avec succès.`,
        });
        setFormData({
          marque: "",
          matricule: "",
          model: "",
          capacite: "",
        });
        setErrors({
          marque: "",
          matricule: "",
          model: "",
          capacite: "",
        });
        setEditingVehicule(null);
        closeForm();
      })
      .catch((error) => {
        if (error.response) {
          const serverErrors = error.response.data.error;
          console.log(serverErrors);
          setErrors({
            marque: serverErrors.marque ? serverErrors.marque[0] : "",
            matricule: serverErrors.matricule ? serverErrors.matricule[0] : "",
            model: serverErrors.model ? serverErrors.model[0] : "",
            capacite: serverErrors.capacite ? serverErrors.capacite[0] : "",
          });
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
      marque: "",
      matricule: "",
      model: "",
      capacite: "",
    });
    setErrors({
      marque: "",
      matricule: "",
      model: "",
      capacite: "",
    });
    setEditingVehicule(null);
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <h3 className="text-left" style={{ color: "#A31818" }}>
            <FaCar style={{ fontSize: "24px", marginRight: "8px" }} />
            Liste des Vehicules
          </h3>
         
          <div className="d-flex flex-row justify-content-end">
            <div className="btn-group col-2">
              <PrintList
                tableId="VehiculeTable"
                title="Liste des Vehicules"
                VehiculeList={vehicules}
                filteredVehicules={filteredVehicules}
              />
              <ExportPdfButton
                vehicules={vehicules}
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
                id="showFormButton"
                onClick={handleShowFormButtonClick}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaCar style={{ fontSize: "24px", marginRight: "8px" }} />
                Mise a jour Vehicule
              </Button>

              <div
                id="formContainer"
                className="mt-2"
                style={formContainerStyle}
              >
                <Form className="col row" onSubmit={handleSubmit}>
                  <Form.Label className="text-center m-2">
                    <h5>
                      {editingVehicule
                        ? "Modifier vehicule"
                        : "Ajouter un vehicule"}
                    </h5>
                  </Form.Label>
                  <Form.Group className="col-sm-5 m-2 ">
                    <Form.Label>marque</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="marque"
                      name="marque"
                      value={formData.marque}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">
                      {errors.marque}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2 ">
                    <Form.Label>matricule</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="matricule"
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">
                      {errors.matricule}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-10 m-2">
                    <Form.Label>model</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">
                      {errors.model}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>capacite</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="capacite"
                      name="capacite"
                      value={formData.capacite}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">
                      {errors.capacite}
                    </Form.Text>
                  </Form.Group>

                  <div className="mt-5">
                    <Form.Group className="col m-3 text-center">
                      <Button
                        type="submit"
                        className="btn btn-danger col-md-4 m-3"
                      >
                        {editingVehicule ? "Modifier" : "Ajouter"}
                      </Button>
                      <Button
                        className="btn btn-secondary col-md-4 m-3"
                        onClick={closeForm}
                      >
                        Annuler
                      </Button>
                    </Form.Group>
                  </div>
                </Form>
              </div>
            </div>
            <div
              id="tableContainer"
              className="table-responsive-sm"
              style={tableContainerStyle}
            >
              <table
                className="table table-responsive table-bordered "
                id="VehiculeTable"
              >
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>
                      <input type="checkbox" onChange={handleSelectAllChange} />
                    </th>
                    <th style={tableHeaderStyle}>marque </th>
                    <th style={tableHeaderStyle}>matricule</th>
                    <th style={tableHeaderStyle}>model</th>
                    <th style={tableHeaderStyle}>capacite</th>
                    <th style={tableHeaderStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicules
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((vehicule) => (
                      <tr key={vehicule.id}>
                        <td>
                          <input
                            type="checkbox"
                            onChange={() => handleCheckboxChange(vehicule.id)}
                            checked={selectedItems.includes(vehicule.id)}
                          />
                        </td>
                        <td>{vehicule.marque}</td>
                        <td>{vehicule.matricule}</td>
                        <td>{vehicule.model}</td>
                        <td>{vehicule.capacite}</td>

                        <td className="d-inline-flex">
                          <Button
                            className="btn btn-sm btn-info m-1"
                            onClick={() => handleEdit(vehicule)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            className="btn btn-danger btn-sm m-1"
                            onClick={() => handleDelete(vehicule.id)}
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
                disabled={selectedItems.length === 0}
              >
                <FontAwesomeIcon icon={faTrash} />
                supprimer selection
              </Button>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredVehicules.length}
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

export default VehiculeList;
