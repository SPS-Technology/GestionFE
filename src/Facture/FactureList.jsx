import React, { useState, useEffect } from "react";
import axios from "axios";
import Navigation from "../Acceuil/Navigation";
import Swal from "sweetalert2";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import { Form, Button, Modal, Table } from "react-bootstrap";
import "../style.css";
import Search from "../Acceuil/Search";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrash, faFilePdf, faPrint, faPlus,faMinus,} from "@fortawesome/free-solid-svg-icons";
import TablePagination from "@mui/material/TablePagination";
import Select from "react-dropdown-select";


const FactureList = () => {
    const [factures, setFactures] = useState([]);
    const [LigneFacture, setLigneFacture] = useState([]);
    const [clients, setClients] = useState([]);
    const [devises, setDevises] = useState([]);
    const [authId, setAuthId] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    const [selectedClient, setSelectedClient] = useState([]);

    const csrfTokenMeta = document.head.querySelector('meta[name="csrf-token"]');
    const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : null;
    const [editingFacture, setEditingFacture] = useState(null); // State to hold the devis being edited

    const [formData, setFormData] = useState({ reference: "", date: "", ref_BL: "", ref_BC: "", modePaiement: "",total_ttc:"",client_id:"", user_id: "",
        Code_produit: "",
        designation: "",
        prix_vente: "",
        quantite: "",
        id_facture: "",
    });
    const [formContainerStyle, setFormContainerStyle] = useState({ right: '-100%' });
    const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: '0px' });
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [produits, setProduits] = useState([]);
    const [selectedProductsData, setSelectedProductsData] = useState([]);
    const [modifiedQuantiteValues, setModifiedQuantiteValues] = useState({});
    const [modifiedPrixValues, setModifiedPrixValues] = useState({});

    const [filteredfactures, setFilteredfactures] = useState([]);

    // Pagination calculations
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const indexOfLastFacture = (page + 1) * rowsPerPage;
    const indexOfFirstFacture = indexOfLastFacture - rowsPerPage;
    const currentFactures = factures.slice(indexOfFirstFacture, indexOfLastFacture);

    const handleAddEmptyRow = () => {
        setSelectedProductsData([...selectedProductsData, {}]);
        console.log("selectedProductData", selectedProductsData);
    };
    const toggleRow = async (factureId) => {
        if (!expandedRows.includes(factureId)) {
            try {
                // Récupérer les lignes de facture associées à cette facture
                const lignefactures = await fetchLignefacture(factureId);

                // Mettre à jour l'état pour inclure les lignes de facture récupérées
                setFactures((prevFactures) => {
                    return prevFactures.map((facture) => {
                        if (facture.id === factureId) {
                            return { ...facture, lignefactures }; // Renommer ici pour correspondre à la clé
                        }
                        return facture;
                    });
                });

                // Ajouter l'ID de la facture aux lignes étendues
                setExpandedRows([...expandedRows, factureId]);
                console.log("expandedRows", expandedRows);
            } catch (error) {
                console.error('Erreur lors de la récupération des lignes de facture:', error);
            }
        }
    };
    const handleShowLigneFactures = async (factureId) => {
        setExpandedRows((prevRows) =>
            prevRows.includes(factureId)
                ? prevRows.filter((row) => row !== factureId)
                : [...prevRows, factureId]
        );
    };
    useEffect(() => {
        // Préchargement des lignes de facture pour chaque facture
        factures.forEach(async (facture) => {
            if (!facture.lignefactures) {
                try {
                    const lignefactures = await fetchLignefacture(facture.id);
                    setFactures((prevFactures) => {
                        return prevFactures.map((prevFacture) => {
                            if (prevFacture.id === facture.id) {
                                return { ...prevFacture, lignefactures };
                            }
                            return prevFacture;
                        });
                    });
                } catch (error) {
                    console.error('Erreur lors du préchargement des lignes de facture:', error);
                }
            }
        });
    }, []); // Le tableau de dépendances vide signifie que ce useEffect ne sera exécuté qu'une seule fois après le montage du composant


    const fetchLignefacture = async (factureId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/factures/${factureId}/ligneFacture`
            );
            console.log("fetch lign facture ", response.data.lignefactures);
            return response.data.lignefactures;
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des lignes de facture :",
                error
            );
            return [];
        }
    };
    // useEffect(() => {
    //     // Préchargement des lingedevises pour chaque devis
    //     factures.forEach(async (facture) => {
    //         if (!facture.lignefacture) {
    //             const lignefactures = await fetchLignefacture(factures.id);
    //             setClients((prevFactures) => {
    //                 return prevFactures.map((prevFactures) => {
    //                     if (prevFactures.id === facture.id) {
    //                         return { ...prevFactures, lignefactures };
    //                     }
    //                     return prevFactures;
    //                 });
    //             });
    //         }
    //     });
    // }, [factures]);
    //
    // useEffect(() => {
    //     fetchFactures();
    // }, []);
    const handleProductSelection = (selectedProduct, index) => {
        console.log("selectedProduct", selectedProduct);
        const updatedSelectedProductsData = [...selectedProductsData];
        updatedSelectedProductsData[index] = selectedProduct;
        setSelectedProductsData(updatedSelectedProductsData);
        console.log("selectedProductsData", selectedProductsData);
    };
    const populateProductInputs = (lignefacturesId, inputType) => {
        console.log("lignefacturesId", lignefacturesId);
        const existingLigneFactures = selectedProductsData.find(
            (LigneFacture) => LigneFacture.id === lignefacturesId
        );
        console.log("existingLigneFactures", existingLigneFactures);

        if (existingLigneFactures) {
            return existingLigneFactures[inputType];
        }
        return "";
    };
    const getClientValue = (clientId, field) => {
        // Find the product in the produits array based on produitId
        const client = clients.find((c) => c.id === clientId);

        // If the product is found, return the value of the specified field
        if (client) {
            return client[field];
        }

        // If the product is not found, return an empty string or any default value
        return "";
    };
    const handleInputChange = (index, inputType, event) => {
        const newValue = event.target.value;
        console.log("selectedProductsData", selectedProductsData);
        console.log("index", index);
        if (selectedProductsData[index]) {
            const productId = selectedProductsData[index].produit_id;

            if (inputType === "prix_vente") {
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
                .delete(`http://localhost:8000/api/ligneFacture/${id}`)
                .then(() => {
                    fetchFactures();
                });
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const getElementValueById = (id) => {
        return document.getElementById(id)?.value || "";
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleClientSelection = (selected) => {
        if (selected) {
            setSelectedClient(selected);
            console.log("selectedClient", selectedClient);
        } else {
            setSelectedClient(null);
        }
    };

    const fetchFactures = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/factures");
            setFactures(response.data.facture);

            const ClientResponse = await axios.get(
                "http://localhost:8000/api/clients"
            );
            // console.log("API Response:", response.data);
            setClients(ClientResponse.data.client);

            const LigneFactureResponse = await axios.get(
                "http://localhost:8000/api/ligneFacture"
            );
            setLigneFacture(LigneFactureResponse.data);

            console.log("lignefactures",LigneFactureResponse.data);

            const produitResponse = await axios.get(
                "http://localhost:8000/api/produits"
            );
            setProduits(produitResponse.data.produit);


            const DeviesResponse = await axios.get(
                "http://localhost:8000/api/devises"
            );
            setDevises(DeviesResponse.data.devis);

            const userResponse = await axios.get(
                "http://localhost:8000/api/user"
            );
            console.log("user authentifie ",userResponse)
            setAuthId(userResponse.data.id);
        } catch (error) {
            console.error("Error fetching factures:", error);
        }
    };

    useEffect(() => {
        fetchFactures();
    }, []);

    useEffect(() => {
        const filtered = factures.filter((facture) =>
            facture.reference
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );

        setFilteredfactures(filtered);
    }, [factures, searchTerm]);
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // const userResponse = await axios.get("http://localhost:8000/api/users", {
            //   withCredentials: true,
            //   headers: {
            //     "X-CSRF-TOKEN": csrfToken,
            //   },
            // });

            // const authenticatedUserId = userResponse.data[0].id;
            // console.log("auth user", authenticatedUserId);
            // Préparer les données du Devis
            console.log("authId",authId)
            console.log("selectedClient",selectedClient)
            const FactureData = {
                date: formData.date,
                ref_BL: formData.ref_BL,
                ref_BC: formData.ref_BC,
                modePaiement:formData.modePaiement,
                total_ttc:formData.total_ttc,
                reference: formData.reference,
                client_id: selectedClient.id,
                user_id: authId,

            };


            let response;
            if (editingFacture) {
                // Mettre à jour le Devis existant
                response = await axios.put(
                    `http://localhost:8000/api/factures/${editingFacture.id}`,
                    {
                        date: formData.date,
                        ref_BL: formData.ref_BL,
                        ref_BC: formData.ref_BC,
                        modePaiement:formData.modePaiement,
                        total_ttc:formData.total_ttc,
                        reference: formData.reference,
                        client_id: selectedClient.id,
                        user_id: authId,

                    }
                );
                // const existingLigneFacturesResponse = await axios.get(
                //     `http://localhost:8000/api/ligneFacture/${editingFacture.id}`
                // );

                const existingLigneFactures =
                    editingFacture.ligne_facture;
                console.log("existing lignefactures", existingLigneFactures);
                const selectedPrdsData = selectedProductsData.map(
                    (selectedProduct, index) => {
                        const ligneFactureForSelectedProduct = existingLigneFactures.find(
                          (ligneFacture) =>
                              ligneFacture.produit_id === selectedProduct.produit_id
                        );

                        return {
                            id: ligneFactureForSelectedProduct.id,
                            id_facture: editingFacture.id,
                            produit_id: selectedProduct.produit_id,
                            quantite: getElementValueById(
                                `quantite_${index}_${selectedProduct.produit_id}`
                            ),
                            prix_vente: getElementValueById(
                                `prix_unitaire_${index}_${selectedProduct.produit_id}`
                            ),
                            // Update other properties as needed
                        };
                    }
                );
                console.log("selectedPrdsData:", selectedPrdsData);
                for (const lignefactureData of selectedPrdsData) {
                    // Check if ligneDevis already exists for this produit_id and update accordingly

                    if (lignefactureData.id) {
                        // If exists, update the existing ligneDevis
                        await axios.put(
                            `http://localhost:8000/api/ligneFacture/${lignefactureData.id}`,
                            lignefactureData,
                            {
                                withCredentials: true,
                                headers: {
                                    "X-CSRF-TOKEN": csrfToken,
                                },
                            }
                        );
                    } else {
                        await axios.post(
                            "http://localhost:8000/api/ligneFacture",
                            lignefactureData,
                            {
                                withCredentials: true,
                                headers: {
                                    "X-CSRF-TOKEN": csrfToken,
                                },
                            }
                        );
                    }
                }





            } else {
                // Créer un nouveau Devis
                response = await axios.post(
                    "http://localhost:8000/api/factures",
                    FactureData
                );
                //console.log(response.data.devi)
                const selectedPrdsData = selectedProductsData.map(
                    (selectProduct, index) => {
                        return {
                            id_facture: response.data.facture.id,
                            produit_id: selectProduct.produit_id,
                            quantite: getElementValueById(
                                `quantite_${index}_${selectProduct.produit_id}`
                            ),
                            prix_vente: getElementValueById(
                                `prix_unitaire_${index}_${selectProduct.produit_id}`
                            ),
                        };
                    }
                );
                console.log("selectedPrdsData", selectedPrdsData);
                for (const lignefactureData of selectedPrdsData) {
                    // Sinon, il s'agit d'une nouvelle ligne de Devis
                    await axios.post(
                        "http://localhost:8000/api/ligneFacture",
                        lignefactureData
                    );
                }

            }
            console.log("response of postFACTURE: ", response.data);

            fetchFactures();

            setSelectedClient([]);

            setSelectedProductsData([]);
            //fetchExistingLigneDevis();
            closeForm();

            // Afficher un message de succès à l'utilisateur
            Swal.fire({
                icon: "success",
                title: "FACTURE ajoutée avec succès",
                text: "La FACTURE a été ajoutée avec succès.",
            });
        } catch (error) {
            console.error("Erreur lors de la soumission des données :", error);

            // Afficher un message d'erreur à l'utilisateur
            Swal.fire({
                icon: "error",
                title: "Erreur !",
                text: "Erreur !",
            });
        }
        closeForm();
    };


    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Êtes-vous sûr de vouloir supprimer cette facture ?",
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
            });

            if (result.isConfirmed) {
                // Delete the invoice with the given ID
                await axios.delete(`http://localhost:8000/api/factures/${id}`);

                // Refresh the list of invoices (if necessary)
                fetchFactures(); // Ensure this function retrieves the list of invoices again after deletion

                Swal.fire({
                    icon: "success",
                    title: "Succès!",
                    text: "Facture supprimée avec succès.",
                });
            } else {
                console.log("Suppression annulée");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de la facture:", error);

            Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression de la facture.",
            });
        }
    };


    const clearFormData = () => {
        // Reset the form data to empty values
        setFormData({
            reference: "",
            date: "",
            ref_BL: "",
            ref_BC: "",
            modePaiement: "",
            total_ttc:"",
            client_id: "",
            devis_id: "",
            id: "",
        });
    };

    const handleEdit = (facture) => {
        console.log("facture for edit", facture)
        // Populate the form data with the details of the selected facture
        setEditingFacture(facture);

        setFormData({
            reference: facture.reference,
            date: facture.date,
            ref_BL: facture.ref_BL,
            ref_BC: facture.ref_BC,
            modePaiement: facture.modePaiement,
            total_ttc: facture.total_ttc,
            client_id: facture.client_id,
            // user_id: facture.user_id,
        });

        console.log("formData for edit",formData)
        // if (facture.ligne_facture && facture.ligne_facture.length > 0) {
            const selectedProducts = facture.ligne_facture && facture.ligne_facture .map((lignefacture) => {
                const product = produits.find(
                    (produit) => produit.id === lignefacture.produit_id
                );
                console.log("product",product)
                return {
                    id: lignefacture.id,
                    Code_produit: product.Code_produit,
                    calibre_id: product.calibre_id,
                    designation: product.designation,
                    produit_id: lignefacture.produit_id,
                    quantite: lignefacture.quantite,
                    prix_vente: lignefacture.prix_vente,
                };
            });
            setSelectedProductsData(selectedProducts);
            console.log("selectedProducts for edit",selectedProducts)
        // }

        if (formContainerStyle.right === "-100%") {
            setFormContainerStyle({ right: "0" });
            setTableContainerStyle({ marginRight: "500px" });
        } else {
            closeForm();
        }
    };

    const closeForm = () => {
        setFormContainerStyle({ right: '-100%' });
        setTableContainerStyle({ marginRight: '0' });
        setShowForm(false); // Hide the form
        setFormData({ // Clear form data
            raison_sociale: '',
            abreviation: '',
            adresse: '',
            tele: '',
            ville: '',
            zone_id: '',
            user_id: '',
            total_ttc: '',
            client_id: '',
            ice: '',
            code_postal: '',
            Code_produit: "",
            designation: "",
            prix_vente: "",
            quantite: "",
            id_facture: "",
        });
        setEditingFacture(null); // Clear editing client

    };

    const handleShowFormButtonClick = () => {
        if (formContainerStyle.right === "-100%") {
            setFormContainerStyle({ right: "-0%" });
            setTableContainerStyle({ marginRight: "600px" });
        } else {
            closeForm();
        }
    };

    const handlePDF = (factureId) => {
        // Récupérer les informations spécifiques à la facture sélectionnée
        const selectedFacture = factures.find((facture) => facture.id === factureId);

        // Création d'une nouvelle instance de jsPDF
        const doc = new jsPDF();

        // Dessiner un cadre noir pour les informations du client
        const boxX = 130; // Ajustez la position horizontale du cadre pour l'élargir vers le centre
        const boxY = 10;
        const boxWidth = 70; // Ajustez la largeur du cadre pour l'élargir jusqu'au centre
        const boxHeight = 40; // Ajustez la hauteur du cadre pour qu'il encadre juste les informations
        doc.setDrawColor(0); // Couleur noire
        doc.setLineWidth(0.5); // Épaisseur de la ligne
        doc.rect(boxX, boxY, boxWidth, boxHeight);

        // Dessiner les informations du client dans le cadre à droite
        const clientInfo = [
            { label: "", value: selectedFacture.client.raison_sociale },
            { label: "", value: selectedFacture.client.adresse },
            { label: "", value: selectedFacture.client.tele },
            { label: "", value: selectedFacture.client.ice },
        ];

        // Position de départ pour l'impression des données du client
        let textOffsetX = boxX + 5;
        let textOffsetY = boxY + 10;

        // Afficher les informations du client dans le cadre
        doc.setFontSize(10); // Police plus petite pour les informations du client
        clientInfo.forEach((info, index) => {
            if (index === 0) {
                // Nom du client en gras et police plus grande
                doc.setFontSize(12); // Police plus grande pour le nom du client
                doc.setFont("helvetica", "bold"); // Police en gras
                doc.text(info.value ? info.value.toString() : "", textOffsetX, textOffsetY);
                doc.setFont("helvetica", "normal"); // Revenir à la police normale
                doc.setFontSize(10); // Revenir à la taille de police normale
            } else {
                // Afficher les autres informations
                if (index === 3) { // ICE
                    doc.text(info.value ? info.value.toString() : "", boxX + boxWidth - 5, textOffsetY, { align: 'right' });
                } else {
                    doc.text(info.value ? info.value.toString() : "", textOffsetX, textOffsetY);
                }
            }
            textOffsetY += 8; // Espacement entre les lignes du tableau
        });

        // Dessiner le numéro de facture en gras à gauche des informations du client
        doc.setFontSize(14); // Police plus grande pour le numéro de facture
        doc.setFont("helvetica", "bold"); // Police en gras
        doc.text(`Devis N° ${selectedFacture.reference}`, 10, 20);

        // Détails de la facture
        const factureDetailsTable = [
            ["Date", "Référence BL", "Référence BC", "Total TTC", "Mode de paiement"],
            [
                selectedFacture.date,
                selectedFacture.ref_BL,
                selectedFacture.ref_BC,
                selectedFacture.total_ttc,
                selectedFacture.modePaiement,
            ],
        ];

        // Position du tableau
        const tableStartY = 70; // Ajustez la position verticale selon vos besoins

        // Dessiner le tableau des détails de la facture
        doc.autoTable({
            head: [factureDetailsTable[0]],
            body: [factureDetailsTable[1]],
            startY: tableStartY,
            styles: {
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fontSize: 10,
            },
            headStyles: {
                fillColor: [0, 0, 255], // Couleur bleue pour les en-têtes
                textColor: [255, 255, 255], // Couleur du texte des en-têtes en blanc
            },
        });

        // Détails des produits
        const productDetailsTable = [
            ["Produit", "Quantité", "Prix Unitaire", "Total"],
            ...selectedFacture.ligne_facture.map(ligne => [
                ligne.produit_id,
                ligne.quantite,
                ligne.prix_vente,
                (ligne.quantite * ligne.prix_vente).toFixed(2) // Calculer le total pour chaque ligne de produit
            ]),
        ];

        // Dessiner le tableau des détails des produits
        doc.autoTable({
            head: [productDetailsTable[0]],
            body: productDetailsTable.slice(1),
            startY: doc.autoTable.previous.finalY + 10, // Positionner ce tableau juste en dessous du premier tableau
            styles: {
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fontSize: 10,
            },
            headStyles: {
                fillColor: [0, 0, 255], // Couleur bleue pour les en-têtes
                textColor: [255, 255, 255], // Couleur du texte des en-têtes en blanc
            },
        });

        // Enregistrer le fichier PDF avec le nom 'devis.pdf'
        doc.save("facturee.pdf");
    };

    function nombreEnLettres(nombre) {
        const units = ['', 'un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf'];
        const teens = ['Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze', 'Seize', 'Dix-Sept', 'Dix-Huit', 'Dix-Neuf'];
        const tens = ['', 'Dix', 'Vingt', 'Trente', 'Quarante', 'Cinquante', 'Soixante', 'Soixante-Dix', 'Quatre-Vingt', 'Quatre-Vingt-Dix'];

        let parts = [];

        if (nombre === 0) {
            return 'zéro';
        }

        if (nombre >= 1000) {
            parts.push(nombreEnLettres(Math.floor(nombre / 1000)) + ' Mille');
            nombre %= 1000;
        }

        if (nombre >= 100) {
            parts.push(units[Math.floor(nombre / 100)] + ' Cent');
            nombre %= 100;
        }

        if (nombre >= 10 && nombre <= 19) {
            parts.push(teens[nombre - 10]);
            nombre = 0;
        } else if (nombre >= 20 || nombre === 10) {
            parts.push(tens[Math.floor(nombre / 10)]);
            nombre %= 10;
        }

        if (nombre > 0) {
            parts.push(units[nombre]);
        }

        return parts.join(' ');
    }

    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ display: "flex" }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    <Toolbar />
                    <div className="">
                        <h2>Liste des Factures</h2>
                    </div>
                    <div className="search-container d-flex flex-row-reverse col-3" role="search">
                        <Search onSearch={handleSearch} type="search" />
                    </div>
                    <div className="container">
                        <Button
                            variant="primary"
                            className="col-2 btn btn-sm m-2"
                            id="showFormButton"
                            onClick={handleShowFormButtonClick}
                        >
                            {showForm ? "Modifier le formulaire" : "Ajouter un Facture"}
                        </Button>
                        <div id="formContainer" className="" style={formContainerStyle} >
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
                                <Form.Group className="m-2 col-4" controlId="ref_BL">
                                    <Form.Label>ref_BL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.ref_BL}
                                        onChange={handleChange}
                                        name="ref_BL"
                                    />
                                    {/*<Form.Group className="m-2 col-4" controlId="user_id">*/}
                                    {/*    <Form.Label>User_id</Form.Label>*/}
                                    {/*    <Form.Control*/}
                                    {/*        type="text"*/}
                                    {/*        value={formData.user_id}*/}
                                    {/*        onChange={handleChange}*/}
                                    {/*        name="user_id"*/}
                                    {/*    />*/}
                                    {/*</Form.Group>*/}

                                </Form.Group>
                                <div className="col-md-12">
                                    <div className="row mb-3">
                                        <div className="col-sm-6">
                                            <label htmlFor="client_id" className="col-form-label">
                                                Client:
                                            </label>
                                        </div>
                                        <div className="col-sm-6">
                                            {console.log("selected client  :", selectedClient)}
                                            <Select
                                                options={clients.map((client) => ({
                                                    value: client.id,
                                                    label: client.raison_sociale,
                                                }))}
                                                onChange={(selected) => {
                                                    if (selected && selected.length > 0) {
                                                        const client = clients.find(
                                                            (client) => client.id === selected[0].value
                                                        );
                                                        handleClientSelection({
                                                            id: selected[0].value,
                                                            raison_sociale: client.raison_sociale,
                                                            adresse: client.adresse,
                                                            tele: client.tele,
                                                            abreviation: client.abreviation,
                                                            code_postal: client.code_postal,
                                                            ice: client.ice,
                                                            zone: client.zone,
                                                            siteclients: client.siteclients,
                                                        });
                                                    } else {
                                                        handleClientSelection(null); // Handle deselection
                                                    }
                                                }}
                                                values={
                                                    formData.client_id
                                                        ? [
                                                            {
                                                                value: formData.client_id,
                                                                label: getClientValue(
                                                                    formData.client_id,
                                                                    "raison_sociale"
                                                                ),
                                                            },
                                                        ]
                                                        : []
                                                }
                                                placeholder="Client ..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Form.Group className="m-2 col-4" controlId="ref_BC">
                                    <Form.Label>ref_BC</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.ref_BC}
                                        onChange={handleChange}
                                        name="ref_BC"
                                    />
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="total_ttc">
                                    <Form.Label>Total TTC:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.total_ttc}
                                        onChange={handleChange}
                                        name="total_ttc"
                                    />
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
                                                                <td style={{ backgroundColor: "white" }}>
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
                                                                <td style={{ backgroundColor: "white" }}>
                                                                    <Select
                                                                        options={produits.map((produit) => ({
                                                                            value: produit.id,
                                                                            label: produit.designation,
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
                                                                                        label: productData.designation,
                                                                                    },
                                                                                ]
                                                                                : []
                                                                        }
                                                                        placeholder="Designation ..."
                                                                    />
                                                                </td>
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
                                                                                "prix_vente"
                                                                            )
                                                                        }
                                                                        onChange={(event) =>
                                                                            handleInputChange(
                                                                                index,
                                                                                "prix_vente",
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
                                                                                productData.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </Button>
                                                                </td>
                                                                {/*<Modal.Footer>*/}
                                                                {/*            <Button variant="secondary" onClick={handleModalClose}>*/}
                                                                {/*                Annuler*/}
                                                                {/*            </Button>*/}
                                                                {/*            <Button variant="primary" onClick={handleProduct}>*/}
                                                                {/*                Valider la sélection*/}
                                                                {/*            </Button>*/}
                                                                {/*        </Modal.Footer>*/}
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </Form.Group>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="text-center">
                                        <Button type="submit" className=" btn-sm col-4">
                                            {editingFacture ? "Modifier" : "Valider"}
                                        </Button>
                                        <Button
                                            className=" btn-sm btn-secondary col-4 offset-1 "
                                            onClick={closeForm}
                                        >
                                            Annuler
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </div>
                        <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
                            <table className="table table-bordered">
                                <thead className="text-center"  style={{ backgroundColor: "#adb5bd" }}>
                                <tr>
                                    <th>Détails</th>
                                    <th>N° Facture</th>
                                    <th>Date</th>
                                    <th>Client</th>
                                    {/*<th>Total HT</th>*/}
                                    {/*<th>TVA</th>*/}
                                    {/*<th>Total TTC</th>*/}
                                    <th>REF BL N°</th>
                                    <th>REF BC N°</th>
                                    <th>TOTAL TTC</th>
                                    <th>Mode de Paiement</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                {/*<tbody className="text-center">*/}
                                {/*{filteredfactures*/}
                                {/*    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)*/}
                                {/*    .map((facture) => (*/}
                                <tbody className="text-center">
                                {filteredfactures.map((facture) => (
                                    <React.Fragment key={facture.id}>
                                        <tr>
                                            <td>
                                                <div className="no-print ">
                                                    <button
                                                        className="btn btn-sm btn-light"
                                                        onClick={() => handleShowLigneFactures(facture.id)}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={
                                                                expandedRows.includes(facture.id)
                                                                    ? faMinus
                                                                    : faPlus
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>{facture.reference}</td>
                                            <td>{facture.date}</td>
                                            <td>{facture.client.raison_sociale}</td>
                                            <td>{facture.ref_BL}</td>
                                            <td>{facture.ref_BC}</td>
                                            <td>{facture.total_ttc}</td>
                                            <td>{facture.modePaiement}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-info m-1"
                                                    onClick={() => handleEdit(facture)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <Button className="btn btn-danger btn-sm m-2" onClick={() => handleDelete(facture.id)}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button>
                                                <Button
                                                    className="btn btn-sm m-2"
                                                    onClick={() => handlePDF(facture.id)}
                                                >
                                                    <FontAwesomeIcon icon={faFilePdf} />
                                                </Button>
                                            </td>
                                        </tr>
                                        {expandedRows.includes(facture.id) && facture.ligne_facture && (
                                            <tr>
                                                <td colSpan="8">
                                                    <div>
                                                        <table className="table table-responsive table-bordered" style={{ backgroundColor: "#adb5bd" }}>
                                                            <thead>
                                                            <tr>
                                                                <th>Code Produit</th>
                                                                <th>designation</th>

                                                                <th>Quantite</th>
                                                                <th>Prix Vente</th>
                                                                {/*<th>Total HT </th>*/}
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {facture.ligne_facture.map((lignefacture) => {

                                                                const produit = produits.find(
                                                                (prod) =>
                                                                prod.id === lignefacture.produit_id
                                                                );
                                                                return (

                                                                    <tr key={lignefacture.id}>
                                                                        <td>{lignefacture.produit_id}</td>
                                                                        <td>{produit.designation}</td>

                                                                        <td>{lignefacture.quantite}</td>
                                                                        <td>{lignefacture.prix_vente} DH</td>
                                                                        {/*<td>*/}
                                                                        {/*    {(*/}
                                                                        {/*        lignefactures.quantite **/}
                                                                        {/*        lignefactures.prix_vente*/}
                                                                        {/*    ).toFixed(2)}{" "}*/}
                                                                        {/*    DH*/}
                                                                        {/*</td>*/}
                                                                    </tr>
                                                                );
                                                                }
                                                            )}
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
                                count={filteredfactures.length}
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

export default FactureList;