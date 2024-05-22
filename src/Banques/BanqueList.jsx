import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {Form, Button, Table} from "react-bootstrap";
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

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);


    const [filteredBanques, setFilteredBanques] = useState([]);
    const [banques, setBanques] = useState([]);

    const [user, setUser] = useState({});
    // const [users, setUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    //-------------------edit-----------------------//
    const [editingBanque, setEditingBanque] = useState(null); // State to hold the banque being edited
    const [editingBanqueId, setEditingBanqueId] = useState(null);
    const [clients, setClients] = useState([]);
    const [factures, setFactures] = useState([]);
    const [filteredFactures, setFilteredFactures] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [existingLignEntrees, setExistingLigneEntrees] = useState([]);
    const [modifiedAvanceValues, setModifiedAvanceValues] = useState({});

    const [searchTerm, setSearchTerm] = useState("");

    const [clientId,setClientId] = useState(null);
    const [ligneEntrerComptes, setLigneEntrerComptes] = useState([]);


    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        client_id: "",
        numero_cheque: "",
        mode_de_paiement: "",
        datee: "",
        avance:{},
        Status:"",
        remarque: "",
        reference: {},
        total_ttc:{},
        date:{},
    });
    const [formContainerStyle, setFormContainerStyle] = useState({ right: "-100%", });
    const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: "0", });
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
    // const toggleRow = async (banque) => {
    //     if (expandedRows.includes(banque.id)) {
    //         setExpandedRows(expandedRows.filter((id) => id !== banque.id));
    //     } else {
    //         try {
    //             // Charger les lignes de factures pour la banque sélectionnée
    //             const lignes = ligneEntrerComptes; // Vous devez implémenter cette fonction
    //
    //             // Ajouter les lignes de factures spécifiques à la banque sélectionnée
    //             setExpandedRows([...expandedRows, ...lignes]);
    //         } catch (error) {
    //             console.error("Erreur lors de la récupération des lignes de Commandes :", error);
    //         }
    //     }
    // };

    const handleShowLigneEntreeCompte = async (banque) => {
        setExpandedRows((prevRows) =>
            prevRows.includes(banque)
                ? prevRows.filter((row) => row !== banque)
                : [...prevRows, banque]
        );
    };
    const fetchBanques = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/banques");
            setBanques(response.data.banques);
            console.log("API Response for Banques:", response.data.banques);

            const clientResponse = await axios.get("http://localhost:8000/api/clients");
            setClients(clientResponse.data.client);
            console.log("API Response for Clients:", clientResponse.data.client);

            const factureResponse = await axios.get("http://localhost:8000/api/factures");
            setFactures(factureResponse.data.facture);
            console.log("API Response for Factures:", factureResponse.data.facture);

            // Récupération des données depuis le nouvel endpoint
            const ligneEntrerCompteResponse = await axios.get("http://localhost:8000/api/ligneentrercompte");
            setLigneEntrerComptes(ligneEntrerCompteResponse.data.ligneentrercomptes);
            console.log("API Response for LigneEntrerCompte:", ligneEntrerCompteResponse.data.ligneentrercomptes);

        } catch (error) {
            console.error("Error fetching data:", error);

            // Afficher un message d'erreur à l'utilisateur
            Swal.fire({
                icon: 'error',
                title: 'Erreur!',
                text: 'Échec de la récupération des données.',
            });
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
    const handleClientSelection = (target) => {
        const clientId = target.value;
        setFormData({ ...formData, [target.name]: clientId });
    console.log("formData",formData);
        // Filtrer les factures en fonction de l'ID du client sélectionné
        const facturesForClient = factures.filter(facture => facture.client_id === parseInt(clientId) && facture.status != "reglee"  );
        setFilteredFactures(facturesForClient);
        console.log("filtered Factures",filteredFactures);
    };

    const handleAvanceChange = (factureId, montant) => {
        setFormData({
            ...formData,
            factures: {
                ...formData.factures,
                [factureId]: montant
            }
        });
    };







    const getReferenceByIdBanque = (banqueId) => {
        // Assuming you have a `clients` array containing client objects
        const ligneEntree = ligneEntrerComptes.filter((l) => l.entrer_comptes_id === banqueId);

console.log("ligne Entree",ligneEntree)
        // Check if the client is found
        if (ligneEntree) {
            const references = [];

            // Parcourir chaque entrée filtrée
            ligneEntree.forEach((entry) => {
                // Trouver les factures correspondant à l'entrée actuelle
                const invoice = factures.find((f) => f.id === entry.id_facture);
                console.log("invoice", invoice);
                references.push(invoice.reference);
                // Ajouter les références des factures trouvées au tableau de références
                // invoices.forEach((invoice) => {
                //     references.push(invoice.reference);
                // });
            });

            // Retourner le tableau de références des factures
            return references;
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const gettotalByIdBanque = (index,clientId,factureId) => {
        // Assuming you have a `clients` array containing client objects
        const ligneEntree = ligneEntrerComptes.filter((l) => l.id_facture === factureId && l.client_id === clientId);

        console.log("ligne Entree",ligneEntree)
        // Check if the client is found
        if (ligneEntree) {
            const total = [];
            let isFirstIndex = true;
            // Parcourir chaque entrée filtrée
            ligneEntree.forEach((entry, index) => {
                // Trouver les factures correspondant à l'entrée actuelle
                const invoice = factures.find((f) => f.id === entry.id_facture);
                if (isFirstIndex && invoice) {
                    total.push(invoice.total_ttc);
                    total.push(entry.restee);
                    isFirstIndex = false; // Update to mark that the first index is processed
                }
                else {
                    // console.log("invoice", invoice);

                    total.push(entry.restee);
                    console.log("total_ttc",total)
                }
                // Ajouter les références des factures trouvées au tableau de références
                // invoices.forEach((invoice) => {
                //     references.push(invoice.reference);
                // });

                // Add index to each entry
                entry.index = index;
                console.log(total);
            });


            // Retourner le tableau de références des factures
            return total;
        } else {
            return []; // or handle accordingly if client not found
        }
    };




    const getavanceByIdBanque = (banqueId) => {
        // Assuming you have a `clients` array containing client objects
        const ligneEntree = ligneEntrerComptes.filter((l) => l.entrer_comptes_id === banqueId);

        console.log("ligne Entree",ligneEntree)
        // Check if the client is found
        if (ligneEntree) {
            const avance = [];

            // Parcourir chaque entrée filtrée
            ligneEntree.forEach((entry) => {
                // Trouver les factures correspondant à l'entrée actuelle
                // const invoice = factures.find((f) => f.id === entry.id_facture);
                // console.log("invoice", invoice);
                avance.push(entry.avance);
                // Ajouter les références des factures trouvées au tableau de références
                // invoices.forEach((invoice) => {
                //     references.push(invoice.reference);
                // });
            });

            // Retourner le tableau de références des factures
            return avance;
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const getResteByIdBanque = (banqueId) => {
        // Assuming you have a `clients` array containing client objects
        const ligneEntree = ligneEntrerComptes.filter((l) => l.entrer_comptes_id === banqueId);

        console.log("ligne Entree",ligneEntree)
        // Check if the client is found
        if (ligneEntree) {
            const reste = [];

            // Parcourir chaque entrée filtrée
            ligneEntree.forEach((entry) => {
                // Trouver les factures correspondant à l'entrée actuelle
                // const invoice = factures.find((f) => f.id === entry.id_facture);
                // console.log("invoice", invoice);
                reste.push(entry.restee);
                // Ajouter les références des factures trouvées au tableau de références
                // invoices.forEach((invoice) => {
                //     references.push(invoice.reference);
                // });
            });

            // Retourner le tableau de références des factures
            return reste;
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const getDateByIdBanque = (banqueId) => {
        // Assuming you have a `clients` array containing client objects
        const ligneEntree = ligneEntrerComptes.filter((l) => l.entrer_comptes_id === banqueId);

        console.log("ligne Entree",ligneEntree)
        // Check if the client is found
        if (ligneEntree) {
            const dates = [];

            // Parcourir chaque entrée filtrée
            ligneEntree.forEach((entry) => {
                // Trouver les factures correspondant à l'entrée actuelle
                const invoice = factures.find((f) => f.id === entry.id_facture);
                console.log("invoice", invoice);
                dates.push(invoice.date);
                // Ajouter les références des factures trouvées au tableau de références
                // invoices.forEach((invoice) => {
                //     references.push(invoice.reference);
                // });
            });

            // Retourner le tableau de références des factures
            return dates;
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const getTotalTTc1ByIdBanque = (banqueId) => {
        // Assuming you have a `clients` array containing client objects
        const ligneEntree = ligneEntrerComptes.filter((l) => l.entrer_comptes_id === banqueId);

        console.log("ligne Entree",ligneEntree)
        // Check if the client is found
        if (ligneEntree) {
            const totalTtcs = [];

            // Parcourir chaque entrée filtrée
            ligneEntree.forEach((entry) => {
                // Trouver les factures correspondant à l'entrée actuelle
                const invoice = factures.find((f) => f.id === entry.id_facture);
                console.log("invoice", invoice);
                totalTtcs.push(invoice.total_ttc);
                // Ajouter les références des factures trouvées au tableau de références
                // invoices.forEach((invoice) => {
                //     references.push(invoice.reference);
                // });
            });

            // Retourner le tableau de références des factures
            return totalTtcs;
        } else {
            return []; // or handle accordingly if client not found
        }
    };
    const getReferenceByIdFacture = (factureId) => {
        // Assuming you have a `clients` array containing client objects
        console.log(factureId)
        const facture = factures.find((f) => f.id === factureId);
        console.
            log('factures',factures)
        console.
        log('facture',facture)
        // Check if the client is found
        if (facture) {
            // Assuming each client object has an `invoices` property which is an array

            return facture.reference;
        } else {
            return ""; // or handle accordingly if client not found
        }
    };
    const getAvanceByIdFacture = (factureId) => {
        // Assuming you have a `clients` array containing client objects
        console.log(factureId)
        const facture = factures.find((f) => f.id === factureId);
        console.
        log('factures',factures)
        console.
        log('facture',facture)
        // Check if the client is found
        if (facture) {
            // Assuming each client object has an `invoices` property which is an array

            return facture.avance;
        } else {
            return ""; // or handle accordingly if client not found
        }
    };
    const handleInputChange = (factureId, inputType, event) => {
        const newValue = event.target.value;
        if (inputType === "avance") {
            setModifiedAvanceValues((prev) => ({...prev, [factureId]: newValue}));
        }
    }
    const getAvancebyFacture = (clientId) => {
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
    const getDateFactureByIdClient = (clientId) => {
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
    const getAvanceByIdClient = (factureId) => {
        // Assuming you have a `clients` array containing client objects
        const facture = factures.find((c) => c.id === factureId);

        // Check if the client is found
        if (facture) {
            // Assuming each client object has an `invoices` property which is an array
            const ligneEntrees = facture.ligne_entrer_compte;
            console.log("ligneEntrees", ligneEntrees);
            // Return an array of invoice references or any other property you want
            return ligneEntrees.map((ligneEntree) => ligneEntree.avance);
        } else {
            return []; // or handle accordingly if client not found
        }
    };

    const gettotalttcByIdFacture = (factureId) => {
        // Assuming you have a `clients` array containing client objects
        console.log(factureId)
        const facture = factures.find((f) => f.id === factureId);
        console.
        log('factures',factures)
        console.
        log('facture',facture)
        // Check if the client is found
        if (facture) {
            // Assuming each client object has an `invoices` property which is an array

            return facture.total_ttc;
        } else {
            return "fff"; // or handle accordingly if client not found
        }
    };

    const getDateFactureByIdFacture = (factureId) => {
        // Assuming you have a `clients` array containing client objects
        console.log(factureId)
        const facture = factures.find((f) => f.id === factureId);
        console.
        log('factures',factures)
        console.
        log('facture',facture)
        // Check if the client is found
        if (facture) {
            // Assuming each client object has an `invoices` property which is an array

            return facture.date;
        } else {
            return ""; // or handle accordingly if client not found
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

    const handleChange = (event) => {
        console.log("handleChange called");
        // Extraction des données du champ de formulaire modifié
        const { name, value } = event.target;

        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));

        // Mise à jour de l'état du formulaire avec la nouvelle valeur sélectionnée
        setFormData({ ...formData, [name]: value });


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

    const getElementValueById = (id) => {
        return document.getElementById(id)?.value || "";
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

try{
        if(editingBanque){
            const banquesData = {
                numero_cheque: formData.numero_cheque,
                mode_de_paiement: formData.mode_de_paiement,
                datee: formData.datee,
                Status: formData.Status,
                remarque: formData.remarque,
                client_id: formData.client_id,
            };
            const banqueResponse = await axios.put(
                `http://localhost:8000/api/banques/${editingBanque.id}`,
                banquesData,

            );
            console.log(banqueResponse)
            let isFirstTime = true;
            const selectedFacturesData = editingBanque.ligne_entrer_compte.map((selectedligneEntree) => {
                // let restee; // Variable to hold the remaining amount
                const avance = getElementValueById(`avance_${selectedligneEntree.id}`)
                // if (isFirstTime) {
                //     // For the first time, take the total TTC as restee
                //     restee = gettotalttcByIdFacture(selectedligneEntree.id_facture);
                //     isFirstTime = false; // Set the flag to false for subsequent iterations
                // } else {
                //     // For subsequent times, subtract avance from the previous restee
                //     restee = restee - getElementValueById(`avance_${selectedligneEntree.id_facture}`);
                // }

            const reste = parseFloat(gettotalttcByIdFacture(selectedligneEntree.id_facture)) - avance


                return {
                    id:selectedligneEntree.id,
                    client_id:formData.client_id,
                    entrer_comptes_id: editingBanque.id,
                    id_facture: selectedligneEntree.id_facture,
                    avance: avance,
                    restee: reste,

                };
            });
            console.log("selectedFacturesData", selectedFacturesData);
            for (const ligneEntreBanques of selectedFacturesData) {
                console.log("ligneEntreBanques", ligneEntreBanques);
                await axios.put(
                    `http://localhost:8000/api/ligneentrercompte/${ligneEntreBanques.id}`,
                    ligneEntreBanques,

                );
            }
        }else {

                console.log('editingBanque',editingBanque)
                const banquesData = {
                    numero_cheque: formData.numero_cheque,
                    mode_de_paiement: formData.mode_de_paiement,
                    datee: formData.datee,
                    Status: formData.Status,
                    remarque: formData.remarque,
                    client_id: formData.client_id,
                };
                const banqueResponse = await axios.post(
                    "http://localhost:8000/api/banques",
                    banquesData,

                );
                console.log(banqueResponse)

                const selectedFacturesData = filteredFactures.map((selectedFacture) => {
                    const avance = getElementValueById(`avance_${selectedFacture.id}`);
                    console.log("totalTTC",gettotalttcByIdFacture(selectedFacture.id))
                    const restee = gettotalttcByIdFacture(selectedFacture.id) - avance;
                    return {
                        client_id:formData.client_id,
                        entrer_comptes_id: banqueResponse.data.banque.id,
                        id_facture: selectedFacture.id,
                        avance: avance,
                        restee: restee,

                    };
                });
                console.log("selectedFacturesData", selectedFacturesData);
                for (const ligneEntreBanques of selectedFacturesData) {

                    console.log("avance", ligneEntreBanques.avance);
                    if (ligneEntreBanques.avance !== "") {
                        await axios.post(
                            "http://localhost:8000/api/ligneentrercompte",
                            ligneEntreBanques,
                        );
                    }
                }
        }


            // Afficher une alerte de succès
            Swal.fire({
                icon: 'success',
                title: 'Succès!',
                text: 'Données ajoutées avec succès.',
            });

            fetchBanques();
        } catch (error) {
            console.error('Error:', error);

            // Afficher une alerte d'erreur
            Swal.fire({
                icon: 'error',
                title: 'Erreur!',
                text: 'Échec de l\'ajout des données.',
            });
        }

    };

    //------------------------- banque EDIT---------------------//

    const handleEdit = async (banques) => {
        setEditingBanque(banques); // Set the banques to be edited

        try {

            setFormData({
                client_id: banques.client_id,
                numero_cheque: banques.numero_cheque,
                mode_de_paiement: banques.mode_de_paiement,
                datee: banques.datee,
                Status: banques.Status,
                remarque: banques.remarque,
                reference: banques.reference,
                total_ttc: banques.total_ttc,
                date: banques.date,
                avance: banques.avance,
            });
            const facturesForClient = factures.filter(facture => facture.client_id === parseInt(banques.client_id) && facture.status != "regler"  );
            setFilteredFactures(facturesForClient);
            // Show the form and adjust styles
            if (formContainerStyle.right === '-100%') {
                setFormContainerStyle({ right: '0' });
                setTableContainerStyle({ marginRight: '100%' });
            } else {
                closeForm();
            }
        } catch (error) {
            console.error("Error fetching facture data:", error);
            // Handle error
        }
    };

    useEffect(() => {
        if (editingBanqueId !== null) {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '100%' });
        }
    }, [editingBanqueId]);


    //------------------------- banque SUBMIT---------------------//

    useEffect(() => {
        fetchBanques();
    }, []);




    //------------------------- banque FORM---------------------//



    const handleShowFormButtonClick = () => {
        if (formContainerStyle.right === '-100%') {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '3000px' });
        } else {
            closeForm();
        }
    };
    const populateProductInputs = (factureId, inputType) => {
        //console.log("ligneCommandes", existingLigneCommandes);
        if(editingBanque) {
            const existingLigneEntree = ligneEntrerComptes.find(
                (ligneEntree) => ligneEntree.id_facture === factureId
            );

            if (existingLigneEntree) {
                return existingLigneEntree[inputType];
            }
        }
        return "";
    };
    const closeForm = () => {
        setFilteredFactures([]);
        setFormContainerStyle({ right: '-100%' });
        setTableContainerStyle({ marginRight: '0' });
        setShowForm(false); // Hide the form
        setFormData({ // Clear form data
            client_id: '',

            numero_cheque: '',
            mode_de_paiement: '',
            datee: '',

            Montant:'',
            Status:'',
            remarque: '',
            reference: {},
            total_ttc:{},
            date:{},
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
                        <h3>Entrer Banques</h3>
                        <div className="search-container d-flex flex-row-reverse " role="search">
                            <Search onSearch={handleSearch} type="search" />
                        </div>
                        <Button
                            id="showFormButton"
                            onClick={handleShowFormButtonClick}
                            style={{ backgroundColor: 'white', color: 'black' }}
                        >
                            <IoIosPersonAdd  style={{ fontSize: '24px' }} />
                            {/*{showForm ? "Modifier le formulaire" : <IoIosPersonAdd />}*/}
                        </Button>
                        <div id="formContainer" className="mt-2" style={formContainerStyle}>
                            <Form className="col row" onSubmit={handleSubmit}>
                                <Form.Label className="text-center m-2"><h5>{editingBanque ? 'Modifier ' : 'Ajouter '}</h5></Form.Label>
                                <Form.Group className="col-sm-5 m-2" controlId="client_id">

                                    <Form.Label>Client</Form.Label>
                                    <Form.Select
                                        name="client_id"
                                        value={formData.client_id}
                                        onChange={(e) => handleClientSelection(e.target)}
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


                                <Form.Group className="col-sm-10 m-2">
                                    <Form.Label>N° de Chéque</Form.Label>
                                    <Form.Control type="text" placeholder="Numéro de Facture" name="numero_cheque" value={formData.numero_cheque} onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="col-sm-4 m-2">
                                    <Form.Label>Mode de Paiement</Form.Label>
                                    <Form.Control as="select" name="mode_de_paiement" value={formData.mode_de_paiement} onChange={handleChange}>
                                        <option value="">Sélectionner un mode de paiement</option>
                                        <option value="Effet">Effet</option>
                                        <option value="Chéque">Chéque</option>
                                        <option value="Espèce">Espèce</option>
                                        <option value="Garantie">Garantie</option>
                                        <option value="Virement">Virement</option>
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group className="col-sm-4 m-2">
                                    <Form.Label>date </Form.Label>
                                    <Form.Control type="date" placeholder="datee" name="datee" value={formData.datee} onChange={handleChange} />
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
                                {/*<Form.Group className="col m-3 text-center">*/}
                                {/*    <Button type="submit" className="btn btn-success col-6">*/}
                                {/*        {editingBanque ? 'Modifier' : 'Ajouter'}*/}
                                {/*    </Button>*/}
                                {/*    <Button className="btn btn-secondary col-5 offset-1" onClick={closeForm}>Annuler</Button>*/}
                                {/*</Form.Group>*/}

                                <div className="col-md-12">
                                    <Form.Group controlId="selectedFactureTable">
                                        <Form.Label>Factures du client sélectionné:</Form.Label>
                                        <Table striped bordered hover>
                                            <thead>
                                            <tr>
                                                <th>Numéro de Facture</th>
                                                <th>Total TTC</th>
                                                <th>Date de Facture</th>
                                                <th>Avance</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {filteredFactures.map((facture, index) => (
                                                <tr key={index}>
                                                    <td>{facture.reference}</td>
                                                    <td>{facture.total_ttc}</td>
                                                    <td>{facture.date}</td>
                                                    <td>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Montant"
                                                                id={`avance_${facture.id}`}
                                                                name={`avance_${facture.id}`}
                                                                value={
                                                                    modifiedAvanceValues[facture.id] ||
                                                                    populateProductInputs(facture.id, "avance")
                                                                }
                                                                onChange={(event) =>
                                                                    handleInputChange(facture.id, "avance", event)
                                                                }
                                                            />
                                                        </td>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                    </Form.Group>
                                </div>
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
                                <thead>
                                <tr>
                                    <th style={tableHeaderStyle}>
                                        <input type="checkbox" onChange={handleSelectAllChange} />
                                    </th>
                                    <th style={tableHeaderStyle}>Client</th>
                                    <th style={tableHeaderStyle}>N° de Facture</th>
                                    <th style={tableHeaderStyle}>Total TTC</th>
                                    <th style={tableHeaderStyle}>Date de Facture</th>

                                    <th style={tableHeaderStyle}>N° de Chéque</th>
                                    <th style={tableHeaderStyle}>Mode de Paiement</th>
                                    <th style={tableHeaderStyle}>date</th>
                                    <th style={tableHeaderStyle}>Avance</th>
                                    <th style={tableHeaderStyle}>Reste</th>
                                    <th style={tableHeaderStyle}>Status</th>
                                    <th style={tableHeaderStyle}>Remarque</th>
                                    <th style={tableHeaderStyle}>Action</th>
                                </tr>
                                </thead>
                               <tbody>
                               {filteredBanques && filteredBanques.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((banques,index) => (


                                   <React.Fragment key={banques.id}>

                                       <tr>
                                           <td>

                                           </td>
                                           <td>

                                               {getClientNameById(
                                                   banques.client_id
                                               )}
                                           </td>
                                           <td>
                                           {getReferenceByIdBanque(banques.id).length > 1
                                               ?  <button
                                                   className="btn btn-sm btn-light"
                                                   onClick={() => handleShowLigneEntreeCompte(banques.id)}
                                               >
                                                   <FontAwesomeIcon
                                                       icon={
                                                           expandedRows.includes(banques.id)
                                                               ? faMinus
                                                               : faPlus
                                                       }
                                                   />
                                               </button>
                                               : ""}

                                               {banques.ligne_entrer_compte.length > 0 && banques.ligne_entrer_compte[0].id_facture ?
                                                   getReferenceByIdFacture(banques.ligne_entrer_compte[0].id_facture)
                                                   : ""}
                                           </td>
                                           <td>
                                           {/*    {gettotalByIdBanque*/}
                                           {/*(banques.id,banques.ligne_entrer_compte[index].id_facture,banques.ligne_entrer_compte[index].client_id)[0]}*/}
                                               {banques.ligne_entrer_compte.map((ligneEntreCompte) => (
                                                   // Assuming gettotalByIdBanque is dependent on the ligne_entrer_compte index
                                                   getTotalTTc1ByIdBanque(
                                                       banques.id,

                                                   )[0]
                                               ))}
                                           </td>
                                           <td>{getDateByIdBanque(banques.id)[0]}</td>
                                           <td>{banques.numero_cheque}</td>
                                           <td>{banques.mode_de_paiement}</td>
                                           <td>{banques.datee}</td>
                                           <td>{getavanceByIdBanque(banques.id)[0]}</td>
                                           <td>
                                               {getResteByIdBanque(banques.id)[index]}
                                              </td>
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
                                               <td colSpan="12">
                                                   <div>
                                                       <table className="table table-bordered" style={{ fontSize: "0.9rem" }}>
                                                           <thead>
                                                           <tr>
                                                               <th style={tableHeaderStyle}>N° Facture</th>
                                                               <th style={tableHeaderStyle}>Total TTC</th>
                                                               <th style={tableHeaderStyle}>Date</th>
                                                               <th style={tableHeaderStyle}>Avance</th>
                                                               <th style={tableHeaderStyle}>Reste</th>
                                                           </tr>
                                                           </thead>
                                                           <tbody>
                                                           {banques.ligne_entrer_compte.map((ligneEntreCompte) => (

                                                               // Vérifiez si une avance a été saisie pour cette facture
                                                               ligneEntreCompte.avance !== null &&
                                                               ligneEntreCompte.avance !== "" && (
                                                                   <tr key={ligneEntreCompte.id}>
                                                                       <td>
                                                                           {getReferenceByIdFacture(
                                                                               ligneEntreCompte.id_facture
                                                                           )}
                                                                       </td>
                                                                       <td>
                                                                           {gettotalttcByIdFacture(
                                                                               ligneEntreCompte.id_facture
                                                                           )}
                                                                       </td>
                                                                       <td>
                                                                           {getDateFactureByIdFacture(
                                                                               ligneEntreCompte.id_facture
                                                                           )}
                                                                       </td>
                                                                       <td>{ligneEntreCompte.avance}</td>
                                                                       <td>{ligneEntreCompte.restee}</td>
                                                                   </tr>
                                                               )
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

                            {/*<TablePagination*/}
                            {/*    rowsPerPageOptions={[5, 10, 25]}*/}
                            {/*    component="div"*/}
                            {/*    count={filteredBanques.length}*/}
                            {/*    rowsPerPage={rowsPerPage}*/}
                            {/*    page={page}*/}
                            {/*    onPageChange={handleChangePage}*/}
                            {/*    onRowsPerPageChange={handleChangeRowsPerPage}*/}
                            {/*/>*/}
                        </div>
                    </div>


                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default BanqueList;