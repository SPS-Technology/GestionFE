// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import TablePagination from "@mui/material/TablePagination";
// import Search from "../Acceuil/Search";
// import Navigation from "../Acceuil/Navigation";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faTrash,
//   faFilePdf,
//   faFileExcel,
//   faPrint,
//   faPlus,
//   faMinus,
// } from "@fortawesome/free-solid-svg-icons";
// import * as XLSX from "xlsx";
// import { jsPDF } from "jspdf";
// import "jspdf-autotable";
// import CommandeDetails from "./CommandeDetails ";
// import Modal from "react-modal"; // Import the Modal component
// import "../style.css";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// import Box from "@mui/material/Box";
// import { Toolbar } from "@mui/material";

// const PrepareCommande = () => {
//   const csrfTokenMeta = document.head.querySelector('meta[name="csrf-token"]');
//   const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : null;
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredCommandes, setFilteredCommandes] = useState([]);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [commandes, setCommandes] = useState([]);
//   const [produits, setProduits] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [selectedCommande, setSelectedCommande] = useState(null);
//   const [expandedRows, setExpandedRows] = useState([]);
//   const [modifiedLot, setModifiedLot] = useState({});
//   const [lignePreparationCommandes, setLignePreparationCommandes] = useState(
//     {}
//   );
//   const tableHeaderStyle = {
//     border: "1px solid #000",
//     padding: "8px",
//     textAlign: "center",
//     backgroundColor: "#f2f2f2", // Header background color
//   };

//   const tableCellStyle = {
//     border: "1px solid #000",
//     padding: "8px",
//     textAlign: "center",
//   };
//   const fetchCommandes = async () => {
//     try {
//       const responseLignePreparationCommandes = await axios.get(
//         "http://localhost:8000/api/lignePreparationCommandes"
//       );

//       console.log(
//         "API Response for Commandes:",
//         responseLignePreparationCommandes.data.lignePreparationCommandes
//       );

//       setLignePreparationCommandes(
//         responseLignePreparationCommandes.data.lignePreparationCommandes
//       );
//       const response = await axios.get("http://localhost:8000/api/commandes");

//       console.log("API Response for Commandes:", response.data.commandes);

//       setCommandes(response.data.commandes);

//       // const userResponse = await axios.get("http://localhost:8000/api/users");
//       // console.log("API Response for Users:", userResponse.data);
//       // setUsers(userResponse.data);

//       const produitResponse = await axios.get(
//         "http://localhost:8000/api/produits"
//       );

//       console.log("API Response for Produits:", produitResponse.data.produit);

//       setProduits(produitResponse.data.produit);

//       const clientResponse = await axios.get(
//         "http://localhost:8000/api/clients"
//       );
//       console.log("API Response for Clients:", clientResponse.data.client);
//       setClients(clientResponse.data.client);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchCommandes();
//   }, []);

//   useEffect(() => {
//     // Filter commandes based on the search term
//     const filtered = commandes.filter((commande) =>
//       commande.reference.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     setFilteredCommandes(filtered);
//   }, [commandes, searchTerm]);

//   const getElementValueById = (id) => {
//     return document.getElementById(id)?.value || "";
//   };
//   const handleSearch = (term) => {
//     //setCurrentPage(1); // Reset to the first page when searching
//     setSearchTerm(term);
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleCheckboxChange = (itemId) => {
//     if (selectedItems.includes(itemId)) {
//       setSelectedItems(selectedItems.filter((id) => id !== itemId));
//     } else {
//       setSelectedItems([...selectedItems, itemId]);
//     }
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };
//   const handleDeleteSelected = () => {
//     const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer  ?");

//     selectedItems.forEach((id) => {
//       if (isConfirmed) {
//         axios
//           .delete(`http://localhost:8000/api/commandes/${id}`)
//           .then(() => {
//             fetchCommandes();
//             Swal.fire({
//               icon: "success",
//               title: "Succès!",
//               text: "Commande supprimé avec succès.",
//             });
//           })
//           .catch((error) => {
//             console.error("Erreur lors de la suppression du commande:", error);
//             Swal.fire({
//               icon: "error",
//               title: "Erreur!",
//               text: "Échec de la suppression du commande.",
//             });
//           });
//       } else {
//         console.log("Suppression annulée");
//       }
//     });
//     fetchCommandes();

//     setSelectedItems([]);
//   };

//   const handleShowDetails = (commande) => {
//     setExpandedRows((prevRows) =>
//       prevRows.includes(commande)
//         ? prevRows.filter((row) => row !== commande)
//         : [...prevRows, commande]
//     );
//   };
//   const handleValidation = async (lignePreparationCommande, filteredCommande) => {
//     const modifiedLotValue = modifiedLot[lignePreparationCommande.id];
//     const correspondingLignePreparationCommande =
//       filteredCommande.ligne_preparation_commandes.find(
//         (preparationCommande) =>
//           preparationCommande.produit_id === lignePreparationCommande.produit_id
//       );

//     if (correspondingLignePreparationCommande) {
//       // If the lot value is modified, update the lignePreparationCommande table
//       await axios.put(
//         `http://localhost:8000/api/lignePreparationCommandes/${correspondingLignePreparationCommande.id}`,
//         {
//           commande_id: lignePreparationCommande.commande_id,
//           produit_id: lignePreparationCommande.produit_id,
//           quantite: lignePreparationCommande.quantite,
//           prix_unitaire: lignePreparationCommande.prix_unitaire,
//           lot: modifiedLotValue,
//         },
//         {
//           withCredentials: true,
//           headers: {
//             "X-CSRF-TOKEN": csrfToken,
//           },
//         }
//       );

//       // Clear the modifiedLot state after updating the table
//       setModifiedLot((prev) => ({
//         ...prev,
//         [lignePreparationCommande.id]: undefined,
//       }));

//       // Fetch the updated commandes data
//       fetchCommandes();

//       Swal.fire({
//         icon: "success",
//         title: "Succès!",
//         text: "Lot modifié avec succès.",
//       });
//     } else {
//       await axios.post(
//         "http://localhost:8000/api/lignePreparationCommandes",
//         {
//           commande_id: lignePreparationCommande.commande_id,
//           produit_id: lignePreparationCommande.produit_id,
//           quantite: lignePreparationCommande.quantite,
//           prix_unitaire: lignePreparationCommande.prix_unitaire,
//           lot: getElementValueById(`lot-${lignePreparationCommande.id}`),
//         },
//         {
//           withCredentials: true,
//           headers: {
//             "X-CSRF-TOKEN": csrfToken,
//           },
//         }
//       );
//       fetchCommandes();

//       Swal.fire({
//         icon: "success",
//         title: "Succès!",
//         text: "Lot modifié avec succès.",
//       });
//     }
//   };
//   const handleModalClose = () => {
//     setModalIsOpen(false); // Close the modal
//     setSelectedCommande(null);
//   };

//   const handleSuppression = (id) => {
//     const isConfirmed = window.confirm(
//       "Êtes-vous sûr de vouloir supprimer cette Preparation de ligne de Commande ?"
//     );

//     if (isConfirmed) {
//       axios
//         .delete(`http://localhost:8000/api/lignePreparationCommandes/${id}`)
//         .then(() => {
//           Swal.fire({
//             icon: "success",
//             title: "Succès!",
//             text: "supprimé avec succès.",
//           });
//         })
//         .catch((error) => {
//           console.error("Erreur lors de  suppression ", error);
//           Swal.fire({
//             icon: "error",
//             title: "Erreur!",
//             text: "Échec de  suppression.",
//           });
//         });
//     } else {
//       console.log("Suppression annulée");
//     }
//   };

//   const handleSelectAllChange = () => {
//     setSelectAll(!selectAll);
//     if (selectAll) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(commandes.map((commande) => commande.id));
//     }
//   };
//   //------------Print List----------//

//   const printList = (tableId, title, commandeList) => {
//     const printWindow = window.open(" ", "_blank", " ");

//     if (printWindow) {
//       const tableToPrint = document.getElementById(tableId);

//       if (tableToPrint) {
//         const newWindowDocument = printWindow.document;
//         newWindowDocument.write(`
//             <!DOCTYPE html>
//             <html lang="fr">
//             <head>
//               <meta charset="UTF-8">
//               <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               <h1 class="h1"> Gestion Commandes </h1>
//               <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
//               <style>

//                 body {
//                   font-family: 'Arial', sans-serif;
//                   margin-bottom: 60px;
//                 }

//                 .page-header {
//                   text-align: center;
//                   font-size: 24px;
//                   margin-bottom: 20px;
//                 }

//                 .h1 {
//                   text-align: center;
//                 }

//                 .list-title {
//                   font-size: 18px;
//                   margin-bottom: 10px;
//                 }

//                 .header {
//                   font-size: 16px;
//                   margin-bottom: 10px;
//                 }

//                 table {
//                   width: 100%;
//                   border-collapse: collapse;
//                   margin-bottom: 20px;
//                 }

//                 th, td {
//                   border: 1px solid #ddd;
//                   padding: 8px;
//                   text-align: left;
//                 }

//                 .footer {
//                   position: fixed;
//                   bottom: 0;
//                   width: 100%;
//                   text-align: center;
//                   font-size: 14px;
//                   margin-top: 30px;
//                   background-color: #fff;
//                 }

//                 @media print {
//                   .footer {
//                     position: fixed;
//                     bottom: 0;
//                   }

//                   body {
//                     margin-bottom: 0;
//                   }
//                   .no-print {
//                     display: none;
//                   }
//                 }
//                 .no-print {
//                   display: none;
//                 }

//                 .content-wrapper {
//                   margin-bottom: 100px;
//                 }

//                 .extra-space {
//                   margin-bottom: 30px;
//                 }
//               </style>
//             </head>
//             <body>
//               <div class="content-wrapper">
//                 ${tableToPrint.outerHTML}
//               </div>
//               <script>
//                 setTimeout(() => {
//                   window.print();
//                   window.onafterprint = function () {
//                     window.close();
//                   };
//                 }, 1000);
//               </script>
//             </body>
//             </html>
//           `);

//         newWindowDocument.close();
//       } else {
//         console.error(`Table with ID '${tableId}' not found.`);
//       }
//     } else {
//       console.error("Error opening print window.");
//     }
//   };
//   //------------exportToPdf----------//

//   const exportToPdf = () => {
//     const pdf = new jsPDF();

//     // Define the columns and rows for the table
//     const columns = [
//       "Raison Sociale",
//       "Adresse",
//       "Téléphone",
//       "Ville",
//       "Abréviation",
//       "Zone",
//     ];
//     const selectedCommandes = commandes.filter((commande) =>
//       selectedItems.includes(commande.id)
//     );
//     const rows = selectedCommandes.map((commande) => [
//       commande.raison_sociale,
//       commande.adresse,
//       commande.tele,
//       commande.ville,
//       commande.abreviation,
//       commande.zone,
//     ]);

//     // Set the margin and padding
//     const margin = 10;
//     const padding = 5;

//     // Calculate the width of the columns
//     const columnWidths = columns.map(
//       (col) => pdf.getStringUnitWidth(col) * 5 + padding * 2
//     );
//     const tableWidth = columnWidths.reduce((total, width) => total + width, 0);

//     // Calculate the height of the rows
//     const rowHeight = 10;
//     const tableHeight = rows.length * rowHeight;

//     // Set the table position
//     const startX = (pdf.internal.pageSize.width - tableWidth) / 2;
//     const startY = margin;

//     // Add the table headers
//     pdf.setFont("helvetica", "bold");
//     pdf.setFillColor(200, 220, 255);
//     pdf.rect(startX, startY, tableWidth, rowHeight, "F");
//     pdf.autoTable({
//       head: [columns],
//       startY: startY + padding,
//       styles: {
//         fillColor: [200, 220, 255],
//         textColor: [0, 0, 0],
//         fontSize: 10,
//       },
//       columnStyles: {
//         0: { cellWidth: columnWidths[0] },
//         1: { cellWidth: columnWidths[1] },
//         2: { cellWidth: columnWidths[2] },
//         3: { cellWidth: columnWidths[3] },
//         4: { cellWidth: columnWidths[4] },
//         5: { cellWidth: columnWidths[5] },
//       },
//     });

//     // Add the table rows
//     pdf.setFont("helvetica", "");
//     pdf.autoTable({
//       body: rows,
//       startY: startY + rowHeight + padding * 2,
//       styles: { fontSize: 8 },
//       columnStyles: {
//         0: { cellWidth: columnWidths[0] },
//         1: { cellWidth: columnWidths[1] },
//         2: { cellWidth: columnWidths[2] },
//         3: { cellWidth: columnWidths[3] },
//         4: { cellWidth: columnWidths[4] },
//         5: { cellWidth: columnWidths[5] },
//       },
//     });

//     // Save the PDF
//     pdf.save("commandes.pdf");
//   };
//   //------------exportToExcel----------//

//   const exportToExcel = () => {
//     const selectedCommandes = commandes.filter((commande) =>
//       selectedItems.includes(commande.id)
//     );
//     const ws = XLSX.utils.json_to_sheet(selectedCommandes);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Commandes");
//     XLSX.writeFile(wb, "commandes.xlsx");
//   };

//   const getClientNameById = (clientId) => {
//     console.log("clients", clients);
//     const client = clients.find((c) => c.id === clientId);
//     return client ? client.raison_sociale : "";
//   };

//   //------------formatDate----------//
//   // function formatDate(dateString) {
//   //   const options = { year: "numeric", month: "2-digit", day: "2-digit" };
//   //   return new Date(dateString).toLocaleDateString("fr-FR", options);
//   // }
//   const tableHeaderStylePrepareCommand = {
//     border: "1px solid #ddd",
//     padding: "8px",
//     textAlign: "center",
//     backgroundColor: "#f2f2f2", // Header background color
//   };

//   const tableCellStylePrepareCommand = {
//     border: "1px solid #ddd",
//     padding: "8px",
//     textAlign: "center",
//   };
//   return (
//     <ThemeProvider theme={createTheme()}>
//       <Box sx={{ display: "flex" }}>
//         <Navigation />
//         <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 1 }}>
//           <Toolbar />

//           {filteredCommandes && filteredCommandes.length > 0 ? (
//             <div className="table-container">
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   marginBottom: "1rem",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "20%",
//                     borderRadius: "50%",
//                   }}
//                 >
//                   <Search onSearch={handleSearch} />
//                 </div>
//               </div>

//               <div className="table-container">
//                 <div style={{ display: "flex", justifyContent: "flex-end" }}>
//                   <div className="btn-group">
//                     <button className="btn btn-danger" onClick={exportToPdf}>
//                       <FontAwesomeIcon icon={faFilePdf} />
//                     </button>
//                     <button className="btn btn-success" onClick={exportToExcel}>
//                       <FontAwesomeIcon icon={faFileExcel} />
//                     </button>
//                     <button
//                       className="btn btn-secondary"
//                       onClick={() =>
//                         printList(
//                           "commande",
//                           "commandes Liste",
//                           "commandes Liste"
//                         )
//                       }
//                     >
//                       <FontAwesomeIcon icon={faPrint} />
//                     </button>
//                   </div>
//                 </div>
//                 <table className="table">
//                   {/* Table headers */}
//                   <thead className="text-center">
//                     <tr>
//                       <th></th>
//                       <th
//                         style={tableHeaderStylePrepareCommand}
//                         className="no-print"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={selectAll}
//                           onChange={handleSelectAllChange}
//                         />
//                       </th>

//                       <th style={tableHeaderStylePrepareCommand}>Reference</th>
//                       <th style={tableHeaderStylePrepareCommand}>
//                         Date Commande
//                       </th>
//                       <th style={tableHeaderStylePrepareCommand}>
//                         Mode Paiement
//                       </th>
//                       <th style={tableHeaderStylePrepareCommand}>Status</th>
//                       <th style={tableHeaderStylePrepareCommand}>Client</th>
//                     </tr>
//                   </thead>
//                   {/* Table body */}
//                   <tbody className="text-center">
//                     {filteredCommandes
//                       .slice(
//                         page * rowsPerPage,
//                         page * rowsPerPage + rowsPerPage
//                       )
//                       .map((filteredCommande, index) => (
//                         <React.Fragment key={filteredCommande.id}>
//                           <tr key={filteredCommande.id}>
//                             <td
//                               style={tableCellStylePrepareCommand}
//                               className="no-print"
//                             >
//                               <FontAwesomeIcon
//                                 onClick={() =>
//                                   handleShowDetails(filteredCommande.id)
//                                 }
//                                 icon={
//                                   expandedRows.includes(filteredCommande.id)
//                                     ? faMinus
//                                     : faPlus
//                                 }
//                               />
//                             </td>
//                             <td
//                               style={tableCellStylePrepareCommand}
//                               className="no-print"
//                             >
//                               <input
//                                 type="checkbox"
//                                 checked={selectedItems.includes(
//                                   filteredCommande.id
//                                 )}
//                                 onChange={() =>
//                                   handleCheckboxChange(filteredCommande.id)
//                                 }
//                               />
//                             </td>

//                             <td style={tableCellStylePrepareCommand}>
//                               {filteredCommande.reference}
//                             </td>
//                             <td style={tableCellStylePrepareCommand}>
//                               {filteredCommande.dateCommande}
//                             </td>

//                             <td style={tableCellStylePrepareCommand}>
//                               {filteredCommande.mode_payement}
//                             </td>
//                             <td style={tableCellStylePrepareCommand}>
//                               {filteredCommande.status}
//                             </td>
//                             <td style={tableCellStylePrepareCommand}>
//                               {getClientNameById(filteredCommande.client_id)}
//                             </td>
//                           </tr>
//                           {expandedRows.includes(filteredCommande.id) && (
//                             <tr>
//                               <td colSpan="7">
//                                 <table
//                                   className="table-container"
//                                   style={{
//                                     borderCollapse: "collapse",
//                                   }}
//                                 >
//                                   <thead>
//                                     <tr>
//                                       <th></th>
//                                       <th></th>
//                                       <th style={tableHeaderStyle}>Produit</th>
//                                       <th style={tableHeaderStyle}>Quantite</th>
//                                       <th style={tableHeaderStyle}>Prix</th>
//                                       <th style={tableHeaderStyle}>Lot</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {filteredCommande.ligne_preparation_commandes.map(
//                                       (lignePreparationCommande) => {
//                                         const correspondingLignePreparationCommande =
//                                           filteredCommande.ligne_preparation_commandes.find(
//                                             (preparationCommande) =>
//                                               preparationCommande.produit_id ===
//                                               lignePreparationCommande.produit_id
//                                           );

//                                         console.log(
//                                           "correspondingLignePreparationCommande",
//                                           correspondingLignePreparationCommande
//                                         );

//                                         return (
//                                           <tr key={lignePreparationCommande.id}>
//                                             <td></td>
//                                             <td></td>
//                                             <td
//                                               style={tableCellStyle}
//                                               id={`produit-${lignePreparationCommande.id}`}
//                                             >
//                                               {lignePreparationCommande.produit_id}
//                                             </td>
//                                             <td
//                                               style={tableCellStyle}
//                                               id={`quantite-${lignePreparationCommande.id}`}
//                                             >
//                                               {lignePreparationCommande.quantite}
//                                             </td>
//                                             <td
//                                               style={tableCellStyle}
//                                               id={`prix-${lignePreparationCommande.id}`}
//                                             >
//                                               ${lignePreparationCommande.prix_unitaire}
//                                             </td>
//                                             <td style={tableCellStyle}>
//                                               <input
//                                                 type="text"
//                                                 value={
//                                                   modifiedLot[
//                                                     lignePreparationCommande.id
//                                                   ] ||
//                                                   correspondingLignePreparationCommande?.lot ||
//                                                   ""
//                                                 }
//                                                 id={`lot-${lignePreparationCommande.id}`}
//                                                 onChange={(e) => {
//                                                   // Update the modifiedLot state when the input changes
//                                                   setModifiedLot((prev) => ({
//                                                     ...prev,
//                                                     [lignePreparationCommande.id]:
//                                                       e.target.value,
//                                                   }));
//                                                 }}
//                                               />
//                                             </td>
//                                             <td style={tableCellStyle}>
//                                               <button
//                                                 className="validate-btn "
//                                                 style={{
//                                                   marginRight: "10px",
//                                                 }}
//                                                 onClick={() =>
//                                                   handleValidation(
//                                                     lignePreparationCommande,
//                                                     filteredCommande
//                                                   )
//                                                 }
//                                               >
//                                                 Valider
//                                               </button>

//                                               <button
//                                                 className="delete-btn"
//                                                 onClick={() =>
//                                                   handleSuppression(
//                                                     correspondingLignePreparationCommande.id
//                                                   )
//                                                 }
//                                               >
//                                                 <FontAwesomeIcon
//                                                   icon={faTrash}
//                                                 />{" "}
//                                               </button>
//                                             </td>
//                                           </tr>
//                                         );
//                                       }
//                                     )}
//                                   </tbody>
//                                 </table>
//                               </td>
//                             </tr>
//                           )}
//                         </React.Fragment>
//                       ))}
//                   </tbody>
//                 </table>

//                 <TablePagination
//                   rowsPerPageOptions={[5, 10, 25]}
//                   component="div"
//                   count={filteredCommandes.length}
//                   rowsPerPage={rowsPerPage}
//                   page={page}
//                   onPageChange={handleChangePage}
//                   onRowsPerPageChange={handleChangeRowsPerPage}
//                 />
//               </div>
//               <div className="d-flex flex-row">
//                 <div className="btn-group ">
//                   <button
//                     className="btn btn-danger"
//                     onClick={handleDeleteSelected}
//                   >
//                     <FontAwesomeIcon icon={faTrash} />
//                   </button>
//                 </div>
//               </div>
//               {/* Render the Modal component */}
//               <Modal
//                 isOpen={modalIsOpen}
//                 onRequestClose={handleModalClose}
//                 contentLabel="Commande Details"
//               >
//                 {selectedCommande && (
//                   <CommandeDetails
//                     commande={selectedCommande}
//                     produits={produits}
//                     onBackToList={handleModalClose}
//                   />
//                 )}
//               </Modal>
//             </div>
//           ) : (
//             <div className="table-container">
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   marginBottom: "1rem",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "20%",
//                     borderRadius: "50%",
//                   }}
//                 >
//                   <Search onSearch={handleSearch} />
//                 </div>
//               </div>

//               <div className="table-container">
//                 <div style={{ display: "flex", justifyContent: "flex-end" }}>
//                   <div className="btn-group">
//                     <button className="btn btn-danger" onClick={exportToPdf}>
//                       <FontAwesomeIcon icon={faFilePdf} />
//                     </button>
//                     <button className="btn btn-success" onClick={exportToExcel}>
//                       <FontAwesomeIcon icon={faFileExcel} />
//                     </button>
//                     <button
//                       className="btn btn-secondary"
//                       onClick={() =>
//                         printList(
//                           "commande",
//                           "commandes Liste",
//                           "commandes Liste"
//                         )
//                       }
//                     >
//                       <FontAwesomeIcon icon={faPrint} />
//                     </button>
//                   </div>
//                 </div>
//                 <table className="table">
//                   {/* Table headers */}
//                   <thead className="text-center">
//                     <tr>
//                       <th
//                         style={tableHeaderStylePrepareCommand}
//                         className="no-print"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={selectAll}
//                           onChange={handleSelectAllChange}
//                         />
//                       </th>

//                       <th style={tableHeaderStylePrepareCommand}>Reference</th>
//                       <th style={tableHeaderStylePrepareCommand}>
//                         Date Commande
//                       </th>
//                       <th style={tableHeaderStylePrepareCommand}>
//                         Mode Paiement
//                       </th>
//                       <th style={tableHeaderStylePrepareCommand}>Status</th>
//                       <th style={tableHeaderStylePrepareCommand}>Client</th>
//                     </tr>
//                   </thead>
//                   {/* Table body */}
//                   <tbody className="text-center"></tbody>
//                 </table>

//                 <TablePagination
//                   rowsPerPageOptions={[5, 10, 25]}
//                   component="div"
//                   count={filteredCommandes.length}
//                   rowsPerPage={rowsPerPage}
//                   page={page}
//                   onPageChange={handleChangePage}
//                   onRowsPerPageChange={handleChangeRowsPerPage}
//                 />
//               </div>
//               <div className="d-flex flex-row">
//                 <div className="btn-group ">
//                   <button
//                     className="btn btn-danger"
//                     onClick={handleDeleteSelected}
//                   >
//                     <FontAwesomeIcon icon={faTrash} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//           {/* </div> */}
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// };
// export default PrepareCommande;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Navigation from "../Acceuil/Navigation";
import { Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import Select from "react-dropdown-select";
import "jspdf-autotable";
import Swal from "sweetalert2";

const CommandeList = () => {
  const [commandes, setCommandes] = useState([]);
  const [warningIndexes, setWarningIndexes] = useState([]);
  const [clients, setClients] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [modifiedLotValues, setModifiedLotValues] = useState({});
  const [modifiedQuantiteValues, setModifiedQuantiteValues] = useState({});
  const [selectedProductsData, setSelectedProductsData] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const csrfTokenMeta = document.head.querySelector('meta[name="csrf-token"]');
  const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : null;
  const [selectedClientId, setSelectedClientId] = useState(null);
  useState(null);
  const [formData, setFormData] = useState({
    reference: "",
    dateCommande: "",
    datePreparationCommande: "",
    client_id: "",
    mode_payement: "",
    status: "",
    user_id: "",
    produit_id: "",
    prix_unitaire: "",
    quantite: "",
  });
  const [
    existingLignePreparationCommandes,
    setExistingLignePreparationCommandes,
  ] = useState([]);

  const [existingLigneCommandes, setExistingLigneCommandes] = useState([]);

  const [editingCommandes, setEditingCommandes] = useState(null);
  const [editingCommandesId, setEditingCommandesId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expand_total, setExpandTotal] = useState([]);
  const [expand_status, setExpandedStatus] = useState([]);
  const calibres = produits.map((produit) => produit.calibre.calibre);
  const uniqueCalibres = [...new Set(calibres)];
  const [formContainerStyle, setFormContainerStyle] = useState({
    right: "-100%",
  });
  const [tableContainerStyle, setTableContainerStyle] = useState({
    marginRight: "0px",
  });

  // const fetchData = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:8000/api/commandes");
  //     setCommandes(response.data.commandes);
  //     const clientResponse = await axios.get(
  //       "http://localhost:8000/api/clients"
  //     );
  //     setClients(clientResponse.data.client);

  //     const produitResponse = await axios.get(
  //       "http://localhost:8000/api/produits"
  //     );
  //     setProduits(produitResponse.data.produit);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  useEffect(() => {
    if (editingCommandesId) {
      fetchExistingLigneCommandes(editingCommandesId);
      fetchExistingLignePreparationCommandes(editingCommandesId);
    }
  }, [editingCommandesId]);

  const fetchExistingLigneCommandes = async (commandId) => {
    axios
      .get(`http://localhost:8000/api/ligneCommandes/${commandId}`)
      .then((ligneCommandesResponse) => {
        const existingLigneCommandes =
          ligneCommandesResponse.data.ligneCommandes;

        setExistingLigneCommandes(existingLigneCommandes);
      });
  };
  const fetchExistingLignePreparationCommandes = async (commandId) => {
    axios
      .get(`http://localhost:8000/api/lignePreparationCommandes/${commandId}`)
      .then((lignePreparationCommandesResponse) => {
        const existingLignePreparationCommandes =
          lignePreparationCommandesResponse.data.lignePreparationCommandes;

        setExistingLignePreparationCommandes(existingLignePreparationCommandes);
      });
  };

  const handleShowTotalDetails = (commande) => {
    setExpandTotal((prevRows) =>
      prevRows.includes(commande)
        ? prevRows.filter((row) => row !== commande)
        : [...prevRows, commande]
    );
  };
  const handleShowLigneCommandes = async (commande) => {
    setExpandedRows((prevRows) =>
      prevRows.includes(commande)
        ? prevRows.filter((row) => row !== commande)
        : [...prevRows, commande]
    );
  };
  const handleShowStatusCommandes = async (commande) => {
    setExpandedStatus((prevRows) =>
      prevRows.includes(commande)
        ? prevRows.filter((row) => row !== commande)
        : [...prevRows, commande]
    );
  };

  const fetchData = async () => {
    try {
      const [commandesResponse, clientsResponse, produitsResponse] =
        await Promise.all([
          axios.get("http://localhost:8000/api/commandes"),
          axios.get("http://localhost:8000/api/clients"),
          axios.get("http://localhost:8000/api/produits"),
        ]);
      setCommandes(commandesResponse.data.commandes);
      setClients(clientsResponse.data.client);
      setProduits(produitsResponse.data.produit);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    // Update formData.client_id when commande changes
    if (editingCommandes) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        client_id: editingCommandes.client_id,
      }));
    }
  }, [editingCommandes]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getElementValueById = (id) => {
    return document.getElementById(id)?.value || "";
  };
  const calculateTotalQuantity = (ligneCommandes) => {
    // fetchData();
    return ligneCommandes.reduce((total, ligneCommande) => {
      return total + ligneCommande.quantite;
    }, 0);
  };

  const getQuantity = (ligneCommandes, calibre, designation) => {
    const correspondingProduct = produits.find(
      (product) =>
        product.calibre.calibre === calibre &&
        product.designation === designation
    );

    if (!correspondingProduct) {
      return 0; // If no corresponding product is found, return 0
    }

    const correspondingLigneCommande = ligneCommandes.find(
      (ligne) => ligne.produit_id === correspondingProduct.id
    );

    return correspondingLigneCommande ? correspondingLigneCommande.quantite : 0;
  };
  // const populateProductInputs = (productId, inputType) => {
  //   console.log("productId", productId);
  //   const existingLignePreparationCommande =
  //     existingLignePreparationCommandes.find(
  //       (lignePreparationCommande) =>
  //         lignePreparationCommande.produit_id === productId
  //     );
  //   console.log("existing LigneCommande", existingLigneCommandes);

  //   if (existingLignePreparationCommande) {
  //     return existingLignePreparationCommande[inputType];
  //   }
  //   return "";
  // };
  const populateProductInputs = (productId, inputType) => {
    console.log("productId", productId);

    // console.log("existing LigneCommande", existingLigneCommandes);
    console.log(
      "existing LignePreparationCommande",
      existingLignePreparationCommandes
    );
    // const existingLigneCommande = existingLigneCommandes.find(
    //   (ligneCommande) => ligneCommande.produit_id === productId
    // );
    const existingLignePreparationCommande =
      existingLignePreparationCommandes.find(
        (lignePreparationCommande) =>
          lignePreparationCommande.produit_id === productId
      );

    // if (existingLigneCommande && inputType === "quantite") {
    //   return existingLigneCommande[inputType];
    // }
    if (existingLignePreparationCommande) {
      return existingLignePreparationCommande[inputType];
    }
    return "";
  };

  const getTotalForCalibre = (lignePreparationCommandes, calibre, produits) => {
    // Filter lignePreparationCommandes for the given calibre
    const lignePreparationCommandesForCalibre =
      lignePreparationCommandes.filter(
        (ligne) =>
          produits.find((produit) => produit.id === ligne.produit_id)?.calibre
            .calibre === calibre
      );

    // Calculate the total quantity for the calibre
    const total = lignePreparationCommandesForCalibre.reduce(
      (acc, ligne) => acc + ligne.quantite,
      0
    );

    return total;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userResponse = await axios.get("http://localhost:8000/api/users", {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
      });

      const authenticatedUserId = userResponse.data[0].id;
      console.log("auth user", authenticatedUserId);

      if (editingCommandes) {
        const response = await axios.put(
          `http://localhost:8000/api/commandes/${editingCommandes.id}`,
          {
            datePreparationCommande: formData.dateCommande,
            client_id: editingCommandes.client_id,
            status: editingCommandes.status,
            user_id: authenticatedUserId,
          }
        );

        const existingLigneCommandesResponse = await axios.get(
          `http://localhost:8000/api/ligneCommandes/${editingCommandes.id}`
        );
        const existingLigneCommandes =
          existingLigneCommandesResponse.data.ligneCommandes;

        const existingLignePreparationCommandesResponse = await axios.get(
          `http://localhost:8000/api/lignePreparationCommandes/${editingCommandes.id}`
        );

        const existingLignePreparationCommandes =
          existingLignePreparationCommandesResponse.data
            .lignePreparationCommandes;
        const selectedPrdsData = selectedProductsData.map(
          (selectedProduct, index) => {
            const existingLignePreparationCommande =
              existingLignePreparationCommandes.find(
                (lignePreparationCommande) =>
                  lignePreparationCommande.produit_id === selectedProduct.id
              );

            const existingLigneCommande = existingLigneCommandes.find(
              (ligneCommande) =>
                ligneCommande.produit_id === selectedProduct.produit_id
            );

            return {
              id: existingLignePreparationCommande
                ? existingLignePreparationCommande.id
                : undefined,
              commande_id: editingCommandes.id,
              produit_id: selectedProduct.produit_id,
              prix_unitaire: existingLigneCommande
                ? existingLigneCommande.prix_unitaire
                : undefined,
              quantite: getElementValueById(
                `quantite_${index}_${selectedProduct.produit_id}`
              ),
              lot: getElementValueById(
                `lot_${index}_${selectedProduct.produit_id}`
              ),
            };
          }
        );
        console.log("selectedPrdsData", selectedPrdsData);
        for (const lignePreparationCommandeData of selectedPrdsData) {
          // Check if lignePreparationCommande already exists for this produit_id and update accordingly

          console.log(
            "existing lignePreparationCommandeData:",
            lignePreparationCommandeData
          );

          if (lignePreparationCommandeData.id) {
            // If exists, update the existing lignePreparationCommande
            await axios.put(
              `http://localhost:8000/api/lignePreparationCommandes/${lignePreparationCommandeData.id}`,
              lignePreparationCommandeData,
              {
                withCredentials: true,
                headers: {
                  "X-CSRF-TOKEN": csrfToken,
                },
              }
            );
          } else {
            //   // If doesn't exist, create a new lignePreparationCommande
            await axios.post(
              "http://localhost:8000/api/lignePreparationCommandes",
              lignePreparationCommandeData,
              {
                withCredentials: true,
                headers: {
                  "X-CSRF-TOKEN": csrfToken,
                },
              }
            );
          }
        }
      }

      fetchData();

      // Réinitialiser les données du formulaire
      setFormData({
        datePreparationCommande: "",

        user_id: "",
        produit_id: "",
        prix_unitaire: "",
        quantite: "",
        lot: "",
      });

      // Fermer le formulaire si nécessaire
      setShowForm(false);
      setExistingLignePreparationCommandes([]);
      // Afficher un message de succès à l'utilisateur
      Swal.fire({
        icon: "success",
        title: "Succès !",
        text: "Succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la soumission des données :", error);

      // Afficher un message d'erreur à l'utilisateur
      Swal.fire({
        icon: "error",
        title: "Erreur !",
        text: "Erreur !",
      });
    }
    closeForm();
  };
  const getProduitValue = (produitId, field) => {
    // Find the product in the produits array based on produitId
    const produit = produits.find((p) => p.id === produitId);

    // If the product is found, return the value of the specified field
    if (produit) {
      return produit[field];
    }

    // If the product is not found, return an empty string or any default value
    return "";
  };
  const handleEdit = (commande) => {
    setModifiedLotValues({});
    setModifiedQuantiteValues({});
    setEditingCommandesId(commande.id);
    setEditingCommandes(commande);
    console.log(commande);
    setFormData({
      reference: commande.reference,
      dateCommande: commande.dateCommande,
      datePreparationCommande: commande.datePreparationCommande,
      client_id: commande.client_id,
      mode_payement: commande.mode_payement,
      status: commande.status,
    });

    console.log("formData,", formData);

    const selectedProducts = commande.ligne_commandes.map((ligneCommande) => {
      const product = produits.find(
        (produit) => produit.id === ligneCommande.produit_id
      );

      const lignePrepartion = commande.ligne_preparation_commandes.find(
        (lignePrepartionCommande) =>
          lignePrepartionCommande.produit_id === ligneCommande.produit_id
      );
      console.log("lignePrepartionCommande", lignePrepartion);

      return {
        id: lignePrepartion ? lignePrepartion.id : undefined,
        Code_produit: product.Code_produit,
        calibre_id: product.calibre_id,
        designation: product.designation,
        produit_id: ligneCommande.produit_id,
        quantite: ligneCommande.quantite,
        quantite_lot: lignePrepartion ? lignePrepartion.quantite : undefined,
        prix_unitaire: ligneCommande.prix_unitaire,
        lot: lignePrepartion ? lignePrepartion.lot : undefined,
      };
    });
    setSelectedProductsData(selectedProducts);

    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
  };
  const handleInputChange = (index, inputType, event) => {
    const newValue = event.target.value;
    console.log("selectedProductsData", selectedProductsData);
    console.log("index", index);
    if (selectedProductsData[index]) {
      const productId = selectedProductsData[index].produit_id;
      const quantite = selectedProductsData[index].quantite;
      if (inputType === "lot") {
        setModifiedLotValues((prev) => {
          const updatedValues = {
            ...prev,
            [`${index}_${productId}`]: newValue,
          };
          console.log("Modified Lot values:", updatedValues);
          return updatedValues;
        });
      } else if (inputType === "quantite") {
        if (newValue > quantite) {
          setWarningIndexes((prev) => [...prev, index]); // Add index to warning indexes
        } else {
          setWarningIndexes((prev) => prev.filter((item) => item !== index)); // Remove index from warning indexes

          setModifiedQuantiteValues((prev) => {
            const updatedValues = {
              ...prev,
              [`${index}_${productId}`]: newValue,
            };
            console.log("Modified quantite values:", updatedValues);
            return updatedValues;
          });
        }
      }
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer ce Commandes ?",
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
          .delete(`http://localhost:8000/api/commandes/${id}`)
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Commandes supprimé avec succès.",
            });
            fetchData();
          })
          .catch((error) => {
            console.error("Erreur lors de la suppression du Commandes:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la suppression du Commandes.",
            });
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  };

  const handleShowFormButtonClick = () => {
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "-0%" });
      setTableContainerStyle({ marginRight: "600px" });
    } else {
      closeForm();
    }
  };
  const handleDeleteAllSelection = () => {
    // Clear the selected products data
    setSelectedProductsData([]);
  };
  const closeForm = () => {
    handleDeleteAllSelection();
    setFormContainerStyle({ right: "-100%" });
    setTableContainerStyle({ marginRight: "0" });
    setShowForm(false); // Hide the form
    setFormData({
      // Clear form data
      reference: "",
      dateCommande: "",
      datePreparationCommande: "",
      client_id: "",
      mode_payement: "",
      status: "",
      user_id: "",
      produit_id: "",
      prix_unitaire: "",
      quantite: "",
    });
    setEditingCommandes(null); // Clear editing client
  };
  //---------------------------Produit--------------------------

  const handleProductSelection = (selectedProduct, index) => {
    console.log("selectedProduct", selectedProduct);
    const updatedSelectedProductsData = [...selectedProductsData];
    updatedSelectedProductsData[index] = selectedProduct;
    setSelectedProductsData(updatedSelectedProductsData);
    console.log("selectedProductsData", selectedProductsData);
  };

  useEffect(() => {
    const filtered = commandes.filter((Commandes) =>
      Commandes.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCommandes(filtered);
  }, [commandes, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCheckboxChange = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(commandes.map((Commandes) => Commandes.id));
    }
  };
  const handleAddEmptyRow = () => {
    setSelectedProductsData([...selectedProductsData, {}]);
    console.log("selectedProductData", selectedProductsData);
  };
  const handleClientSelection = (selected) => {
    if (selected && selected.length > 0) {
      console.log("selectedClient", selected);
      setSelectedClientId(selected[0].value);
    }
  };
  const handleDeleteProduct = (index, id) => {
    const updatedSelectedProductsData = [...selectedProductsData];
    updatedSelectedProductsData.splice(index, 1);
    setSelectedProductsData(updatedSelectedProductsData);
    if (id) {
      axios
        .delete(`http://localhost:8000/api/lignePreparationCommandes/${id}`)
        .then(() => {
          fetchData();
        });
    }
  };
  const getClientValue = (clientId, field) => {
    // Find the product in the produits array based on produitId
    const client = clients.find((p) => p.id === clientId);

    // If the product is found, return the value of the specified field
    if (client) {
      return client[field];
    }

    // If the product is not found, return an empty string or any default value
    return "";
  };
  const calculateRowColor = (commande) => {
    // Implement your logic here to determine row color based on quantity data
    const preparedQuantites = calculateTotalQuantity(
      commande.ligne_preparation_commandes
    );
    return preparedQuantites ===
      calculateTotalQuantity(commande.ligne_commandes)
      ? "#87A922"
      : "#FCDC2A";
  };

  // Function to calculate total quantity
  // const calculateTotalQuantity = (ligne_commandes) => {
  //   // Implement your logic here to calculate total quantity
  //   // For example:
  //   let total = 0;
  //   ligne_commandes.forEach((ligne) => {
  //     total += ligne.quantite;
  //   });
  //   return total;
  // };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <h2 className="mt-4">Preparation des Commandes</h2>

          {/* <Button
              variant="primary"
              className="col-2 btn btn-sm m-2"
              id="showFormButton"
              onClick={handleShowFormButtonClick}
            >
              {showForm ? "Modifier le formulaire" : "Ajouter un Commandes"}
            </Button> */}
          <div
            id="formContainer"
            style={{ ...formContainerStyle, padding: "50px" }}
          >
            {/* <Form className="row" onSubmit={handleSubmit}>
                <div className="col-md-4">
                  <Form.Group controlId="datePreparationCommande">
                    <Form.Label>Date Preparation Commande:</Form.Label>
                    <Form.Control
                      type="date"
                      name="datePreparationCommande"
                      value={formData.datePreparationCommande}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-12">
                  {console.log("selectedProductsData:", selectedProductsData)}
                  <Form.Group controlId="selectedProduitTable">
                    <table className="table table-bordered table-responsive-sm">
                      <thead>
                        <tr>
                          <th>
                            <Select
                              options={produits.map((produit) => ({
                                value: produit.id,
                                label: produit.Code_produit,
                                placeholder: "Code Produit",
                              }))}
                              onChange={(selected) =>
                                handleProductSelection(
                                  selected[0].value,
                                  selected[0].designation
                                )
                              }
                              value={selectedProductId}
                            />
                          </th>
                          <th>Designation</th>
                          <th>Calibre</th>
                          <th>Quantité</th>
                          <th>Lot</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProductsData.map((productData, index) => (
                          <tr
                            key={index}
                            className={
                              productData.quantity ===
                              getElementValueById(`quantite_${productData.id}`)
                                ? "green-row"
                                : "yellow-row"
                            }
                          >
                            <td>
                              {getProduitValue(productData.id, "Code_produit")}
                            </td>
                            <td>
                              {getProduitValue(productData.id, "designation")}
                            </td>
                            <td>
                              {getProduitValue(productData.id, "calibre_id")}
                            </td>
                            <td>
                              <input
                                type="text"
                                id={`quantite_${productData.id}`}
                                className="quantiteInput"
                                placeholder="Quantite"
                                value={
                                  modifiedQuantiteValues[productData.id] ||
                                  populateProductInputs(
                                    productData.id,
                                    "quantite"
                                  )
                                }
                                onChange={(event) =>
                                  handleInputChange(
                                    productData.id,
                                    "quantite",
                                    event
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                id={`lot_${productData.id}`}
                                className="lotInput"
                                placeholder="Lot"
                                value={
                                  modifiedLotValues[productData.id] ||
                                  populateProductLotInputs(
                                    productData.id,
                                    "lot"
                                  )
                                }
                                onChange={(event) =>
                                  handleInputChange(
                                    productData.id,
                                    "lot",
                                    event
                                  )
                                }
                              />
                            </td>
                            <td>
                              <Button
                                className=" btn btn-danger btn-sm m-1"
                                onClick={() => handleDeleteProduct(index)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Form.Group>
                </div>

                <div className="col-md-12 mt-3">
                  <Button
                    className="btn btn-sm"
                    variant="primary"
                    type="submit"
                  >
                    Submit
                  </Button>
                </div>
              </Form> */}
            <Form className="row" onSubmit={handleSubmit}>
              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="client_id" className="col-form-label">
                      Client:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <Select
                      options={clients.map((client) => ({
                        value: client.id,
                        label: client.raison_sociale,
                      }))}
                      onChange={handleClientSelection}
                      values={
                        formData.client_id
                          ? [
                              {
                                value: formData.client_id,
                                label: getClientValue(
                                  formData.client_id,
                                  "raison_sociale"
                                ),
                              },
                            ]
                          : []
                      }
                      placeholder="Select client ..."
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="mode_payement" className="col-form-label">
                      Mode Paiement:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <Form.Select
                      name="mode_payement"
                      value={formData.mode_payement}
                      onChange={handleChange}
                    >
                      <option disabled selected>
                        Mode de Paiement
                      </option>
                      <option value="Espece">Espece</option>
                      <option value="Tpe">Tpe</option>
                      <option value="Cheque">Cheque</option>
                      {/* Add more payment types as needed */}
                    </Form.Select>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                {editingCommandes && (
                  <div className="row mb-3">
                    <div className="col-sm-6">
                      <label htmlFor="status" className="col-form-label">
                        Status:
                      </label>
                    </div>
                    <div className="col-sm-6">
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="En cours">En cours</option>
                        <option value="Valide">Valide</option>
                        <option value="Non Valide">Non Valide</option>
                        {/* Add more statuses as needed */}
                      </Form.Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="dateCommande" className="col-form-label">
                      Date Commande:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <Form.Group controlId="dateCommande">
                      <Form.Control
                        type="date"
                        name="dateCommande"
                        value={formData.dateCommande}
                        onChange={handleChange}
                        className="form-control-sm"
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                {console.log("selectedProductsData:", selectedProductsData)}
                <Form.Group controlId="selectedProduitTable">
                  <div className="table-responsive">
                    <table className="table-bordered ">
                      <thead>
                        <tr>
                          <th>
                            {" "}
                            <Button
                              className="btn btn-sm "
                              variant="primary"
                              onClick={handleAddEmptyRow}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </Button>
                          </th>
                          <th>Code Produit</th>
                          <th>Designation</th>
                          <th>Calibre</th>
                          <th>Quantité</th>
                          <th>Lot</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProductsData.map((productData, index) => (
                          <tr key={index}>
                            <td colSpan="2">
                              <Select
                                options={produits.map((produit) => ({
                                  value: produit.id,
                                  label: produit.Code_produit,
                                }))}
                                onChange={(selected) => {
                                  const produit = produits.find(
                                    (prod) => prod.id === selected[0].value
                                  );
                                  handleProductSelection(
                                    {
                                      produit_id: selected[0].value,
                                      Code_produit: produit.Code_produit,
                                      designation: produit.designation,
                                      calibre_id: produit.calibre_id,
                                    },
                                    index
                                  );
                                }}
                                values={
                                  productData.produit_id
                                    ? [
                                        {
                                          value: productData.produit_id,
                                          label: productData.Code_produit,
                                        },
                                      ]
                                    : []
                                }
                                placeholder="Code ..."
                              />
                            </td>
                            <td>{productData.designation}</td>
                            <td>{productData.calibre_id}</td>
                            <td>
                              <input
                                type="text"
                                className={
                                  warningIndexes.includes(index)
                                    ? "input-warning"
                                    : ""
                                }
                                id={`quantite_${index}_${productData.produit_id}`}
                                // className="quantiteInput"
                                placeholder={productData.quantite}
                                value={
                                  modifiedQuantiteValues[
                                    `${index}_${productData.produit_id}`
                                  ] ||
                                  populateProductInputs(
                                    productData.produit_id,
                                    "quantite"
                                  )
                                }
                                onChange={(event) =>
                                  handleInputChange(index, "quantite", event)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                id={`lot_${index}_${productData.produit_id}`}
                                className="lotInput"
                                placeholder="Lot"
                                value={
                                  modifiedLotValues[
                                    `${index}_${productData.produit_id}`
                                  ] ||
                                  populateProductInputs(
                                    productData.produit_id,
                                    "lot"
                                  )
                                }
                                onChange={(event) =>
                                  handleInputChange(index, "lot", event)
                                }
                              />
                            </td>
                            <td>
                              <Button
                                className=" btn btn-danger btn-sm m-1"
                                onClick={() =>
                                  handleDeleteProduct(index, productData.id)
                                }
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Form.Group>
              </div>

              <Form.Group className="col m-3 text-center">
                <Button type="submit" className="btn btn-sm col-4">
                  {editingCommandes ? "Modifier" : "Valider"}
                </Button>
                <Button
                  className="btn btn-secondary col-4 offset-1"
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
            <table className="table table-bordered">
              <thead
                className="text-center "
                style={{ backgroundColor: "#ddd" }}
              >
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                    />
                  </th>
                  <th colSpan="2">Reference</th>
                  <th>Client</th>
                  <th>Date Commande</th>
                  <th>Date Preparation Commande</th>

                  <th>Mode de Paiement</th>

                  <th colSpan="2">Status</th>
                  <th colSpan="2">Total</th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {commandes &&
                  commandes.map((commande) => (
                    <React.Fragment key={commande.id}>
                      <tr>
                        <td>
                          {/* <input
                              type="checkbox"
                              checked={selectedItems.some(
                                (item) => item.id === Commandes.id
                              )}
                              onChange={() => handleSelectItem(Commandes)}
                            /> */}
                          <input
                            type="checkbox"
                            onChange={() => handleCheckboxChange(commande.id)}
                            checked={selectedItems.includes(commande.id)}
                          />
                        </td>
                        <td
                          style={{
                            backgroundColor: calculateRowColor(commande),
                          }}
                        >
                          <div className="no-print ">
                            <Button
                              className="btn btn-sm btn-light"
                              onClick={() =>
                                handleShowLigneCommandes(commande.id)
                              }
                            >
                              <FontAwesomeIcon
                                icon={
                                  expandedRows.includes(commande.id)
                                    ? faMinus
                                    : faPlus
                                }
                              />
                            </Button>
                          </div>
                        </td>
                        <td
                          style={{
                            backgroundColor: calculateRowColor(commande),
                          }}
                        >
                          {commande.reference}
                        </td>
                        <td>{commande.client_id}</td>
                        <td>{commande.dateCommande}</td>
                        <td>{commande.datePreparationCommande}</td>

                        <td>{commande.mode_payement}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-light"
                            onClick={() =>
                              handleShowStatusCommandes(commande.id)
                            }
                          >
                            <FontAwesomeIcon
                              icon={
                                expand_status.includes(commande.id)
                                  ? faMinus
                                  : faPlus
                              }
                            />
                          </button>
                        </td>
                        <td>{commande.status}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-light"
                            onClick={() => handleShowTotalDetails(commande.id)}
                          >
                            <FontAwesomeIcon
                              icon={
                                expand_total.includes(commande.id)
                                  ? faMinus
                                  : faPlus
                              }
                            />
                          </button>
                        </td>
                        <td>
                          {calculateTotalQuantity(commande.ligne_commandes)}
                        </td>
                        <td>
                          <div className="d-inline-flex text-center">
                            <Button
                              className=" btn btn-sm btn-info m-1"
                              onClick={() => handleEdit(commande)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            {/* <Button
                                className=" btn btn-danger btn-sm m-1"
                                onClick={() => handleDelete(commande.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button> */}
                          </div>
                        </td>
                      </tr>
                      {expandedRows.includes(commande.id) &&
                        commande.ligne_commandes && (
                          <tr>
                            <td
                              colSpan="12"
                              style={{
                                padding: "0",
                              }}
                            >
                              <div id="lignesCommandes">
                                <table
                                  className="table-bordered"
                                  style={{
                                    borderCollapse: "collapse",

                                    width: "100%",
                                  }}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Produit
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Quantite
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Prix Vente
                                      </th>
                                      {/* <th className="text-center">Action</th> */}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {commande.ligne_commandes.map(
                                      (ligneCommande) => (
                                        <tr key={ligneCommande.id}>
                                          <td>{ligneCommande.produit_id}</td>
                                          <td>{ligneCommande.quantite}</td>
                                          <td>
                                            {ligneCommande.prix_unitaire} DH
                                          </td>
                                          {/* <td className="no-print">
                                              <button
                                                className="btn btn-sm btn-info m-1"
                                                onClick={() => {
                                                  handleEditSC(siteClient);
                                                }}>
                                                <i className="fas fa-edit"></i>
                                              </button>
                                              <button className="btn btn-sm btn-danger m-1"
                                                onClick={() => handleDeleteSiteClient(siteClient.id)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                              </button>
                                            </td> */}
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      {expand_total.includes(commande.id) && (
                        <tr>
                          <td
                            style={{
                              padding: "0",
                            }}
                            colSpan="12"
                          >
                            {/* Increased colspan to accommodate the new Total column */}
                            <table
                              className="table-bordered"
                              style={{
                                borderCollapse: "collapse",
                                width: "100%",
                              }}
                            >
                              <thead>
                                <tr>
                                  <th></th>
                                  {commande.ligne_commandes.map((ligne) => {
                                    const produit = produits.find(
                                      (prod) => prod.id === ligne.produit_id
                                    );
                                    return (
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                        key={produit.designation}
                                      >
                                        {produit.designation}
                                      </th>
                                    );
                                  })}
                                  <th
                                    style={{
                                      backgroundColor: "#ddd",
                                    }}
                                  >
                                    Total (Unité) / Calibre
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {uniqueCalibres.map((calibre) => (
                                  <tr key={calibre}>
                                    <td
                                      style={{
                                        backgroundColor: "#ddd",
                                      }}
                                    >
                                      <strong>calibre : [{calibre}]</strong>
                                    </td>
                                    {commande.ligne_commandes.map((ligne) => {
                                      const produit = produits.find(
                                        (prod) => prod.id === ligne.produit_id
                                      );
                                      return (
                                        <td key={produit.designation}>
                                          {getQuantity(
                                            commande.ligne_commandes,
                                            calibre,
                                            produit.designation
                                          )}
                                        </td>
                                      );
                                    })}
                                    <td>
                                      <strong>
                                        {getTotalForCalibre(
                                          commande.ligne_commandes,
                                          calibre,
                                          produits
                                        )}
                                      </strong>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                      {expand_status.includes(commande.id) &&
                        commande.status_commandes && (
                          <tr>
                            <td
                              colSpan="12"
                              style={{
                                padding: "0",
                              }}
                            >
                              <div id="statusCommandes">
                                <table
                                  className="table-bordered"
                                  style={{
                                    borderCollapse: "collapse",

                                    width: "100%",
                                  }}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Status
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Date Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {commande.status_commandes.map(
                                      (statusCommande) => (
                                        <tr key={statusCommande.id}>
                                          <td>{statusCommande.status}</td>
                                          <td>{statusCommande.date_status}</td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CommandeList;
