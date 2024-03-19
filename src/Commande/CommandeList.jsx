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
//   faArrowUp,
//   faArrowDown,
// } from "@fortawesome/free-solid-svg-icons";
// import * as XLSX from "xlsx";
// import { jsPDF } from "jspdf";
// import "jspdf-autotable";
// import CommandeDetails from "./CommandeDetails ";
// import Modal from "react-modal"; // Import the Modal component
// import AddCommande from "./AddCommande ";
// import EditCommande from "./EditCommande ";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// import Box from "@mui/material/Box";
// import { Toolbar } from "@mui/material";
// import { width } from "@mui/system";

// const CommandeList = () => {
//   const [board, SetBoard] = useState([]);
// const csrfTokenMeta = document.head.querySelector('meta[name="csrf-token"]');
// const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : null;
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredCommandes, setFilteredCommandes] = useState([]);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [commandes, setCommandes] = useState([]);
//   const [ligneCommandes, setLigneCommandes] = useState([]);
//   const [statusCommandes, setStatusCommandes] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [produits, setProduits] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [selectedCommande, setSelectedCommande] = useState(null);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [isAddCommandeDrawerOpen, setIsAddCommandeDrawerOpen] = useState(false);
//   const [isEditCommandeDrawerOpen, setIsEditCommandeDrawerOpen] =
//     useState(false);
//   const [expandedRows, setExpandedRows] = useState([]);
//   const [expand_total, setExpandTotal] = useState([]);

//   const calibres = produits.map((produit) => produit.calibre.calibre);
//   const uniqueCalibres = [...new Set(calibres)];

//   // const [quantitiesByCalibreAndProduct, setQuantitiesByCalibreAndProduct] =
//   useState({});

//   // Assuming you have quantitiesByCalibreAndProduct available
//   // const quantitiesByCalibreAndProduct = {
//   //   "Calibre 1": {
//   //     "Product A": 10,
//   //     "Product B": 15,
//   //     // Add more products as needed
//   //   },
//   //   "Calibre 2": {
//   //     "Product A": 8,
//   //     "Product B": 12,
//   //     // Add more products as needed
//   //   },
//   //Add more calibres as needed
//   // };
//   const handleOpenAddCommandeDrawer = () => {
//     setIsEditCommandeDrawerOpen(true);
//   };

//   const handleCloseAddCommandeDrawer = () => {
//     setIsEditCommandeDrawerOpen(false);
//   };
//   const handleOpenEditCommandeDrawer = () => {
//     setIsEditCommandeDrawerOpen(true);
//   };

//   const handleCloseEditCommandeDrawer = () => {
//     setIsEditCommandeDrawerOpen(false);
//   };
//   const fetchCommandes = async () => {
//     try {
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
//       const response = await axios.get("http://localhost:8000/api/commandes");

//       console.log("API Response for Commandes:", response.data.commandes);

//       if (
//         JSON.stringify(response.data.commandes) !== JSON.stringify(commandes)
//       ) {
//         setCommandes(response.data.commandes);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };
//   const fetchLigneCommandes = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8000/api/ligneCommandes"
//       );

//       console.log("API Response for ligneCommandes:", response.data);

//       setLigneCommandes(response.data.ligneCommande);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };
//   const fetchStatusCommandes = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8000/api/statusCommande"
//       );

//       console.log("API Response for ligneCommandes:", response.data);

//       setStatusCommandes(response.data.statusCommande);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchCommandes();
//   }, []);
//   // useEffect(() => {
//   //   // Get unique calibres
//   //   const calibres = produits.map((produit) => produit.calibre);
//   //   const uniqueCalibres = [...new Set(calibres)];

//   //   // Log or use the unique calibres as needed
//   //   console.log("Unique Calibres:", uniqueCalibres);

//   //   // Set unique calibres to the state
//   //   setUniqueCalibres(uniqueCalibres);
//   // }, [produits]); // Run the effect whenever produits is updated

//   useEffect(() => {
//     // Filter commandes based on the search term
//     const filtered = commandes.filter((commande) =>
//       commande.reference.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     setFilteredCommandes(filtered);
//   }, [commandes, searchTerm]);
//   // useEffect(() => {
//   //   const quantities = getQuantityByCalibreAndProduct();
//   //   setQuantitiesByCalibreAndProduct(quantities);
//   // }, [ligneCommandes, produits]);

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
//   const tableHeaderStyleCommand = {
//     border: "1px solid #ddd",
//     padding: "8px",
//     textAlign: "center",
//     backgroundColor: "#f2f2f2", // Header background color
//   };

//   const tableCellStyleCommand = {
//     border: "1px solid #ddd",
//     padding: "8px",
//     textAlign: "center",
//   };
//   const handleShowDetails = (commande) => {
//     setExpandedRows((prevRows) =>
//       prevRows.includes(commande)
//         ? prevRows.filter((row) => row !== commande)
//         : [...prevRows, commande]
//     );
//   };
//   const handleShowTotalDetails = (commande) => {
//     setExpandTotal((prevRows) =>
//       prevRows.includes(commande)
//         ? prevRows.filter((row) => row !== commande)
//         : [...prevRows, commande]
//     );
//   };
//   const handleModalClose = () => {
//     setModalIsOpen(false); // Close the modal
//     setSelectedCommande(null);
//   };

//   const handleDelete = (id) => {
//     const isConfirmed = window.confirm(
//       "Êtes-vous sûr de vouloir supprimer ce commande ?"
//     );

//     if (isConfirmed) {
//       axios
//         .delete(`http://localhost:8000/api/commandes/${id}`)
//         .then(() => {
//           fetchCommandes();
//           Swal.fire({
//             icon: "success",
//             title: "Succès!",
//             text: "Commande supprimé avec succès.",
//           });
//         })
//         .catch((error) => {
//           console.error("Erreur lors de la suppression du commande:", error);
//           Swal.fire({
//             icon: "error",
//             title: "Erreur!",
//             text: "Échec de la suppression du commande.",
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
//   const calculateTotalQuantity = (ligneCommandes, produit) => {
//     //fetchCommandes();
//     return ligneCommandes.reduce((total, ligneCommande) => {
//       return total + ligneCommande.quantite;
//     }, 0);
//   };
//   const getQuantity = (ligneCommandes, calibre, designation) => {
//     const correspondingProduct = produits.find(
//       (product) =>
//         product.calibre.calibre === calibre &&
//         product.designation === designation
//     );

//     if (!correspondingProduct) {
//       return 0; // If no corresponding product is found, return 0
//     }

//     const correspondingLigneCommande = ligneCommandes.find(
//       (ligne) => ligne.produit_id === correspondingProduct.id
//     );

//     return correspondingLigneCommande ? correspondingLigneCommande.quantite : 0;
//   };
//   const getClientNameById = (clientId) => {
//     console.log("clients", clients);
//     const client = clients.find((c) => c.id === clientId);
//     return client ? client.raison_sociale : "";
//   };
//   const getTotalForCalibre = (ligneCommandes, calibre, produits) => {
//     // Filter ligneCommandes for the given calibre
//     const ligneCommandesForCalibre = ligneCommandes.filter(
//       (ligne) =>
//         produits.find((produit) => produit.id === ligne.produit_id)?.calibre
//           .calibre === calibre
//     );

//     // Calculate the total quantity for the calibre
//     const total = ligneCommandesForCalibre.reduce(
//       (acc, ligne) => acc + ligne.quantite,
//       0
//     );

//     return total;
//   };
//   //------------formatDate----------//
//   // function formatDate(dateString) {
//   //   const options = { year: "numeric", month: "2-digit", day: "2-digit" };
//   //   return new Date(dateString).toLocaleDateString("fr-FR", options);
//   // }
//   // const generateQuantitiesByCalibreAndProduct = (ligneCommandes) => {
//   //   const quantitiesByCalibreAndProduct = {};

//   //   ligneCommandes.forEach((ligneCommande) => {
//   //     const { produit_id, quantite } = ligneCommande;

//   //     const produit = produits.find((p) => p.id === produit_id);

//   //     if (produit) {
//   //       const { calibre, designation } = produit;

//   //       if (!quantitiesByCalibreAndProduct[calibre]) {
//   //         quantitiesByCalibreAndProduct[calibre] = {};
//   //       }

//   //       quantitiesByCalibreAndProduct[calibre][designation] =
//   //         (quantitiesByCalibreAndProduct[calibre][designation] || 0) + quantite;
//   //     }
//   //   });
//   //   console.log(quantitiesByCalibreAndProduct);
//   //   return quantitiesByCalibreAndProduct;
//   // };

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
//               <div>
//                 <AddCommande
//                   produits={produits}
//                   clients={clients}
//                   users={users}
//                   csrfToken={csrfToken}
//                   fetchCommandes={fetchCommandes}
//                   open={isAddCommandeDrawerOpen}
//                   onClose={handleCloseAddCommandeDrawer}
//                 />
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
//                 <table className="table ">
//                   {/* Table headers */}
//                   <thead className="text-center">
//                     <tr>
//                       <th></th>
//                       <th style={tableHeaderStyleCommand} className="no-print">
//                         <input
//                           type="checkbox"
//                           checked={selectAll}
//                           onChange={handleSelectAllChange}
//                         />
//                       </th>

//                       <th style={tableHeaderStyleCommand}>Reference</th>
//                       <th style={tableHeaderStyleCommand}>Date Commande</th>
//                       <th style={tableHeaderStyleCommand}>Mode Paiement</th>
//                       <th style={tableHeaderStyleCommand}>Status</th>
//                       <th style={tableHeaderStyleCommand}>Client</th>
//                       <th style={tableHeaderStyleCommand}>Total (Unité)</th>
//                       <th style={tableHeaderStyleCommand} className="no-print">
//                         Action
//                       </th>
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
//                               style={tableCellStyleCommand}
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
//                               style={tableCellStyleCommand}
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

//                             <td style={tableCellStyleCommand}>
//                               {filteredCommande.reference}
//                             </td>
//                             <td style={tableCellStyleCommand}>
//                               {filteredCommande.dateCommande}
//                             </td>

//                             <td style={tableCellStyleCommand}>
//                               {filteredCommande.mode_payement}
//                             </td>
//                             <td style={tableCellStyleCommand}>
//                               {filteredCommande.status}
//                             </td>
//                             <td style={tableCellStyleCommand}>
//                               {getClientNameById(filteredCommande.client_id)}
//                             </td>
//                             <td style={tableCellStyleCommand}>
//                               <button
//                                 style={{ marginRight: "10px" }}
//                                 className="no-print"
//                                 onClick={() =>
//                                   handleShowTotalDetails(filteredCommande.id)
//                                 }
//                               >
//                                 <FontAwesomeIcon
//                                   icon={
//                                     expand_total.includes(filteredCommande.id)
//                                       ? faArrowDown
//                                       : faArrowUp
//                                   }
//                                 />
//                               </button>{" "}
//                               {calculateTotalQuantity(
//                                 filteredCommande.ligne_commandes
//                               )}
//                             </td>

//                             <td style={tableCellStyleCommand}>
//                               <EditCommande
//                                 className=" no-print"
//                                 produits={produits}
//                                 clients={clients}
//                                 users={users}
//                                 csrfToken={csrfToken}
//                                 fetchCommandes={fetchCommandes}
//                                 editCommandeId={filteredCommande.id}
//                                 open={isEditCommandeDrawerOpen}
//                                 onClose={handleCloseEditCommandeDrawer}
//                               />
//                               <button
//                                 className="no-print btn btn-danger btn-sm m-1"
//                                 onClick={() =>
//                                   handleDelete(filteredCommande.id)
//                                 }
//                               >
//                                 <FontAwesomeIcon icon={faTrash} />
//                               </button>
//                             </td>
//                           </tr>
//                           {expandedRows.includes(filteredCommande.id) && (
//                             <tr>
//                               <td colSpan="7">
//                                 <CommandeDetails
//                                   produits={produits}
//                                   commande={filteredCommande}
//                                   ligneCommandes={ligneCommandes}
//                                   statusCommandes={statusCommandes}
//                                   fetchLigneCommandes={fetchLigneCommandes}
//                                   fetchStatusCommandes={fetchStatusCommandes}
//                                   // onBackToList={() =>
//                                   //   handleShowDetails(filteredCommande.id)
//                                   // }
//                                 />
//                               </td>
//                             </tr>
//                           )}

//                           {expand_total.includes(filteredCommande.id) && (
//                             <tr>
//                               <td colSpan="11">
//                                 {/* Increased colspan to accommodate the new Total column */}
//                                 <table
//                                   style={{
//                                     borderCollapse: "collapse",
//                                     width: "100%",
//                                   }}
//                                 >
//                                   <thead>
//                                     <tr>
//                                       <th></th>
//                                       {produits
//                                         .filter((produit) =>
//                                           filteredCommande.ligne_commandes.some(
//                                             (ligne) =>
//                                               ligne.produit_id === produit.id
//                                           )
//                                         )
//                                         .map((produit) => (
//                                           <th
//                                             key={produit.designation}
//                                             style={tableHeaderStyle}
//                                           >
//                                             {produit.designation}
//                                           </th>
//                                         ))}
//                                       <th style={tableHeaderStyle}>
//                                         Total (Unité) / Calibre
//                                       </th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {uniqueCalibres.map((calibre) => (
//                                       <tr key={calibre}>
//                                         <td style={tableHeaderStyle}>
//                                           <strong>calibre : [{calibre}]</strong>
//                                         </td>
//                                         {produits
//                                           .filter((produit) =>
//                                             filteredCommande.ligne_commandes.some(
//                                               (ligne) =>
//                                                 ligne.produit_id === produit.id
//                                             )
//                                           )
//                                           .map((produit) => (
//                                             <td
//                                               key={produit.designation}
//                                               style={tableCellStyle}
//                                             >
//                                               {getQuantity(
//                                                 filteredCommande.ligne_commandes,
//                                                 calibre,
//                                                 produit.designation
//                                               )}
//                                             </td>
//                                           ))}
//                                         <td style={tableCellStyle}>
//                                           <strong>
//                                             {getTotalForCalibre(
//                                               filteredCommande.ligne_commandes,
//                                               calibre,
//                                               produits
//                                             )}
//                                           </strong>
//                                         </td>
//                                       </tr>
//                                     ))}
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
//               <button className="btn btn-danger" onClick={handleDeleteSelected}>
//                 <FontAwesomeIcon icon={faTrash} />{" "}
//               </button>

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
//               <div>
//                 <AddCommande
//                   produits={produits}
//                   clients={clients}
//                   users={users}
//                   csrfToken={csrfToken}
//                   fetchCommandes={fetchCommandes}
//                   open={isAddCommandeDrawerOpen}
//                   onClose={handleCloseAddCommandeDrawer}
//                 />
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
//                 <table className="table ">
//                   {/* Table headers */}
//                   <thead className="text-center">
//                     <tr>
//                       <th style={tableHeaderStyleCommand} className="no-print">
//                         <input
//                           type="checkbox"
//                           checked={selectAll}
//                           onChange={handleSelectAllChange}
//                         />
//                       </th>

//                       <th style={tableHeaderStyleCommand}>Reference</th>
//                       <th style={tableHeaderStyleCommand}>Date Commande</th>
//                       <th style={tableHeaderStyleCommand}>Mode Paiement</th>
//                       <th style={tableHeaderStyleCommand}>Status</th>
//                       <th style={tableHeaderStyleCommand}>Client</th>
//                       <th style={tableHeaderStyleCommand}>Total (Unité)</th>
//                       <th style={tableHeaderStyleCommand} className="no-print">
//                         Action
//                       </th>
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
//                               style={tableCellStyleCommand}
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
//                               style={tableCellStyleCommand}
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

//                             <td style={tableCellStyleCommand}>
//                               {filteredCommande.reference}
//                             </td>
//                             <td style={tableCellStyleCommand}>
//                               {filteredCommande.dateCommande}
//                             </td>

//                             <td style={tableCellStyleCommand}>
//                               {filteredCommande.mode_payement}
//                             </td>
//                             <td style={tableCellStyleCommand}>
//                               {filteredCommande.status}
//                             </td>
//                             <td style={tableCellStyleCommand}>
//                               {getClientNameById(filteredCommande.client_id)}
//                             </td>
//                             <td style={tableCellStyleCommand}>
//                               <button
//                                 style={{ marginRight: "10px" }}
//                                 className="no-print"
//                                 onClick={() =>
//                                   handleShowTotalDetails(filteredCommande.id)
//                                 }
//                               >
//                                 <FontAwesomeIcon
//                                   icon={
//                                     expand_total.includes(filteredCommande.id)
//                                       ? faArrowDown
//                                       : faArrowUp
//                                   }
//                                 />
//                               </button>{" "}
//                               {calculateTotalQuantity(
//                                 filteredCommande.ligne_commandes
//                               )}
//                             </td>

//                             <td style={tableCellStyleCommand}>
//                               <EditCommande
//                                 className=" no-print"
//                                 produits={produits}
//                                 clients={clients}
//                                 users={users}
//                                 csrfToken={csrfToken}
//                                 fetchCommandes={fetchCommandes}
//                                 editCommandeId={filteredCommande.id}
//                                 open={isEditCommandeDrawerOpen}
//                                 onClose={handleCloseEditCommandeDrawer}
//                               />
//                               <button
//                                 className="no-print btn btn-danger btn-sm m-1"
//                                 onClick={() =>
//                                   handleDelete(filteredCommande.id)
//                                 }
//                               >
//                                 <FontAwesomeIcon icon={faTrash} />
//                               </button>
//                             </td>
//                           </tr>
//                           {expandedRows.includes(filteredCommande.id) && (
//                             <tr>
//                               <td colSpan="7">
//                                 <CommandeDetails
//                                   produits={produits}
//                                   commande={filteredCommande}
//                                   ligneCommandes={ligneCommandes}
//                                   statusCommandes={statusCommandes}
//                                   fetchLigneCommandes={fetchLigneCommandes}
//                                   fetchStatusCommandes={fetchStatusCommandes}
//                                   // onBackToList={() =>
//                                   //   handleShowDetails(filteredCommande.id)
//                                   // }
//                                 />
//                               </td>
//                             </tr>
//                           )}

//                           {expand_total.includes(filteredCommande.id) && (
//                             <tr>
//                               <td colSpan="11">
//                                 {/* Increased colspan to accommodate the new Total column */}
//                                 <table
//                                   style={{
//                                     borderCollapse: "collapse",
//                                     width: "100%",
//                                   }}
//                                 >
//                                   <thead>
//                                     <tr>
//                                       {produits
//                                         .filter((produit) =>
//                                           filteredCommande.ligne_commandes.some(
//                                             (ligne) =>
//                                               ligne.produit_id === produit.id
//                                           )
//                                         )
//                                         .map((produit) => (
//                                           <th
//                                             key={produit.designation}
//                                             style={tableHeaderStyle}
//                                           >
//                                             {produit.designation}
//                                           </th>
//                                         ))}
//                                       <th style={tableHeaderStyle}>
//                                         Total (Unité) / Calibre
//                                       </th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {uniqueCalibres.map((calibre) => (
//                                       <tr key={calibre}>
//                                         <td style={tableHeaderStyle}>
//                                           <strong>calibre : [{calibre}]</strong>
//                                         </td>
//                                         {produits
//                                           .filter((produit) =>
//                                             filteredCommande.ligne_commandes.some(
//                                               (ligne) =>
//                                                 ligne.produit_id === produit.id
//                                             )
//                                           )
//                                           .map((produit) => (
//                                             <td
//                                               key={produit.designation}
//                                               style={tableCellStyle}
//                                             >
//                                               {getQuantity(
//                                                 filteredCommande.ligne_commandes,
//                                                 calibre,
//                                                 produit.designation
//                                               )}
//                                             </td>
//                                           ))}
//                                         <td style={tableCellStyle}>
//                                           <strong>
//                                             {getTotalForCalibre(
//                                               filteredCommande.ligne_commandes,
//                                               calibre,
//                                               produits
//                                             )}
//                                           </strong>
//                                         </td>
//                                       </tr>
//                                     ))}
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
//               <button className="btn btn-danger" onClick={handleDeleteSelected}>
//                 <FontAwesomeIcon icon={faTrash} />{" "}
//               </button>

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
//           )}
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// };
// export default CommandeList;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import Navigation from "../Acceuil/Navigation";
import { Form, Button, Modal, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFilePdf,
  faPrint,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import Select from "react-dropdown-select";
import "jspdf-autotable";
import Swal from "sweetalert2";

const CommandeList = () => {
  const [commandes, setCommandes] = useState([]);
  const [ligneCommandes, setLigneCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusCommandes, setStatusCommandes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const handleModalClose = () => setShowModal(false);
  const [totals, setTotals] = useState({});
  const [selectedProductsData, setSelectedProductsData] = useState([]);
  const [selectedClientData, setSelectedClientData] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const csrfTokenMeta = document.head.querySelector('meta[name="csrf-token"]');
  const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : null;
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedProductDesignation, setSelectedProductDesignation] =
    useState(null);
  const [formData, setFormData] = useState({
    reference: "",
    dateCommande: "",
    client_id: "",
    mode_payement: "",
    status: "",
    user_id: "",
    produit_id: "",
    prix_unitaire: "",
    quantite: "",
  });

  const [editingCommandes, setEditingCommandes] = useState(null); // State to hold the Commandes being edited
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

  const fetchCommandes = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/commandes");
      setCommandes(response.data.commandes);

      const clientResponse = await axios.get(
        "http://localhost:8000/api/clients"
      );
      // console.log("API Response:", response.data);
      setClients(clientResponse.data.client);

      const produitResponse = await axios.get(
        "http://localhost:8000/api/produits"
      );
      setProduits(produitResponse.data.produit);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const handleShowTotalDetails = (commande) => {
    setExpandTotal((prevRows) =>
      prevRows.includes(commande)
        ? prevRows.filter((row) => row !== commande)
        : [...prevRows, commande]
    );
  };
  const handleShowLigneCommandes = async (CommandesId) => {
    if (expandedRows.includes(CommandesId)) {
      setExpandedRows(expandedRows.filter((id) => id !== CommandesId));
    } else {
      try {
        // Récupérer les lignes de Commandes associées à ce Commandes
        const ligneCommandes = await fetchLigneCommandes(CommandesId);

        // Mettre à jour l'état pour inclure les lignes de Commandes récupérées
        setCommandes((prevCommandes) =>
          prevCommandes.map((Commandes) =>
            Commandes.id === CommandesId
              ? { ...Commandes, ligneCommandes }
              : Commandes
          )
        );

        // Ajouter l'ID du Commandes aux lignes étendues
        setExpandedRows([...expandedRows, CommandesId]);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des lignes de Commandes :",
          error
        );
      }
    }
  };
  const fetchLigneCommandes = async (CommandesId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/ligneCommandes/${CommandesId}`
      );
      return response.data.ligneCommandes;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des lignes de Commandes :",
        error
      );
      return [];
    }
  };

  // useEffect(() => {
  //   // Préchargement des lingeCommandes pour chaque Commandes
  //   commandes.forEach(async (Commandes) => {
  //     if (!Commandes.ligne_commandes) {
  //       const ligneCommandes = await fetchLigneCommandes(Commandes.id);
  //       setClients((prevCommandes) => {
  //         return prevCommandes.map((prevCommandes) => {
  //           if (prevCommandes.id === Commandes.id) {
  //             return { ...prevCommandes, ligneCommandes };
  //           }
  //           return prevCommandes;
  //         });
  //       });
  //     }
  //   });
  // }, [commandes]);

  useEffect(() => {
    fetchCommandes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getElementValueById = (id) => {
    return document.getElementById(id)?.value || "";
  };
  const calculateTotalQuantity = (ligneCommandes) => {
    fetchCommandes();
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

  const getTotalForCalibre = (ligneCommandes, calibre, produits) => {
    // Filter ligneCommandes for the given calibre
    const ligneCommandesForCalibre = ligneCommandes.filter(
      (ligne) =>
        produits.find((produit) => produit.id === ligne.produit_id)?.calibre
          .calibre === calibre
    );

    // Calculate the total quantity for the calibre
    const total = ligneCommandesForCalibre.reduce(
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
      // Préparer les données du Commandes
      const CommandesData = {
        dateCommande: formData.dateCommande,

        mode_payement: formData.mode_payement,

        client_id: selectedClientId,
        user_id: authenticatedUserId,
      };

      let response;
      if (editingCommandes) {
        // Mettre à jour le Commandes existant
        response = await axios.put(
          `http://localhost:8000/api/commandes/${editingCommandes.id}`,
          CommandesData
        );
      } else {
        // Créer un nouveau Commandes
        response = await axios.post(
          "http://localhost:8000/api/commandes",
          CommandesData
        );
      }
      console.log("response of postCommande: ", response);

      //   // Envoyer une requête PUT pour mettre à jour le Commandes
      //   const updatedCommandesResponse = await axios.put(
      //     `http://localhost:8000/api/commandes/${response.data.Commandes.id}`,
      //     updatedCommandesData
      //   );

      //   console.log("Commandes mis à jour:", updatedCommandesResponse.data);
      // }

      // Préparer les données des lignes de Commandes
      const selectedPrdsData = selectedProductsData.map((selectProduct) => {
        return {
          commande_id: response.data.commande.id,
          produit_id: selectProduct.id,
          quantite: getElementValueById(`quantite_${selectProduct.id}`),
          prix_unitaire: getElementValueById(`prix_${selectProduct.id}`),
        };
      });

      // Envoyer une requête POST pour chaque produit sélectionné
      for (const ligneCommandesData of selectedPrdsData) {
        if (ligneCommandesData.id) {
          // Si l'ID existe, il s'agit d'une modification
          await axios.put(
            `http://localhost:8000/api/ligneCommandes/${ligneCommandesData.id}`,
            ligneCommandesData
          );
        } else {
          // Sinon, il s'agit d'une nouvelle ligne de Commandes
          await axios.post(
            "http://localhost:8000/api/ligneCommandes",
            ligneCommandesData
          );
        }
      }

      // Récupérer les données mises à jour
      fetchCommandes();

      // Réinitialiser les données du formulaire
      setFormData({
        reference: "",
        dateCommande: "",
        client_id: "",
        mode_payement: "",
        status: "",
        user_id: "",
        produit_id: "",
        prix_unitaire: "",
        quantite: "",
      });

      // Fermer le formulaire si nécessaire
      setShowForm(false);

      // Afficher un message de succès à l'utilisateur
      Swal.fire({
        icon: "success",
        title: "Succès !",
        text: "Détails du Commandes et des lignes de Commandes ajoutés avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la soumission des données :", error);

      // Afficher un message d'erreur à l'utilisateur
      Swal.fire({
        icon: "error",
        title: "Erreur !",
        text: "Impossible d'ajouter les détails du Commandes et des lignes de Commandes.",
      });
    }
    closeForm();
  };

  const handleEdit = (commande) => {
    setEditingCommandes(commande);
    setFormData({
      reference: commande.reference,
      dateCommande: commande.dateCommande,
      client_id: commande.client_id,
      mode_payement: commande.mode_payement,
      status: commande.status,
    });

    console.log("formData,", formData);

    const selectedProducts = commande.ligne_commandes.map((ligneCommande) => ({
      produit_id: ligneCommande.produit_id,
      quantite: ligneCommande.quantite,
      prix_unitaire: ligneCommande.prix_unitaire,
    }));
    setSelectedProductsData(selectedProducts);

    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
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
            fetchCommandes();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Commandes supprimé avec succès.",
            });
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

  const closeForm = () => {
    setFormContainerStyle({ right: "-100%" });
    setTableContainerStyle({ marginRight: "0" });
    setShowForm(false); // Hide the form
    setFormData({
      // Clear form data
      reference: "",
      dateCommande: "",
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

  const handleClientSelection = (selected) => {
    console.log("selectedClientId", selected[0].value);
    setSelectedClientId(selected[0].value);
  };

  const handleModalShow = () => {
    setShowModal(true); // Show the modal
  };

  const handleProductSelection = (productId, designation) => {
    console.log("selectedProductData before: ", selectedProductsData);

    const selectedProduct = produits.find(
      (product) => product.id === productId
    );

    if (selectedProduct) {
      setSelectedProductsData((prevData) => [...prevData, selectedProduct]);
    }
    console.log("selectedProductData after: ", selectedProductsData);

    setSelectedProductId(null); // Clear the selected product ID
    setSelectedProductDesignation(""); // Clear the selected product designation
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

  const handlePrint = (CommandesId) => {
    // Récupérer les informations spécifiques au Commandes sélectionné
    const selectedCommandes = commandes.find(
      (Commandes) => Commandes.id === CommandesId
    );

    // Création d'une nouvelle instance de jsPDF
    const doc = new jsPDF();

    // Position de départ pour l'impression des données
    let startY = 20;

    // Dessiner les informations du client dans un tableau à gauche
    const clientInfo = [
      {
        label: "Raison sociale:",
        value: selectedCommandes.client.raison_sociale,
      },
      { label: "Adresse:", value: selectedCommandes.client.adresse },
      { label: "Téléphone:", value: selectedCommandes.client.tele },
      { label: "ICE:", value: selectedCommandes.client.ice },
      // Ajoutez d'autres informations client si nécessaire
    ];

    // Dessiner le tableau d'informations client à gauche
    doc.setFontSize(10); // Police plus petite pour les informations du client
    clientInfo.forEach((info) => {
      doc.text(`${info.label}`, 10, startY);
      doc.text(`${info.value}`, 40, startY);
      startY += 10; // Espacement entre les lignes du tableau
    });

    // Dessiner le tableau des informations du Commandes à droite
    const CommandesInfo = [
      { label: "N° Commandes:", value: selectedCommandes.reference },
      { label: "Date:", value: selectedCommandes.date },
      {
        label: "Validation de l'offre:",
        value: selectedCommandes.validation_offer,
      },
      { label: "Mode de Paiement:", value: selectedCommandes.modePaiement },
    ];

    // Dessiner le tableau des informations du Commandes à droite
    startY = 20; // Réinitialiser la position Y
    CommandesInfo.forEach((info) => {
      doc.text(`${info.label}`, 120, startY);
      doc.text(`${info.value}`, 160, startY);
      startY += 10; // Espacement entre les lignes du tableau
    });

    // Vérifier si les détails des lignes de Commandes sont définis
    if (selectedCommandes.ligneCommandes) {
      // Dessiner les en-têtes du tableau des lignes de Commandes
      const headersLigneCommandes = [
        "Code produit",
        "Désignation",
        "Quantité",
        "Prix",
        "Total HT",
      ];

      // Récupérer les données des lignes de Commandes
      const rowsLigneCommandes = selectedCommandes.ligneCommandes.map(
        (ligneCommandes) => [
          ligneCommandes.Code_produit,
          ligneCommandes.designation,
          ligneCommandes.quantite,
          ligneCommandes.prix_vente,
          // Calculate the total for each product line
          (ligneCommandes.quantite * ligneCommandes.prix_vente).toFixed(2), // Assuming the price is in currency format
        ]
      );

      // Dessiner le tableau des lignes de Commandes
      doc.autoTable({
        head: [headersLigneCommandes],
        body: rowsLigneCommandes,
        startY: startY + 20, // Décalage vers le bas pour éviter de chevaucher les informations du Commandes
        margin: { top: 20 },
        styles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fontSize: 8, // Police plus petite pour les lignes de Commandes
        },
        columnStyles: {
          0: { cellWidth: 40 }, // Largeur de la première colonne
          1: { cellWidth: 60 }, // Largeur de la deuxième colonne
          2: { cellWidth: 20 }, // Largeur de la troisième colonne
          3: { cellWidth: 30 }, // Largeur de la quatrième colonne
          4: { cellWidth: 30 }, // Largeur de la cinquième colonne
        },
      });

      // Dessiner le tableau des montants
      // const montantTable = [
      //   [
      //     "Montant Total Hors Taxes:",
      //     getTotalHT(selectedCommandes.ligneCommandes).toFixed(2),
      //   ],
      //   [
      //     "TVA (20%):",
      //     calculateTVA(getTotalHT(selectedCommandes.ligneCommandes)).toFixed(2),
      //   ],
      //   ["TTC:", getTotalTTC(selectedCommandes.ligneCommandes).toFixed(2)],
      // ];

      // doc.autoTable({
      //   body: montantTable,
      //   startY: doc.autoTable.previous.finalY + 10,
      //   margin: { top: 20 },
      //   styles: {
      //     lineWidth: 0.1,
      //     lineColor: [0, 0, 0],
      //     fontSize: 10, // Police plus petite pour les montants
      //   },
      // });
    }

    // Enregistrer le fichier PDF avec le nom 'Commandes.pdf'
    doc.save("Commandes.pdf");
  };
  const handleDeleteProduct = (index) => {
    const updatedSelectedProductsData = [...selectedProductsData];
    updatedSelectedProductsData.splice(index, 1);
    setSelectedProductsData(updatedSelectedProductsData);
  };
  const handleProductCheckboxChange = (selectedOptions) => {
    const selectedProductIds = selectedOptions.map((option) => option.value);

    const updatedSelectedProducts = produits
      .map((produit) => ({
        ...produit,
        prix: produit.prix_vente, // Initialize prix with prix_vente
      }))
      .filter((produit) => selectedProductIds.includes(produit.id));

    setSelectedProducts(updatedSelectedProducts);
    console.log("selectedProducts :", selectedProducts);
  };

  // Fonction pour calculer le montant total hors taxes
  // const getTotalHT = (ligneCommandes) => {
  //   return ligneCommandes.reduce(
  //     (total, item) => total + item.quantite * item.prix_vente,
  //     0
  //   );
  // };

  // // Fonction pour calculer la TVA
  // const calculateTVA = (totalHT) => {
  //   return totalHT * 0.2; // 20% de TVA
  // };

  // // Fonction pour calculer le montant total toutes taxes comprises (TTC)
  // const getTotalTTC = (ligneCommandes) => {
  //   return (
  //     getTotalHT(ligneCommandes) + calculateTVA(getTotalHT(ligneCommandes))
  //   );
  // };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <h2 className="mt-3">Liste des Commandes</h2>
          <div className="container">
            <Button
              variant="primary"
              className="col-2 btn btn-sm m-2"
              id="showFormButton"
              onClick={handleShowFormButtonClick}
            >
              {showForm ? "Modifier le formulaire" : "Ajouter un Commandes"}
            </Button>
            <div
              id="formContainer"
              className="col"
              style={{ ...formContainerStyle }}
            >
              <Form className="row" onSubmit={handleSubmit}>
                <div className="col-md-4">
                  <Form.Group controlId="client_id">
                    <Form.Label>Client:</Form.Label>
                    <Select
                      options={clients.map((client) => ({
                        value: client.id,
                        label: client.raison_sociale,
                      }))}
                      onChange={handleClientSelection}
                      value={formData.client_id}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group controlId="mode_payement">
                    <Form.Label>Mode Paiement:</Form.Label>
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
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group controlId="dateCommande">
                    <Form.Label>Date Commande:</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateCommande"
                      value={formData.dateCommande}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-12">
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
                          <th>Prix vente</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProductsData.map((productData, index) => (
                          <tr key={index}>
                            <td>{productData.Code_produit}</td>
                            <td>{productData.designation}</td>
                            <td>{productData.calibre_id}</td>
                            <td>
                              <input
                                type="text"
                                id={`quantite_${productData.id}`}
                                className="quantiteInput"
                                placeholder="Quantite"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                id={`prix_${productData.id}`}
                                className="prixInput"
                                placeholder="Prix"
                              />
                            </td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteProduct(index)}
                              >
                                Delete
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
                  style={{ backgroundColor: "#adb5bd" }}
                >
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                      />
                    </th>
                    <th colSpan="2">reference</th>
                    <th>dateCommande</th>
                    <th>Client</th>
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
                          <td>
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
                          <td>{commande.reference}</td>
                          <td>{commande.dateCommande}</td>
                          <td>{commande.client_id}</td>
                          <td>{commande.mode_payement}</td>
                          <td>
                            <button
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
                            </button>
                          </td>
                          <td>{commande.status}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-light"
                              onClick={() =>
                                handleShowTotalDetails(commande.id)
                              }
                            >
                              <FontAwesomeIcon
                                icon={
                                  expandedRows.includes(commande.id)
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
                              <Button
                                className=" btn btn-danger btn-sm m-1"
                                onClick={() => handleDelete(commande.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows.includes(commande.id) &&
                          commande.ligne_commandes && (
                            <tr>
                              <td
                                colSpan="11"
                                style={{
                                  padding: "0",
                                }}
                              >
                                <div id="lignesCommandes">
                                  <table
                                    className="table-bordered"
                                    style={{
                                      borderCollapse: "collapse",
                                      backgroundColor: "#ddd",
                                      width: "100%",
                                    }}
                                  >
                                    <thead>
                                      <tr>
                                        <th>Produit</th>
                                        <th>Quantite</th>
                                        <th>Prix Vente</th>
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
                              colSpan="11"
                            >
                              {/* Increased colspan to accommodate the new Total column */}
                              <table
                                className="table-bordered"
                                style={{
                                  borderCollapse: "collapse",
                                  width: "100%",
                                  backgroundColor: "#ddd",
                                }}
                              >
                                <thead>
                                  <tr>
                                    <th></th>
                                    {produits
                                      .filter((produit) =>
                                        commande.ligne_commandes.some(
                                          (ligne) =>
                                            ligne.produit_id === produit.id
                                        )
                                      )
                                      .map((produit) => (
                                        <th key={produit.designation}>
                                          {produit.designation}
                                        </th>
                                      ))}
                                    <th>Total (Unité) / Calibre</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {uniqueCalibres.map((calibre) => (
                                    <tr key={calibre}>
                                      <td>
                                        <strong>calibre : [{calibre}]</strong>
                                      </td>
                                      {produits
                                        .filter((produit) =>
                                          commande.ligne_commandes.some(
                                            (ligne) =>
                                              ligne.produit_id === produit.id
                                          )
                                        )
                                        .map((produit) => (
                                          <td key={produit.designation}>
                                            {getQuantity(
                                              commande.ligne_commandes,
                                              calibre,
                                              produit.designation
                                            )}
                                          </td>
                                        ))}
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
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CommandeList;