import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
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
import ExportPdfButton from "./ExportPdfButton";
import PrintList from "./PrintList";
const ReclamationList = () => {
    const [montantHt, setMontantHt] = useState('');
    const [avance, setAvance] = useState('');
    const [montantTtc, setMontantTtc] = useState(null);
    const [payments, setPayments] = useState([]);
    const [totalAvance, setTotalAvance] = useState(0);
    const [totalReste, setTotalReste] = useState(0);
    const [totalTtc, setTotalTtc] = useState(0);


    const handleCalculateTotalAvance = () => {
        alert(`Total des avances: ${totalAvance}`);
    };

    const handleCalculateTotalReste = () => {
        alert(`Total du reste: ${totalReste}`);
    };

    // const [existingFournisseur, setExistingFournisseur] = useState([]);
    const getClientNameById = (clientId) => {
        console.log("clients", clients);
        const client = clients.find((c) => c.id === clientId);
        return client ? client.raison_sociale : "";
    };
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredReclamations, setFilteredReclamations] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [reclamations, setReclamations] = useState([]);
    const [user, setUser] = useState({});
    // const [users, setUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    //-------------------edit-----------------------//
    const [editingReclamation, setEditingReclamation] = useState(null); // State to hold the reclamation being edited
    const [editingReclamationId, setEditingReclamationId] = useState(null);

    //---------------form-------------------//
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        numero: "",
        client: "",
        numero_facture: "",
        montant_ht: "",
        avance: "",
        mode_paiement: "",
        date_echeance: "",
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


    const fetchReclamations = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/reclamations");
            setReclamations(response.data.reclamations);
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
        fetchReclamations();
    }, []);

    useEffect(() => {
        const filtered =  reclamations&&reclamations.filter((reclamation) =>
            reclamation.sujet
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
        setFilteredReclamations(filtered);
    }, [reclamations, searchTerm]);

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
    //------------------------- reclamation Delete Selected ---------------------//

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
                        .delete(`http://localhost:8000/api/reclamations/${id}`)
                        .then((response) => {
                            fetchReclamations();
                            Swal.fire({
                                icon: "success",
                                title: "Succès!",
                                text: 'reclamation supprimé avec succès.',
                            });
                        })
                        .catch((error) => {
                            console.error(
                                "Erreur lors de la suppression du reclamation:", error);
                            Swal.fire({
                                icon: "error",
                                title: "Erreur!",
                                text: 'Échec de la suppression du reclamation.',
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
            setSelectedItems(reclamations.map((reclamation) => reclamation.id));
        }
    };
    //------------------------- fournisseur print ---------------------//

    const printList = (tableId, title, reclamationList) => {
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
                ${Array.isArray(reclamationList)
                    ? reclamationList.map((item) => `<li>${item}</li>`).join("")
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
        const selectedRecouvrements = reclamations.filter((reclamation) =>
            selectedItems.includes(reclamation.numero)
        );
        const rows = selectedRecouvrements.map((reclamation) => [
            reclamation.client_id,
            reclamation.sujet,
            reclamation.date_reclamation,
            reclamation.status_reclamation,
            reclamation.traitement_reclamation,
            reclamation.date_traitement,
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
        pdf.save("reclamations.pdf");
    };
    //------------------------- fournisseur export to excel ---------------------//

    const exportToExcel = () => {
        const selectedRecouvrements = reclamations.filter((reclamation) =>
            selectedItems.includes(reclamation.id)
        );
        const ws = XLSX.utils.json_to_sheet(selectedRecouvrements);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Recouvrements");
        XLSX.writeFile(wb, "recouvrements.xlsx");
    };

    //------------------------- reclamation Delete---------------------//
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Êtes-vous sûr de vouloir supprimer ce reclamation ?',
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
                    .delete(`http://localhost:8000/api/reclamations/${id}`)
                    .then((response) => {
                        if (response.data) {
                            // Successful deletion
                            fetchReclamations();
                            Swal.fire({
                                icon: 'success',
                                title: 'Succès!',
                                text: "reclamation supprimé avec succès",
                            });
                        } else if (response.data.error) {
                            // Error occurred
                            if (response.data.error.includes("Impossible de supprimer ou de mettre à jour une ligne parent : une contrainte de clé étrangère échoue")) {
                                // Violated integrity constraint error
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Erreur!',
                                    text: "Impossible de supprimer le reclamation car il a des produits associés.",
                                });
                            }
                        }
                    })
                    .catch((error) => {
                        // Request error
                        console.error("Erreur lors de la suppression du reclamation:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur!',
                            text: `Échec de la suppression du reclamation. Veuillez consulter la console pour plus d'informations.`,
                        });
                    });
            } else {
                console.log("Suppression annulée");
            }
        });
    }
    //------------------------- reclamation EDIT---------------------//

    const handleEdit = (reclamations) => {
        setEditingReclamation(reclamations); // Set the recouvrements to be edited
        // Populate form data with recouvrements details
        setFormData({
            client_id: reclamations.client_id,
            sujet: reclamations.sujet,
            date_reclamation: reclamations.date_reclamation,
            status_reclamation: reclamations.status_reclamation,
            traitement_reclamation: reclamations.traitement_reclamation,
            date_traitement: reclamations.date_traitement,
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
        if (editingReclamationId !== null) {
            setFormContainerStyle({ right: '0' });
            setTableContainerStyle({ marginRight: '500px' });
        }
    }, [editingReclamationId]);

    //------------------------- reclamation SUBMIT---------------------//

    useEffect(() => {
        fetchReclamations();
    }, []);

    const handleSubmit =  (e) => {
        e.preventDefault();

        const url = editingReclamation ? `http://localhost:8000/api/reclamations/${editingReclamation.id}` : 'http://localhost:8000/api/reclamations';
        const method = editingReclamation ? 'put' : 'post';
        axios({
            method: method,
            url: url,
            data: formData,
        }).then(() => {
            fetchReclamations();
            Swal.fire({
                icon: 'success',
                title: 'Succès!',
                text: `reclamation ${editingReclamation ? 'modifié' : 'ajouté'} avec succès.`,
            });
            setFormData({
                client_id: '',
                sujet: '',
                date_reclamation: '',
                status_reclamation: '',
                traitement_reclamation: '',
                date_traitement: '',
            });
            setEditingReclamation(null); // Clear editing reclamation
            // closeForm();
        })
            .catch((error) => {
                console.error(`Erreur lors de ${editingReclamation ? 'la modification' : "l'ajout"} du reclamation:`, error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur!',
                    text: `Échec de ${editingReclamation ? 'la modification' : "l'ajout"} du reclamation.`,
                });
            });
        if (formContainerStyle.right === "-500px") {
            setFormContainerStyle({ right: "0" });
            setTableContainerStyle({ marginRight: "500px" });
        } else {
            closeForm();
        }
    };

    //------------------------- reclamation FORM---------------------//

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
            sujet: '',
            date_reclamation: '',
            status_reclamation: '',
            traitement_reclamation: '',
            date_traitement: '',
        });
        setEditingReclamation(null); // Clear editing reclamation
    };

    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ display: 'flex' }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    <Toolbar />

                    <div>
                        <h3>Liste des Réclamations</h3>
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
                                    tableId="reclamationTable"
                                    title="Liste des reclatioms"
                                    ReclamationList={reclamations}
                                    filtredreclamations={filteredReclamations}
                                />

                                <ExportPdfButton
                                    reclamations={reclamations}
                                    selectedItems={selectedItems}
                                />
                                <Button className="btn btn-success btn-sm ml-2" onClick={exportToExcel}>
                                    <FontAwesomeIcon icon={faFileExcel} />
                                </Button>
                            </div>
                        </div>
                        <div id="formContainer" className="mt-2" style={formContainerStyle}>
                            <Form className="col row" onSubmit={handleSubmit}>
                                <Form.Label className="text-center m-2"><h5>{editingReclamation ? 'Modifier reclamation' : 'Ajouter un reclamation'}</h5></Form.Label>
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

                                <Form.Group className="col-sm-10 m-2">
                                    <Form.Label>Sujet</Form.Label>
                                    <Form.Control type="text" placeholder="Sujet" name="sujet" value={formData.sujet} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="col-sm-5 m-2">
                                    <Form.Label>Date de Réclamation</Form.Label>
                                    <Form.Control type="date" placeholder="Date de Réclamation" name="date_reclamation" value={formData.date_reclamation} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="col-sm-5 m-2">
                                    <Form.Label>Statut de Réclamation</Form.Label>
                                    <Form.Control as="select" name="status_reclamation" value={formData.status_reclamation} onChange={handleChange}>
                                        <option value="">Sélectionner le statut</option>
                                        <option value="En attente">En attente</option>
                                        <option value="En cours de traitement">En cours de traitement</option>
                                        <option value="Résolue">Résolue</option>
                                        <option value="Fermée">Fermée</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group className="col-sm-4 m-2">
                                    <Form.Label>Traitement de Réclamation</Form.Label>
                                    <Form.Control type="text" placeholder="Traitement de Réclamation" name="traitement_reclamation" value={formData.traitement_reclamation} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="col-sm-4 m-2">
                                    <Form.Label>Date de Traitement</Form.Label>
                                    <Form.Control type="date" placeholder="Date de Traitement" name="date_traitement" value={formData.date_traitement} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="col m-3 text-center">
                                    <Button type="submit" className="btn btn-success col-6">
                                        {editingReclamation ? 'Modifier' : 'Ajouter'}
                                    </Button>
                                    <Button className="btn btn-secondary col-5 offset-1" onClick={closeForm}>Annuler</Button>
                                </Form.Group>
                            </Form>
                        </div>

                        <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
                            <table className="table table-responsive table-bordered " id="reclamationTable">
                                <thead >
                                <tr>
                                    <th style={tableHeaderStyle}>
                                        <input type="checkbox" onChange={handleSelectAllChange} />
                                    </th>
                                    <th style={tableHeaderStyle}>Client</th>
                                    <th style={tableHeaderStyle}>Sujet</th>
                                    <th style={tableHeaderStyle}>date de Réclamation</th>
                                    <th style={tableHeaderStyle}>Status de Réclamation</th>
                                    <th style={tableHeaderStyle}>Traitrement de Réclamation</th>
                                    <th style={tableHeaderStyle}>Date De Traitement</th>
                                    <th style={tableHeaderStyle}>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredReclamations && filteredReclamations.slice (page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((reclamations) => (

                                    <tr key={reclamations.id}>
                                        <td>
                                            <input type="checkbox" onChange={() => handleCheckboxChange(reclamations.id)} checked={selectedItems.includes(reclamations.id)} />
                                        </td>

                                        <td>
                                            {getClientNameById(
                                                reclamations.client_id
                                            )}
                                        </td>
                                        <td>{reclamations.sujet}</td>
                                        <td>{reclamations.date_reclamation}</td>
                                        <td>{reclamations.status_reclamation}</td>
                                        <td>{reclamations.traitement_reclamation}</td>
                                        <td>{reclamations.date_traitement}</td>
                                        {/*<td>{reclamations.user}</td>*/}
                                        <td className="d-inline-flex">
                                            <Button className="btn btn-sm btn-info m-1" onClick={() => handleEdit(reclamations)}>
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button className="btn btn-danger btn-sm m-1" onClick={() => handleDelete(reclamations.id)}>
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
                                count={filteredReclamations.length}
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

export default ReclamationList;