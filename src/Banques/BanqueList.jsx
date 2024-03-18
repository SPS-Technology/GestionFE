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
const BanqueList = () => {

    const [banques, setBanques] = useState([]);
    const [filteredBanques, setFilteredBanques] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [user, setUser] = useState({});
    // const [users, setUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    //-------------------edit-----------------------//
    const [editingBanque, setEditingBanque] = useState(null); // State to hold the banque being edited
    const [editingBanqueId, setEditingBanqueId] = useState(null);
    const [clients, setClients] = useState([]);
    const [factures, setFactures] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);


    const [searchTerm, setSearchTerm] = useState("");












    //---------------form-------------------//
    const [showFormSC, setShowFormSC] = useState(false);

    const [formDataSC, setFormDataSC] = useState({  client_id: '',
        numero_cheque: '',
        mode_de_paiement: '',
        datee: '',
        remarque: '', });

    const [formContainerStyleSC, setFormContainerStyleSC] = useState({ right: '-500px' });

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        client_id: "",
        numero_cheque: "",
        mode_de_paiement: "",
        datee: "",
        Montant:"",
        Status:"",
        remarque: "",
    });
    const [formContainerStyle, setFormContainerStyle] = useState({ right: "-500px", });
    const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: "0px", });
    const tableHeaderStyle = {
        background: "#f2f2f2",
        padding: "10px",
        textAlign: "left",
        borderBottom: "1px solid #ddd",
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const toggleRow = async (Clients) => {
        if (expandedRows.includes(Clients)) {
            setExpandedRows(expandedRows.filter((id) => id !== Clients));
        } else {
            try {
                // Récupérer les lignes de Commandes associées à ce Commandes
                const facture = await fetchBanques(Clients);

                // Mettre à jour l'état pour inclure les lignes de Commandes récupérées
                setClients((prevClients) =>
                    prevClients.map((Clients) =>
                        Clients.id === Clients
                            ? { ...Clients, factures }
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
    const fetchBanques = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/banques");
            setBanques(response.data.banques);
            console.log("response",response);
            const clientResponse = await axios.get(
                "http://localhost:8000/api/clients"
            );
            console.log("API Response for Clients:", clientResponse.data.client);
            setClients(clientResponse.data.client);

            const factureResponse = await axios.get(
                "http://localhost:8000/api/factures"
            );
            console.log("API Response for Factures:", factureResponse.data.facture);
            setFactures(factureResponse.data.facture);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchBanques();
    }, []);

    useEffect(() => {
        const filtered =  banques&&banques.filter((banque) =>
            banque.remarque
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
        setFilteredBanques(filtered);
    }, [banques, searchTerm]);


    const getClientNameById = (clientId) => {
        console.log("clients", clients);
        const client = clients.find((c) => c.id === clientId);
        return client ? client.raison_sociale : "";
    };



    const getFactureNameById = (id_facture) => {
        console.log("factures", factures);
        const facture = factures.find((c) => c.id === id_facture);
        return facture ? facture.reference : "";
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
    //------------------------- banque Delete Selected ---------------------//

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
                        .delete(`http://localhost:8000/api/banques/${id}`)
                        .then((response) => {
                            fetchBanques();
                            Swal.fire({
                                icon: "success",
                                title: "Succès!",
                                text: 'banque supprimé avec succès.',
                            });
                        })
                        .catch((error) => {
                            console.error(
                                "Erreur lors de la suppression du banque:", error);
                            Swal.fire({
                                icon: "error",
                                title: "Erreur!",
                                text: 'Échec de la suppression du banque.',
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
            setSelectedItems(banques.map((banque) => banque.id));
        }
    };
    //------------------------- fournisseur print ---------------------//

    const printList = (tableId, title, banqueList) => {
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
                ${Array.isArray(banqueList)
                    ? banqueList.map((item) => `<li>${item}</li>`).join("")
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
            "Numéro de Facture",
            "Numéro de chéque",
            "Mode de Paiement",
            "date",
            "Montant",
            "Status",
            "Remarque",
        ];
        const selectedBanques = banques.filter((banque) =>
            selectedItems.includes(banque.numero)
        );
        const rows = selectedBanques.map((banque) => [
            banque.client_id,

            banque.numero_cheque,
            banque.mode_de_paiement,
            banque.datee,
            banque.Montant,
            banque.Status,
            banque.remarque,
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
        pdf.save("banques.pdf");
    };
    //------------------------- fournisseur export to excel ---------------------//

    const exportToExcel = () => {
        const selectedBanques = banques.filter((banque) =>
            selectedItems.includes(banque.id)
        );
        const ws = XLSX.utils.json_to_sheet(selectedBanques);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Recouvrements");
        XLSX.writeFile(wb, "banques.xlsx");
    };

    //------------------------- banque Delete---------------------//
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Êtes-vous sûr de vouloir supprimer ce banque ?',
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
                    .delete(`http://localhost:8000/api/banques/${id}`)
                    .then((response) => {
                        if (response.data) {
                            // Successful deletion
                            fetchBanques();
                            Swal.fire({
                                icon: 'success',
                                title: 'Succès!',
                                text: "banque supprimé avec succès",
                            });
                        } else if (response.data.error) {
                            // Error occurred
                            if (response.data.error.includes("Impossible de supprimer ou de mettre à jour une ligne parent : une contrainte de clé étrangère échoue")) {
                                // Violated integrity constraint error
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Erreur!',
                                    text: "Impossible de supprimer le banque car il a des produits associés.",
                                });
                            }
                        }
                    })
                    .catch((error) => {
                        // Request error
                        console.error("Erreur lors de la suppression du banque:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur!',
                            text: `Échec de la suppression du banque. Veuillez consulter la console pour plus d'informations.`,
                        });
                    });
            } else {
                console.log("Suppression annulée");
            }
        });
    }
    //------------------------- banque EDIT---------------------//

    const handleEdit = (banques) => {
        setEditingBanque(banques); // Set the banques to be edited
        // Populate form data with banques details
        setFormData({
            client: banques.client_id,

            numero_cheque: banques.numero_cheque,
            mode_de_paiement: banques.mode_de_paiement,
            datee: banques.datee,
            Montant:banques.Montant,
            Status:banques.Status,
            remarque: banques.remarque,

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
        if (editingBanqueId !== null) {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '500px' });
        }
    }, [editingBanqueId]);

    //------------------------- banque SUBMIT---------------------//

    useEffect(() => {
        fetchBanques();
    }, []);

    const handleSubmit =  (e) => {
        e.preventDefault();
        const url = editingBanque ? `http://localhost:8000/api/banques/${editingBanque.id}` : 'http://localhost:8000/api/banques';
        const method = editingBanque ? 'put' : 'post';
        axios({
            method: method,
            url: url,
            data: formData,
        }).then(() => {
            fetchBanques();
            Swal.fire({
                icon: 'success',
                title: 'Succès!',
                text: `banque ${editingBanque ? 'modifié' : 'ajouté'} avec succès.`,
            });
            setFormData({
                client_id: "",

                numero_cheque: "",
                mode_de_paiement: "",
                datee: "",
                Montant:"",
                Status:"",
                remarque: "",
            });
            setEditingBanque(null); // Clear editing banque
            // closeForm();
        })
            .catch((error) => {
                console.error(`Erreur lors de ${editingBanque ? 'la modification' : "l'ajout"} du banque:`, error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur!',
                    text: `Échec de ${editingBanque ? 'la modification' : "l'ajout"} du banque.`,
                });
            });
        if (formContainerStyle.right === "-500px") {
            setFormContainerStyle({ right: "0" });
            setTableContainerStyle({ marginRight: "500px" });
        } else {
            closeForm();
        }
    };

    //------------------------- banque FORM---------------------//



    const handleShowFormButtonClick = () => {
        if (formContainerStyle.right === '-500px') {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '500px' });
        } else {
            closeForm();
        }
    };

    const closeForm = () => {
        setFormContainerStyle({ right: '-500px' });
        setTableContainerStyle({ marginRight: '0' });
        setShowForm(false); // Hide the form
        setFormData({ // Clear form data
            client_id: '',
            reference: '',
            numero_cheque: '',
            mode_de_paiement: '',
            datee: '',
            total_ttc:'',
            Montant:'',
            Status:'',
            remarque: '',
        });
        setEditingBanque(null); // Clear editing banque
    };

    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ display: 'flex' }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    <Toolbar />

                    <div>
                        <h3>Banques</h3>
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
                                    tableId="banqueTable"
                                    title="Liste des recouvrement"
                                    BanqueList={banques}
                                    filtredbanques={filteredBanques}
                                />

                                <ExportPdfButton
                                    banques={banques}
                                    selectedItems={selectedItems}
                                />
                                <Button className="btn btn-success btn-sm ml-2" onClick={exportToExcel}>
                                    <FontAwesomeIcon icon={faFileExcel} />
                                </Button>
                            </div>
                        </div>
                        <div id="formContainer" className="mt-2" style={formContainerStyle}>
                            <Form className="col row" onSubmit={handleSubmit}>
                                <Form.Label className="text-center m-2"><h5>{editingBanque ? 'Modifier ' : 'Ajouter '}</h5></Form.Label>
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

                                {/*<Form.Group className="col-sm-5 m-2" controlId="client_id">*/}

                                {/*    <Form.Label>Numero de Facture</Form.Label>*/}

                                {/*    <Form.Select*/}
                                {/*        name="id_facture"*/}
                                {/*        value={formData.reference}*/}
                                {/*        onChange={handleChange}*/}
                                {/*        className="form-select form-select-sm"*/}
                                {/*    >*/}
                                {/*        <option value="">Sélectionner une Facture </option>*/}
                                {/*        {factures.map((facture) => (*/}
                                {/*            <option key={facture.id} value={facture.id}>*/}
                                {/*                {facture.reference}*/}
                                {/*            </option>*/}
                                {/*        ))}*/}
                                {/*    </Form.Select>*/}
                                {/*</Form.Group>*/}

                                <Form.Group className="col-sm-10 m-2">
                                    <Form.Label>N° de Chéque</Form.Label>
                                    <Form.Control type="text" placeholder="Numéro de Facture" name="numero_cheque" value={formData.numero_cheque} onChange={handleChange} />
                                </Form.Group>
                                {/*<Form.Group className="col-sm-4 m-2">*/}
                                {/*    <Form.Label>Mode de Paiement</Form.Label>*/}
                                {/*    <Form.Control as="select" name="mode_de_paiement" value={formData.mode_de_paiement} onChange={handleChange}>*/}
                                {/*        <option value="">Sélectionner un mode de paiement</option>*/}
                                {/*        <option value="espece">Espèce</option>*/}
                                {/*        <option value="cheque">Chèque</option>*/}
                                {/*        <option value="carte_bancaire">Carte Bancaire</option>*/}
                                {/*    </Form.Control>*/}
                                {/*</Form.Group>*/}
                                <Form.Group className="col-sm-4 m-2">
                                    <Form.Label>Mode de Paiement</Form.Label>
                                    <Form.Control as="select" name="mode_de_paiement" value={formData.mode_de_paiement} onChange={handleChange}>
                                        <option value="">Sélectionner un mode de paiement</option>
                                        <option value="Chèque">Chèque</option>
                                        <option value="Espèce">Espèce</option>
                                        <option value="Garantie">Garantie</option>
                                        <option value="Virement">Virement</option>
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group className="col-sm-4 m-2">
                                    <Form.Label>date </Form.Label>
                                    <Form.Control type="date" placeholder="datee" name="datee" value={formData.datee} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="col-sm-4 m-2">
                                    <Form.Label>Montant </Form.Label>
                                    <Form.Control type="text" placeholder="Montant" name="Montant" value={formData.Montant} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="col-sm-5 m-2">
                                    <Form.Label>Status </Form.Label>
                                    <Form.Control as="select" name="Status" value={formData. Status} onChange={handleChange}>
                                        <option value="">Sélectionner le statut</option>
                                        <option value="En attente">En attente</option>
                                        <option value="En cours de traitement">En cours de traitement</option>
                                        <option value="Résolue">Résolue</option>
                                        <option value="Fermée">Fermée</option>
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group className="col-sm-4 m-2">
                                    <Form.Label>Remarque </Form.Label>
                                    <Form.Control type="text" placeholder="remarque" name="remarque" value={formData.remarque} onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="col m-3 text-center">
                                    <Button type="submit" className="btn btn-success col-6">
                                        {editingBanque ? 'Modifier' : 'Ajouter'}
                                    </Button>
                                    <Button className="btn btn-secondary col-5 offset-1" onClick={closeForm}>Annuler</Button>
                                </Form.Group>
                            </Form>
                        </div>

                        <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
                            <table className="table table-responsive table-bordered " id="banqueTable">
                                <thead >
                                <tr>
                                    <th style={tableHeaderStyle}>
                                        <input type="checkbox" onChange={handleSelectAllChange} />
                                    </th>
                                    <th style={tableHeaderStyle}>Client</th>
                                    {/*<th style={tableHeaderStyle}>N° de Facture</th>*/}
                                    <th style={tableHeaderStyle}>N° de Chéque</th>
                                    <th style={tableHeaderStyle}>Mode de Paiement</th>
                                    <th style={tableHeaderStyle}>date</th>
                                    <th style={tableHeaderStyle}>Montant</th>
                                    <th style={tableHeaderStyle}>Status</th>
                                    <th style={tableHeaderStyle}>Remarque</th>
                                    <th style={tableHeaderStyle}>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredBanques && filteredBanques.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((banques) => (
                                    <React.Fragment key={banques.id}>
                                        <tr>
                                            <td>

                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-light"
                                                    onClick={() => toggleRow(banques.id)}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            expandedRows.includes(banques.id)
                                                                ? faMinus
                                                                : faPlus
                                                        }
                                                    />
                                                </button>
                                                {getClientNameById(
                                                    banques.client_id
                                                )}
                                            </td>
                                        <td>{banques.numero_cheque}</td>
                                        <td>{banques.mode_de_paiement}</td>
                                        <td>{banques.datee}</td>
                                            <td>{banques.Montant}</td>
                                         <td>{banques.Status}</td>
                                        <td>{banques.remarque}</td>
                                        <td className="d-inline-flex">
                                            <Button className="btn btn-sm btn-info m-1" onClick={() => handleEdit(banques)}>
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button className="btn btn-danger btn-sm m-1" onClick={() => handleDelete(banques.id)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>

                                        {expandedRows.includes(banques.id) && (
                                            <tr>
                                                <td colSpan="8">
                                                    <div>
                                                        <table className="table table-bordered" style={{ fontSize: '0.9rem' }}>
                                                            <thead>
                                                            <tr>
                                                                <th>N° Facture</th>
                                                                <th>Total TTC</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {getReferenceByIdClient(banques.client_id).map((facture, index) => (
                                                                <tr key={index}>
                                                                    <td>{facture}</td>
                                                                    <td>{gettotalttcByIdClient(banques.client_id)[index]}</td>
                                                                </tr>
                                                            ))}
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



                            <Button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
                                <FontAwesomeIcon icon={faTrash} /></Button>

                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredBanques.length}
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

export default BanqueList;