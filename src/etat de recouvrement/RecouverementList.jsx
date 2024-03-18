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
const RecouverementList = () => {



        const [recouvrements, setRecouvrements] = useState([]);




    // const [existingFournisseur, setExistingFournisseur] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRecouvrements, setFilteredRecouvrements] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [user, setUser] = useState({});
    // const [users, setUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    //-------------------edit-----------------------//
    const [editingRecouverement, setEditingRecouverement] = useState(null); // State to hold the recouverement being edited
    const [editingRecouverementId, setEditingRecouverementId] = useState(null);

    const [clients, setClients] = useState([]);
    const [expandedDetailsRows, setExpandedDetailsRows] = useState([]);
   const [expandedRows , setExpandedRows]=useState([]);
    const [totalTTC, setTotalTTC] = useState(0);
    const [showAvanceDetails, setShowAvanceDetails] = useState(false);


        //---------------form-------------------//
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        client: "",
        reste: "",
    });
    const [formContainerStyle, setFormContainerStyle] = useState({ right: "-500px", });
    const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: "0px", });
    const tableHeaderStyle = {
        background: "#f2f2f2",
        padding: "10px",
        textAlign: "left",
        borderBottom: "1px solid #ddd",
    };


    const fetchRecouvrements = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/etat-recouvrements");
            setRecouvrements(response.data.etat_recouvrements);
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
        fetchRecouvrements();
    }, []);

    useEffect(() => {
        const filtered =  recouvrements&&recouvrements.filter((recouverement) =>
            recouverement.client_id.toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
        setFilteredRecouvrements(filtered);
    }, [recouvrements, searchTerm]);

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
    //------------------------- recouverement Delete Selected ---------------------//

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
                        .delete(`http://localhost:8000/api/etat-recouvrements/${id}`)
                        .then((response) => {
                            fetchRecouvrements();
                            Swal.fire({
                                icon: "success",
                                title: "Succès!",
                                text: 'recouverement supprimé avec succès.',
                            });
                        })
                        .catch((error) => {
                            console.error(
                                "Erreur lors de la suppression du recouverement:", error);
                            Swal.fire({
                                icon: "error",
                                title: "Erreur!",
                                text: 'Échec de la suppression du recouverement.',
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
            setSelectedItems(recouvrements.map((recouverement) => recouverement.id));
        }
    };
    const getClientNameById = (clientId) => {
        console.log("clients", clients);
        const client = clients.find((c) => c.id === clientId);
        return client ? client.raison_sociale : "";
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
    const calculateTotalMontant = (clientId) => {
        const client = clients.find((c) => c.id === clientId); // Trouver le client
        if (client) {
            const invoices = client.invoices; // Récupérer les factures du client
            const totalMontant = invoices.reduce((total, invoice) => {
                // Ajouter le montant TTC de chaque facture au total
                return total + parseFloat(invoice.total_ttc);
            }, 0);
            return totalMontant;
        } else {
            return 0; // Retourner 0 si le client n'est pas trouvé
        }
    };


    const getDatedeBanqueByIdClient = (clientId) => {
        // Assuming you have a `clients` array containing client objects
        const client = clients.find((c) => c.id === clientId);

        // Check if the client is found
        if (client) {
            // Assuming each client object has an `invoices` property which is an array
            const banques = client.banques;
            console.log("banques", banques);
            // Return an array of invoice references or any other property you want
            return banques.map((banques) => banques.datee);
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const getModepaiementdeBanqueByIdClient = (clientId) => {
        // Assuming you have a `clients` array containing client objects
        const client = clients.find((c) => c.id === clientId);

        // Check if the client is found
        if (client) {
            // Assuming each client object has an `invoices` property which is an array
            const banques = client.banques;
            console.log("banques", banques);
            // Return an array of invoice references or any other property you want
            return banques.map((banques) => banques.mode_de_paiement);
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const getAvancedeBanqueByIdClient = (clientId) => {
        // Assuming you have a `clients` array containing client objects
        const client = clients.find((c) => c.id === clientId);

        // Check if the client is found
        if (client) {
            // Assuming each client object has an `invoices` property which is an array
            const banques = client.banques;
            console.log("banques", banques);
            // Return an array of invoice references or any other property you want
            return banques.map((banques) => banques.Montant);
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const calculerTotalMontantBanques = (clientId) => {
        const montants = getAvancedeBanqueByIdClient(clientId);
        const total = montants.reduce((acc, montant) => acc + montant, 0);
        return total;
    };
        // Fonction pour calculer la somme totale des montants TTC

    //------------------------- fournisseur print ---------------------//

    const printList = (tableId, title, recouverementList) => {
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
                ${Array.isArray(recouverementList)
                    ? recouverementList.map((item) => `<li>${item}</li>`).join("")
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
            "Numéro",
            "Client",
            "Numéro Facture",
            "Date de Facture",
            "Montant",
            "Reste",
            "Avance"
        ];
        const selectedRecouvrements = recouvrements.filter((recouverement) =>
            selectedItems.includes(recouverement.numero)
        );
        const rows = selectedRecouvrements.map((recouverement) => [
            recouverement.id,
            recouverement.client_id,
            recouverement.reste,

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
        pdf.save("recouvrements.pdf");
    };
    //------------------------- fournisseur export to excel ---------------------//

    const exportToExcel = () => {
        const selectedRecouvrements = recouvrements.filter((recouverement) =>
            selectedItems.includes(recouverement.id)
        );
        const ws = XLSX.utils.json_to_sheet(selectedRecouvrements);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Recouvrements");
        XLSX.writeFile(wb, "recouvrements.xlsx");
    };

    //------------------------- recouverement Delete---------------------//
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Êtes-vous sûr de vouloir supprimer ce recouverement ?',
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
                    .delete(`http://localhost:8000/api/etat-recouvrements/${id}`)
                    .then((response) => {
                        if (response.data) {
                            // Successful deletion
                            fetchRecouvrements();
                            Swal.fire({
                                icon: 'success',
                                title: 'Succès!',
                                text: "recouverement supprimé avec succès",
                            });
                        } else if (response.data.error) {
                            // Error occurred
                            if (response.data.error.includes("Impossible de supprimer ou de mettre à jour une ligne parent : une contrainte de clé étrangère échoue")) {
                                // Violated integrity constraint error
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Erreur!',
                                    text: "Impossible de supprimer le recouverement car il a des produits associés.",
                                });
                            }
                        }
                    })
                    .catch((error) => {
                        // Request error
                        console.error("Erreur lors de la suppression du recouverement:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur!',
                            text: `Échec de la suppression du recouverement. Veuillez consulter la console pour plus d'informations.`,
                        });
                    });
            } else {
                console.log("Suppression annulée");
            }
        });
    }
    //------------------------- Recouverement EDIT---------------------//

    const handleEdit = (recouvrements) => {
        setEditingRecouverement(recouvrements); // Set the recouvrements to be edited
        // Populate form data with recouvrements details
        setFormData({
            client: recouvrements.client_id,
            reste: recouvrements.reste,

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
        if (editingRecouverementId !== null) {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '500px' });
        }
    }, [editingRecouverementId]);

    //------------------------- recouverement SUBMIT---------------------//

    useEffect(() => {
        fetchRecouvrements();
    }, []);

    const handleSubmit =  (e) => {
        e.preventDefault();
        // Calculating the value of "reste"
        const reste = parseFloat(formData.total_ttc) - parseFloat(formData.Montant);
        // Updating the "reste" field in formData
        const updatedFormData = { ...formData, reste };

        const url = editingRecouverement ? `http://localhost:8000/api/etat-recouvrements/${editingRecouverement.id}` : 'http://localhost:8000/api/etat-recouvrements';
        const method = editingRecouverement ? 'put' : 'post';
        axios({
            method: method,
            url: url,
            data: updatedFormData,
        }).then(() => {
            fetchRecouvrements();
            Swal.fire({
                icon: 'success',
                title: 'Succès!',
                text: `recouverement ${editingRecouverement ? 'modifié' : 'ajouté'} avec succès.`,
            });
            setFormData({
                client_id: '',

                // user_id: '',
            });
            setEditingRecouverement(null); // Clear editing recouverement
            // closeForm();
        })
            .catch((error) => {
                console.error(`Erreur lors de ${editingRecouverement ? 'la modification' : "l'ajout"} du recouverement:`, error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur!',
                    text: `Échec de ${editingRecouverement ? 'la modification' : "l'ajout"} du recouverement.`,
                });
            });
        if (formContainerStyle.right === "-500px") {
            setFormContainerStyle({ right: "0" });
            setTableContainerStyle({ marginRight: "500px" });
        } else {
            closeForm();
        }
    };

   // ------------------------- recouverement FORM---------------------//
    const calculateTotalAvance = (recouvrements) => {
        console.log("recouvrements", recouvrements);
        if (recouvrements && Array.isArray(recouvrements)) {
            return recouvrements.reduce((total, recouvrement) => {
                return total + parseFloat(recouvrement.Montant);
            }, 0);
        } else {
            return 0; // Retourner une valeur par défaut si recouvrements n'est pas un tableau défini
        }
    };

    const calculateTotalMontantHt = (recouvrements) => {
        console.log("recouvrements", recouvrements);
        if (recouvrements && Array.isArray(recouvrements)) {
            return recouvrements.reduce((total, recouvrement) => {
                return total + parseFloat(recouvrement.total_ttc);
            }, 0);
        } else {
            return 0; // Retourner une valeur par défaut si recouvrements n'est pas un tableau défini
        }
    };

    const calculateTotalReste = (recouvrements) => {
        console.log("recouvrements", recouvrements);
        if (recouvrements && Array.isArray(recouvrements)) {
            return recouvrements.reduce((total, recouvrement) => {
                return total + parseFloat(recouvrement.reste);
            }, 0);
        } else {
            return 0; // Retourner une valeur par défaut si recouvrements n'est pas un tableau défini
        }
    };



    const handleShowFormButtonClick = () => {
        if (formContainerStyle.right === '-500px') {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '500px' });
        } else {
            closeForm();
        }
    };
    const toggleDetailsRow = async (clientID) => {
        if (expandedDetailsRows.includes(clientID)) {
            setExpandedDetailsRows(expandedDetailsRows.filter((id) => id !== clientID));
        } else {
            try {
                // Récupérer les autres détails associés à ce client
                const otherDetails = await fetchRecouvrements(clientID);

                // Mettre à jour l'état pour inclure les autres détails récupérés
                setClients((prevClients) =>
                    prevClients.map((client) =>
                        client.id === clientID
                            ? { ...client, otherDetails }
                            : client
                    )
                );

                // Ajouter l'ID du client aux lignes étendues pour les autres détails
                setExpandedDetailsRows([...expandedDetailsRows, clientID]);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des autres détails :",
                    error
                );
            }
        }
    };
    const toggleRow = async (Clients) => {
        if (expandedRows.includes(Clients)) {
            setExpandedRows(expandedRows.filter((id) => id !== Clients));
        } else {
            try {
                // Récupérer les lignes de Commandes associées à ce Commandes
                const facture = await fetchRecouvrements(Clients);

                // Mettre à jour l'état pour inclure les lignes de Commandes récupérées
                setClients((prevClients) =>
                    prevClients.map((Clients) =>
                        Clients.id === Clients
                            ? { ...Clients, recouvrements }
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

    const closeForm = () => {
        setFormContainerStyle({ right: '-500px' });
        setTableContainerStyle({ marginRight: '0' });
        setShowForm(false); // Hide the form
        setFormData({ // Clear form data
            client_id: '',
            reste: '',
            // user_id: '',
        });
        setEditingRecouverement(null); // Clear editing recouverement
    };

    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ display: 'flex' }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    <Toolbar />

                    <div>
                        <h3>Liste des Recouvrements</h3>
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
                                    tableId="recouverementTable"
                                    title="Liste des recouvrement"
                                    RecouvrementList={recouvrements}
                                    filtredrecouvrements={filteredRecouvrements}
                                />

                                <ExportPdfButton
                                    recouvrements={recouvrements}
                                    selectedItems={selectedItems}
                                />
                                <Button className="btn btn-success btn-sm ml-2" onClick={exportToExcel}>
                                    <FontAwesomeIcon icon={faFileExcel} />
                                </Button>
                            </div>
                        </div>
                        <div id="formContainer" className="mt-2" style={formContainerStyle}>
                            <Form className="col row" onSubmit={handleSubmit}>
                                <Form.Label className="text-center m-2"><h5>{editingRecouverement ? 'Modifier recouverement' : 'Ajouter un recouverement'}</h5></Form.Label>
                                {/*<Form.Group className="col-sm-5 m-2 ">*/}
                                {/*    <Form.Label>N°</Form.Label>*/}
                                {/*    <Form.Control type="text" placeholder="Numero" name="numero" value={formData.numero} onChange={handleChange} />*/}
                                {/*</Form.Group>*/}
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
                                        {editingRecouverement ? 'Modifier' : 'Ajouter'}
                                    </Button>
                                    <Button className="btn btn-secondary col-5 offset-1" onClick={closeForm}>Annuler</Button>
                                </Form.Group>
                            </Form>
                        </div>

                        <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
                            <table className="table table-responsive table-bordered " id="recouverementTable">
                                <thead >
                                <tr>
                                    <th style={tableHeaderStyle}>
                                        <input type="checkbox" onChange={handleSelectAllChange} />
                                    </th>
                                    <th style={tableHeaderStyle}>Client</th>
                                    <th style={tableHeaderStyle}>Montant</th>
                                    <th style={tableHeaderStyle}>Avance</th>
                                    <th style={tableHeaderStyle}>Reste</th>
                                    <th style={tableHeaderStyle}>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredRecouvrements && filteredRecouvrements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((recouvrements) => (
                                    <React.Fragment key={recouvrements.id}>
                                        <tr>
                                            <td></td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-light"
                                                    onClick={() => toggleRow(recouvrements.id)}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            expandedRows.includes(recouvrements.id)
                                                                ? faMinus
                                                                : faPlus
                                                        }
                                                    />
                                                </button>
                                                {getClientNameById(
                                                    recouvrements.client_id
                                                )}
                                            </td>

                                            <td>{calculateTotalMontant(recouvrements)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-light ml-2"
                                                    onClick={() => toggleDetailsRow(recouvrements.id)}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            expandedDetailsRows.includes(recouvrements.id)
                                                                ? faMinus
                                                                : faPlus
                                                        }
                                                    />
                                                </button>
                                                {calculerTotalMontantBanques(recouvrements)}
                                            </td>
                                            <td>{recouvrements.reste}</td>
                                            <td className="d-inline-flex">
                                                <Button className="btn btn-sm btn-info m-1" onClick={() => handleEdit(recouvrements)}>
                                                    <i className="fas fa-edit"></i>
                                                </Button>
                                                <Button className="btn btn-danger btn-sm m-1" onClick={() => handleDelete(recouvrements.id)}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button>
                                            </td>
                                        </tr>

                                        {expandedRows.includes(recouvrements.id) && (
                                            <tr>
                                                <td colSpan="8">
                                                    <div>
                                                        <table className="table table-bordered" style={{ fontSize: '0.9rem' }}>
                                                            <thead>
                                                            <tr>
                                                                <th>N° Facture</th>
                                                                <th>Total TTC</th>
                                                                <th>Date de Facture</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {getReferenceByIdClient(recouvrements.client_id).map((facture, index) => (
                                                                <tr key={index}>
                                                                    <td>{facture}</td>
                                                                    <td>{gettotalttcByIdClient(recouvrements.client_id)[index]}</td>
                                                                    <td>{getDatedeFactureByIdClient(recouvrements.client_id)[index]}</td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                        {expandedDetailsRows.includes(recouvrements.id) && (
                                            <tr>
                                                <td colSpan="6">
                                                    <div>
                                                        <table className="table table-bordered">
                                                            <thead>
                                                            <tr>
                                                                <th>Montant</th>
                                                                <th>Date</th>
                                                                <th>Mode de paiement</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {getDatedeBanqueByIdClient(recouvrements.client_id).map((date, index) => (
                                                                <tr key={index}>
                                                                    <td>{getAvancedeBanqueByIdClient(recouvrements.client_id)[index]}</td>
                                                                    <td>{date}</td>
                                                                    <td>{getModepaiementdeBanqueByIdClient(recouvrements.client_id)[index]}</td>
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
                                count={filteredRecouvrements.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </div>
                    </div>
                    <div className="mt-4"> {/* Ajout de la classe mt-4 pour ajouter de la marge au-dessus */}
                        <div className="border p-3"> {/* Utilisation de la classe border et p-3 pour encadrer et ajouter du padding */}
                            <p><strong>Total à recouvrer:</strong> <span>{calculateTotalMontantHt(recouvrements)}</span></p>
                            <p><strong>Total recouvré:</strong> <span>{calculateTotalAvance(recouvrements)}</span></p>
                            <p><strong>Reste à recouvrer:</strong> <span>{calculateTotalReste(recouvrements)}</span></p>
                        </div>
                    </div>

                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default RecouverementList;