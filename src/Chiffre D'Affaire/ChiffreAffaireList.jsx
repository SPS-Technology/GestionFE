import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import "../style.css";
import Navigation from "../Acceuil/Navigation";
import Search from "../Acceuil/Search";
import TablePagination from '@mui/material/TablePagination';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrash, faFilePdf, faFileExcel, faPrint, faPlus, faMinus, faFilter,} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import {IoIosPersonAdd} from "react-icons/io";
import PrintList from "./PrintList";
import ExportPdfButton from "./ExportPdfButton";
const ChiffreAffaireList = () => {





    const [clients, setClients] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredChiffreaffaires, setFilteredChiffreaffaires] = useState([]);
    const [factures, setFactures] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [chiffreaffaires, setChiffreaffaires] = useState([]);
    const [user, setUser] = useState({});
    // const [users, setUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    //-------------------edit-----------------------//
    const [editingChiffreaffaire, setEditingChiffreaffaire] = useState(null); // State to hold the chiffreaffaire being edited
    const [editingChiffreaffaireId, setEditingChiffreaffaireId] = useState(null);

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterFormData, setFilterFormData] = useState({
       client_id:"",
    });
    const [isFiltering, setIsFiltering] = useState(false);

    const [isFilter, setIsFilter] = useState(false);



    //---------------form-------------------//

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        client_id: "",
    });

    const [expandedDetailsRows, setExpandedDetailsRows] = useState([]);
    const [expandedRows , setExpandedRows]=useState([]);
    const [formContainerStyle, setFormContainerStyle] = useState({ right: "-500px", });
    const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: "0px", });
    const tableHeaderStyle = {
        background: "#f2f2f2",
        padding: "10px",
        textAlign: "left",
        borderBottom: "1px solid #ddd",
    };

    const getClientNameById = (clientId) => {
        console.log("clients", clients);
        const client = clients.find((c) => c.id === clientId);
        return client ? client.raison_sociale : "";
    };

    const fetchChiffreaffaires = async () => {
        try {
            const responseFactures = await axios.get(
                "http://localhost:8000/api/factures");
            setFactures(responseFactures.data.facture);
            console.log("response",responseFactures);
            const response = await axios.get(
                "http://localhost:8000/api/chiffre-affaire");
            setChiffreaffaires(response.data.chiffres_affaires);
            console.log("response",response);
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
        fetchChiffreaffaires();
    }, []);

    useEffect(() => {
        const filtered =  chiffreaffaires.filter((chiffreaffaire) =>
            chiffreaffaire.client_id.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredChiffreaffaires(filtered);
    }, [chiffreaffaires, searchTerm]);

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


    const handleSelectAllChange = () => {
        setSelectAll(!selectAll);
        if (selectAll) {
            setSelectedItems([]);
        } else {
            setSelectedItems(chiffreaffaires.map((chiffreaffaire) => chiffreaffaire.id));
        }
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterFormData({
            ...filterFormData,
            [name]: value,
        });
    };

    const handleClientNameFilterSubmit = (e) => {
        e.preventDefault();

        const { clientName } = filterFormData;

        const filteredChiffreAffaires = chiffreaffaires.filter((chiffreaffaire) => {
            const client = getClientNameById(chiffreaffaire.client_id);
            return !clientName || client.toLowerCase().includes(clientName.toLowerCase());
        });

        setFilteredChiffreaffaires(filteredChiffreAffaires);

        if (filteredChiffreAffaires.length === 0) {
            Swal.fire({
                icon: "info",
                title: "Aucun résultat trouvé",
                text: "Veuillez ajuster vos filtres.",
            });
        }

        console.log("filterFormData:", filterFormData);
        console.log("filteredChiffreAffaires:", filteredChiffreAffaires);
        setShowFilterModal(false);
    };

    //------------------------- fournisseur print ---------------------//

    const PrintList = ({ tableId, title, recouvrementList , filtredrecouvrements  }) => {
        const handlePrint = () => {
            const printWindow = window.open("", "_blank", "");

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
            <title>${title}</title>
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
      <div class="container">
              <div class="page-header print-no-date m-2">${title}</div>
              <div class="content-wrapper">
                <table>
                  <thead>
                    <tr class="table-header">
                   
                      <th>Client</th>
                      <th>Numéro de Facture</th>
                      <th>Date De Facture</th>
                      <th>Montant de Facture</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${factures.map((facture) => `
                      <tr key=${facture.id}>
                        <td>${getClientNameById(
                            facture.client_id)}</td>
                        <td>${facture.reference}</td>
                        <td>${facture.date}</td>
                        <td>${facture.total_ttc}</td>

                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
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

        return (
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
                <FontAwesomeIcon icon={faPrint} className="me-2" />
            </button>
        );
    };
    //------------------------- fournisseur export to pdf ---------------------//

    const exportToPdf = () => {
        const pdf = new jsPDF();

        // Define the columns and rows for the table
        const columns = [
            "Client",
            "Numéro Facture",
            "Date de Facture",
            "Montant de Facture",
        ];
        const selectedChiffreaffaires = chiffreaffaires.filter((chiffreaffaire) =>
            selectedItems.includes(chiffreaffaire.numero_facture)
        );
        const rows = selectedChiffreaffaires.map((chiffreaffaire) => [
            chiffreaffaire.client_id,
            chiffreaffaire.numero_facture,
            chiffreaffaire.date_facture,
            chiffreaffaire.montant_facture,
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
        pdf.save("chiffreaffaires.pdf");
    };
    //------------------------- fournisseur export to excel ---------------------//

    const exportToExcel = () => {
        const selectedRecouvrements = chiffreaffaires.filter((chiffreaffaire) =>
            selectedItems.includes(chiffreaffaire.id)
        );
        const ws = XLSX.utils.json_to_sheet(selectedRecouvrements);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Recouvrements");
        XLSX.writeFile(wb, "chiffreaffaires.xlsx");
    };




    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ display: 'flex' }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    <Toolbar />

                    <div>
                        <h3>Chiffre D'Affaire </h3>
                        <div className="search-container d-flex flex-row-reverse mb-3">
                            <Search onSearch={handleSearch} />
                        </div>


                        <div className="d-flex align-items-start">
                            {isFilter && (
                                <div className="filter-container">
                                    <Form onSubmit={handleClientNameFilterSubmit}>
                                        <table className="table table-borderless">
                                            <thead>
                                            <tr>
                                                <th>Nom du Client</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>
                                                    <Form.Control
                                                        type="text"
                                                        name="clientName"
                                                        value={filterFormData.clientName}
                                                        onChange={handleFilterChange}
                                                        className="form-control form-control-sm"
                                                    />
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="primary"
                                                        type="submit"
                                                        className="btn-sm"
                                                    >
                                                        Appliquer le filtre par nom du client
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
                                if (isFilter) {
                                    // Annuler le filtrage
                                    setIsFilter(false);
                                    // Réinitialiser les données filtrées et les données de formulaire
                                    setFilterFormData(chiffreaffaires);
                                    setFilterFormData({
                                       client_id: "",
                                    });
                                } else {
                                    // Activer le filtrage
                                    setIsFilter(true);
                                }
                            }}
                            disabled={isFiltering && filterFormData.length === 0}
                        >
                            <FontAwesomeIcon
                                icon={faFilter}
                                style={{ verticalAlign: "middle" }}
                            />{" "}
                            {isFilter ? "Annuler le filtre" : "Filtrer"}
                        </Button>


                        <div className="d-flex flex-row justify-content-end">
                            <div className="btn-group col-2">
                                <PrintList
                                    tableId="chiffreaffaireTable"
                                    title="Liste des chiffre d'affaire"
                                    ChiffreAffaireList={chiffreaffaires}
                                    filtredchiffreaffaires={filteredChiffreaffaires}
                                />

                                <ExportPdfButton
                                    chiffreaffaires={chiffreaffaires}
                                    selectedItems={selectedItems}
                                />
                                <Button className="btn btn-success btn-sm ml-2" onClick={exportToExcel}>
                                    <FontAwesomeIcon icon={faFileExcel} />
                                </Button>
                            </div>
                        </div>
                        {/*<div id="formContainer" className="mt-2" style={formContainerStyle}>*/}
                        {/*    <Form className="col row" onSubmit={handleSubmit}>*/}
                        {/*        <Form.Label className="text-center m-2"><h5>{editingChiffreaffaire ? 'Modifier chiffreaffaire' : 'Ajouter un chiffreaffaire'}</h5></Form.Label>*/}
                        {/*        <Form.Group className="col-sm-5 m-2" controlId="client_id">*/}

                        {/*            <Form.Label>Client</Form.Label>*/}

                        {/*            <Form.Select*/}
                        {/*                name="client_id"*/}
                        {/*                value={formData.client_id}*/}
                        {/*                onChange={handleChange}*/}
                        {/*                className="form-select form-select-sm"*/}
                        {/*            >*/}
                        {/*                <option value="">Sélectionner un client</option>*/}
                        {/*                {clients.map((client) => (*/}
                        {/*                    <option key={client.id} value={client.id}>*/}
                        {/*                        {client.raison_sociale}*/}
                        {/*                    </option>*/}
                        {/*                ))}*/}
                        {/*            </Form.Select>*/}
                        {/*        </Form.Group>*/}


                        {/*        <Form.Group className="col m-3 text-center">*/}
                        {/*            <Button type="submit" className="btn btn-success col-6">*/}
                        {/*                {editingChiffreaffaire ? 'Modifier' : 'Ajouter'}*/}
                        {/*            </Button>*/}
                        {/*            <Button className="btn btn-secondary col-5 offset-1" onClick={closeForm}>Annuler</Button>*/}
                        {/*        </Form.Group>*/}
                        {/*    </Form>*/}
                        {/*</div>*/}

                        <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
                            <table className="table table-responsive table-bordered" id="chiffreaffaireTable">
                                <thead>
                                <tr>
                                        <th style={tableHeaderStyle}>
                                        <input type="checkbox" onChange={handleSelectAllChange} />
                                    </th>
                                    <th style={tableHeaderStyle}>Client</th>
                                    <th style={tableHeaderStyle}>N° Facture</th>
                                    <th style={tableHeaderStyle}>Total TTC</th>
                                    <th style={tableHeaderStyle}>Date de Facture</th>
                                    {/*<th style={tableHeaderStyle}>Action</th>*/}
                                </tr>
                                </thead>
                                <tbody>
                                {factures && factures.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((facture) => (

                                        <tr>
                                            <td></td>
                                            <td>

                                                {getClientNameById(
                                                    facture.client_id
                                                )}
                                            </td>
                                            <td>{facture.reference}</td>
                                            <td>{facture.total_ttc}</td>
                                            <td>{facture.date}</td>

                                        </tr>


                                ))}
                                </tbody>
                            </table>
                            {/*<Button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>*/}
                            {/*    <FontAwesomeIcon icon={faTrash} />*/}
                            {/*</Button>*/}
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredChiffreaffaires.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </div>

                    </div>
                    {/*     <div className="mt-4"> /!* Ajout de la classe mt-4 pour ajouter de la marge au-dessus *!/*/}
                    {/*    <div className="border p-3"> /!* Utilisation de la classe border et p-3 pour encadrer et ajouter du padding *!/*/}
                    {/*        <p><strong>Total des Montants des Factures:</strong> <span>{calculateTotalMontantfacture(chiffreaffaires)}</span></p>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                </Box>
            </Box>
        </ThemeProvider>

    );
};


export default ChiffreAffaireList;