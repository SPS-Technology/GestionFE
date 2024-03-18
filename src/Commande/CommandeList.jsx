import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import TablePagination from "@mui/material/TablePagination";
import Search from "../Acceuil/Search";
import Navigation from "../Acceuil/Navigation";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFilePdf,
  faFileExcel,
  faPrint,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import CommandeDetails from "./CommandeDetails ";
import Modal from "react-modal"; // Import the Modal component
import AddCommande from "./AddCommande ";
import EditCommande from "./EditCommande ";
import "../style.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";

const CommandeList = () => {
  const csrfTokenMeta = document.head.querySelector('meta[name="csrf-token"]');
  const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : null;
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [commandes, setCommandes] = useState([]);
  const [ligneCommandes, setLigneCommandes] = useState([]);
  const [statusCommandes, setStatusCommandes] = useState([]);
  const [users, setUsers] = useState([]);
  const [produits, setProduits] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAddCommandeDrawerOpen, setIsAddCommandeDrawerOpen] = useState(false);
  const [isEditCommandeDrawerOpen, setIsEditCommandeDrawerOpen] =
      useState(false);

  const [expandedRows, setExpandedRows] = useState([]);

  const handleOpenAddCommandeDrawer = () => {
    setIsEditCommandeDrawerOpen(true);
  };

  const handleCloseAddCommandeDrawer = () => {
    setIsEditCommandeDrawerOpen(false);
  };
  const handleOpenEditCommandeDrawer = () => {
    setIsEditCommandeDrawerOpen(true);
  };

  const handleCloseEditCommandeDrawer = () => {
    setIsEditCommandeDrawerOpen(false);
  };
  const fetchCommandes = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/commandes");

      console.log("API Response for Commandes:", response.data.commandes);

      setCommandes(response.data.commandes);

      const userResponse = await axios.get("http://localhost:8000/api/users");
      console.log("API Response for Users:", userResponse.data);
      setUsers(userResponse.data);

      const produitResponse = await axios.get(
          "http://localhost:8000/api/produits"
      );

      console.log("API Response for Produits:", produitResponse.data.produit);

      setProduits(produitResponse.data.produit);

      const clientResponse = await axios.get(
          "http://localhost:8000/api/clients"
      );
      console.log("API Response for Clients:", clientResponse.data.client);
      setClients(clientResponse.data.client);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchLigneCommandes = async () => {
    try {
      const response = await axios.get(
          "http://localhost:8000/api/ligneCommandes"
      );

      console.log("API Response for ligneCommandes:", response.data);

      setLigneCommandes(response.data.ligneCommande);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchStatusCommandes = async () => {
    try {
      const response = await axios.get(
          "http://localhost:8000/api/statusCommande"
      );

      console.log("API Response for ligneCommandes:", response.data);

      setStatusCommandes(response.data.statusCommande);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  useEffect(() => {
    // Filter commandes based on the search term
    const filtered = commandes.filter((commande) =>
        commande.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCommandes(filtered);
  }, [commandes, searchTerm]);

  const handleSearch = (term) => {
    //setCurrentPage(1); // Reset to the first page when searching
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
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer  ?");

    selectedItems.forEach((id) => {
      if (isConfirmed) {
        axios
            .delete(`http://localhost:8000/api/commandes/${id}`)
            .then(() => {
              fetchCommandes();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "Commande supprimé avec succès.",
              });
            })
            .catch((error) => {
              console.error("Erreur lors de la suppression du commande:", error);
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression du commande.",
              });
            });
      } else {
        console.log("Suppression annulée");
      }
    });
    fetchCommandes();

    setSelectedItems([]);
  };

  const handleShowDetails = (commande) => {
    setExpandedRows((prevRows) =>
        prevRows.includes(commande)
            ? prevRows.filter((row) => row !== commande)
            : [...prevRows, commande]
    );
  };

  const handleModalClose = () => {
    setModalIsOpen(false); // Close the modal
    setSelectedCommande(null);
  };

  const handleDelete = (id) => {
    const isConfirmed = window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce commande ?"
    );

    if (isConfirmed) {
      axios
          .delete(`http://localhost:8000/api/commandes/${id}`)
          .then(() => {
            fetchCommandes();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Commande supprimé avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de la suppression du commande:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la suppression du commande.",
            });
          });
    } else {
      console.log("Suppression annulée");
    }
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(commandes.map((commande) => commande.id));
    }
  };
  //------------Print List----------//

  const printList = (tableId, title, commandeList) => {
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
                .no-print {
                  display: none;
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
  //------------exportToPdf----------//

  const exportToPdf = () => {
    const pdf = new jsPDF();

    // Define the columns and rows for the table
    const columns = [
      "Raison Sociale",
      "Adresse",
      "Téléphone",
      "Ville",
      "Abréviation",
      "Zone",
    ];
    const selectedCommandes = commandes.filter((commande) =>
        selectedItems.includes(commande.id)
    );
    const rows = selectedCommandes.map((commande) => [
      commande.raison_sociale,
      commande.adresse,
      commande.tele,
      commande.ville,
      commande.abreviation,
      commande.zone,
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
      },
    });

    // Save the PDF
    pdf.save("commandes.pdf");
  };
  //------------exportToExcel----------//

  const exportToExcel = () => {
    const selectedCommandes = commandes.filter((commande) =>
        selectedItems.includes(commande.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedCommandes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Commandes");
    XLSX.writeFile(wb, "commandes.xlsx");
  };

  const getClientNameById = (clientId) => {
    console.log("clients", clients);
    const client = clients.find((c) => c.id === clientId);
    return client ? client.raison_sociale : "";
  };
  //------------formatDate----------//
  function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  }

  return (
      <ThemeProvider theme={createTheme()}>
        <Box sx={{ display: "flex" }}>
          <Navigation />
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
            <Toolbar />
            <div>
              <div>
                <h3>Liste des Commandes</h3>
              </div>
              {filteredCommandes && filteredCommandes.length > 0 ? (
                  <div className="table-container">
                    <div
                        style={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <div>
                        <AddCommande
                            produits={produits}
                            clients={clients}
                            users={users}
                            csrfToken={csrfToken}
                            fetchCommandes={fetchCommandes}
                            open={isAddCommandeDrawerOpen}
                            onClose={handleCloseAddCommandeDrawer}
                        />
                      </div>
                      <div className="search-container mb-1">
                        <Search onSearch={handleSearch} />
                      </div>
                    </div>
                    <div className="d-flex flex-row justify-content-end">
                      <div className="btn-group col-2">
                        <button
                        className="btn btn-secondary"
                        onClick={() =>
                            printList(
                                "commande",
                                "commandes Liste",
                                "commandes Liste"
                            )
                        }
                    >
                          <FontAwesomeIcon icon={faPrint} />
                    </button>
                    <button className="btn btn-danger" onClick={exportToPdf}>
                      <FontAwesomeIcon icon={faFilePdf} />{" "}
                    </button>
                    <button className="btn btn-success" onClick={exportToExcel}>
                      <FontAwesomeIcon icon={faFileExcel} />{" "}
                    </button>
                  </div>
                </div>
                    <div className="">
                      <div id="tableContainer" className="table-responsive-sm">
                        <table className="table table-hover table-bordered">
                          {/* Table headers */}
                          <thead className="text-center">
                          <tr>
                            <th></th>
                            <th className="no-print">
                              <input
                                  type="checkbox"
                                  checked={selectAll}
                                  onChange={handleSelectAllChange}
                              />
                            </th>

                            <th>Reference</th>
                            <th>Date Commande</th>
                            <th>Mode Paiement</th>
                            <th>Status</th>
                            <th>Client</th>
                            <th className="no-print">Action</th>
                          </tr>
                          </thead>
                          {/* Table body */}
                          <tbody className="text-center">
                          {filteredCommandes
                              .slice(
                                  page * rowsPerPage,
                                  page * rowsPerPage + rowsPerPage
                              )
                              .map((filteredCommande, index) => (
                                  <React.Fragment key={filteredCommande.id}>
                                    <tr key={filteredCommande.id}>
                                      <td className="no-print">
                                        <button
                                            className="no-print"
                                            onClick={() =>
                                                handleShowDetails(filteredCommande.id)
                                            }
                                        >
                                          <FontAwesomeIcon
                                              icon={
                                                expandedRows.includes(
                                                    filteredCommande.id
                                                )
                                                    ? faMinus
                                                    : faPlus
                                              }
                                          />
                                        </button>
                                      </td>
                                      <td className="no-print">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(
                                                filteredCommande.id
                                            )}
                                            onChange={() =>
                                                handleCheckboxChange(filteredCommande.id)
                                            }
                                        />
                                      </td>

                                      <td>{filteredCommande.reference}</td>
                                      <td>
                                        {formatDate(filteredCommande.dateCommande)}
                                      </td>

                                      <td>{filteredCommande.mode_payement}</td>
                                      <td>{filteredCommande.status}</td>
                                      <td>
                                        {getClientNameById(
                                            filteredCommande.client_id
                                        )}
                                      </td>
                                      <td className="d-inline-flex no-print">
                                        <EditCommande
                                            className="no-print"
                                            produits={produits}
                                            clients={clients}
                                            users={users}
                                            csrfToken={csrfToken}
                                            fetchCommandes={fetchCommandes}
                                            editCommandeId={filteredCommande.id}
                                            open={isEditCommandeDrawerOpen}
                                            onClose={handleCloseEditCommandeDrawer}
                                        />
                                        <button
                                            className="no-print"
                                            onClick={() =>
                                                handleDelete(filteredCommande.id)
                                            }
                                        >
                                          <FontAwesomeIcon icon={faTrash} />{" "}
                                        </button>
                                      </td>
                                    </tr>
                                    {expandedRows.includes(filteredCommande.id) && (
                                        <tr>
                                          <td colSpan="8">
                                            <div>
                                              <CommandeDetails
                                                  produits={produits}
                                                  commande={filteredCommande}
                                                  ligneCommandes={ligneCommandes}
                                                  statusCommandes={statusCommandes}
                                                  fetchLigneCommandes={
                                                    fetchLigneCommandes
                                                  }
                                                  fetchStatusCommandes={
                                                    fetchStatusCommandes
                                                  }
                                                  onBackToList={() =>
                                                      handleShowDetails(filteredCommande.id)
                                                  }
                                              />
                                            </div>
                                          </td>
                                        </tr>
                                    )}
                                  </React.Fragment>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredCommandes.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />

                        <button
                            className="btn btn-danger"
                            onClick={handleDeleteSelected}
                        >
                          <FontAwesomeIcon icon={faTrash} />{" "}
                        </button>

                    {/* Render the Modal component */}
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={handleModalClose}
                        contentLabel="Commande Details"
                    >
                      {selectedCommande && (
                          <CommandeDetails
                              commande={selectedCommande}
                              produits={produits}
                              onBackToList={handleModalClose}
                          />
                      )}
                    </Modal>
                  </div>
              ) : (
                  <div className="table-container">
                    <div
                        style={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <div>
                        <AddCommande
                            produits={produits}
                            clients={clients}
                            users={users}
                            csrfToken={csrfToken}
                            fetchCommandes={fetchCommandes}
                            open={isAddCommandeDrawerOpen}
                            onClose={handleCloseAddCommandeDrawer}
                        />
                      </div>
                      <div className="search-container mb-1">
                        <Search onSearch={handleSearch} />
                      </div>
                    </div>
                    <table className="table" id="commande">
                      {/* Table headers */}
                      <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Date Commande</th>
                        <th>Date Saisie</th>
                        <th>Mode Paiement</th>
                        <th>Status</th>
                        <th>Client</th>
                      </tr>
                      </thead>
                    </table>
                  </div>
              )}
            </div>
          </Box>
        </Box>
      </ThemeProvider>
  );
};
export default CommandeList;