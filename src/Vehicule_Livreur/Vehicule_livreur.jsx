import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button, Modal, Col, Row } from "react-bootstrap";
import Navigation from "../Acceuil/Navigation";
import TablePagination from "@mui/material/TablePagination";
import "jspdf-autotable";
import Search from "../Acceuil/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFileExcel,
  faPrint,
  faFilePdf,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "../style.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import { CiDeliveryTruck } from "react-icons/ci";
import ExportToPdfButton from "./exportToPdf";
import PrintList from "./PrintList";

//------------------------- CLIENT LIST---------------------//
const Vehicule_livreur = () => {
  const [livreurs, setLivreurs] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicule_livreurs, setVehicule_livreurs] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  //---------------form-------------------//
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date_debut_affectation: "",
    date_fin_affectation: "",
    heure: "",
    kilometrage_debut: "",
    kilometrage_fin: "",
    vehicule_id: "",
    livreur_id: "",
  });
  const [errors, setErrors] = useState({
    date_debut_affectation: "",
    date_fin_affectation: "",
    heure: "",
    kilometrage_debut: "",
    kilometrage_fin: "",
    vehicule_id: "",
    livreur_id: "",
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

  //-------------------edit-----------------------//
  const [editingvehicule_livreur, setEditingVehicule_livreurs] = useState(null); // State to hold the client being edited
  const [editingVehicule_livreursId, setEditingVehicule_livreursId] =
    useState(null);
  //-------------------Pagination-----------------------/
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [filteredvehicule_livreurs, setFilteredvehicule_livreurs] = useState(
    []
  );
  const [isFilte, setIsFilte] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterFormData, setFilterFormData] = useState({
    date_debut_affectation: "",
    date_fin_affectation: "",
    livreur_id: "",
    vehicule_id: "",
  });
  //-------------------Selected-----------------------/
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filteredVehiculeLivreurs, setFilteredVehiculeLivreurs] = useState([]);
  //-------------------Search-----------------------/
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicule_livreursId, setSelectedVehicule_livreursId] =
    useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const fetchVehicule_livreurs = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/vehicule-livreurs"
      );
      setVehicule_livreurs(response.data.vehicule_livreurs);

      const userResponse = await axios.get("http://localhost:8000/api/user");
      setUsers(userResponse.data.users);

      const livreursResponse = await axios.get(
        "http://localhost:8000/api/livreurs"
      );
      setLivreurs(livreursResponse.data.livreurs);

      const VehiculesResponse = await axios.get(
        "http://localhost:8000/api/vehicules"
      );

      setVehicules(VehiculesResponse.data.vehicules);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //---------------------------------------------
  useEffect(() => {
    const filtered = vehicule_livreurs.filter((vehicule_livreur) =>
      vehicule_livreur.heure.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredvehicule_livreurs(filtered);
  }, [vehicule_livreurs, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  useEffect(() => {
    fetchVehicule_livreurs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  //------------------------- CLIENT EDIT---------------------//

  const handleEdit = (vehicule_livreur) => {
    setEditingVehicule_livreurs(vehicule_livreur);
    setFormData({
      date_debut_affectation: vehicule_livreur.date_debut_affectation,
      date_fin_affectation: vehicule_livreur.date_fin_affectation,
      kilometrage_debut: vehicule_livreur.kilometrage_debut,
      kilometrage_fin: vehicule_livreur.kilometrage_fin,
      heure: vehicule_livreur.heure,
      livreur_id: vehicule_livreur.livreur_id,
      vehicule_id: vehicule_livreur.vehicule_id,
    });
    if (formContainerStyle.right === "-500px") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
  };
  useEffect(() => {
    if (editingVehicule_livreursId !== null) {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    }
  }, [editingVehicule_livreursId]);

  //------------------------- CLIENT SUBMIT---------------------//

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingvehicule_livreur
      ? `http://localhost:8000/api/vehicule-livreurs/${editingvehicule_livreur.id}`
      : "http://localhost:8000/api/vehicule-livreurs";
    const method = editingvehicule_livreur ? "put" : "post";
    axios({
      method: method,
      url: url,
      data: formData,
    })
      .then(() => {
        fetchVehicule_livreurs();
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: `Affectation de véhicule au livreur ${
            editingvehicule_livreur ? "modifié" : "ajouté"
          } avec succès.`,
        });
        setFormData({
          date_debut_affectation: "",
          date_fin_affectation: "",
          heure: "",
          kilometrage_debut: "",
          kilometrage_fin: "",
          vehicule_id: "",
          livreur_id: "",
        });
        setErrors({
          date_debut_affectation: "",
          date_fin_affectation: "",
          heure: "",
          kilometrage_debut: "",
          kilometrage_fin: "",
          vehicule_id: "",
          livreur_id: "",
        });
        setEditingVehicule_livreurs(null); // Clear editing client
        closeForm();
      })
      .catch((error) => {
        if (error.response) {
          const serverErrors = error.response.data.error;
          console.log(serverErrors);
          setErrors({
            date_debut_affectation: serverErrors.date_debut_affectation
              ? serverErrors.date_debut_affectation[0]
              : "",
            date_fin_affectation: serverErrors.date_fin_affectation
              ? serverErrors.date_fin_affectation[0]
              : "",
            heure: serverErrors.heure ? serverErrors.heure[0] : "",
            kilometrage_debut: serverErrors.kilometrage_debut
              ? serverErrors.kilometrage_debut[0]
              : "",
            kilometrage_fin: serverErrors.kilometrage_fin
              ? serverErrors.kilometrage_fin[0]
              : "",
            vehicule_id: serverErrors.vehicule_id
              ? serverErrors.vehicule_id[0]
              : "",
            livreur_id: serverErrors.livreur_id
              ? serverErrors.livreur_id[0]
              : "",
          });
        }
        console.error(
          `Erreur lors de ${
            editingvehicule_livreur ? "la modification" : "l'ajout"
          } d'affectation du livreur au vehicule :`,
          error
        );
      });
  };
  //------------------------- CLIENT FORM---------------------//

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
    setShowForm(false);
    setFormData({
      date_debut_affectation: "",
      date_fin_affectation: "",
      heure: "",
      kilometrage_debut: "",
      kilometrage_fin: "",
      vehicule_id: "",
      livreur_id: "",
    });
    setErrors({
      date_debut_affectation: "",
      date_fin_affectation: "",
      heure: "",
      kilometrage_debut: "",
      kilometrage_fin: "",
      vehicule_id: "",
      livreur_id: "",
    });

    setEditingVehicule_livreurs(null);
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData({
      ...filterFormData,
      [name]: value,
    });

    // Clear the error when the user starts typing in the "Date Fin d'affectation" field
    if (name === "date_debut_affectation") {
      setErrors({
        ...errors,
        date_fin_affectation: "",
      });
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    const {
      date_debut_affectation,
      date_fin_affectation,
      livreur_id,
      vehicule_id,
    } = filterFormData;

    const filteredVehiculeLivreurs = vehicule_livreurs.filter((vl) => {
      const startDate = new Date(date_debut_affectation);
      const endDate = new Date(date_fin_affectation);
      const currentStartDate = new Date(vl.date_debut_affectation);
      const currentEndDate = new Date(vl.date_fin_affectation);

      const dateFilter =
        (!date_debut_affectation || currentStartDate >= startDate) &&
        (!date_fin_affectation || currentEndDate <= endDate);

      const livreurFilter = !livreur_id || String(vl.livreur.id) === livreur_id;
      const vehiculeFilter =
        !vehicule_id || String(vl.vehicule.id) === vehicule_id;

      const isFilterFilled =
        date_debut_affectation !== "" ||
        date_fin_affectation !== "" ||
        livreur_id !== "" ||
        vehicule_id !== "";

      setIsFiltering(isFilterFilled);

      return dateFilter && livreurFilter && vehiculeFilter;
    });

    setFilteredData(filteredVehiculeLivreurs);

    if (date_debut_affectation && !date_fin_affectation) {
      setErrors({
        date_fin_affectation:
          "La Date Fin d'affectation est obligatoire si la Date Debut d'affectation est renseignée.",
      });
    } else {
      setErrors({}); // Efface les erreurs s'il n'y en a pas
    }

    if (filteredVehiculeLivreurs.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Aucun résultat trouvé",
        text: "Veuillez ajuster vos filtres.",
      });

      setIsFiltering(false);
      setFilteredData(vehicule_livreurs);
    }

    console.log("filterFormData:", filterFormData);
    console.log("filteredVehiculeLivreurs:", filteredVehiculeLivreurs);
    setShowFilterModal(false);
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
                  Array.isArray(Vehicule_livreur)
                    ? Vehicule_livreur.map((item) => `<li>${item}</li>`).join(
                        ""
                      )
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
      "livreur_id",
      "vehicule_id",
      "date_debut_affectation",
      "date_fin_affectation",
      "kilometrage_debut",
      "kilometrage_fin",
      "heure",
    ];
    const selectedVehiculelivreurs = vehicule_livreurs.filter(
      (vehicule_livreur) => selectedItems.includes(vehicule_livreur.id)
    );
    const rows = selectedVehiculelivreurs.map((vehicule_livreur) => [
      vehicule_livreur.livreur_id,
      vehicule_livreur.vehicule_id,
      vehicule_livreur.date_debut_affectation,
      vehicule_livreur.date_fin_affectation,
      vehicule_livreur.kilometrage_debut,
      vehicule_livreur.kilometrage_fin,
      vehicule_livreur.heure,
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
      },
    });

    // Save the PDF
    pdf.save("livreurs.pdf");
  };

  //------------------------- CLIENT PAGINATION---------------------//

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Pagination calculations
  const indexOfLastClient = (page + 1) * rowsPerPage;
  const indexOfFirstClient = indexOfLastClient - rowsPerPage;
  const currentClients = vehicule_livreurs.slice(
    indexOfFirstClient,
    indexOfLastClient
  );

  //------------------------- CLIENT DELETE---------------------//

  const handleDelete = (id) => {
    Swal.fire({
      title:
        "Êtes-vous sûr de vouloir supprimer cet Affectation de véhicule au livreur ?",
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
          .delete(`http://localhost:8000/api/vehicule-livreurs/${id}`)
          .then(() => {
            fetchVehicule_livreurs();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Affectation de véhicule au livreur supprimé avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de la suppression du client:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la suppression d'Affectation de véhicule au livreur.",
            });
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  };
  //-------------------------Select Delete --------------------//
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
            .delete(`http://localhost:8000/api/vehicule-livreurs/${id}`)
            .then(() => {
              fetchVehicule_livreurs();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "Affectation de véhicule au livreur supprimé avec succès.",
              });
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la suppression du Affectation de véhicule au livreur:",
                error
              );
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression du Affectation de véhicule au livreur.",
              });
            });
        });
      }
    });

    setSelectedItems([]);
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(vehicule_livreurs.map((client) => client.id));
    }
  };
  const handleCheckboxChange = (itemId) => {
    if (selectedItems.includes(itemId)) {
      console.log("id", selectedItems);
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const exportToExcel = () => {
    const selectedVehiculelivreurs = vehicule_livreurs.filter(
      (vehicule_livreur) => selectedItems.includes(vehicule_livreur.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedVehiculelivreurs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VehiculeLivreur");
    XLSX.writeFile(wb, "vehiculeLivreur.xlsx");
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <h3 className="text-left" style={{ color: "#A31818" }}>
            <CiDeliveryTruck
              style={{
                fontSize: "24px",
                marginRight: "8px",
                verticalAlign: "middle",
              }}
            />
            Liste des Affectiaion du vehicule au livreur
          </h3>
          <div className="d-flex flex-row justify-content-end">
            <div className="btn-group col-2">
              <PrintList
                tableId="VehiculeLivreurs"
                title="Liste des objectifs"
                vehicule_livreurs={vehicule_livreurs}
                filteredvehicule_livreurs={filteredvehicule_livreurs}
              />
              <ExportToPdfButton
                vehicule_livreurs={vehicule_livreurs}
                selectedItems={selectedItems}
                disabled={selectedItems.length === 0}
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
          <div className="container-d-flex justify-content-start">
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
              <CiDeliveryTruck
                style={{
                  fontSize: "24px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              />
              Affectation de véhicule au livreur
            </Button>

            <div className="d-flex align-items-start">
              {isFilte && (
                <div className="filter-container">
                  <Form onSubmit={handleFilterSubmit}>
                    <table className="table table-borderless">
                      <thead>
                        <tr>
                          <th>Date Debut d'affectation</th>
                          <th>Date Fin d'affectation</th>
                          <th>Livreurs</th>
                          <th>Véhicules</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <Form.Control
                              type="date"
                              name="date_debut_affectation"
                              value={filterFormData.date_debut_affectation}
                              onChange={handleFilterChange}
                              className="form-control form-control-sm"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="date"
                              name="date_fin_affectation"
                              value={filterFormData.date_fin_affectation}
                              onChange={handleFilterChange}
                              className="form-control form-control-sm"
                              required={
                                filterFormData.date_debut_affectation !== ""
                              }
                            />
                            {errors.date_fin_affectation && (
                              <Form.Text className="text-danger">
                                {errors.date_fin_affectation}
                              </Form.Text>
                            )}
                          </td>
                          <td>
                            <Form.Control
                              as="select"
                              name="livreur_id"
                              value={filterFormData.livreur_id}
                              onChange={handleFilterChange}
                              className="form-control form-control-sm"
                            >
                              <option value="">Sélectionner un livreur</option>
                              {livreurs.map((liv) => (
                                <option key={liv.id} value={liv.id}>
                                  {liv.nom}
                                </option>
                              ))}
                            </Form.Control>
                          </td>
                          <td>
                            <Form.Control
                              as="select"
                              name="vehicule_id"
                              value={filterFormData.vehicule_id}
                              onChange={handleFilterChange}
                              className="form-control form-control-sm"
                            >
                              <option value="">Sélectionner un véhicule</option>
                              {vehicules.map((veh) => (
                                <option key={veh.id} value={veh.id}>
                                  {veh.model}-{veh.matricule}
                                </option>
                              ))}
                            </Form.Control>
                          </td>
                          <td>
                            <Button
                              variant="primary"
                              type="submit"
                              className="btn-sm"
                            >
                              Appliquer les filtres
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </Form>
                </div>
              )}
            </div>

            <Button
              variant="info"
              className="col-2 btn btn-sm m-2"
              id="filterButton"
              onClick={() => {
                if (isFilte) {
                  // Annuler le filtrage
                  setIsFilte(false);
                  // Réinitialiser les données filtrées et les données de formulaire
                  setFilteredData(vehicule_livreurs);
                  setFilterFormData({
                    date_debut_affectation: "",
                    date_fin_affectation: "",
                    livreur_id: "",
                    vehicule_id: "",
                  });
                } else {
                  // Activer le filtrage
                  setIsFilte(true);
                }
              }}
              disabled={isFiltering && filteredData.length === 0}
            >
              <FontAwesomeIcon
                icon={faFilter}
                style={{ verticalAlign: "middle" }}
              />{" "}
              {isFilte ? "Annuler le filtre" : "Filtrer"}
            </Button>

            <div id="formContainer" className="" style={formContainerStyle}>
              <Form className="col row" onSubmit={handleSubmit}>
                <Form.Label className="text-center m-2">
                  <h4>
                    {editingvehicule_livreur ? "Modifier" : "Ajouter"} une
                    Affectation de véhicule au livreur
                  </h4>
                </Form.Label>
                <Form.Group className="col-sm-5 m-2 " controlId="livreur_id">
                  <Form.Label>Livreurs</Form.Label>
                  <Form.Control
                    as="select"
                    name="livreur_id"
                    value={formData.livreur_id}
                    onChange={handleChange}
                  >
                    <option value=""> sele livreur</option>
                    {livreurs.map((liv) => (
                      <option key={liv.id} value={liv.id}>
                        {liv.nom}
                      </option>
                    ))}
                    <Form.Text className="text-danger">
                      {errors.livreur_id}
                    </Form.Text>
                  </Form.Control>
                </Form.Group>
                <Form.Group className="col-sm-5 m-2 " controlId="livreur_id">
                  <Form.Label>Vehicules</Form.Label>
                  <Form.Control
                    as="select"
                    name="vehicule_id"
                    value={formData.vehicule_id}
                    onChange={handleChange}
                  >
                    <option value="">sele vehicule</option>
                    {vehicules.map((veh) => (
                      <option key={veh.id} value={veh.id}>
                        {veh.model}-{veh.matricule}
                      </option>
                    ))}
                    <Form.Text className="text-danger">
                      {errors.vehicule_id}
                    </Form.Text>
                  </Form.Control>
                </Form.Group>
                <Form.Group
                  className="col-sm-4 m-2 "
                  controlId="date_debut_affectation"
                >
                  <Form.Label>date Debut d'affectation</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_debut_affectation"
                    value={formData.date_debut_affectation}
                    onChange={handleChange}
                    placeholder="date_debut_affectation"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">
                    {errors.date_debut_affectation}
                  </Form.Text>
                </Form.Group>
                <Form.Group
                  className="col-sm-4 m-2"
                  controlId="date_fin_affectation"
                >
                  <Form.Label>date Fin d'affectation</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_fin_affectation"
                    value={formData.date_fin_affectation}
                    onChange={handleChange}
                    placeholder="datefin d'affectation"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">
                    {errors.date_fin_affectation}
                  </Form.Text>
                </Form.Group>
                <Form.Group
                  className="col-sm-5 m-2"
                  controlId="kilometrage_debut"
                >
                  <Form.Label>kilometrage Debut</Form.Label>
                  <Form.Control
                    type="number"
                    name="kilometrage_debut"
                    value={formData.kilometrage_debut}
                    onChange={handleChange}
                    placeholder="kilometrage_debut"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">
                    {errors.kilometrage_debut}
                  </Form.Text>
                </Form.Group>
                <Form.Group
                  className="col-sm-5 m-2"
                  controlId="kilometrage_fin"
                >
                  <Form.Label>kilometrage_fin</Form.Label>
                  <Form.Control
                    type="number"
                    name="kilometrage_fin"
                    value={formData.kilometrage_fin}
                    onChange={handleChange}
                    placeholder="kilometrage_fin"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">
                    {errors.kilometrage_fin}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="col-sm-4 m-2" controlId="heure">
                  <Form.Label>Heure</Form.Label>
                  <Form.Control
                    type="time"
                    name="heure"
                    value={formData.heure}
                    onChange={handleChange}
                    placeholder="heure"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">{errors.heure}</Form.Text>
                </Form.Group>

                <Form.Group className="col-8 m-3 text-center">
                  <Button type="submit" className="btn btn-danger col-6">
                    {editingvehicule_livreur ? "Modifier" : "Ajouter"}
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
            <div
              id="tableContainer"
              className="table-responsive-sm"
              style={tableContainerStyle}
            >
              <table
                className="table table-responsive table-bordered "
                id="VehiculeLivreurs"
              >
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>
                      <input type="checkbox" onChange={handleSelectAllChange} />
                    </th>
                    <th style={tableHeaderStyle}>livreur</th>
                    <th style={tableHeaderStyle}>vehicule matricule</th>
                    <th style={tableHeaderStyle}>date_debut_affectation</th>
                    <th style={tableHeaderStyle}>date_fin_affectation</th>
                    <th style={tableHeaderStyle}>kilometrage_debut</th>
                    <th style={tableHeaderStyle}>kilometrage_fin</th>
                    <th style={tableHeaderStyle}>Heure</th>
                    <th style={tableHeaderStyle}>Action</th>
                  </tr>
                </thead>
                  <tbody>
                    {filteredData.length > 0
                      ? filteredData
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((vehicule_livreur) => (
                            <tr key={vehicule_livreur.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  onChange={() =>
                                    handleCheckboxChange(vehicule_livreur.id)
                                  }
                                  checked={selectedItems.includes(
                                    vehicule_livreur.id
                                  )}
                                />
                              </td>
                              <td>{vehicule_livreur.livreur.nom}</td>
                            <td>{vehicule_livreur.vehicule.matricule}</td>
                            <td>{vehicule_livreur.date_debut_affectation}</td>
                            <td>{vehicule_livreur.date_fin_affectation}</td>
                            <td>{vehicule_livreur.kilometrage_debut}</td>
                            <td>{vehicule_livreur.kilometrage_fin}</td>
                            <td>{vehicule_livreur.heure}</td>
                            <td className="d-inline-flex">
                              <Button
                                className="btn btn-sm btn-info m-1"
                                onClick={() => handleEdit(vehicule_livreur)}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                className="btn btn-danger btn-sm m-1"
                                onClick={() =>
                                  handleDelete(vehicule_livreur.id)
                                }
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </td>
                          </tr>
                        ))
                    : vehicule_livreurs
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((vehicule_livreur) => (
                          <tr key={vehicule_livreur.id}>
                            <td>
                              <input
                                type="checkbox"
                                onChange={() =>
                                  handleCheckboxChange(vehicule_livreur.id)
                                }
                                checked={selectedItems.includes(
                                  vehicule_livreur.id
                                )}
                              />
                            </td>
                            <td>{vehicule_livreur.livreur.nom}</td>
                            <td>{vehicule_livreur.vehicule.matricule}</td>
                            <td>{vehicule_livreur.date_debut_affectation}</td>
                            <td>{vehicule_livreur.date_fin_affectation}</td>
                            <td>{vehicule_livreur.kilometrage_debut}</td>
                            <td>{vehicule_livreur.kilometrage_fin}</td>
                            <td>{vehicule_livreur.heure}</td>
                            <td className="d-inline-flex">
                              <Button
                                className="btn btn-sm btn-info m-1"
                                onClick={() => handleEdit(vehicule_livreur)}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                className="btn btn-danger btn-sm m-1"
                                onClick={() =>
                                  handleDelete(vehicule_livreur.id)
                                }
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
                count={filteredvehicule_livreurs.length}
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

export default Vehicule_livreur;
