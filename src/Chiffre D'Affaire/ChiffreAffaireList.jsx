import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import "../style.css";
import Navigation from "../Acceuil/Navigation";
import Search from "../Acceuil/Search";
import TablePagination from '@mui/material/TablePagination';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrash, faFilePdf, faFileExcel, faPrint, faPlus, faMinus,} from "@fortawesome/free-solid-svg-icons";
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


    const calculateTotalMontantfacture = (chiffreaffaires) => {
        console.log("chiffreaffaires", chiffreaffaires);
        return chiffreaffaires.reduce((total, chiffreaffaires) => {
            return total + parseFloat(chiffreaffaires.montant_facture);
        }, 0);
    };
    // const handleCalculateTotalAvance = () => {
    //     alert(`Total des avances: ${totalAvance}`);
    // };

    // const handleCalculateTotalReste = () => {
    //     alert(`Total du reste: ${totalReste}`);
    // };

    // const [existingFournisseur, setExistingFournisseur] = useState([]);
    const getClientNameById = (clientId) => {
        console.log("clients", clients);
        const client = clients.find((c) => c.id === clientId);
        return client ? client.raison_sociale : "";
    };
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
    //------------------------- chiffreaffaire Delete Selected ---------------------//

    const handleDeleteSelected = () => {
        Swal.fire({
            title: 'Êtes-vous sûr de vouloir supprimer ?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Oui',
            denyButtonText: 'Non',
            customClass: {
                actions: 'my-actions',
                cancelButton: 'order-1 right-gap',
                confirmButton: 'order-2',
                denyButton: 'order-3',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                selectedItems.forEach((id) => {
                    axios
                        .delete(`http://localhost:8000/api/chiffre-affaire/${id}`)
                        .then((response) => {
                            fetchChiffreaffaires();
                            Swal.fire({
                                icon: "success",
                                title: "Succès!",
                                text: 'chiffreaffaire supprimé avec succès.',
                            });
                        })
                        .catch((error) => {
                            console.error(
                                "Erreur lors de la suppression du chiffreaffaire:", error);
                            Swal.fire({
                                icon: "error",
                                title: "Erreur!",
                                text: 'Échec de la suppression du chiffreaffaire.',
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
            setSelectedItems(chiffreaffaires.map((chiffreaffaire) => chiffreaffaire.id));
        }
    };
    //------------------------- fournisseur print ---------------------//

    const printList = (tableId, title, chiffreaffaireList) => {
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
                ${Array.isArray(chiffreaffaireList)
                    ? chiffreaffaireList.map((item) => `<li>${item}</li>`).join("")
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

    //------------------------- chiffreaffaire Delete---------------------//
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Êtes-vous sûr de vouloir supprimer ce chiffreaffaire ?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Oui',
            denyButtonText: 'Non',
            customClass: {
                actions: 'my-actions',
                cancelButton: 'order-1 right-gap',
                confirmButton: 'order-2',
                denyButton: 'order-3',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`http://localhost:8000/api/chiffre-affaire/${id}`)
                    .then((response) => {
                        if (response.data) {
                            // Successful deletion
                            fetchChiffreaffaires();
                            Swal.fire({
                                icon: 'success',
                                title: 'Succès!',
                                text: "chiffreaffaire supprimé avec succès",
                            });
                        } else if (response.data.error) {
                            // Error occurred
                            if (response.data.error.includes("Impossible de supprimer ou de mettre à jour une ligne parent : une contrainte de clé étrangère échoue")) {
                                // Violated integrity constraint error
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Erreur!',
                                    text: "Impossible de supprimer le chiffreaffaire car il a des produits associés.",
                                });
                            }
                        }
                    })
                    .catch((error) => {
                        // Request error
                        console.error("Erreur lors de la suppression du chiffreaffaire:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur!',
                            text: `Échec de la suppression du chiffreaffaire. Veuillez consulter la console pour plus d'informations.`,
                        });
                    });
            } else {
                console.log("Suppression annulée");
            }
        });
    }
    //------------------------- chiffreaffaire EDIT---------------------//

    const handleEdit = (chiffreaffaires) => {
        setEditingChiffreaffaire(chiffreaffaires); // Set the chiffreaffaires to be edited
        // Populate form data with chiffreaffaires details
        setFormData({
            client_id: chiffreaffaires.client_id,
        });
        if (formContainerStyle.right === '-500px') {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '500px' });
        } else {
            closeForm();
        }
        // Show form
        // setShowForm(true);
    };
    useEffect(() => {
        if (editingChiffreaffaireId !== null) {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '500px' });
        }
    }, [editingChiffreaffaireId]);

    //------------------------- chiffreaffaire SUBMIT---------------------//

    useEffect(() => {
        fetchChiffreaffaires();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingChiffreaffaire ? `http://localhost:8000/api/chiffre-affaire/${editingChiffreaffaire.id}` : 'http://localhost:8000/api/chiffre-affaire';
        const method = editingChiffreaffaire ? 'put' : 'post';
        axios({
            method: method,
            url: url,
            data: formData,
        }).then(() => {
            fetchChiffreaffaires();
            Swal.fire({
                icon: 'success',
                title: 'Succès!',
                text: `chiffre d'affaire ${editingChiffreaffaire ? 'modifié' : 'ajouté'} avec succès.`,
            });

            // Effacer le formulaire
            setFormData({
                client_id: '',

            });

            setEditingChiffreaffaire(null); // Clear editing fournisseur
            // closeForm();
        })
        .catch((error) => {
                console.error(`Erreur lors de ${editingChiffreaffaire ? 'la modification' : "l'ajout"} du chiffre d'affaire:`, error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur!',
                    text: `Échec de ${editingChiffreaffaire ? 'la modification' : "l'ajout"} du chiffre d'affaire.`,
                });
            });
            if (formContainerStyle.right === "-500px") {
                setFormContainerStyle({ right: "0" });
                setTableContainerStyle({ marginRight: "500px" });
            } else {
                closeForm();
            }
        };

        //------------------------- chiffreaffaire FORM---------------------//

    const handleShowFormButtonClick = () => {
        if (formContainerStyle.right === '-500px') {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '500px' });
        } else {
            closeForm();
        }
    };
    const toggleRow = async (Clients) => {
        if (expandedRows.includes(Clients)) {
            setExpandedRows(expandedRows.filter((id) => id !== Clients));
        } else {
            try {
                // Récupérer les lignes de Commandes associées à ce Commandes
                const facture = await fetchChiffreaffaires(Clients);

                // Mettre à jour l'état pour inclure les lignes de Commandes récupérées
                setClients((prevClients) =>
                    prevClients.map((Clients) =>
                        Clients.id === Clients
                            ? { ...Clients, chiffreaffaires }
                            : Clients
                    )
                );

                // Ajouter l'ID du Commandes aux lignes étendues
                setExpandedRows([...expandedRows, Clients]);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des lignes de Commandes :",
                    error
                );
            }
        }
    };
    const gettotalttcByIdClient = (clientId) => {
        // Assuming you have a `clients` array containing client objects
        const client = clients.find((c) => c.id === clientId);

        // Check if the client is found
        if (client) {
            // Assuming each client object has an `invoices` property which is an array
            const invoices = client.invoices;
            console.log("invoices", invoices);
            // Return an array of invoice references or any other property you want
            return invoices.map((invoice) => invoice.total_ttc);
        } else {
            return []; // or handle accordingly if client not found
        }
    };

    const getReferenceByIdClient = (clientId) => {
        // Assuming you have a `clients` array containing client objects
        const client = clients.find((c) => c.id === clientId);

        // Check if the client is found
        if (client) {
            // Assuming each client object has an `invoices` property which is an array
            const invoices = client.invoices;
            console.log("invoices", invoices);
            // Return an array of invoice references or any other property you want
            return invoices.map((invoice) => invoice.reference);
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const getDatedeFactureByIdClient = (clientId) => {
        // Assuming you have a `clients` array containing client objects
        const client = clients.find((c) => c.id === clientId);

        // Check if the client is found
        if (client) {
            // Assuming each client object has an `invoices` property which is an array
            const invoices = client.invoices;
            console.log("invoices", invoices);
            // Return an array of invoice references or any other property you want
            return invoices.map((invoice) => invoice.date);
        } else {
            return []; // or handle accordingly if client not found
        }
    };


    const closeForm = () => {
        setFormContainerStyle({ right: '-500px' });
        setTableContainerStyle({ marginRight: '0' });
        setShowForm(false); // Hide the form
        setFormData({ // Clear form data
            client_id: '',

        });
        setEditingChiffreaffaire(null); // Clear editing chiffreaffaire
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
                        <Button
                            id="showFormButton"
                            onClick={handleShowFormButtonClick}
                            style={{ backgroundColor: 'white', color: 'black' }}
                        >
                            <IoIosPersonAdd  style={{ fontSize: '24px' }} />
                            {/*{showForm ? "Modifier le formulaire" : <IoIosPersonAdd />}*/}
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
                        <div id="formContainer" className="mt-2" style={formContainerStyle}>
                            <Form className="col row" onSubmit={handleSubmit}>
                                <Form.Label className="text-center m-2"><h5>{editingChiffreaffaire ? 'Modifier chiffreaffaire' : 'Ajouter un chiffreaffaire'}</h5></Form.Label>
                                <Form.Group className="col-sm-5 m-2" controlId="client_id">

                                    <Form.Label>Client</Form.Label>

                                    <Form.Select
                                        name="client_id"
                                        value={formData.client_id}
                                        onChange={handleChange}
                                        className="form-select form-select-sm"
                                    >
                                        <option value="">Sélectionner un client</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.raison_sociale}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>


                                <Form.Group className="col m-3 text-center">
                                    <Button type="submit" className="btn btn-success col-6">
                                        {editingChiffreaffaire ? 'Modifier' : 'Ajouter'}
                                    </Button>
                                    <Button className="btn btn-secondary col-5 offset-1" onClick={closeForm}>Annuler</Button>
                                </Form.Group>
                            </Form>
                        </div>

                        <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
                            <table className="table table-responsive table-bordered" id="chiffreaffaireTable">
                                <thead>
                                <tr>
                                    <th style={tableHeaderStyle}>
                                        <input type="checkbox" onChange={handleSelectAllChange} />
                                    </th>
                                    <th style={tableHeaderStyle}>Client</th>
                                    <th>N° Facture</th>
                                    <th>Total TTC</th>
                                    <th>Date de Facture</th>
                                    <th style={tableHeaderStyle}>Action</th>
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

                                            <td className="d-inline-flex">
                                                <Button className="btn btn-sm btn-info m-1" onClick={() => handleEdit(facture)}>
                                                    <i className="fas fa-edit"></i>
                                                </Button>
                                                <Button className="btn btn-danger btn-sm m-1" onClick={() => handleDelete(facture.id)}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button>
                                            </td>
                                        </tr>


                                ))}
                                </tbody>
                            </table>
                            <Button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
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