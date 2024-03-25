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
  const [livreurs, setLivreurs] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChargementCommandes, setFilteredChargementCommandes] =
    useState([]);
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
  const [formData, setFormData] = useState({
    veihicule_id: "",
    livreur_id: "",
    commande_id: "",
    dateLivraisonPrevue: "",
    dateLivraisonReelle: "",
  });
  const [formContainerStyle, setFormContainerStyle] = useState({
    right: "-100%",
  });
  const [tableContainerStyle, setTableContainerStyle] = useState({
    marginRight: "0px",
  });

  const fetchChargementCommandes = async () => {
    try {
      const livreurResponse = await axios.get(
        "http://localhost:8000/api/livreurs"
      );

      console.log("API Response for Livreurs:", livreurResponse.data.livreurs);

      setLivreurs(livreurResponse.data.livreurs);
      const vehiculesResponse = await axios.get(
        "http://localhost:8000/api/vehicules"
      );

      console.log(
        "API Response for Vehicules:",
        vehiculesResponse.data.vehicules
      );

      setVehicules(vehiculesResponse.data.vehicules);
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
  useEffect(() => {
    const filtered = chargementCommandes.filter((chargementCommande) => {
      const isVehiculeMatch =
        chargementCommande.veihicule_id
          ?.toString()
          .toLowerCase()
          .includes(vehiculeFilter.toLowerCase()) ||
        getVehiculesMarque(chargementCommande.veihicule_id)
          .toLowerCase()
          .includes(vehiculeFilter.toLowerCase());

      const isDateMatch =
        chargementCommande.dateLivraisonReelle &&
        chargementCommande.dateLivraisonReelle
          .toString()
          .toLowerCase()
          .includes(dateLivraisonReeleFilter.toLowerCase());

      return isVehiculeMatch && isDateMatch;
    });

    setFilteredChargementCommandes(filtered);
  }, [chargementCommandes, vehiculeFilter, dateLivraisonReeleFilter]);

  useEffect(() => {
    const filtered =
      chargementCommandes &&
      chargementCommandes.filter((chargementCommande) =>
        chargementCommande.veihicule_id
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    setFilteredChargementCommandes(filtered);
  }, [chargementCommandes, searchTerm]);
  const getLivreurNom = (livreurId) => {
    try {
      const livreur = livreurs.find((livreur) => livreur.id === livreurId);

      return livreur ? livreur.nom : "";
    } catch (error) {
      console.error(`Error finding produit with ID ${livreurId}:`, error);
      return "";
    }
  };
  const getVehiculesMarque = (vehiclueId) => {
    try {
      const vehicule = vehicules.find((vehicule) => vehicule.id === vehiclueId);

      return vehicule ? vehicule.marque : "";
    } catch (error) {
      console.error(`Error finding produit with ID ${vehiclueId}:`, error);
      return "";
    }
  };
  const getCommandeReference = (commandeId) => {
    try {
      const commande = commandes.find((commande) => commande.id === commandeId);

      return commande ? commande.reference : "";
    } catch (error) {
      console.error(`Error finding produit with ID ${commandeId}:`, error);
      return "";
    }
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
      veihicule_id: chargementCommandes.veihicule_id,
      livreur_id: chargementCommandes.livreur_id,
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
          veihicule_id: "",
          livreur_id: "",
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

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 1 }}>
          {/* <h2 className="mt-4">Chargement des Commandes</h2> */}

          <div className="search-container d-flex flex-row-reverse mb-3">
            <Search onSearch={handleSearch} />
          </div>
          <div className="add-Ajout-form ">
            <div className="filter-container mt-4">
              <div className="filter-controls">
                <input
                  type="text"
                  placeholder="Véhicule"
                  value={vehiculeFilter}
                  onChange={handleVehiculeFilterChange}
                />
                <input
                  type="text"
                  placeholder="Date Livraison Reelle"
                  value={dateLivraisonReeleFilter}
                  onChange={handleDateLivraisonReeleFilterChange}
                />
              </div>
            </div>
            <div className="mt-4">
              {" "}
              <Button
                //variant="primary"
                className=" btn btn-sm"
                id="showFormButton"
                onClick={handleShowFormButtonClick}
              >
                {showForm ? "Modifier le formulaire" : "Charger une Commande"}
              </Button>
            </div>

            <div
              id="formContainer"
              style={{ ...formContainerStyle, padding: "50px" }}
            >
              <Form className="row" onSubmit={handleSubmit}>
                <div className="col-md-12">
                  <div className="row mb-3">
                    <div className="col-sm-6">
                      <label htmlFor="livreur_id" className="col-form-label">
                        Livreur:
                      </label>
                    </div>
                    <div className="col-sm-6">
                      <Form.Select
                        name="livreur_id"
                        value={formData.livreur_id}
                        onChange={handleChange}
                        className="form-select form-select-sm"
                        required
                      >
                        <option value="">Livreur</option>
                        {livreurs.map((livreur) => (
                          <option key={livreur.id} value={livreur.id}>
                            {livreur.nom}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="row mb-3">
                    <div className="col-sm-6">
                      <label htmlFor="veihicule_id" className="col-form-label">
                        Vehicule:
                      </label>
                    </div>
                    <div className="col-sm-6">
                      <Form.Select
                        name="veihicule_id"
                        value={formData.veihicule_id}
                        onChange={handleChange}
                        className="form-select form-select-sm"
                        required
                      >
                        <option value="">Vehicule</option>
                        {vehicules.map((vehicule) => (
                          <option key={vehicule.id} value={vehicule.id}>
                            {vehicule.marque}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="row mb-3">
                    <div className="col-sm-6">
                      <label htmlFor="commande_id" className="col-form-label">
                        Commande:
                      </label>
                    </div>
                    <div className="col-sm-6">
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
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="row mb-3">
                    <div className="col-sm-6">
                      <label
                        htmlFor="dateLivraisonPrevue"
                        className="col-form-label"
                      >
                        Date Livraison Prevue:
                      </label>
                    </div>
                    <div className="col-sm-6">
                      <Form.Group controlId="dateLivraisonPrevue">
                        <Form.Control
                          type="date"
                          name="dateLivraisonPrevue"
                          value={formData.dateLivraisonPrevue}
                          onChange={handleChange}
                          className="form-control-sm"
                        />
                      </Form.Group>
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="row mb-4">
                    <div className="col-sm-6">
                      <label
                        htmlFor="dateLivraisonReelle"
                        className="col-form-label"
                      >
                        Date Livraison Reelle:
                      </label>
                    </div>
                    <div className="col-sm-6">
                      <Form.Group controlId="dateLivraisonReelle">
                        <Form.Control
                          type="date"
                          name="dateLivraisonReelle"
                          value={formData.dateLivraisonReelle}
                          onChange={handleChange}
                          className="form-control-sm"
                        />
                      </Form.Group>
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <Form.Group className="text-center">
                    <Button type="submit" className=" btn-sm col-4">
                      {editingChargementCommande ? "Modifier" : "Valider"}
                    </Button>
                    <Button
                      className=" btn-sm btn-secondary col-4 offset-1 "
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
            <table className="table table-bordered" id="stockTable">
              <thead
                className="text-center "
                style={{ backgroundColor: "#ddd" }}
              >
                <tr></tr>
                <tr>
                  <th scope="col">
                    <input type="checkbox" onChange={handleSelectAllChange} />
                  </th>
                  <th scope="col">Vehicule</th>
                  <th scope="col">Livreur</th>
                  <th scope="col">Commande</th>
                  <th scope="col">Date Prevue</th>
                  <th scope="col">Date Reelle</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredChargementCommandes &&
                  filteredChargementCommandes
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((chargementCommandes) => (
                      <tr key={chargementCommandes.id}>
                        <td>
                          <input
                            type="checkbox"
                            onChange={() =>
                              handleCheckboxChange(chargementCommandes.id)
                            }
                            checked={selectedItems.includes(
                              chargementCommandes.id
                            )}
                          />
                        </td>
                        <td>
                          {getVehiculesMarque(chargementCommandes.veihicule_id)}
                        </td>
                        <td>{getLivreurNom(chargementCommandes.livreur_id)}</td>
                        <td>
                          {getCommandeReference(
                            chargementCommandes.commande_id
                          )}
                        </td>
                        <td>{chargementCommandes.dateLivraisonPrevue}</td>
                        <td>{chargementCommandes.dateLivraisonReelle}</td>
                        <td className="d-inline-flex">
                          <Button
                            className="btn btn-sm btn-info m-1"
                            onClick={() => handleEdit(chargementCommandes)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            className="btn btn-danger btn-sm m-1"
                            onClick={() => handleDelete(chargementCommandes.id)}
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
                filteredChargementCommandes &&
                filteredChargementCommandes.length
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
