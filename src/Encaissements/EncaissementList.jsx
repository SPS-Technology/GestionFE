import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {Form, Button, Table} from "react-bootstrap";
import "../style.css";
import Navigation from "../Acceuil/Navigation";
import Search from "../Acceuil/Search";
import TablePagination from '@mui/material/TablePagination';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrash, faFilePdf, faFileExcel, faPrint, faPlus,} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import {IoIosPersonAdd} from "react-icons/io";
// import ExportPdfButton from "./ExportPdfButton";
// import PrintList from "./PrintList";
const EncaissementList = () => {

    const [comptes, setComptes] = useState([]);
    const [filteredBanques, setFilteredBanques] = useState([]);
    const [Banque, setBanque] = useState([]);
    const  [clients,setClients]=useState([]);
    const  [factures,setFactures]=useState([]);


    const [encaissements, setEncaissements] = useState([]);
    const [ligneEncaissements,setLigneEncaissements]=useState([]);
    const [ligneEntrerComptes, setLigneEntrerComptes] = useState([]);


    const [banques, setBanques] = useState([]);

    const getCompteById = (compteId) => {
        console.log("comptes", comptes);
        const compte = comptes.find((c) => c.id === compteId);
        return compte ? compte.designations : "";
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [filtredEncaissements, setFiltredEncaissements] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [user, setUser] = useState({});
    // const [users, setUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    //-------------------edit-----------------------//
    const [editingEncaissement, setEditingEncaissement] = useState(null); // State to hold the encaissement being edited
    const [editingEncaissementId, setEditingEncaissementId] = useState(null);

    //---------------form-------------------//
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        referencee: "",
        date_encaissement: "",
        montant_total: "",
        comptes_id: "",
        type_encaissement: "",
    });
    const [formContainerStyle, setFormContainerStyle] = useState({ right: "-500px", });
    const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: "0px", });
    const tableHeaderStyle = {
        background: "#f2f2f2",
        padding: "10px",
        textAlign: "left",
        borderBottom: "1px solid #ddd",
    };


    const fetchEncaissements = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/encaissements");
            setEncaissements(response.data.encaissements);
            console.log("response",response);

            const responsebanques = await axios.get("http://localhost:8000/api/banques");
            setBanques(responsebanques.data.banques);
            console.log("API Response for Banques:", responsebanques.data.banques);
            const responseLigneentrer = await axios.get(
                "http://localhost:8000/api/ligneentrercompte");
            setLigneEntrerComptes(responseLigneentrer.data.ligneentrercomptes);
            console.log("lignenetrecomptes",responseLigneentrer.data.ligneentrercomptes);


            const ligneEncaissementResponse = await axios.get("http://localhost:8000/api/ligneencaissement");
            setLigneEncaissements(ligneEncaissementResponse.data.ligneencaissements );
            console.log("API Response for ligneencaissement:", ligneEncaissementResponse.data.ligneencaissements);


            const compteResponse = await axios.get(
                "http://localhost:8000/api/comptes"
            );
            console.log("API Response for Comptes:", compteResponse.data.comptes);
            setComptes(compteResponse.data.comptes);


            const clientResponse = await axios.get(
                "http://localhost:8000/api/clients"
            );
            console.log("API Response for clients:", clientResponse.data.client);
            setClients(clientResponse.data.client);

            const factureResponse = await axios.get(
                "http://localhost:8000/api/factures"
            );
            console.log("API Response for facture:", factureResponse.data.facture);
            setFactures(factureResponse.data.facture);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchEncaissements();
    }, []);

    useEffect(() => {
        const filtered =  encaissements&&encaissements.filter((encaissement) =>
            encaissement.referencee
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
        setFiltredEncaissements(filtered);
    }, [encaissements, searchTerm]);

    const handleBanqueSelection = (target) => {
        const banqueId = target.value;
        setFormData({ ...formData, [target.name]: banqueId });
        console.log("formData",formData);


    };

    const handleClientSelection = (target) => {
        const banque_id = parseInt(target.value);
        console.log('banque Id :',banque_id)
        const banque = banques.filter((b) => b.id === banque_id);
        console.log(banque)
        // setFormData({ ...formData, [target.name]: clientId });
        // console.log("formData",formData);
        // Filtrer les factures en fonction de l'ID du client sélectionné
        console.log(banques)
        setBanque(banque);
        // console.log(banque.ligneEntrerCompte)
         const facturesFormodePaimenent = banques.filter(facture => facture.banque_id === parseInt(banque_id) && facture.status != "reglee"  );
        setFilteredBanques(facturesFormodePaimenent);
        console.log("filtered Factures",filteredBanques);
    };

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
    //------------------------- encaissement Delete Selected ---------------------//

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
                        .delete(`http://localhost:8000/api/encaissements/${id}`)
                        .then((response) => {
                            fetchEncaissements();
                            Swal.fire({
                                icon: "success",
                                title: "Succès!",
                                text: 'encaissement supprimé avec succès.',
                            });
                        })
                        .catch((error) => {
                            console.error(
                                "Erreur lors de la suppression du encaissement:", error);
                            Swal.fire({
                                icon: "error",
                                title: "Erreur!",
                                text: 'Échec de la suppression du encaissement.',
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
            setSelectedItems(encaissements.map((encaissement) => encaissement.id));
        }
    };
    //------------------------- fournisseur print ---------------------//

    const printList = (tableId, title, encaissementList) => {
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
                ${Array.isArray(encaissementList)
                    ? encaissementList.map((item) => `<li>${item}</li>`).join("")
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
            "Sujet",
            "Date de Réclamation",
            "Status de Réclamation",
            "Traitement de Réclamation",
            "Date de Traitement",
        ];
        const selectedRecouvrements = encaissements.filter((encaissement) =>
            selectedItems.includes(encaissement.numero)
        );
        const rows = selectedRecouvrements.map((encaissement) => [
            encaissement.referencee,
            encaissement.date_encaissement,
            encaissement.montant_total,
            encaissement.comptes_id,
            encaissement.type_encaissement,

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
        pdf.save("encaissements.pdf");
    };
    //------------------------- fournisseur export to excel ---------------------//

    const exportToExcel = () => {
        const selectedRecouvrements = encaissements.filter((encaissement) =>
            selectedItems.includes(encaissement.id)
        );
        const ws = XLSX.utils.json_to_sheet(selectedRecouvrements);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Recouvrements");
        XLSX.writeFile(wb, "recouvrements.xlsx");
    };

    //------------------------- encaissement Delete---------------------//
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Êtes-vous sûr de vouloir supprimer ce encaissement ?',
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
                    .delete(`http://localhost:8000/api/encaissements/${id}`)
                    .then((response) => {
                        if (response.data) {
                            // Successful deletion
                            fetchEncaissements();
                            Swal.fire({
                                icon: 'success',
                                title: 'Succès!',
                                text: "encaissement supprimé avec succès",
                            });
                        } else if (response.data.error) {
                            // Error occurred
                            if (response.data.error.includes("Impossible de supprimer ou de mettre à jour une ligne parent : une contrainte de clé étrangère échoue")) {
                                // Violated integrity constraint error
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Erreur!',
                                    text: "Impossible de supprimer le encaissement car il a des produits associés.",
                                });
                            }
                        }
                    })
                    .catch((error) => {
                        // Request error
                        console.error("Erreur lors de la suppression du encaissement:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur!',
                            text: `Échec de la suppression du encaissement. Veuillez consulter la console pour plus d'informations.`,
                        });
                    });
            } else {
                console.log("Suppression annulée");
            }
        });
    }
    //------------------------- encaissement EDIT---------------------//

    const handleEdit = (encaissements) => {
        setEditingEncaissement(encaissements); // Set the recouvrements to be edited
        // Populate form data with recouvrements details
        setFormData({
            referencee: encaissements.referencee,
            date_encaissement: encaissements.date_encaissement,
            montant_total: encaissements.montant_total,
            comptes_id: encaissements.comptes_id,
            type_encaissement: encaissements.type_encaissement,

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
        if (editingEncaissementId !== null) {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '500px' });
        }
    }, [editingEncaissementId]);

    //------------------------- encaissement SUBMIT---------------------//

    useEffect(() => {
        fetchEncaissements();
    }, []);

    const handleSubmit =  (e) => {
        e.preventDefault();

        const url = editingEncaissement ? `http://localhost:8000/api/encaissements/${editingEncaissement.id}` : 'http://localhost:8000/api/encaissements';
        const method = editingEncaissement ? 'put' : 'post';
        axios({
            method: method,
            url: url,
            data: formData,
        }).then(() => {
            fetchEncaissements();
            Swal.fire({
                icon: 'success',
                title: 'Succès!',
                text: `encaissement ${editingEncaissement ? 'modifié' : 'ajouté'} avec succès.`,
            });
            setFormData({
                referencee: '',
                date_encaissement: '',
                montant_total: '',
                comptes_id: '',
                type_encaissement: '',

            });
            setEditingEncaissement(null); // Clear editing encaissement
            // closeForm();
        })
            .catch((error) => {
                console.error(`Erreur lors de ${editingEncaissement ? 'la modification' : "l'ajout"} du encaissement:`, error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur!',
                    text: `Échec de ${editingEncaissement ? 'la modification' : "l'ajout"} du encaissement.`,
                });
            });
        if (formContainerStyle.right === "-500px") {
            setFormContainerStyle({ right: "0" });
            setTableContainerStyle({ marginRight: "500px" });
        } else {
            closeForm();
        }
    };

    //------------------------- encaissement FORM---------------------//

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
            referencee: '',
            date_encaissement: '',
            montant_total: '',
            comptes_id: '',
            type_encaissement: '',
        });
        setEditingEncaissement(null); // Clear editing encaissement
    };

    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ display: 'flex' }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    <Toolbar />

                    <div>
                        <h3>Liste des Encaissements</h3>
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
                        {/*<div className="d-flex flex-row justify-content-end">*/}
                        {/*    <div className="btn-group col-2">*/}
                        {/*        <PrintList*/}
                        {/*            tableId="encaissementTable"*/}
                        {/*            title="Liste des Encaissement"*/}
                        {/*            encaissementList={encaissements}*/}
                        {/*            filtredencaissements={filtredEncaissements}*/}
                        {/*        />*/}

                        {/*        <ExportPdfButton*/}
                        {/*            encaissements={encaissements}*/}
                        {/*            selectedItems={selectedItems}*/}
                        {/*        />*/}
                        {/*        <Button className="btn btn-success btn-sm ml-2" onClick={exportToExcel}>*/}
                        {/*            <FontAwesomeIcon icon={faFileExcel} />*/}
                        {/*        </Button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                        <div id="formContainer" className="mt-2" style={formContainerStyle}>
                            <Form className="col row" onSubmit={handleSubmit}>
                                <Form.Label className="text-center m-2"><h5>{editingEncaissement ? 'Modifier encaissement' : 'Ajouter un encaissement'}</h5></Form.Label>
                                <Form.Group className="col-sm-5 m-2" controlId="client_id">

                                    <Form.Label>Compte</Form.Label>

                                    <Form.Select
                                        name="comptes_id"
                                        value={formData.comptes_id}
                                        onChange={handleChange}
                                        className="form-select form-select-sm"
                                    >
                                        <option value="">Sélectionner un compte</option>
                                        {comptes.map((compte) => (
                                            <option key={compte.id} value={compte.id}>
                                                {compte.designations}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="col-sm-10 m-2">
                                    <Form.Label>Reference</Form.Label>
                                    <Form.Control type="text" placeholder="Reference" name="referencee" value={formData.referencee} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="col-sm-5 m-2">
                                    <Form.Label>Date d'encaissement</Form.Label>
                                    <Form.Control type="date" placeholder="Date d'encaissement'" name="date_encaissement" value={formData.date_encaissement} onChange={handleChange} />
                                </Form.Group>
                                {/*<Form.Group className="col-sm-5 m-2">*/}
                                {/*    <Form.Label>Type d'encaissement</Form.Label>*/}
                                {/*    <Form.Control as="select" name="type_encaissement" value={formData.type_encaissement} onChange={handleChange}>*/}
                                {/*        <option value="">Sélectionner un type</option>*/}
                                {/*        <option value="Effet">Effet</option>*/}
                                {/*        <option value="Chéque">Chéque</option>*/}
                                {/*        <option value="Espèce">Espèce</option>*/}
                                {/*    </Form.Control>*/}
                                {/*</Form.Group>*/}
                                <Form.Group className="col-sm-5 m-2" controlId="banque_id">

                                    <Form.Label>Type d'encaissement</Form.Label>
                                    <Form.Select
                                        name="banque_id"
                                        value={formData.banque_id}
                                        onChange={(e) => handleClientSelection(e.target)}
                                        className="form-select form-select-sm"
                                    >
                                        <option value="">Sélectionner un encaissement</option>
                                        {banques.map((banque) => (
                                            <option key={banque.id} value={banque.id}>
                                                {banque.mode_de_paiement}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="col-sm-4 m-2">
                                    <Form.Label>Montant Total</Form.Label>
                                    <Form.Control type="text" placeholder="Montant Total" name="montant_total" value={formData.montant_total} onChange={handleChange} />
                                </Form.Group>
                                <div className="col-md-12">
                                    <Form.Group controlId="selectedFactureTable">
                                        <Form.Label> </Form.Label>
                                        <Table striped bordered hover responsive>
                                            <thead>
                                            <tr>
                                                <th>Client</th>
                                                <th>N° de Facture</th>
                                                <th>Total TTC</th>
                                                <th>Date de Facture</th>
                                                <th>N° de Chéque</th>
                                                <th>Mode de Paiement</th>
                                                <th>date</th>
                                                <th>Avance</th>
                                                <th>Status</th>
                                                <th>Remarque</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {Banque && Banque.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((banque) => {

                                                const ligneEntrerCompte = ligneEntrerComptes.find(ligne => ligne.client_id === banque.client_id);
                                                 console.log(ligneEntrerCompte)
                                                const facture = factures.find(facture => facture.id === ligneEntrerCompte?.id_facture);

                                                // Afficher les données de Banque et client s'il existe
                                                return (
                                                    <tr key={banque.id}>
                                                        <td>{facture.client.raison_sociale}</td>
                                                        <td>{facture.reference}</td>
                                                        <td>{facture.total_ttc}</td>
                                                        <td>{facture.date}</td>
                                                        <td>{banque.numero_cheque}</td>
                                                        <td>{banque.mode_de_paiement}</td>
                                                        <td>{banque.datee}</td>
                                                        <td>{ligneEntrerCompte ? ligneEntrerCompte.avance : 'N/A'}</td>
                                                        <td>{banque.Status}</td>
                                                        <td>{banque.remarque}</td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>



                                        </Table>
                                    </Form.Group>
                                </div>
                                <Form.Group className="col m-3 text-center">
                                    <Button type="submit" className="btn btn-success col-6">
                                        {editingEncaissement ? 'Modifier' : 'Ajouter'}
                                    </Button>
                                    <Button className="btn btn-secondary col-5 offset-1" onClick={closeForm}>Annuler</Button>
                                </Form.Group>
                            </Form>
                        </div>

                        <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
                            <table className="table table-responsive table-bordered " id="encaissementTable">
                                <thead >
                                <tr>
                                    <th style={tableHeaderStyle}>
                                        <input type="checkbox" onChange={handleSelectAllChange} />
                                    </th>
                                    <th style={tableHeaderStyle}>Compte</th>
                                    <th style={tableHeaderStyle}>Reference</th>
                                    <th style={tableHeaderStyle}>Date d'encaissement</th>
                                    <th style={tableHeaderStyle}>Type d'encaissement</th>
                                    <th style={tableHeaderStyle}>Montant Total</th>
                                    <th style={tableHeaderStyle}>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filtredEncaissements && filtredEncaissements.slice (page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((encaissements) => (

                                    <tr key={encaissements.id}>
                                        <td>
                                            <input type="checkbox" onChange={() => handleCheckboxChange(encaissements.id)} checked={selectedItems.includes(encaissements.id)} />
                                        </td>

                                        <td>
                                            {getCompteById(
                                                encaissements.comptes_id
                                            )}
                                        </td>
                                        <td>{encaissements.referencee}</td>
                                        <td>{encaissements.date_encaissement}</td>
                                        <td>{encaissements.type_encaissement}</td>
                                        <td>{encaissements.montant_total}</td>
                                        <td className="d-inline-flex">
                                            <Button className="btn btn-sm btn-info m-1" onClick={() => handleEdit(encaissements)}>
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button className="btn btn-danger btn-sm m-1" onClick={() => handleDelete(encaissements.id)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}

                                </tbody>
                            </table>



                            <Button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
                                <FontAwesomeIcon icon={faTrash} /></Button>

                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filtredEncaissements.length}
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

export default EncaissementList;