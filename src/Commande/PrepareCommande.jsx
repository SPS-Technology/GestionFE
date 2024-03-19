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
import "../style.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";

const PrepareCommande = () => {
  const csrfTokenMeta = document.head.querySelector('meta[name="csrf-token"]');
  const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : null;
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);
  const [modifiedLot, setModifiedLot] = useState({});
  const [lignePreparationCommandes, setLignePreparationCommandes] = useState(
    {}
  );
  const tableHeaderStyle = {
    border: "1px solid #000",
    padding: "8px",
    textAlign: "center",
    backgroundColor: "#f2f2f2", // Header background color
  };

  const tableCellStyle = {
    border: "1px solid #000",
    padding: "8px",
    textAlign: "center",
  };
  const fetchCommandes = async () => {
    try {
      const responseLignePreparationCommandes = await axios.get(
        "http://localhost:8000/api/lignePreparationCommandes"
      );

      console.log(
        "API Response for Commandes:",
        responseLignePreparationCommandes.data.lignePreparationCommandes
      );

      setLignePreparationCommandes(
        responseLignePreparationCommandes.data.lignePreparationCommandes
      );
      const response = await axios.get("http://localhost:8000/api/commandes");

      console.log("API Response for Commandes:", response.data.commandes);

      setCommandes(response.data.commandes);

      // const userResponse = await axios.get("http://localhost:8000/api/users");
      // console.log("API Response for Users:", userResponse.data);
      // setUsers(userResponse.data);

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

  const getElementValueById = (id) => {
    return document.getElementById(id)?.value || "";
  };
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
  const handleValidation = async (ligneCommande, filteredCommande) => {
    const modifiedLotValue = modifiedLot[ligneCommande.id];
    const correspondingLignePreparationCommande =
      filteredCommande.ligne_preparation_commandes.find(
        (preparationCommande) =>
          preparationCommande.produit_id === ligneCommande.produit_id
      );

    if (correspondingLignePreparationCommande) {
      // If the lot value is modified, update the lignePreparationCommande table
      await axios.put(
        `http://localhost:8000/api/lignePreparationCommandes/${correspondingLignePreparationCommande.id}`,
        {
          commande_id: ligneCommande.commande_id,
          produit_id: ligneCommande.produit_id,
          quantite: ligneCommande.quantite,
          prix_unitaire: ligneCommande.prix_unitaire,
          lot: modifiedLotValue,
        },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );

      // Clear the modifiedLot state after updating the table
      setModifiedLot((prev) => ({
        ...prev,
        [ligneCommande.id]: undefined,
      }));

      // Fetch the updated commandes data
      fetchCommandes();

      Swal.fire({
        icon: "success",
        title: "Succès!",
        text: "Lot modifié avec succès.",
      });
    } else {
      await axios.post(
        "http://localhost:8000/api/lignePreparationCommandes",
        {
          commande_id: ligneCommande.commande_id,
          produit_id: ligneCommande.produit_id,
          quantite: ligneCommande.quantite,
          prix_unitaire: ligneCommande.prix_unitaire,
          lot: getElementValueById(`lot-${ligneCommande.id}`),
        },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );
      fetchCommandes();

      Swal.fire({
        icon: "success",
        title: "Succès!",
        text: "Lot modifié avec succès.",
      });
    }
  };
  const handleModalClose = () => {
    setModalIsOpen(false); // Close the modal
    setSelectedCommande(null);
  };

  const handleSuppression = (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette Preparation de ligne de Commande ?"
    );

    if (isConfirmed) {
      axios
        .delete(`http://localhost:8000/api/lignePreparationCommandes/${id}`)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Succès!",
            text: "supprimé avec succès.",
          });
        })
        .catch((error) => {
          console.error("Erreur lors de  suppression ", error);
          Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: "Échec de  suppression.",
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
  // function formatDate(dateString) {
  //   const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  //   return new Date(dateString).toLocaleDateString("fr-FR", options);
  // }
  const tableHeaderStylePrepareCommand = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
    backgroundColor: "#f2f2f2", // Header background color
  };

  const tableCellStylePrepareCommand = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
  };
  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 1 }}>
          <Toolbar />

          {filteredCommandes && filteredCommandes.length > 0 ? (
            <div className="table-container">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "20%",
                    borderRadius: "50%",
                  }}
                >
                  <Search onSearch={handleSearch} />
                </div>
              </div>

              <div className="table-container">
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div className="btn-group">
                    <button className="btn btn-danger" onClick={exportToPdf}>
                      <FontAwesomeIcon icon={faFilePdf} />
                    </button>
                    <button className="btn btn-success" onClick={exportToExcel}>
                      <FontAwesomeIcon icon={faFileExcel} />
                    </button>
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
                  </div>
                </div>
                <table className="table">
                  {/* Table headers */}
                  <thead className="text-center">
                    <tr>
                      <th></th>
                      <th
                        style={tableHeaderStylePrepareCommand}
                        className="no-print"
                      >
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAllChange}
                        />
                      </th>

                      <th style={tableHeaderStylePrepareCommand}>Reference</th>
                      <th style={tableHeaderStylePrepareCommand}>
                        Date Commande
                      </th>
                      <th style={tableHeaderStylePrepareCommand}>
                        Mode Paiement
                      </th>
                      <th style={tableHeaderStylePrepareCommand}>Status</th>
                      <th style={tableHeaderStylePrepareCommand}>Client</th>
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
                            <td
                              style={tableCellStylePrepareCommand}
                              className="no-print"
                            >
                              <FontAwesomeIcon
                                onClick={() =>
                                  handleShowDetails(filteredCommande.id)
                                }
                                icon={
                                  expandedRows.includes(filteredCommande.id)
                                    ? faMinus
                                    : faPlus
                                }
                              />
                            </td>
                            <td
                              style={tableCellStylePrepareCommand}
                              className="no-print"
                            >
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

                            <td style={tableCellStylePrepareCommand}>
                              {filteredCommande.reference}
                            </td>
                            <td style={tableCellStylePrepareCommand}>
                              {filteredCommande.dateCommande}
                            </td>

                            <td style={tableCellStylePrepareCommand}>
                              {filteredCommande.mode_payement}
                            </td>
                            <td style={tableCellStylePrepareCommand}>
                              {filteredCommande.status}
                            </td>
                            <td style={tableCellStylePrepareCommand}>
                              {getClientNameById(filteredCommande.client_id)}
                            </td>
                          </tr>
                          {expandedRows.includes(filteredCommande.id) && (
                            <tr>
                              <td colSpan="7">
                                <table
                                  className="table-container"
                                  style={{
                                    borderCollapse: "collapse",
                                  }}
                                >
                                  <thead>
                                    <tr>
                                      <th></th>
                                      <th></th>
                                      <th style={tableHeaderStyle}>Produit</th>
                                      <th style={tableHeaderStyle}>Quantite</th>
                                      <th style={tableHeaderStyle}>Prix</th>
                                      <th style={tableHeaderStyle}>Lot</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredCommande.ligne_commandes.map(
                                      (ligneCommande) => {
                                        const correspondingLignePreparationCommande =
                                          filteredCommande.ligne_preparation_commandes.find(
                                            (preparationCommande) =>
                                              preparationCommande.produit_id ===
                                              ligneCommande.produit_id
                                          );

                                        console.log(
                                          "correspondingLignePreparationCommande",
                                          correspondingLignePreparationCommande
                                        );

                                        return (
                                          <tr key={ligneCommande.id}>
                                            <td></td>
                                            <td></td>
                                            <td
                                              style={tableCellStyle}
                                              id={`produit-${ligneCommande.id}`}
                                            >
                                              {ligneCommande.produit_id}
                                            </td>
                                            <td
                                              style={tableCellStyle}
                                              id={`quantite-${ligneCommande.id}`}
                                            >
                                              {ligneCommande.quantite}
                                            </td>
                                            <td
                                              style={tableCellStyle}
                                              id={`prix-${ligneCommande.id}`}
                                            >
                                              ${ligneCommande.prix_unitaire}
                                            </td>
                                            <td style={tableCellStyle}>
                                              <input
                                                type="text"
                                                value={
                                                  modifiedLot[
                                                    ligneCommande.id
                                                  ] ||
                                                  correspondingLignePreparationCommande?.lot ||
                                                  ""
                                                }
                                                id={`lot-${ligneCommande.id}`}
                                                onChange={(e) => {
                                                  // Update the modifiedLot state when the input changes
                                                  setModifiedLot((prev) => ({
                                                    ...prev,
                                                    [ligneCommande.id]:
                                                      e.target.value,
                                                  }));
                                                }}
                                              />
                                            </td>
                                            <td style={tableCellStyle}>
                                              <button
                                                className="validate-btn "
                                                style={{
                                                  marginRight: "10px",
                                                }}
                                                onClick={() =>
                                                  handleValidation(
                                                    ligneCommande,
                                                    filteredCommande
                                                  )
                                                }
                                              >
                                                Valider
                                              </button>

                                              <button
                                                className="delete-btn"
                                                onClick={() =>
                                                  handleSuppression(
                                                    correspondingLignePreparationCommande.id
                                                  )
                                                }
                                              >
                                                <FontAwesomeIcon
                                                  icon={faTrash}
                                                />{" "}
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      }
                                    )}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredCommandes.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </div>
              <div className="d-flex flex-row">
                <div className="btn-group ">
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteSelected}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
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
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "20%",
                    borderRadius: "50%",
                  }}
                >
                  <Search onSearch={handleSearch} />
                </div>
              </div>

              <div className="table-container">
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div className="btn-group">
                    <button className="btn btn-danger" onClick={exportToPdf}>
                      <FontAwesomeIcon icon={faFilePdf} />
                    </button>
                    <button className="btn btn-success" onClick={exportToExcel}>
                      <FontAwesomeIcon icon={faFileExcel} />
                    </button>
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
                  </div>
                </div>
                <table className="table">
                  {/* Table headers */}
                  <thead className="text-center">
                    <tr>
                      <th
                        style={tableHeaderStylePrepareCommand}
                        className="no-print"
                      >
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAllChange}
                        />
                      </th>

                      <th style={tableHeaderStylePrepareCommand}>Reference</th>
                      <th style={tableHeaderStylePrepareCommand}>
                        Date Commande
                      </th>
                      <th style={tableHeaderStylePrepareCommand}>
                        Mode Paiement
                      </th>
                      <th style={tableHeaderStylePrepareCommand}>Status</th>
                      <th style={tableHeaderStylePrepareCommand}>Client</th>
                    </tr>
                  </thead>
                  {/* Table body */}
                  <tbody className="text-center"></tbody>
                </table>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredCommandes.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </div>
              <div className="d-flex flex-row">
                <div className="btn-group ">
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteSelected}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* </div> */}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
export default PrepareCommande;