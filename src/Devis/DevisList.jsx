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
    const [existingLigneDevis, setExistingLigneDevis] = useState([]);
    const [authId, setAuthId] = useState([]);
    const [selectedClient, setSelectedClient] = useState([]);
    const csrfTokenMeta = document.head.querySelector('meta[name="csrf-token"]');
    const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : null;
    const [devises, setDevises] = useState([]);
    const [ligneDevises, setLigneDevis] = useState([]);
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
    const handleClientSelection = (selected) => {
        if (selected) {
            setSelectedClient(selected);
            console.log("selectedClient", selectedClient);
        } else {
            setSelectedClient(null);
        }
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
    const fetchExistingLigneDevis = async (devisId) => {
        axios
            .get(`http://localhost:8000/api/ligneDevis/${devisId}`)
            .then((ligneDevisResponse) => {
                const existingLigneDevis =
                    ligneDevisResponse.data.ligneDevis;

                setExistingLigneDevis(existingLigneDevis);
            });
    };
    const populateProductInputs = (ligneDevisId, inputType) => {
        console.log("ligneDevisId", ligneDevisId);
        const existingLigneDevis = selectedProductsData.find(
            (ligneDevis) => ligneDevis.id === ligneDevisId
        );
        console.log("existing LigneDevis", existingLigneDevis);

        if (existingLigneDevis) {
            return existingLigneDevis[inputType];
        }
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
                .delete(`http://localhost:8000/api/ligneDevis/${id}`)
                .then(() => {
                    fetchDevis();
                });
        }
    };
    const fetchDevis = async () => {
        try {
            const clientResponse = await axios.get(
                "http://localhost:8000/api/clients"
            );
            // console.log("API Response:", response.data);
            setClients(clientResponse.data.client);
            const response = await axios.get("http://localhost:8000/api/devises");
            setDevises(response.data.devis);

            const ligneDevisResponse = await axios.get(
                "http://localhost:8000/api/ligneDevis"
            );
            setLigneDevis(ligneDevisResponse.data.ligneDevis);



            const produitResponse = await axios.get(
                "http://localhost:8000/api/produits"
            );
            setProduits(produitResponse.data.produit);

            const factureResponse = await axios.get(
                "http://localhost:8000/api/factures"
            );
            setFactures(factureResponse.data.facture);
            const userResponse = await axios.get(
                "http://localhost:8000/api/user"
            );
            console.log("user authentifie ",userResponse)
            setAuthId(userResponse.data.id);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


// Définir le toggleRow pour basculer l'état des lignes de devis
    // Définir le toggleRow pour basculer l'état des lignes de devis
        const toggleRow = async (devisId) => {
            if (!expandedRows.includes(devisId)) {
                try {
                    // Récupérer les lignes de devis associées à ce devis
                    const ligneDevis = await fetchLigneDevis(devisId);

                    // Mettre à jour l'état pour inclure les lignes de devis récupérées
                    setDevises((prevDevises) => {
                        return prevDevises.map((devis) => {
                            if (devis.id === devisId) {
                                return { ...devis, ligneDevis };
                            }
                            return devis;
                            console.log("devis",devis)
                        });
                    });

                    // Ajouter l'ID du devis aux lignes étendues
                setExpandedRows([...expandedRows, devisId]);
                console.log("expandsRows",expandedRows);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des lignes de devis :",
                    error
                );
            }
        }
    };





    const handleShowLigneEntreeCompte = async (devisId) => {
        setExpandedRows((prevRows) =>
            prevRows.includes(devisId)
                ? prevRows.filter((row) => row !== devisId)
                : [...prevRows, devisId]
        );
    };


    const fetchLigneDevis = async (devisId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/devises/${devisId}/ligneDevis`
            );
            console.log("fetch lign devis ", response.data.lignedevis);
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
            if (!devis.ligneDevis) {
                const ligneDevis = await fetchLigneDevis(devis.id);
                setClients((prevDevises) => {
                    return prevDevises.map((prevDevis) => {
                        if (prevDevis.id === devis.id) {
                            return { ...prevDevis, ligneDevis };
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

    // const handleGenerateFacture = async (devis) => {
    //
    //     try {
    //         // Préparer les données de la facture
    //         const factureData = {
    //             client_id: devis.client_id,
    //             user_id: authId,
    //             id_devis: devis.id,
    //             // total// Utiliser l'ID du devis actuel
    //         };
    //
    //         // Envoyer une requête POST pour créer la facture
    //         const factureResponse = await axios.post(
    //             "http://localhost:8000/api/factures",
    //             factureData
    //         );
    //
    //         console.log("Facture créée:", factureResponse.data);
    //         setFactureGenerated(true);
    //     } catch (error) {
    //         console.error("Erreur lors de la génération de la facture :", error);
    //     }
    // };
    const handleGenerateFacture = async (devis) => {
        try {
            // 1. Préparer les données de la facture
            const factureData = {
                client_id: devis.client_id,
                total_ttc: devis.total_ttc,
                user_id: authId,
                id_devis: devis.id,
                // Autres données de la facture...
            };

            // 2. Envoyer une requête POST pour créer la facture
            const factureResponse = await axios.post(
                "http://localhost:8000/api/factures",
                factureData
            );

            const facture = factureResponse.data;

            console.log("Facture créée:", facture);

            // 3. Récupérer les lignes de devis associées au devis
            const lignesDevisResponse = await axios.get(
                `http://localhost:8000/api/ligneDevis/${devis.id}`
            );

            // Vérification si les données sont présentes et sous forme de tableau
            if (Array.isArray(lignesDevisResponse.data)) {
                const lignesDevis = lignesDevisResponse.data;

                // 4. Créer les lignes de facture en utilisant l'ID de la facture créée
                for (const ligneDevis of lignesDevis) {
                    const ligneFactureData = {
                        facture_id: facture.id,
                        produit_id: ligneDevis.produit_id,
                        quantite: ligneDevis.quantite,
                        prix_unitaire: ligneDevis.prix_unitaire,
                        // Autres données de la ligne de facture...
                    };

                    // 5. Envoyer une requête POST pour créer la ligne de facture
                    const ligneFactureResponse = await axios.post(
                        "http://localhost:8000/api/ligneFacture",
                        ligneFactureData
                    );

                    console.log("Ligne de facture créée:", ligneFactureResponse.data);
                }

                setFactureGenerated(true);
            } else {
                console.error("Aucune donnée de lignes de devis trouvée ou les données ne sont pas sous forme de tableau.");
            }
        } catch (error) {
            console.error("Erreur lors de la génération de la facture :", error);
        }
    };

    const handleGenerateBonLivraison = async (devis) => {

        try {
            // Préparer les données du bon de livraison
            const bonLivraisonData = {
                reference: devis.reference,
                date: devis.date,
                client_id: devis.client_id,
                user_id: authId,

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

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //
    //     try {
    //         // Préparer les données du devis
    //         const devisData = {
    //             reference: formData.reference,
    //             date: formData.date,
    //             validation_offer: formData.validation_offer,
    //             modePaiement: formData.modePaiement,
    //             status: formData.status,
    //             client_id: formData.client_id,
    //             user_id: formData.user_id,
    //             total_ttc: formData.total_ttc,
    //         };
    //
    //         let response;
    //         if (editingDevis) {
    //             // Mettre à jour le devis existant
    //             response = await axios.put(
    //                 `http://localhost:8000/api/devises/${editingDevis.id}`,
    //                 devisData
    //             );
    //         } else {
    //             // Créer un nouveau devis
    //             response = await axios.post(
    //                 "http://localhost:8000/api/devises",
    //                 devisData
    //             );
    //         }
    //
    //         if (formData.status === "Valider") {
    //             // Afficher les boutons pour générer manuellement la facture et le bon de livraison
    //             setFactureGenerated(false);
    //             setBonLivraisonGenerated(false);
    //         }
    //
    //         // Préparer les données des lignes de devis
    //         const selectedPrdsData = selectedProductsData.map((selectProduct) => {
    //             return {
    //                 id: selectProduct.id, // Ajoutez l'ID de la ligne de devis
    //                 Code_produit: selectProduct.Code_produit,
    //                 designation: selectProduct.designation,
    //                 id_devis: response.data.devis
    //                     ? response.data.devis.id
    //                     : selectProduct.id_devis, // Utiliser l'ID du devis créé ou mis à jour
    //                 quantite: selectProduct.quantite,
    //                 prix_vente: selectProduct.prix_vente,
    //             };
    //         });
    //
    //         // Envoyer une requête POST pour chaque produit sélectionné
    //         for (const ligneDevisData of selectedPrdsData) {
    //             if (ligneDevisData.id) {
    //                 // Si l'ID existe, il s'agit d'une modification
    //                 await axios.put(
    //                     `http://localhost:8000/api/ligneDevis/${ligneDevisData.id}`,
    //                     ligneDevisData
    //                 );
    //             } else {
    //                 // Sinon, il s'agit d'une nouvelle ligne de devis
    //                 await axios.post(
    //                     "http://localhost:8000/api/ligneDevis",
    //                     ligneDevisData
    //                 );
    //             }
    //         }
    //
    //         // Récupérer les données mises à jour
    //         fetchDevis();
    //
    //         // Réinitialiser les données du formulaire
    //         setFormData({
    //             reference: "",
    //             date: "",
    //             validation_offer: "",
    //             modePaiement: "",
    //             status: "",
    //             client_id: "",
    //             user_id: "",
    //             Code_produit: "",
    //             designation: "",
    //             prix_vente: "",
    //             quantite: "",
    //             id_devis: "",
    //         });
    //
    //         // Fermer le formulaire si nécessaire
    //         setShowForm(false);
    //
    //         // Afficher un message de succès à l'utilisateur
    //         Swal.fire({
    //             icon: "success",
    //             title: "Succès !",
    //             text: "Détails du devis et des lignes de devis ajoutés avec succès.",
    //         });
    //     } catch (error) {
    //         console.error("Erreur lors de la soumission des données :", error);
    //
    //         // Afficher un message d'erreur à l'utilisateur
    //         Swal.fire({
    //             icon: "error",
    //             title: "Erreur !",
    //             text: "Impossible d'ajouter les détails du devis et des lignes de devis.",
    //         });
    //     }
    //     closeForm();
    // };
    //
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
            const DevisData = {
                date: formData.date,
                status: formData.status,
                validation_offer: formData.validation_offer,
                modePaiement: formData.modePaiement,
                reference: formData.reference,
                client_id: selectedClient.id,
                user_id: authId,
            };

            let response;
            if (editingDevis) {
                // Mettre à jour le Devis existant
                response = await axios.put(
                    `http://localhost:8000/api/devises/${editingDevis.id}`,
                    {
                        date: formData.date,
                        status: formData.status,
                        validation_offer: formData.validation_offer,
                        modePaiement: formData.modePaiement,
                        reference: formData.reference,
                        client_id: selectedClient.id,
                        user_id: authId,
                    }
                );
                const existingLigneDevisResponse = await axios.get(
                    `http://localhost:8000/api/ligneDevis/${editingDevis.id}`
                );

                const existingLigneDevis =
                    existingLigneDevisResponse.data.ligneDevis;
                console.log("existing LigneDevis", existingLigneDevis);
                const selectedPrdsData = selectedProductsData.map(
                    (selectedProduct, index) => {
                        // const existingLigneDevis = existingLigneDevis.find(
                        //   (ligneDevis) =>
                        //     ligneDevis.produit_id === selectedProduct.produit_id
                        // );

                        return {
                            id: selectedProduct.id,
                            id_devis: editingDevis.id,
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
                for (const ligneDevisData of selectedPrdsData) {
                    // Check if ligneDevis already exists for this produit_id and update accordingly

                    if (ligneDevisData.id) {
                        // If exists, update the existing ligneDevis
                        await axios.put(
                            `http://localhost:8000/api/ligneDevis/${ligneDevisData.id}`,
                            ligneDevisData,
                            {
                                withCredentials: true,
                                headers: {
                                    "X-CSRF-TOKEN": csrfToken,
                                },
                            }
                        );
                    } else {
                        // If doesn't exist, create a new ligneDevis
                        await axios.post(
                            "http://localhost:8000/api/ligneDevis",
                            ligneDevisData,
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
                    "http://localhost:8000/api/devises",
                    DevisData
                );
                //console.log(response.data.devi)
                const selectedPrdsData = selectedProductsData.map(
                    (selectProduct, index) => {
                        return {
                            id_devis: response.data.devis.id,
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
                for (const ligneDevisData of selectedPrdsData) {
                    // Sinon, il s'agit d'une nouvelle ligne de Devis
                    await axios.post(
                        "http://localhost:8000/api/ligneDevis",
                        ligneDevisData
                    );
                }

            }
            console.log("response of postDevis: ", response.data);

            fetchDevis();

            setSelectedClient([]);

            setSelectedProductsData([]);
            //fetchExistingLigneDevis();
            closeForm();

            // Afficher un message de succès à l'utilisateur
            Swal.fire({
                icon: "success",
                title: "Devis ajoutée avec succès",
                text: "La devise a été ajoutée avec succès.",
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

    const handleEdit = (devis) => {
        console.log("devis for edit", devis)

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

        console.log("formData for edit",formData)
        const selectedProducts = devis.lignedevis && devis.lignedevis.map((ligneDevis) => {
            const product = produits.find(
                (produit) => produit.id === ligneDevis.produit_id
            );
            console.log("product",product)
            return {
                id: ligneDevis.id,
                Code_produit: product.Code_produit,
                calibre_id: product.calibre_id,
                designation: product.designation,
                produit_id: ligneDevis.produit_id,
                quantite: ligneDevis.quantite,
                prix_vente: ligneDevis.prix_vente,
            };
        });
        setSelectedProductsData(selectedProducts);
        console.log("selectedProducts for edit",selectedProducts)
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
    // const handleProductCheckboxChange = (productId) => {
    //     const updatedSelectedProducts = selectedProducts.includes(productId)
    //         ? selectedProducts.filter((id) => id !== productId)
    //         : [...selectedProducts, productId];
    //     setSelectedProducts(updatedSelectedProducts);
    //
    //     console.log(updatedSelectedProducts);
    // };


    const handleProductSelection = (selectedProduct, index) => {
        console.log("selectedProduct", selectedProduct);
        const updatedSelectedProductsData = [...selectedProductsData];
        updatedSelectedProductsData[index] = selectedProduct;
        setSelectedProductsData(updatedSelectedProductsData);
        console.log("selectedProductsData", selectedProductsData);
    };


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

    const handlePDF = (devisId) => {
        // Récupérer les informations spécifiques au devis sélectionné
        const selectedDevis = devises.find((devis) => devis.id === devisId);

        // Création d'une nouvelle instance de jsPDF
        const doc = new jsPDF();

        // Position de départ pour l'impression des données
        let startY = 20;

        // Dessiner un cadre noir pour les informations du client
        doc.setDrawColor(0); // Couleur noire
        doc.setLineWidth(0.5); // Épaisseur de la ligne
        doc.rect(10, startY, 80, 40); // Rectangle pour les informations du client

        // Dessiner les informations du client dans un tableau à gauche
        const clientInfo = [
            { label: "Raison sociale:", value: selectedDevis.client.raison_sociale },
            { label: "Adresse:", value: selectedDevis.client.adresse },
            { label: "Téléphone:", value: selectedDevis.client.tele },
            { label: "ICE:", value: selectedDevis.client.ice },
            // Ajoutez d'autres informations client si nécessaire
        ];

        // Décalage pour le texte dans le cadre
        let textOffsetX = 15;
        let textOffsetY = 30;

        // Afficher les informations du client dans le cadre
        doc.setFontSize(10); // Police plus petite pour les informations du client
        clientInfo.forEach((info) => {
            doc.text(info.label, textOffsetX, textOffsetY);
            doc.text(info.value, textOffsetX + 40, textOffsetY);
            textOffsetY += 10; // Espacement entre les lignes du tableau
        });

        // Dessiner le tableau des informations du devis à droite
        const devisInfo = [
            { label: "N° Devis:", value: selectedDevis.reference },
            { label: "Date:", value: selectedDevis.date },
            { label: "Validation de l'offre:", value: selectedDevis.validation_offer },
            { label: "Mode de Paiement:", value: selectedDevis.modePaiement },
        ];

        // Dessiner le tableau des informations du devis à droite
        startY = 20; // Réinitialiser la position Y
        devisInfo.forEach((info) => {
            doc.text(info.label, 120, startY);
            doc.text(info.value, 160, startY);
            startY += 10; // Espacement entre les lignes du tableau
        });

        // Vérifier si les détails des lignes de devis sont définis
        if (selectedDevis.lignedevis) {
            // Dessiner les en-têtes du tableau des lignes de devis
            const headersLigneDevis = ["Produit","Code produit", "Désignation", "Quantité", "Prix", "Total HT"];

            // Récupérer les données des lignes de devis
            const rowsLigneDevis = selectedDevis.lignedevis.map((lignedevis) => [
                lignedevis.produit_id,
                lignedevis.produit_id,
                lignedevis.produit_id,
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
                ["Montant Total Hors Taxes:", getTotalHT(selectedDevis.lignedevis).toFixed(2)],
                ["TVA (20%):", calculateTVA(getTotalHT(selectedDevis.lignedevis)).toFixed(2)],
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
    function convertirEnLettres(montant) {
        // Tableau des chiffres en lettres
        const chiffresEnLettres = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];

        // Tableau des dizaines en lettres
        const dizainesEnLettres = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

        // Tableau des exceptions pour les nombres entre 10 et 19
        const exceptions = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];

        // Fonction pour convertir un nombre en lettre
        function convertirNombre(n) {
            if (n < 10) {
                return chiffresEnLettres[n];
            } else if (n >= 10 && n < 20) {
                return exceptions[n - 10];
            } else {
                const dizaine = Math.floor(n / 10);
                const unite = n % 10;

                // Traitement spécial pour les nombres entre 70 et 79 et entre 90 et 99
                if (dizaine === 7 || dizaine === 9) {
                    return dizainesEnLettres[dizaine] + "-" + (unite === 1 ? "et-" : "") + chiffresEnLettres[unite];
                } else {
                    return dizainesEnLettres[dizaine] + (unite === 0 ? "" : ("-" + chiffresEnLettres[unite]));
                }
            }
        }

        // Séparation de la partie entière et de la partie décimale
        const [partieEntiere, partieDecimale] = montant.toFixed(2).split(".");

        // Conversion de la partie entière en lettres
        let montantEnLettres = convertirNombre(parseInt(partieEntiere));

        // Ajout de la partie décimale si elle est différente de zéro
        if (parseInt(partieDecimale) !== 0) {
            montantEnLettres += " virgule " + convertirNombre(parseInt(partieDecimale));
        }

        return montantEnLettres;
    }


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
                    /*.client-info {*/
                    /*    float: right;*/
                    /*    width: 40%;*/
                    /*     height: 180px;*/
                    /*    border: 2px solid #000;*/
                    /*    padding: 10px;*/
                    /*    margin-left: 20px;*/
                    /*}*/
                    .client-info {
                         position: relative;
                         top: 10px; /* Ajuste cette valeur selon l'espace que tu veux entre l'en-tête et l'élément */
                         width: 250px; /* Largeur du rectangle */
                         height: 150px; /* Hauteur du rectangle */
                         padding: 10px;
                         border: 2px solid #000;
                         margin-left: 20px;
                         float: right;
   
    /*margin-top: 3px; !* Espace entre l'en-tête et l'élément *!*/
}
                    
                    h1, h2 {
                        text-align: center;
                        margin-top: 30px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 8px;
                        text-align: left;
                    }
                    .montant-table {
                        border: 1px solid #000;
                        margin-top: 20px;
                    }
                    .montant-table td {
                        padding: 8px;
                        text-align: left;
                    }
                    .montant-total {
                        font-weight: bold;
                        font-style: italic;
                        font-size: 24px; /* Ajuster la taille de la police selon vos préférences */
                        color: black; /* Changer la couleur des lettres */
                    }
                </style>
            </head>
            <body>
               <div>
    <h1>${title}</h1>
</div>

                <div class="client-info">
                    <h2><p>${selectedDevis.client.raison_sociale}</p></h2>
                    <p>${selectedDevis.client.adresse}</p>
                    <p>${selectedDevis.client.tele}</p>
                    <p>${selectedDevis.client.ice}</p>
                </div>

                <div style="clear:both;"></div>

               
                <table>
                    <thead>     
                        <tr>
                            <th style="border: 1px solid #000; padding: 8px; background-color: #adb5bd;">Date</th>
<th style="border: 1px solid #000; padding: 8px; background-color: #adb5bd;">Validation de l'offre</th>
<th style="border: 1px solid #000; padding: 8px; background-color: #adb5bd;">Mode de Paiement</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px;">${selectedDevis.date}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${selectedDevis.validation_offer}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${selectedDevis.modePaiement}</td>
                        </tr>
                    </tbody>
                </table>

              
                <table>
                    <thead>
                        <tr>
                            <th style="border: 1px solid #000; padding: 8px; background-color: #adb5bd;">Produit</th>
                            <th style="border: 1px solid #000; padding: 8px; background-color: #adb5bd;">Code produit</th>
                            <th style="border: 1px solid #000; padding: 8px; background-color: #adb5bd;">Désignation</th>
                            <th style="border: 1px solid #000; padding: 8px; background-color: #adb5bd;">Quantité</th>
                            <th style="border: 1px solid #000; padding: 8px; background-color: #adb5bd;">Prix unitaire</th>
                            <th style="border: 1px solid #000; padding: 8px; background-color: #adb5bd;">Total HT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${selectedDevis.lignedevis.map((lignedevis, index) => {
                const produit = produits.find(prod => prod.id === lignedevis.produit_id);
                return `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 8px;">${lignedevis.produit_id}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${produit ? produit.Code_produit : ''}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${produit ? produit.designation : ''}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${lignedevis.quantite}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${lignedevis.prix_vente}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${(lignedevis.quantite * lignedevis.prix_vente).toFixed(2)}</td>
                                </tr>
                            `;
            }).join('')}
                    </tbody>
                </table>

               
                <table class="montant-table">
                    <tbody>
                        <tr>
                            <td>Montant Total Hors Taxes :</td>
                            <td>${getTotalHT(selectedDevis.lignedevis).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>TVA (20%) :</td>
                            <td>${calculateTVA(getTotalHT(selectedDevis.lignedevis)).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>TTC :</td>
                            <td>${getTotalTTC(selectedDevis.lignedevis).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div>
                    <p class="montant-total">Arrêtée le présent devis à la somme de : ${convertirEnLettres(getTotalTTC(selectedDevis.lignedevis))}</p>
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
            console.error("Erreur lors de l'ouverture de la fenêtre d'impression.");
        }
    };

    // Fonction pour calculer le montant total hors taxes
    const getTotalHT = (lignedevis) => {
        // Check if ligneDevis is defined and is an array
        if (!Array.isArray(lignedevis)) {
            // Handle the case where ligneDevis is not an array
            console.error("Invalid input: lignedevis must be an array.");
            return 0; // or any default value that makes sense for your application
        }

        // ligneDevis is an array, proceed with the calculation
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
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Form.Label htmlFor="reference">Reference:</Form.Label>
                                        </div>
                                        <div className="col-sm-12">
                                            <Form.Control
                                                type="text"
                                                value={formData.reference}
                                                onChange={handleChange}
                                                name="reference"
                                            />
                                        </div>
                                    </div>
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="date">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Form.Label htmlFor="date">Date:</Form.Label>
                                        </div>
                                        <div className="col-sm-12">
                                            <Form.Control
                                                type="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                name="date"
                                            />
                                        </div>
                                    </div>
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="validation_offer">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Form.Label htmlFor="validation_offer">Validation de l'offre:</Form.Label>
                                        </div>
                                        <div className="col-sm-12">
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
                                        </div>
                                    </div>
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="modePaiement">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Form.Label htmlFor="modePaiement">Mode de Paiement:</Form.Label>
                                        </div>
                                        <div className="col-sm-12">
                                            <Form.Control
                                                type="text"
                                                value={formData.modePaiement}
                                                onChange={handleChange}
                                                name="modePaiement"
                                            />
                                        </div>
                                    </div>
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="status">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Form.Label htmlFor="status">Status:</Form.Label>
                                        </div>
                                        <div className="col-sm-12">
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
                                        </div>
                                    </div>
                                </Form.Group>
                                {/*<Form.Group className="m-2 col-4" controlId="client_id">*/}
                                {/*    <Form.Select*/}
                                {/*        id="client_id"*/}
                                {/*        className="form-select col-2"*/}
                                {/*        value={formData.client_id}*/}
                                {/*        onChange={handleChange}*/}
                                {/*        name="client_id"*/}
                                {/*    >*/}
                                {/*        <option>Client</option>*/}
                                {/*        {clients.map((client) => (*/}
                                {/*            <option key={client.id} value={client.id}>*/}
                                {/*                {client.raison_sociale}*/}
                                {/*            </option>*/}
                                {/*        ))}*/}
                                {/*    </Form.Select>*/}
                                {/*</Form.Group>*/}
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

                                {/*<Form.Group className="m-2 col-4" controlId="user_id">*/}
                                {/*    <Form.Label>Utilisateur:</Form.Label>*/}
                                {/*    <Form.Control*/}
                                {/*        type="text"*/}
                                {/*        value={formData.user_id}*/}
                                {/*        onChange={handleChange}*/}
                                {/*        name="user_id"*/}
                                {/*    />*/}
                                {/*</Form.Group>*/}

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
                                                                <td>
                                                                    <Select
                                                                        options={produits.map((produit) => ({
                                                                            value: produit.designation,
                                                                            label: produit.designation,
                                                                        }))}
                                                                        onChange={(selected) => {
                                                                            const produit = produits.find(
                                                                                (prod) => prod.designation === selected.value
                                                                            );
                                                                            if (produit) {
                                                                                handleProductSelection({
                                                                                    produit_id: produit.id,
                                                                                    Code_produit: produit.Code_produit,
                                                                                    designation: selected.value,
                                                                                    calibre_id: produit.calibre_id,
                                                                                    calibre: produit.calibre,
                                                                                }, index);
                                                                            }
                                                                        }}
                                                                        value={{
                                                                            value: productData.designation,
                                                                            label: productData.designation,
                                                                        }}
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
                                {formData.status === "Valider" && (
                                    <div className="col-4">
                                        <Button className="btn btn-sm m-2" variant="success" onClick={handleGenerateFacture}>
                                            <LiaFileInvoiceSolid />
                                        </Button>
                                        <Button className="btn btn-sm m-2" variant="dark" onClick={handleGenerateBonLivraison}>
                                            <CiDeliveryTruck />
                                        </Button>
                                    </div>
                                )}
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
                                            <td>{calculateTVA(getTotalHT(devis.ligneDevis))} DH</td> {/* Display TVA */}
                                            <td>{getTotalTTC(devis.ligneDevis)} DH</td> {/* Display Total TTC */}
                                            <td>{devis.status}</td>
                                            <td>{devis.validation_offer}</td>
                                            <td>{devis.modePaiement}</td>
                                            <td>
                                                <div className="d-inline-flex text-center">


                                                        <Button className="btn btn-info btn-sm m-2" onClick={() => handleEdit(devis)}>
                                                            <i className="fas fa-edit"></i>
                                                        </Button>
                                                        <Button className="btn btn-danger btn-sm m-2" onClick={() => handleDelete(devis.id)}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </Button>

                                                        {/*<Button className="btn btn-sm m-2" onClick={() => handlePDF(devis.id)}>*/}
                                                        {/*    <FontAwesomeIcon icon={faFilePdf} />*/}
                                                        {/*</Button>*/}
                                                        <Button className="btn btn-sm m-2" onClick={() => print(devis.id)}>
                                                            <FontAwesomeIcon icon={faPrint} />
                                                        </Button>

                                                    {devis.status === "Valider" && (
                                                        <div>
                                                            <Button className="btn btn-sm m-2" variant="success" onClick={() => handleGenerateFacture(devis)}>
                                                                <LiaFileInvoiceSolid />
                                                            </Button>
                                                            <Button className="btn btn-sm m-2" variant="dark" onClick={() =>handleGenerateBonLivraison(devis)}>
                                                                <CiDeliveryTruck />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                        </tr>
                                        {expandedRows.includes(devis.id) && devis.ligneDevis && (
                                            <tr>
                                                <td colSpan="12">
                                                    <div>
                                                        <table
                                                            className="table table-responsive table-bordered"

                                                        >
                                                            <thead>
                                                            <tr>
                                                                <th    style={{ backgroundColor: "#adb5bd" }}>Code Produit</th>
                                                                <th    style={{ backgroundColor: "#adb5bd" }}>designation</th>
                                                                <th    style={{ backgroundColor: "#adb5bd" }}>calibre</th>
                                                                <th    style={{ backgroundColor: "#adb5bd" }}>Quantite</th>
                                                                <th    style={{ backgroundColor: "#adb5bd" }}>Prix Vente</th>
                                                                <th    style={{ backgroundColor: "#adb5bd" }}>Total HT </th>
                                                                {/* <th className="text-center">Action</th> */}
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {devis.ligneDevis.map((ligneDevis) => {
                                                                    const produit = produits.find(
                                                                        (prod) =>
                                                                            prod.id === ligneDevis.produit_id
                                                                    );
                                                                    console.log("prod",produit)
                                                                    console.log("id",ligneDevis.produit_id)

                                                                    return (
                                                                        <tr key={ligneDevis.id}>
                                                                            <td>{produit.Code_produit}</td>
                                                                            <td>{produit.designation}</td>
                                                                            <td>{produit.calibre.calibre}</td>
                                                                            <td>{ligneDevis.quantite}</td>
                                                                            <td>{ligneDevis.prix_vente} DH</td>
                                                                            <td>
                                                                                {(
                                                                                    ligneDevis.quantite *
                                                                                    ligneDevis.prix_vente
                                                                                ).toFixed(2)}{" "}
                                                                                DH
                                                                            </td>


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