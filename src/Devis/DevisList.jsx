import React, { useState, useEffect } from "react";
import Select from "react-dropdown-select";

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
import "jspdf-autotable";
import Swal from "sweetalert2";
import Search from "../Acceuil/Search";
import TablePagination from "@mui/material/TablePagination";
import {LiaFileInvoiceSolid} from "react-icons/lia";
import {CiDeliveryTruck} from "react-icons/ci";


const DevisList = () => {
    const [existingLigneCommandes, setExistingLigneCommandes] = useState([]);

    const [devises, setDevises] = useState([]);
    const [lignedevises, setLigneDevis] = useState([]);
    const [modifiedPrixValues, setModifiedPrixValues] = useState({});
    const [modifiedQuantiteValues, setModifiedQuantiteValues] = useState({});
    const [clients, setClients] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [filtereddevises, setFiltereddevises] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    // Ajouter des états pour suivre si la facture et le bon de livraison ont été générés
    const [factureGenerated, setFactureGenerated] = useState(false);
    const [bonLivraisonGenerated, setBonLivraisonGenerated] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const handleModalClose = () => setShowModal(false);
    const [totals, setTotals] = useState({});
    const [selectedProductsData, setSelectedProductsData] = useState([]);


    const [produits, setProduits] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [factures, setFactures] = useState([]);
    const [formData, setFormData] = useState({
        reference: "",
        date: "",
        validation_offer: "",
        modePaiement: "",
        status: "",
        client_id: "",
        user_id: "",
        Code_produit: "",
        designation: "",
        prix_vente: "",
        quantite: "",
        id_devis: "",

    });

    const [editingDevis, setEditingDevis] = useState(null); // State to hold the devis being edited
    const [showForm, setShowForm] = useState(false);
    const [formContainerStyle, setFormContainerStyle] = useState({
        right: "-100%",
    });
    const [tableContainerStyle, setTableContainerStyle] = useState({
        marginRight: "0px",
    });
    const handleAddEmptyRow = () => {
        setSelectedProductsData([...selectedProductsData, {}]);
        console.log("selectedProductData", selectedProductsData);
    };
    const populateProductInputs = (ligneCommandId, inputType) => {
        console.log("ligneCommandId", ligneCommandId);
        const existingLigneCommande = selectedProductsData.find(
            (ligneCommande) => ligneCommande.id === ligneCommandId
        );
        console.log("existing LigneCommande", existingLigneCommandes);

        if (existingLigneCommande) {
            return existingLigneCommande[inputType];
        }
        return "";
    };
    const handleInputChange = (index, inputType, event) => {
        const newValue = event.target.value;
        console.log("selectedProductsData", selectedProductsData);
        console.log("index", index);
        if (selectedProductsData[index]) {
            const productId = selectedProductsData[index].produit_id;

            if (inputType === "prix_unitaire") {
                setModifiedPrixValues((prev) => {
                    const updatedValues = {
                        ...prev,
                        [`${index}_${productId}`]: newValue,
                    };
                    console.log("Modified prix values:", updatedValues);
                    return updatedValues;
                });
            } else if (inputType === "quantite") {
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
    };
    const handleDeleteProduct = (index, id) => {
        const updatedSelectedProductsData = [...selectedProductsData];
        updatedSelectedProductsData.splice(index, 1);
        setSelectedProductsData(updatedSelectedProductsData);
        if (id) {
            axios
                .delete(`http://localhost:8000/api/ligneCommandes/${id}`)
                .then(() => {
                    fetchDevis();
                });
        }
    };
    const fetchDevis = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/devises");
            setDevises(response.data.devis);

            const lignedevisResponse = await axios.get(
                "http://localhost:8000/api/lignedevis"
            );
            setLigneDevis(lignedevisResponse.data.lignedevis);

            const clientResponse = await axios.get(
                "http://localhost:8000/api/clients"
            );
            // console.log("API Response:", response.data);
            setClients(clientResponse.data.client);

            const produitResponse = await axios.get(
                "http://localhost:8000/api/produits"
            );
            setProduits(produitResponse.data.produit);

            const factureResponse = await axios.get(
                "http://localhost:8000/api/factures"
            );
            setFactures(factureResponse.data.facture);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    const toggleRow = async (devisId) => {
        if (expandedRows.includes(devisId)) {
            setExpandedRows(expandedRows.filter((id) => id !== devisId));
        } else {
            try {
                // Récupérer les lignes de devis associées à ce devis
                const lignedevis = await fetchLigneDevis(devisId);

                // Mettre à jour l'état pour inclure les lignes de devis récupérées
                setDevises((prevDevises) =>
                    prevDevises.map((devis) =>
                        devis.id === devisId ? { ...devis, lignedevis } : devis
                    )
                );

                // Ajouter l'ID du devis aux lignes étendues
                setExpandedRows([...expandedRows, devisId]);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des lignes de devis :",
                    error
                );
            }
        }
    };

    const fetchLigneDevis = async (devisId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/devises/${devisId}/lignedevis`
            );
            return response.data.lignedevis;
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des lignes de devis :",
                error
            );
            return [];
        }
    };

    useEffect(() => {
        // Préchargement des lingedevises pour chaque devis
        devises.forEach(async (devis) => {
            if (!devis.lignedevis) {
                const lignedevis = await fetchLigneDevis(devis.id);
                setClients((prevDevises) => {
                    return prevDevises.map((prevDevis) => {
                        if (prevDevis.id === devis.id) {
                            return { ...prevDevis, lignedevis };
                        }
                        return prevDevis;
                    });
                });
            }
        });
    }, [devises]);

    useEffect(() => {
        fetchDevis();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getElementValueById = (id) => {
        return document.getElementById(id)?.value || "";
    };

    const handleGenerateFacture = async () => {
        try {
            // Préparer les données de la facture
            const factureData = {
                client_id: formData.client_id,
                user_id: formData.user_id,
                id_devis: editingDevis.id, // Utiliser l'ID du devis actuel
            };

            // Envoyer une requête POST pour créer la facture
            const factureResponse = await axios.post(
                "http://localhost:8000/api/factures",
                factureData
            );

            console.log("Facture créée:", factureResponse.data);
            setFactureGenerated(true);
        } catch (error) {
            console.error("Erreur lors de la génération de la facture :", error);
        }
    };

    const handleGenerateBonLivraison = async () => {
        try {
            // Préparer les données du bon de livraison
            const bonLivraisonData = {
                reference: formData.reference,
                date: formData.date,
                client_id: formData.client_id,
                user_id: formData.user_id,
            };

            // Envoyer une requête POST pour créer le bon de livraison
            const bonLivraisonResponse = await axios.post(
                "http://localhost:8000/api/livraisons",
                bonLivraisonData
            );

            console.log("Bon de livraison créé :", bonLivraisonResponse.data);
            setBonLivraisonGenerated(true);
        } catch (error) {
            console.error("Erreur lors de la génération du bon de livraison :", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Préparer les données du devis
            const devisData = {
                reference: formData.reference,
                date: formData.date,
                validation_offer: formData.validation_offer,
                modePaiement: formData.modePaiement,
                status: formData.status,
                client_id: formData.client_id,
                user_id: formData.user_id,
                total_ttc: formData.total_ttc,
            };

            let response;
            if (editingDevis) {
                // Mettre à jour le devis existant
                response = await axios.put(
                    `http://localhost:8000/api/devises/${editingDevis.id}`,
                    devisData
                );
            } else {
                // Créer un nouveau devis
                response = await axios.post(
                    "http://localhost:8000/api/devises",
                    devisData
                );
            }

            if (formData.status === "Valider") {
                // Afficher les boutons pour générer manuellement la facture et le bon de livraison
                setFactureGenerated(false);
                setBonLivraisonGenerated(false);
            }

            // Préparer les données des lignes de devis
            const selectedPrdsData = selectedProductsData.map((selectProduct) => {
                return {
                    id: selectProduct.id, // Ajoutez l'ID de la ligne de devis
                    Code_produit: selectProduct.Code_produit,
                    designation: selectProduct.designation,
                    id_devis: response.data.devis
                        ? response.data.devis.id
                        : selectProduct.id_devis, // Utiliser l'ID du devis créé ou mis à jour
                    quantite: selectProduct.quantite,
                    prix_vente: selectProduct.prix_vente,
                };
            });

            // Envoyer une requête POST pour chaque produit sélectionné
            for (const ligneDevisData of selectedPrdsData) {
                if (ligneDevisData.id) {
                    // Si l'ID existe, il s'agit d'une modification
                    await axios.put(
                        `http://localhost:8000/api/lignedevis/${ligneDevisData.id}`,
                        ligneDevisData
                    );
                } else {
                    // Sinon, il s'agit d'une nouvelle ligne de devis
                    await axios.post(
                        "http://localhost:8000/api/lignedevis",
                        ligneDevisData
                    );
                }
            }

            // Récupérer les données mises à jour
            fetchDevis();

            // Réinitialiser les données du formulaire
            setFormData({
                reference: "",
                date: "",
                validation_offer: "",
                modePaiement: "",
                status: "",
                client_id: "",
                user_id: "",
                Code_produit: "",
                designation: "",
                prix_vente: "",
                quantite: "",
                id_devis: "",
            });

            // Fermer le formulaire si nécessaire
            setShowForm(false);

            // Afficher un message de succès à l'utilisateur
            Swal.fire({
                icon: "success",
                title: "Succès !",
                text: "Détails du devis et des lignes de devis ajoutés avec succès.",
            });
        } catch (error) {
            console.error("Erreur lors de la soumission des données :", error);

            // Afficher un message d'erreur à l'utilisateur
            Swal.fire({
                icon: "error",
                title: "Erreur !",
                text: "Impossible d'ajouter les détails du devis et des lignes de devis.",
            });
        }
        closeForm();
    };


    const handleEdit = (devis) => {
        setEditingDevis(devis);
        setFormData({
            reference: devis.reference,
            date: devis.date,
            validation_offer: devis.validation_offer,
            modePaiement: devis.modePaiement,
            status: devis.status,
            client_id: devis.client_id,
            user_id: devis.user_id,
        });

        const selectedProducts = devis.lignedevis.map((lignedevis) => ({
            id: lignedevis.id, // Ajoutez l'ID de la ligne de devis
            Code_produit: lignedevis.Code_produit,
            designation: lignedevis.designation,
            quantite: lignedevis.quantite,
            prix_vente: lignedevis.prix_vente,
            id_devis: lignedevis.id_devis,
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
            title: "Êtes-vous sûr de vouloir supprimer ce devis ?",
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
                // Supprimer d'abord les factures associées
                axios.delete(`http://localhost:8000/api/factures/${id}`)
                    .then(() => {
                        // Ensuite, supprimer le devis
                        axios.delete(`http://localhost:8000/api/devises/${id}`)
                            .then(() => {
                                fetchDevis();
                                Swal.fire({
                                    icon: "success",
                                    title: "Succès!",
                                    text: "Devis supprimé avec succès.",
                                });
                            })
                            .catch((error) => {
                                console.error("Erreur lors de la suppression du devis:", error);
                                Swal.fire({
                                    icon: "error",
                                    title: "Erreur!",
                                    text: "Échec de la suppression du devis.",
                                });
                            });
                    })
                    .catch((error) => {
                        console.error("Erreur lors de la suppression de la facture:", error);
                        Swal.fire({
                            icon: "error",
                            title: "Erreur!",
                            text: "Échec de la suppression de la facture.",
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
            date: "",
            validation_offer: "",
            modePaiement: "",
            client_id: "",
            zone_id: "",
            user_id: "",
            Code_produit: "",
            designation: "",
            prix_vente: "",
            quantite: "",
            id_devis: "",
        });
        setEditingDevis(null); // Clear editing client
    };
    //---------------------------Produit--------------------------
    const handleProductCheckboxChange = (productId) => {
        const updatedSelectedProducts = selectedProducts.includes(productId)
            ? selectedProducts.filter((id) => id !== productId)
            : [...selectedProducts, productId];
        setSelectedProducts(updatedSelectedProducts);

        console.log(updatedSelectedProducts);
    };

    const handleModalShow = () => {
        setShowModal(true); // Show the modal
    };
    const handleProductSelection = (selectedProduct, index) => {
        console.log("selectedProduct", selectedProduct);
        const updatedSelectedProductsData = [...selectedProductsData];
        updatedSelectedProductsData[index] = selectedProduct;
        setSelectedProductsData(updatedSelectedProductsData);
        console.log("selectedProductsData", selectedProductsData);
    };
    // const handleProductSelection = () => {
    //     // Collect selected products with quantity and price
    //     const selectedProductsData = produits
    //         .map((produit) => {
    //             const productId = produit.id;
    //             const isChecked = document.getElementById(
    //                 `produit_${productId}`
    //             ).checked;
    //             if (isChecked) {
    //                 const quantite = document.getElementById(
    //                     `quantite_${productId}`
    //                 ).value;
    //                 const prix_vente = document.getElementById(
    //                     `prix_vente_${productId}`
    //                 ).value;
    //                 const Code_produit = produit.Code_produit;
    //                 const designation = produit.designation;
    //
    //                 return {
    //                     Code_produit,
    //                     designation,
    //                     productId,
    //                     quantite,
    //                     prix_vente,
    //                 };
    //             }
    //             return null;
    //         })
    //         .filter((product) => product !== null);
    //     console.log("selectedProductsData", selectedProductsData);
    //
    //     // Update selected products data state
    //     setSelectedProductsData(selectedProductsData);
    //
    //     // Close the modal
    //     setShowModal(false);
    // };

    useEffect(() => {
        const filtered = devises.filter((devis) =>
            devis.reference.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFiltereddevises(filtered);
    }, [devises, searchTerm]);

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
            setSelectedItems(devises.map((devis) => devis.id));
        }
    };

    const handlePrint = (devisId) => {
        // Récupérer les informations spécifiques au devis sélectionné
        const selectedDevis = devises.find((devis) => devis.id === devisId);

        // Création d'une nouvelle instance de jsPDF
        const doc = new jsPDF();

        // Position de départ pour l'impression des données
        let startY = 20;

        // Dessiner les informations du client dans un tableau à gauche
        const clientInfo = [
            { label: "Raison sociale:", value: selectedDevis.client.raison_sociale },
            { label: "Adresse:", value: selectedDevis.client.adresse },
            { label: "Téléphone:", value: selectedDevis.client.tele },
            { label: "ICE:", value: selectedDevis.client.ice },
            // Ajoutez d'autres informations client si nécessaire
        ];

        // Dessiner le tableau d'informations client à gauche
        doc.setFontSize(10); // Police plus petite pour les informations du client
        clientInfo.forEach((info) => {
            doc.text(`${info.label}`, 10, startY);
            doc.text(`${info.value}`, 40, startY);
            startY += 10; // Espacement entre les lignes du tableau
        });

        // Dessiner le tableau des informations du devis à droite
        const devisInfo = [
            { label: "N° Devis:", value: selectedDevis.reference },
            { label: "Date:", value: selectedDevis.date },
            {
                label: "Validation de l'offre:",
                value: selectedDevis.validation_offer,
            },
            { label: "Mode de Paiement:", value: selectedDevis.modePaiement },
        ];

        // Dessiner le tableau des informations du devis à droite
        startY = 20; // Réinitialiser la position Y
        devisInfo.forEach((info) => {
            doc.text(`${info.label}`, 120, startY);
            doc.text(`${info.value}`, 160, startY);
            startY += 10; // Espacement entre les lignes du tableau
        });

        // Vérifier si les détails des lignes de devis sont définis
        if (selectedDevis.lignedevis) {
            // Dessiner les en-têtes du tableau des lignes de devis
            const headersLigneDevis = [
                "Code produit",
                "Désignation",
                "Quantité",
                "Prix",
                "Total HT",
            ];

            // Récupérer les données des lignes de devis
            const rowsLigneDevis = selectedDevis.lignedevis.map((lignedevis) => [
                lignedevis.Code_produit,
                lignedevis.designation,
                lignedevis.quantite,
                lignedevis.prix_vente,
                // Calculate the total for each product line
                (lignedevis.quantite * lignedevis.prix_vente).toFixed(2), // Assuming the price is in currency format
            ]);

            // Dessiner le tableau des lignes de devis
            doc.autoTable({
                head: [headersLigneDevis],
                body: rowsLigneDevis,
                startY: startY + 20, // Décalage vers le bas pour éviter de chevaucher les informations du devis
                margin: { top: 20 },
                styles: {
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                    fontSize: 8, // Police plus petite pour les lignes de devis
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
            const montantTable = [
                [
                    "Montant Total Hors Taxes:",
                    getTotalHT(selectedDevis.lignedevis).toFixed(2),
                ],
                [
                    "TVA (20%):",
                    calculateTVA(getTotalHT(selectedDevis.lignedevis)).toFixed(2),
                ],
                ["TTC:", getTotalTTC(selectedDevis.lignedevis).toFixed(2)],
            ];

            doc.autoTable({
                body: montantTable,
                startY: doc.autoTable.previous.finalY + 10,
                margin: { top: 20 },
                styles: {
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                    fontSize: 10, // Police plus petite pour les montants
                },
            });
        }

        // Enregistrer le fichier PDF avec le nom 'devis.pdf'
        doc.save("devis.pdf");
    };
    const print = (devisId) => {
        // Récupérer les informations spécifiques au devis sélectionné
        const selectedDevis = devises.find((devis) => devis.id === devisId);

        if (!selectedDevis) {
            console.error(`Devis avec l'ID '${devisId}' introuvable.`);
            return;
        }

        // Générer le contenu HTML pour impression
        const printWindow = window.open("", "_blank", "");

        if (printWindow) {
            const newWindowDocument = printWindow.document;
            const title = `Devis N° ${selectedDevis.reference}`;

            // Début du contenu HTML
            newWindowDocument.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    h1, h2 {
                        text-align: center;
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
                </style>
            </head>
            <body>
                <h1>${title}</h1>

                <h2>Informations du Client :</h2>
                <p>Raison sociale : ${selectedDevis.client.raison_sociale}</p>
                <p>Adresse : ${selectedDevis.client.adresse}</p>
                <p>Téléphone : ${selectedDevis.client.tele}</p>
                <p>ICE : ${selectedDevis.client.ice}</p>

                <h2>Informations du Devis :</h2>
                <p>N° Devis : ${selectedDevis.reference}</p>
                <p>Date : ${selectedDevis.date}</p>
                <p>Validation de l'offre : ${selectedDevis.validation_offer}</p>
                <p>Mode de Paiement : ${selectedDevis.modePaiement}</p>
                
                <h2>Détails des lignes de Devis :</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Code produit</th>
                            <th>Désignation</th>
                            <th>Quantité</th>
                            <th>Prix unitaire</th>
                            <th>Total HT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${selectedDevis.lignedevis.map((lignedevis, index) => `
                            <tr>
                                <td>${lignedevis.Code_produit}</td>
                                <td>${lignedevis.designation}</td>
                                <td>${lignedevis.quantite}</td>
                                <td>${lignedevis.prix_vente}</td>
                                <td>${(lignedevis.quantite * lignedevis.prix_vente).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <h2>Montants :</h2>
                <p>Montant Total Hors Taxes : ${getTotalHT(selectedDevis.lignedevis).toFixed(2)}</p>
                <p>TVA (20%) : ${calculateTVA(getTotalHT(selectedDevis.lignedevis)).toFixed(2)}</p>
                <p>TTC : ${getTotalTTC(selectedDevis.lignedevis).toFixed(2)}</p>
                
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
            console.error("Erreur lors de l'ouverture de la fenêtre d'impression.");
        }
    };

    // Fonction pour calculer le montant total hors taxes
    const getTotalHT = (lignedevis) => {
        return lignedevis.reduce(
            (total, item) => total + item.quantite * item.prix_vente,
            0
        );
    };

    // Fonction pour calculer la TVA
    const calculateTVA = (totalHT) => {
        return totalHT * 0.2; // 20% de TVA
    };

    // Fonction pour calculer le montant total toutes taxes comprises (TTC)
    const getTotalTTC = (lignedevis) => {
        return getTotalHT(lignedevis) + calculateTVA(getTotalHT(lignedevis));
    };

    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const indexOfLastDevis = (page + 1) * rowsPerPage;
    const indexOfFirstDevis = indexOfLastDevis - rowsPerPage;
    const currentDevises = devises.slice(indexOfFirstDevis, indexOfLastDevis);


    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ display: "flex" }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    <h2 className="mt-3">Liste des Devis</h2>
                    <div
                        className="search-container d-flex flex-row-reverse col-3"
                        role="search"
                    >
                        <Search onSearch={handleSearch} type="search" />
                    </div>
                    <div className="container">
                        <Button
                            variant="primary"
                            className="col-2 btn btn-sm m-2"
                            id="showFormButton"
                            onClick={handleShowFormButtonClick}
                        >
                            {showForm ? "Modifier le formulaire" : "Ajouter un Devis"}
                        </Button>
                        <div
                            id="formContainer"
                            className="col"
                            style={{ ...formContainerStyle }}
                        >
                            <Form className="row" onSubmit={handleSubmit}>
                                <Form.Group className="m-2 col-4" controlId="reference">
                                    <Form.Label>Reference:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        name="reference"
                                    />
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="date">
                                    <Form.Label>Date:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        name="date"
                                    />
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="validation_offer">
                                    <Form.Label>Validation de l'offre:</Form.Label>
                                    <Form.Select
                                        value={formData.validation_offer}
                                        onChange={handleChange}
                                        name="validation_offer"
                                    >
                                        <option value="">select</option>
                                        <option value="30 jours">30 jours</option>
                                        <option value="60 jours">60 jours</option>
                                        <option value="90 jours">90 jours</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="modePaiement">
                                    <Form.Label>Mode de Paiement:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.modePaiement}
                                        onChange={handleChange}
                                        name="modePaiement"
                                    />
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="status">
                                    <Form.Select
                                        value={formData.status}
                                        onChange={handleChange}
                                        name="status"
                                        id="status"
                                    >
                                        <option value="">Status</option>
                                        <option value="Envoye">Envoye</option>
                                        <option value="Valider">Valider</option>
                                        <option value="Non Valider">Non Valide</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="client_id">
                                    <Form.Select
                                        id="client_id"
                                        className="form-select col-2"
                                        value={formData.client_id}
                                        onChange={handleChange}
                                        name="client_id"
                                    >
                                        <option>Client</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.raison_sociale}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="user_id">
                                    <Form.Label>Utilisateur:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.user_id}
                                        onChange={handleChange}
                                        name="user_id"
                                    />
                                </Form.Group>
                                {/*<Form.Group className="mt-5 col-4" controlId="">*/}
                                {/*    <Button variant="primary" onClick={handleModalShow}>*/}
                                {/*        produits*/}
                                {/*    </Button>*/}
                                {/*</Form.Group>*/}
                                {/*<Form.Group className="m-2 col" controlId="product_list">*/}
                                {/*    <table className="table table-bordered">*/}
                                {/*        <thead>*/}
                                {/*        <tr>*/}
                                {/*            <th>Code</th>*/}
                                {/*            <th>Désignation</th>*/}
                                {/*            <th>Quantité</th>*/}
                                {/*            <th>Prix vente</th>*/}
                                {/*        </tr>*/}
                                {/*        </thead>*/}
                                {/*        <tbody>*/}
                                {/*        {selectedProductsData.map((productData) => (*/}
                                {/*            <tr key={productData.productId}>*/}
                                {/*                <td>*/}
                                {/*                    {*/}
                                {/*                        produits.find(*/}
                                {/*                            (produit) =>*/}
                                {/*                                produit.id === productData.productId*/}
                                {/*                        )?.Code_produit*/}
                                {/*                    }*/}
                                {/*                </td>*/}
                                {/*                <td>*/}
                                {/*                    {*/}
                                {/*                        produits.find(*/}
                                {/*                            (produit) =>*/}
                                {/*                                produit.id === productData.productId*/}
                                {/*                        )?.designation*/}
                                {/*                    }*/}
                                {/*                </td>*/}
                                {/*                <td>{productData.quantite}</td>*/}
                                {/*                <td>{productData.prix_vente}</td>*/}
                                {/*            </tr>*/}
                                {/*        ))}*/}
                                {/*        </tbody>*/}
                                {/*    </table>*/}
                                {/*</Form.Group>*/}
                                {/*<Modal show={showModal} onHide={handleModalClose}>*/}
                                {/*    <Toolbar />*/}
                                {/*    <Modal.Header closeButton>*/}
                                {/*        <Modal.Title>Sélectionner les produits</Modal.Title>*/}
                                {/*    </Modal.Header>*/}
                                {/*    <Modal.Body>*/}
                                {/*        <div className="mt-3">*/}
                                {/*            <table className="table table-hover">*/}
                                {/*                <thead>*/}
                                {/*                <tr>*/}
                                {/*                    <th>Sélectionner</th>*/}
                                {/*                    <th>Code</th>*/}
                                {/*                    <th>Désignation</th>*/}
                                {/*                    <th>Quantité</th>*/}
                                {/*                    <th>Prix vente</th>*/}
                                {/*                </tr>*/}
                                {/*                </thead>*/}
                                {/*                <tbody>*/}
                                {/*                {produits.map((produit) => (*/}
                                {/*                    <tr key={produit.id}>*/}
                                {/*                        <td>*/}
                                {/*                            <input*/}
                                {/*                                type="checkbox"*/}
                                {/*                                id={`produit_${produit.id}`}*/}
                                {/*                                name="selectedProducts"*/}
                                {/*                                value={produit.id}*/}
                                {/*                                onChange={() =>*/}
                                {/*                                    handleProductCheckboxChange(produit.id)*/}
                                {/*                                }*/}
                                {/*                            />*/}
                                {/*                        </td>*/}
                                {/*                        <td>{produit.Code_produit}</td>*/}
                                {/*                        <td>{produit.designation}</td>*/}
                                {/*                        <td>*/}
                                {/*                            <input*/}
                                {/*                                className="col-8"*/}
                                {/*                                type="text"*/}
                                {/*                                id={`quantite_${produit.id}`}*/}
                                {/*                            />*/}
                                {/*                        </td>*/}
                                {/*                        <td>*/}
                                {/*                            <input*/}
                                {/*                                type="text"*/}
                                {/*                                className="col-10"*/}
                                {/*                                id={`prix_vente_${produit.id}`}*/}
                                {/*                            />*/}
                                {/*                        </td>*/}
                                {/*                    </tr>*/}
                                {/*                ))}*/}
                                {/*                </tbody>*/}
                                {/*            </table>*/}
                                {/*        </div>*/}
                                {/*    </Modal.Body>*/}
                                {/*    <Modal.Footer>*/}
                                {/*        <Button variant="secondary" onClick={handleModalClose}>*/}
                                {/*            Annuler*/}
                                {/*        </Button>*/}
                                {/*        <Button variant="primary" onClick={handleProductSelection}>*/}
                                {/*            Valider la sélection*/}
                                {/*        </Button>*/}
                                {/*    </Modal.Footer>*/}
                                {/*</Modal>*/}
                                <div>
                                    <Button
                                        className="btn btn-sm mb-2 "
                                        variant="primary"
                                        onClick={handleAddEmptyRow}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </Button>
                                    <strong>Ajouter Produit</strong>
                                </div>

                                <div className="col-md-12">
                                    <div className="row mb-3">
                                        <div className="col-sm-12">
                                            <Form.Group controlId="selectedProduitTable">
                                                <div className="table-responsive">
                                                    <table className="table table-bordered ">
                                                        <thead>
                                                        <tr>
                                                            <th>Code Produit</th>
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
                                                                <td>
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
                                                                                    calibre: produit.calibre,
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
                                                                        id={`quantite_${index}_${productData.produit_id}`}
                                                                        className="quantiteInput"
                                                                        placeholder="Quantite"
                                                                        value={
                                                                            modifiedQuantiteValues[
                                                                                `${index}_${productData.produit_id}`
                                                                                ] ||
                                                                            populateProductInputs(
                                                                                productData.id,
                                                                                "quantite"
                                                                            )
                                                                        }
                                                                        onChange={(event) =>
                                                                            handleInputChange(
                                                                                index,
                                                                                "quantite",
                                                                                event
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        id={`prix_unitaire_${index}_${productData.produit_id}`}
                                                                        className="prixInput"
                                                                        placeholder="Prix"
                                                                        value={
                                                                            modifiedPrixValues[
                                                                                `${index}_${productData.produit_id}`
                                                                                ] ||
                                                                            populateProductInputs(
                                                                                productData.id,
                                                                                "prix_unitaire"
                                                                            )
                                                                        }
                                                                        onChange={(event) =>
                                                                            handleInputChange(
                                                                                index,
                                                                                "prix_unitaire",
                                                                                event
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Button
                                                                        className=" btn btn-danger btn-sm m-1"
                                                                        onClick={() =>
                                                                            handleDeleteProduct(
                                                                                index,
                                                                                productData.produit_id
                                                                            )
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
                                    </div>
                                </div>
                                <Form.Group className="col-4">
                                    <Button variant="primary" type="submit">
                                        Enregistrer le devis
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
                                    style={{ backgroundColor: "#adb5bd" }}
                                >
                                <tr>
                                    <th>{/* Vide */}</th>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAllChange}
                                        />
                                    </th>
                                    <th>N° Devis</th>
                                    <th>Date</th>
                                    <th>Client</th>
                                    <th>Total HT</th>
                                    <th>TVA (20%)</th>
                                    <th>Total TTC</th>
                                    <th>Status</th>
                                    <th>Validation l'offre</th>
                                    <th>Mode Paiement</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody className="text-center">
                                {filtereddevises.map((devis) => (
                                    <React.Fragment key={devis.id}>
                                        <tr>
                                            <td>
                                                <div className="no-print ">
                                                    <button
                                                        className="btn btn-sm btn-light"
                                                        onClick={() => toggleRow(devis.id)}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={
                                                                expandedRows.includes(devis.id)
                                                                    ? faMinus
                                                                    : faPlus
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                            {/*               <input*/}
                            {/*  type="checkbox"*/}
                            {/*  checked={selectedItems.some(*/}
                            {/*    (item) => item.id === devis.id*/}
                            {/*  )}*/}
                            {/*  onChange={() => handleSelectItem(devis)}*/}
                            {/*/>*/}
                                                <input
                                                    type="checkbox"
                                                    onChange={() => handleCheckboxChange(devis.id)}
                                                    checked={selectedItems.includes(devis.id)}
                                                />
                                            </td>
                                            <td>{devis.reference}</td>
                                            <td>{devis.date}</td>
                                            <td>{devis.client.raison_sociale}</td>
                                            <td>{getTotalHT(devis.lignedevis)} DH</td> {/* Display Total HT */}
                                            <td>{calculateTVA(getTotalHT(devis.lignedevis))} DH</td> {/* Display TVA */}
                                            <td>{getTotalTTC(devis.lignedevis)} DH</td> {/* Display Total TTC */}
                                            <td>{devis.status}</td>
                                            <td>{devis.validation_offer}</td>
                                            <td>{devis.modePaiement}</td>
                                            <td>
                                                <div className="d-inline-flex text-center">
                                                    <Button
                                                        className="col-3 btn btn-sm btn-info m-2"
                                                        onClick={() => handleEdit(devis)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </Button>
                                                    <Button
                                                        className="col-3 btn btn-danger btn-sm m-2"
                                                        onClick={() => handleDelete(devis.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                    <Button
                                                        className="col-3 btn btn-sm m-2"
                                                        onClick={() => handlePrint(devis.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faFilePdf} />
                                                    </Button>
                                                    <Button
                                                        className="col-3 btn btn-sm m-2"
                                                        onClick={() => print(devis.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faPrint} />
                                                    </Button>
                                                    {devis.status === "Valider" && (
                                                        <>
                                                            <Button variant="success" onClick={handleGenerateFacture}>
                                                                <LiaFileInvoiceSolid />

                                                            </Button>
                                                            <Button variant="info" onClick={handleGenerateBonLivraison}>
                                                                <CiDeliveryTruck />
                                                            </Button>
                                                        </>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRows.includes(devis.id) && devis.lignedevis && (
                                            <tr>
                                                <td colSpan="12">
                                                    <div id="lignesDevis">
                                                        <table
                                                            className="table table-responsive table-bordered"
                                                            style={{ backgroundColor: "#adb5bd" }}
                                                        >
                                                            <thead>
                                                            <tr>
                                                                <th>Code Produit</th>
                                                                <th>Description</th>
                                                                <th>Quantite</th>
                                                                <th>Prix Vente</th>
                                                                <th>Total HT </th>
                                                                {/* <th className="text-center">Action</th> */}
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {devis.lignedevis.map((ligneDevis) => (
                                                                <tr key={ligneDevis.id}>
                                                                    <td>{ligneDevis.Code_produit}</td>
                                                                    <td>{ligneDevis.designation}</td>
                                                                    <td>{ligneDevis.quantite}</td>
                                                                    <td>{ligneDevis.prix_vente} DH</td>
                                                                    <td>
                                                                        {(
                                                                            ligneDevis.quantite *
                                                                            ligneDevis.prix_vente
                                                                        ).toFixed(2)}{" "}
                                                                        DH
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
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filtereddevises.length}
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

export default DevisList;