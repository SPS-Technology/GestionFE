import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import "../style.css";
import Navigation from "../Acceuil/Navigation";
import Search from "../Acceuil/Search";
import TablePagination from "@mui/material/TablePagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { DatePicker } from "@mui/x-date-pickers";
import Select from "react-dropdown-select";
import {
  faTrash,
  faFilePdf,
  faFileExcel,
  faPrint,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import TextField from "@mui/material/TextField";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
const ChargeCommande = () => {
  // const [existingChargementCommande, setExistingChargementCommande] = useState([]);
  //   const [livreurs, setLivreurs] = useState([]);
  const [vehicule_livreurs, setVehicule_livreurs] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRealDate, setFilterRealDate] = useState(false);
  const [filterPlannedDate, setFilterPlannedDate] = useState(false);
//   const [filteredChargementCommandes, setFilteredChargementCommandes] =
    // useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [chargementCommandes, setChargementCommandes] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  useState("");
  const [dateLivraisonReeleFilter, setDateLivraisonReeleFilter] = useState("");
  const [vehiculeFilter, setVehiculeFilter] = useState("");
  //-------------------edit-----------------------//
  const [editingChargementCommande, setEditingChargementCommande] =
    useState(null); // State to hold the chargementCommande being edited
  const [editingChargementCommandeId, setEditingChargementCommandeId] =
    useState(null);

  //---------------form-------------------//
  const [showForm, setShowForm] = useState(false);
  const [ShowFilterModal, setShowFilterModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicule_id: "",
    livreur_id: "",
    confort: "",
    remarque: "",
    commande_id: "",
    dateLivraisonPrevue: "",
    dateLivraisonReelle: "",
  });
  //   const [filterFormData, setFilterFormData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isFilte, setIsFilte] = useState(false);
  const [formContainerStyle, setFormContainerStyle] = useState({
    right: "-100%",
  });
  const [tableContainerStyle, setTableContainerStyle] = useState({
    marginRight: "0px",
  });

  const fetchChargementCommandes = async () => {
    try {
      const livreurResponse = await axios.get(
        "http://localhost:8000/api/vehicule-livreurs"
      );

      console.log("API Response for Livreurs:", livreurResponse.data.livreurs);

      setVehicule_livreurs(livreurResponse.data.vehicule_livreurs);
      //   const vehiculesResponse = await axios.get(
      //     "http://localhost:8000/api/vehicules"
      //   );

      //   console.log(
      //     "API Response for Vehicules:",
      //     vehiculesResponse.data.vehicules
      //   );

      //   setVehicules(vehiculesResponse.data.vehicules);
      const commandesResponse = await axios.get(
        "http://localhost:8000/api/commandes"
      );

      console.log(
        "API Response for Commandes:",
        commandesResponse.data.commandes
      );

      setCommandes(commandesResponse.data.commandes);
      const response = await axios.get(
        "http://localhost:8000/api/chargementCommandes"
      );

      console.log("API Response:", response.data);

      setChargementCommandes(response.data.chargementCommandes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchChargementCommandes();
  }, []);
  // useEffect(() => {
  //   const filtered = chargementCommandes.filter((chargementCommande) => {
  //     const isVehiculeMatch =
  //       chargementCommande.veihicule_id
  //         ?.toString()
  //         .toLowerCase()
  //         .includes(vehiculeFilter.toLowerCase()) ||
  //       getVehiculesMarque(chargementCommande.veihicule_id)
  //         .toLowerCase()
  //         .includes(vehiculeFilter.toLowerCase());

  //     const isDateMatch =
  //       chargementCommande.dateLivraisonReelle &&
  //       chargementCommande.dateLivraisonReelle
  //         .toString()
  //         .toLowerCase()
  //         .includes(dateLivraisonReeleFilter.toLowerCase());

  //     return isVehiculeMatch && isDateMatch;
  //   });

  //   setFilteredChargementCommandes(filtered);
  // }, [chargementCommandes, vehiculeFilter, dateLivraisonReeleFilter]);

  //   useEffect(() => {
  //     const filtered =
  //       chargementCommandes &&
  //       chargementCommandes.filter((chargementCommande) =>
  //         chargementCommande.veihicule_id
  //           .toString()
  //           .toLowerCase()
  //           .includes(searchTerm.toLowerCase())
  //       );
  //     setFilteredChargementCommandes(filtered);
  //   }, [chargementCommandes, searchTerm]);
  //   const getLivreurNom = (livreurId) => {
  //     try {
  //       const livreur = livreurs.find((livreur) => livreur.id === livreurId);

  //       return livreur ? livreur.nom : "";
  //     } catch (error) {
  //       console.error(`Error finding produit with ID ${livreurId}:`, error);
  //       return "";
  //     }
  //   };
  //   const getVehiculesMarque = (vehiclueId) => {
  //     try {
  //       const vehicule = vehicules.find((vehicule) => vehicule.id === vehiclueId);

  //       return vehicule ? vehicule.marque : "";
  //     } catch (error) {
  //       console.error(`Error finding produit with ID ${vehiclueId}:`, error);
  //       return "";
  //     }
  //   };
  const getCommandeReference = (commandeId) => {
    try {
      const commande = commandes.find((commande) => commande.id === commandeId);

      return commande ? commande.reference : "";
    } catch (error) {
      console.error(`Error finding produit with ID ${commandeId}:`, error);
      return "";
    }
  };
  const [filterFormData, setFilterFormData] = useState({
    startDate: "",
    endDate: "",
    livreur_id: "",
    vehicule_id: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData({ ...filterFormData, [name]: value });
  };
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
  //------------------------- chargementCommande Delete Selected ---------------------//

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
            .delete(`http://localhost:8000/api/chargementCommandes/${id}`)
            .then((response) => {
              fetchChargementCommandes();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "chargementCommande supprimé avec succès.",
              });
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la suppression du chargementCommande:",
                error
              );
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression du chargementCommande.",
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
      setSelectedItems(
        chargementCommandes.map((chargementCommande) => chargementCommande.id)
      );
    }
  };
  //------------------------- chargementCommande print ---------------------//

  const printList = (tableId, title, stockList) => {
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
                  Array.isArray(stockList)
                    ? stockList.map((item) => `<li>${item}</li>`).join("")
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
  //------------------------- chargementCommande export to pdf ---------------------//

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
    const selectedChargementCommandes = chargementCommandes.filter(
      (chargementCommande) => selectedItems.includes(chargementCommande.id)
    );
    const rows = selectedChargementCommandes.map((chargementCommande) => [
      chargementCommande.id,
      chargementCommande.raison_sociale,
      chargementCommande.adresse,
      chargementCommande.tele,
      chargementCommande.ville,
      chargementCommande.abreviation,
      chargementCommande.ice,
      chargementCommande.user_id,
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
    pdf.save("chargementCommandes.pdf");
  };
  //------------------------- chargementCommande export to excel ---------------------//

  const exportToExcel = () => {
    const selectedChargementCommandes = chargementCommandes.filter(
      (chargementCommande) => selectedItems.includes(chargementCommande.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedChargementCommandes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChargementCommandes");
    XLSX.writeFile(wb, "chargementCommandes.xlsx");
  };

  //------------------------- chargementCommande Delete---------------------//
  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer ce chargementCommande ?",
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
          .delete(`http://localhost:8000/api/chargementCommandes/${id}`)
          .then((response) => {
            if (response.data.message) {
              // Successful deletion
              fetchChargementCommandes();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "chargementCommande supprimé avec succès",
              });
            } else if (response.data.error) {
              // Error occurred
              if (
                response.data.error.includes(
                  "Impossible de supprimer ou de mettre à jour une ligne parent : une contrainte de clé étrangère échoue"
                )
              ) {
                // Violated integrity constraint error
                Swal.fire({
                  icon: "error",
                  title: "Erreur!",
                  text: "Impossible de supprimer le chargementCommande car il a des produits associés.",
                });
              }
            }
          })
          .catch((error) => {
            // Request error
            console.error(
              "Erreur lors de la suppression du chargementCommande:",
              error
            );
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: `Échec de la suppression du chargementCommande. Veuillez consulter la console pour plus d'informations.`,
            });
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  };
  //------------------------- chargementCommande EDIT---------------------//

  const handleEdit = (chargementCommandes) => {
    setEditingChargementCommande(chargementCommandes); // Set the chargementCommandes to be edited
    // Populate form data with chargementCommandes details
    setFormData({
      vehicule_id: chargementCommandes.veihicule_id,
      livreur_id: chargementCommandes.livreur_id,
      remarque: chargementCommandes.remarque,
      confort: chargementCommandes.confort,
      commande_id: chargementCommandes.commande_id,
      dateLivraisonPrevue: chargementCommandes.dateLivraisonPrevue,
      dateLivraisonReelle: chargementCommandes.dateLivraisonReelle,
    });
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "100%" });
    } else {
      closeForm();
    }
    // Show form
    // setShowForm(true);
  };
  useEffect(() => {
    if (editingChargementCommandeId !== null) {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "100%" });
    }
  }, [editingChargementCommandeId]);

  //------------------------- chargementCommande SUBMIT---------------------//

  // Update notifications state
  const handleVehiculeFilterChange = (e) => {
    setVehiculeFilter(e.target.value);
  };

  const handleDateLivraisonReeleFilterChange = (e) => {
    setDateLivraisonReeleFilter(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingChargementCommande
      ? `http://localhost:8000/api/chargementCommandes/${editingChargementCommande.id}`
      : "http://localhost:8000/api/chargementCommandes";
    const method = editingChargementCommande ? "put" : "post";
    axios({
      method: method,
      url: url,
      data: formData,
    })
      .then(() => {
        fetchChargementCommandes();
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: `chargementCommande ${
            editingChargementCommande ? "modifié" : "ajouté"
          } avec succès.`,
        });
        setFormData({
          vehicule_id: "",
          livreur_id: "",
          confort: "",
          remarque: "",
          commande_id: "",
          dateLivraisonPrevue: "",
          dateLivraisonReelle: "",
        });
        setEditingChargementCommande(null); // Clear editing chargementCommande
        closeForm();
      })
      .catch((error) => {
        console.error(
          `Erreur lors de ${
            editingChargementCommande ? "la modification" : "l'ajout"
          } du chargementCommande:`,
          error
        );
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: `Échec de ${
            editingChargementCommande ? "la modification" : "l'ajout"
          } du chargementCommande.`,
        });
      });
  };

  //------------------------- chargementCommande FORM---------------------//

  const handleShowFormButtonClick = () => {
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "100%" });
    } else {
      closeForm();
    }
  };

  const closeForm = () => {
    setFormContainerStyle({ right: "-100%" });
    setTableContainerStyle({ marginRight: "0" });
    setShowForm(false); // Hide the form
    setFormData({
      // Clear form data
      veihicule_id: "",
      livreur_id: "",
      commande_id: "",
      dateLivraisonPrevue: "",
      dateLivraisonReelle: "",
    });
    setEditingChargementCommande(null); // Clear editing chargementCommande
  };
  const handleFilterSubmit = (e) => {
    e.preventDefault();

    const { startDate, endDate, livreur_id, vehicule_id } = filterFormData;

    const filteredVehiculeLivreurs = chargementCommandes.filter((vl) => {
      const dateLivraisonPrevue = new Date(vl.dateLivraisonPrevue);
      const dateLivraisonReelle = new Date(vl.dateLivraisonReelle);

      const isPrevueInRange =
        (!startDate || dateLivraisonPrevue >= new Date(startDate)) &&
        (!endDate || dateLivraisonPrevue <= new Date(endDate));

      const isReelleInRange =
        (!startDate || dateLivraisonReelle >= new Date(startDate)) &&
        (!endDate || dateLivraisonReelle <= new Date(endDate));

      const livreurFilter = !livreur_id || String(vl.livreur.id) === livreur_id;
      const vehiculeFilter =
        !vehicule_id || String(vl.vehicule.id) === vehicule_id;

      const isFilterFilled =
        startDate !== "" ||
        endDate !== "" ||
        livreur_id !== "" ||
        vehicule_id !== "";

      setIsFiltering(isFilterFilled);

      let passFilter = false;

      if (filterRealDate && filterPlannedDate) {
        passFilter =
          (isPrevueInRange || isReelleInRange) &&
          livreurFilter &&
          vehiculeFilter;
      } else if (filterRealDate) {
        passFilter = isReelleInRange && livreurFilter && vehiculeFilter;
      } else if (filterPlannedDate) {
        passFilter = isPrevueInRange && livreurFilter && vehiculeFilter;
      } else {
        passFilter =
          (isPrevueInRange || isReelleInRange) &&
          livreurFilter &&
          vehiculeFilter;
      }

      return passFilter;
    });

    setFilteredData(filteredVehiculeLivreurs);

    if (filteredVehiculeLivreurs.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Aucun résultat trouvé",
        text: "Veuillez ajuster vos filtres.",
      });

      setIsFiltering(false);
      setFilteredData(chargementCommandes);
    }

    console.log("filterFormData:", filterFormData);
    console.log("filteredVehiculeLivreurs:", filteredVehiculeLivreurs);
    setShowFilterModal(false);
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 1 }}>
          <Toolbar />
          <div className="d-flex align-items-start">
            {isFilte && (
              <div className="filter-container">
                <Form onSubmit={handleFilterSubmit}>
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Date Debut</th>
                        <th>Date Fin</th>
                        <th>Livreurs</th>
                        <th>Véhicules</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <Form.Control
                            type="date"
                            name="startDate"
                            value={filterFormData.startDate}
                            onChange={handleFilterChange}
                            className="form-control form-control-sm"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="date"
                            name="endDate"
                            value={filterFormData.endDate}
                            onChange={handleFilterChange}
                            className="form-control form-control-sm"
                          />
                        </td>
                        <td>
                          <Form.Check
                            type="checkbox"
                            id="filterRealDate"
                            label="Date Réelle"
                            checked={filterRealDate}
                            onChange={(e) =>
                              setFilterRealDate(e.target.checked)
                            }
                          />
                        </td>
                        <td>
                          <Form.Check
                            type="checkbox"
                            id="filterPlannedDate"
                            label="Date Prévue"
                            checked={filterPlannedDate}
                            onChange={(e) =>
                              setFilterPlannedDate(e.target.checked)
                            }
                          />
                        </td>

                        <td>
                          <Form.Control
                            as="select"
                            name="livreur_id"
                            value={filterFormData.livreur_id}
                            onChange={handleFilterChange}
                            className="form-control form-control-sm"
                          >
                            <option value="">Livreur</option>
                            {(() => {
                              const seenLivreurIds = new Set(); // Créer un ensemble pour stocker les ID des livreurs déjà rencontrés
                              return vehicule_livreurs.map((item) => {
                                if (
                                  item.livreur &&
                                  !seenLivreurIds.has(item.livreur.id)
                                ) {
                                  seenLivreurIds.add(item.livreur.id); // Ajouter l'ID du livreur à l'ensemble
                                  return (
                                    <option
                                      key={item.livreur.id}
                                      value={item.livreur.id}
                                    >
                                      {item.livreur.nom}
                                    </option>
                                  );
                                }
                                return null;
                              });
                            })()}
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
                            {(() => {
                              const seenVehiculeIds = new Set(); // Créer un ensemble pour stocker les IDs des véhicules déjà rencontrés
                              return vehicule_livreurs.map((veh) => {
                                if (!seenVehiculeIds.has(veh.vehicule.id)) {
                                  seenVehiculeIds.add(veh.vehicule.id); // Ajouter l'ID du véhicule à l'ensemble
                                  return (
                                    <option
                                      key={veh.vehicule.id}
                                      value={veh.vehicule.id}
                                    >
                                      {veh.vehicule.model}-
                                      {veh.vehicule.matricule}
                                    </option>
                                  );
                                }
                                return null;
                              });
                            })()}
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
                setIsFilte(false);
                setFilteredData(chargementCommandes);
                setFilterFormData({
                  vehicule_id: "",
                  livreur_id: "",
                  commande_id: "",
                  dateLivraisonPrevue: "",
                  dateLivraisonReelle: "",
                });
              } else {
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
          <div className="search-container d-flex flex-row-reverse mb-3">
            <Search onSearch={handleSearch} />
          </div>
          <div className="add-Ajout-form ">
            <Button
              //variant="primary"
              className=" btn btn-sm"
              id="showFormButton"
              onClick={handleShowFormButtonClick}
            >
              {showForm ? "Modifier le formulaire" : "Charger une Commande"}
            </Button>
            <div id="formContainer" className="mt-2" style={formContainerStyle}>
              <Form className="col row" onSubmit={handleSubmit}>
                <Form.Label className="text-center m-2">
                  <h5>
                    {editingChargementCommande
                      ? "Modifier le chargementCommande"
                      : "Charger une Commande"}
                  </h5>
                </Form.Label>
                <Form.Group className="col-sm-5 m-2" controlId="livreur_id">
                  <Form.Label>Livreur</Form.Label>
                  <Form.Select
                    name="livreur_id"
                    value={formData.livreur_id}
                    onChange={handleChange}
                    className="form-select form-select-sm"
                    required
                  >
                    <option value="">Livreur</option>
                    {(() => {
                      const seenLivreurIds = new Set();
                      return vehicule_livreurs.map((item) => {
                        if (
                          item.livreur &&
                          !seenLivreurIds.has(item.livreur.id)
                        ) {
                          seenLivreurIds.add(item.livreur.id);
                          return (
                            <option
                              key={item.livreur.id}
                              value={item.livreur.id}
                            >
                              {item.livreur.nom}
                            </option>
                          );
                        }
                        return null;
                      });
                    })()}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="col-sm-5 m-2" controlId="vehicule_id">
                  <Form.Label>Véhicule</Form.Label>
                  <Form.Select
                    name="vehicule_id"
                    value={formData.vehicule_id}
                    onChange={handleChange}
                    className="form-select form-select-sm"
                    disabled={!formData.livreur_id}
                  >
                    <option value="">Véhicule</option>
                    {vehicule_livreurs
                      .filter(
                        (item) =>
                          item.livreur_id === parseInt(formData.livreur_id)
                      )
                      .map((filteredItem) => (
                        <option
                          key={filteredItem.vehicule_id}
                          value={filteredItem.vehicule_id}
                        >
                          {filteredItem.vehicule.matricule}{" "}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="col-sm-5 m-2" controlId="remarque">
                  <Form.Label>Remarque</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="remarque"
                    value={formData.remarque}
                    onChange={handleChange}
                    placeholder="Saisissez votre remarque ici..."
                  />
                </Form.Group>
                <Form.Group className="col-sm-5 m-2">
                  <Form.Label>Confort</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      label="Oui"
                      type="radio"
                      id="confortOui"
                      name="confort"
                      value="oui"
                      checked={formData.confort === "oui"}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      label="Non"
                      type="radio"
                      id="confortNon"
                      name="confort"
                      value="non"
                      checked={formData.confort === "non"}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="col-sm-5 m-2" controlId="commande_id">
                  <Form.Label>Commande</Form.Label>

                  <Form.Select
                    name="commande_id"
                    value={formData.commande_id}
                    onChange={handleChange}
                    className="form-select form-select-sm"
                    required
                  >
                    <option value="">Commande</option>
                    {commandes.map((commande) => (
                      <option key={commande.id} value={commande.id}>
                        {commande.reference}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="col-sm-5 m-2 ">
                  <Form.Label>Date Livraison Prevue</Form.Label>
                  <Form.Control
                    type="date"
                    placeholder="dateLivraisonPrevue"
                    name="dateLivraisonPrevue"
                    value={formData.dateLivraisonPrevue}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="col-sm-10 m-2">
                  <Form.Label>Date Livraison Reelle</Form.Label>
                  <Form.Control
                    type="date"
                    placeholder="dateLivraisonReelle"
                    name="dateLivraisonReelle"
                    value={formData.dateLivraisonReelle}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="col m-3 text-center">
                  <Button type="submit" className="btn btn-success col-6">
                    {editingChargementCommande ? "Modifier" : "Ajouter"}
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
            <table className="table" id="stockTable">
              <thead>
                <tr></tr>
                <tr>
                  <th scope="col">
                    <input type="checkbox" onChange={handleSelectAllChange} />
                  </th>
                  <th scope="col">Vehicule</th>
                  <th scope="col">Livreur</th>
                  <th scope="col">Commande</th>
                  <th scope="col">Remarque</th>
                  <th scope="col">Confort</th>
                  <th scope="col">Date Prevue</th>
                  <th scope="col">Date Reelle</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
              {filteredData.length > 0
                  ? filteredData
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((chargementCommande) => (
                        <tr key={chargementCommande.id}>
                          <td>
                            <input
                              type="checkbox"
                              onChange={() =>
                                handleCheckboxChange(chargementCommande.id)
                              }
                              checked={selectedItems.includes(
                                chargementCommande.id
                              )}
                            />
                          </td>
                          <td>
                            {getCommandeReference(
                              chargementCommande.commande_id
                            )}
                          </td>
                          <td>{chargementCommande.livreur.nom}</td>
                          <td>{chargementCommande.vehicule.matricule}</td>
                          <td>{chargementCommande.confort}</td>
                          <td>{chargementCommande.remarque}</td>
                          <td>{chargementCommande.dateLivraisonPrevue}</td>
                          <td>{chargementCommande.dateLivraisonReelle}</td>
                          <td className="d-inline-flex">
                            <Button
                              className="btn btn-sm btn-info m-1"
                              onClick={() => handleEdit(chargementCommande)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              className="btn btn-danger btn-sm m-1"
                              onClick={() =>
                                handleDelete(chargementCommande.id)
                              }
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))
                  : chargementCommandes
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((chargementCommande) => (
                        <tr key={chargementCommande.id}>
                          <td>
                            <input
                              type="checkbox"
                              onChange={() =>
                                handleCheckboxChange(chargementCommande.id)
                              }
                              checked={selectedItems.includes(
                                chargementCommande.id
                              )}
                            />
                          </td>
                          <td>{chargementCommande.commande.reference}</td>
                          <td>{chargementCommande.livreur.nom}</td>
                          <td>{chargementCommande.vehicule.matricule}</td>
                          <td>{chargementCommande.confort}</td>
                          <td>{chargementCommande.remarque}</td>
                          <td>{chargementCommande.dateLivraisonPrevue}</td>
                          <td>{chargementCommande.dateLivraisonReelle}</td>
                          <td className="d-inline-flex">
                            <Button
                              className="btn btn-sm btn-info m-1"
                              onClick={() => handleEdit(chargementCommande)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              className="btn btn-danger btn-sm m-1"
                              onClick={() =>
                                handleDelete(chargementCommande.id)
                              }
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
            <div className="d-flex flex-row">
              <div className="btn-group col-2">
                <Button
                  className="btn btn-danger btn-sm"
                  onClick={handleDeleteSelected}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
                <Button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    printList(
                      "stockTable",
                      "Liste des ChargementCommandes",
                      chargementCommandes
                    )
                  }
                >
                  <FontAwesomeIcon icon={faPrint} />
                </Button>
                <Button
                  className="btn btn-danger btn-sm ml-2"
                  onClick={exportToPdf}
                >
                  <FontAwesomeIcon icon={faFilePdf} />
                </Button>
                <Button
                  className="btn btn-success btn-sm ml-2"
                  onClick={exportToExcel}
                >
                  <FontAwesomeIcon icon={faFileExcel} />
                </Button>
              </div>
            </div> 
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={
                chargementCommandes &&
                chargementCommandes.length
              }
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ChargeCommande;
