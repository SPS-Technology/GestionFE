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
    const [banques, setBanques] = useState([]);
    const [factures, setFactures] = useState([]);


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
    const [ligneEntrerComptes, setLigneEntrerComptes] = useState([]);


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
            const responseFactures = await axios.get(
                "http://localhost:8000/api/factures");
            setFactures(responseFactures.data.facture);
            console.log("response",responseFactures);

            const responseLigneentrer = await axios.get(
                "http://localhost:8000/api/ligneentrercompte");
            setLigneEntrerComptes(responseLigneentrer.data.ligneentrercomptes);
            console.log("lignenetrecomptes",responseLigneentrer.data.ligneentrercomptes);

            const responsebanques = await axios.get(
                "http://localhost:8000/api/banques");
            setBanques(responsebanques.data.banques);
            console.log("banques",responsebanques.data.banques);

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


    // Fonction pour calculer le total des valeurs TTC des factures pour un client donné
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
    const getAvanceByIdClient = (clientId) => {
        // Assuming you have a `clients` array containing client objects
        const client = clients.find((c) => c.id === clientId);

        // Check if the client is found
        if (client) {
            // Assuming each client object has an `invoices` property which is an array
            const ligneEntrees = client.ligne_entrer_compte;
            console.log("ligneEntrees", ligneEntrees);
            // Return an array of invoice references or any other property you want
            return ligneEntrees.map((ligneEntree) => ligneEntree.avance);
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const getResteByIdClient = (clientId) => {
        // Assuming you have a `clients` array containing client objects
        const client = clients.find((c) => c.id === clientId);

        // Check if the client is found
        if (client) {
            // Assuming each client object has an `invoices` property which is an array
            const ligneEntrees = client.ligne_entrer_compte;
            console.log("ligneEntrees", ligneEntrees);
            // Return an array of invoice references or any other property you want
            return ligneEntrees.map((ligneEntree) => ligneEntree.restee);
        } else {
            return []; // or handle accordingly if client not found
        }
    };

    // Calcul du total des total_ttc affichés pour un client donné
    const calculateTotalTTCByIdClient = (clientId) => {
        const total_ttc_list = gettotalttcByIdClient(clientId);
        // Additionner tous les total_ttc
        const total = total_ttc_list.reduce((acc, val) => acc + parseFloat(val), 0);
        return total;
    };



    const getDatedeBanqueByIdClient = (clientId) => {
        // Assuming you have a `clients` array containing client objects
        const client = clients.find((c) => c.id === clientId);

        // Check if the client is found
        if (client) {
            // Assuming each client object has an `invoices` property which is an array
            const banques = client.entrer_comptes;
            console.log("banques", banques);
            // Return an array of invoice references or any other property you want
            return banques.map((banques) => banques.datee);
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const getnumerochequedeBanqueByIdClient = (clientId) => {
        // Assuming you have a `clients` array containing client objects
        const client = clients.find((c) => c.id === clientId);

        // Check if the client is found
        if (client) {
            // Assuming each client object has an `invoices` property which is an array
            const banques = client.entrer_comptes;
            console.log("banques", banques);
            // Return an array of invoice references or any other property you want
            return banques.map((banques) => banques.numero_cheque);
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
            const banques = client.entrer_comptes;
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
            const banques = client.entrer_comptes;
            console.log("banques", banques);
            // Return an array of invoice references or any other property you want
            return banques.map((banques) => banques.Montant);
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const calculateTotalAvanceByIdClient = (clientId) => {
        const total_avance_list = getAvancedeBanqueByIdClient(clientId);
        // Additionner tous les total_ttc
        const totale = total_avance_list.reduce((acc, val) => acc + parseFloat(val), 0);
        return totale;
    };
    const calculateResteByIdClient = (clientId) => {
        const totalTTC = gettotalttcByIdClient(clientId);
        const avance = getAvanceByIdClient(clientId);

        const reste = totalTTC - avance;
        return reste;
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
     <div class="page-header print-no-date">${title}</div>
    <div class="content-wrapper">
      <table>
        <thead>
          <tr>
                        <th>Client</th>
                        <th >N°Facture</th>
                        <th>Date de Facture</th>
                        <th>Montant TTC</th>
                        <th>Avance</th>
                        <th>Reste</th>
                        <th>N° Chéque</th>
                        <th>Mode paiement</th>
                        <th>Date Entrer compte</th>
          </tr>
        </thead>
        <tbody>
          ${clients.map((client) => `
            <tr key=${client.id}>
              <td>${client.raison_sociale}</td>
              <td>${getReferenceByIdClient(client.id)}</td>
              <td>${getDatedeBanqueByIdClient(client.id)}</td>
              <td>${gettotalttcByIdClient(client.id)}</td>
              <td>${getAvanceByIdClient(client.id)}</td>
              <td>${getResteByIdClient(client.id)}</td>
              <td>${getnumerochequedeBanqueByIdClient(client.id)}</td>
              <td>${getModepaiementdeBanqueByIdClient(client.id)}</td>
              <td>${getDatedeBanqueByIdClient(client.id)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
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
    const handleShowDetails = async (banque) => {
        setExpandedRows((prevRows) =>
            prevRows.includes(banque)
                ? prevRows.filter((row) => row !== banque)
                : [...prevRows, banque]
        );
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


                        <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
                            <table className="table table-responsive table-bordered " id="recouverementTable">
                                <thead >
                                <tr>
                                    <th style={tableHeaderStyle}>
                                        <input type="checkbox" onChange={handleSelectAllChange} />
                                    </th>
                                    <th style={tableHeaderStyle}>Client</th>
                                    <th style={tableHeaderStyle}>N°Facture</th>
                                    <th style={tableHeaderStyle}>Date de Facture</th>
                                    <th style={tableHeaderStyle}>Montant TTC</th>
                                    <th style={tableHeaderStyle}>Avance</th>
                                    <th style={tableHeaderStyle}>Reste</th>
                                    <th style={tableHeaderStyle}>N° Chéque</th>
                                    <th style={tableHeaderStyle}>Mode paiement</th>
                                    <th style={tableHeaderStyle}>Date Entrer compte</th>
                                </tr>
                                </thead>
                                <tbody>
                                {factures && factures.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((facture) => {
                                    const ligneEntreCompte = ligneEntrerComptes.find(
                                        (ligneEntree) => ligneEntree.id_facture === facture.id
                                    );

                                    const banquesFacture = banques.filter(
                                        (banque) => banque.ligne_entrer_compte.some(entry => entry.id_facture === facture.id)
                                    );

                                    console.log('banquesFacture:', banquesFacture);

                                    return (
                                        <React.Fragment key={facture.id}>
                                            {/* Ajoutez une condition pour afficher uniquement si une avance a été saisie */}
                                            {ligneEntreCompte && ligneEntreCompte.avance !== null && ligneEntreCompte.avance !== "" && (
                                                <tr>
                                                    <td></td>
                                                    <td>{facture.client.raison_sociale}</td>
                                                    <td>{facture.reference}</td>
                                                    <td>{facture.date}</td>
                                                    <td>{facture.total_ttc}</td>
                                                    <td>{ligneEntreCompte ? ligneEntreCompte.avance : "N/A"}</td>
                                                    <td>{ligneEntreCompte ? ligneEntreCompte.restee : "N/A"}</td>
                                                    <td>
                                                        {banquesFacture.length > 0 ? (
                                                            <React.Fragment>
                                                                <div>{banquesFacture[0].numero_cheque}</div>
                                                                {banquesFacture.length > 1 && (
                                                                    <button
                                                                        className="btn btn-sm btn-light"
                                                                        onClick={() => toggleRow(facture.id)}
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                expandedRows.includes(facture.id)
                                                                                    ? faMinus
                                                                                    : faPlus
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                            </React.Fragment>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>


                                                    <td>
                                                        {banquesFacture.length > 0 ? (
                                                            <div>{banquesFacture[0].mode_de_paiement}</div>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>
                                                    <td>
                                                        {banquesFacture.length > 0 ? (
                                                            <div>{banquesFacture[0].datee}</div>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>
                                                </tr>
                                            )}

                                            {expandedRows.includes(facture.id) && (
                                                <tr key={facture.id + '-expanded'}>
                                                    <td colSpan="12">
                                                        <div>
                                                            <table className="table table-bordered" style={{ fontSize: '0.9rem' }}>
                                                                <thead>
                                                                <tr>
                                                                    <th style={tableHeaderStyle}>N° chéque</th>
                                                                    <th style={tableHeaderStyle}>Mode de paiement</th>
                                                                    <th style={tableHeaderStyle}>Date</th>
                                                                    <th style={tableHeaderStyle}>Avance</th> {/* Ajout de la colonne Avance */}
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {banquesFacture.map((banque, index) => {
                                                                    // Trouver la ligneEntrerCompte correspondante à cette facture
                                                                    const ligneEntrerCompteForFacture = ligneEntrerComptes.find(
                                                                        (ligneEntree) => ligneEntree.id_facture === facture.id
                                                                    );

                                                                    return (
                                                                        <tr key={index}>
                                                                            <td>{banque.numero_cheque}</td>
                                                                            <td>{banque.mode_de_paiement}</td>
                                                                            <td>{banque.datee}</td>
                                                                            <td>
                                                                                {ligneEntrerCompteForFacture ? ligneEntrerCompteForFacture.avance : "N/A"}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}

                                        </React.Fragment>
                                    );
                                })}
                                </tbody>





                            </table>
                            {/*<Button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>*/}
                            {/*    <FontAwesomeIcon icon={faTrash} />*/}
                            {/*</Button>*/}
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
                    {/*<div className="mt-4"> /!* Ajout de la classe mt-4 pour ajouter de la marge au-dessus *!/*/}
                    {/*    <div className="border p-3"> /!* Utilisation de la classe border et p-3 pour encadrer et ajouter du padding *!/*/}
                    {/*        <p><strong>Total à recouvrer:</strong> <span>{calculateTotalTTCByIdClient(recouvrements.client_id)}</span></p>*/}
                    {/*        <p><strong>Total recouvré:</strong> <span> {calculateTotalAvanceByIdClient(recouvrements.client_id)}</span></p>*/}
                    {/*        <p><strong>Reste à recouvrer:</strong> <span>{calculateResteByIdClient(recouvrements.client_id)}</span></p>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default RecouverementList;