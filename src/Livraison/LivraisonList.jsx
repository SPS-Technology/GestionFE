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
import {
    faTrash,
    faFilePdf,
    faPrint,
    faPlus,
    faMinus,
} from "@fortawesome/free-solid-svg-icons";
import TablePagination from "@mui/material/TablePagination";
import Select from "react-dropdown-select";

const LivraisonList = () => {
    const [livraisons, setLivraisons] = useState([]);
    const [clients, setClients] = useState([]);
    const [authId, setAuthId] = useState([]);
    const [selectedClient, setSelectedClient] = useState([]);
    const [editinglivraison, setEditinglivraison] = useState(null); // State to hold the devis being edited
    const csrfTokenMeta = document.head.querySelector('meta[name="csrf-token"]');
    const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : null;


    const [siteclients, setSiteclients] = useState([]);
    const [commandes, setCommandes] = useState([]);
    const [devises, setDevises] = useState([]);
    const [produits, setProduits] = useState([]);
    const [selectedProductsData, setSelectedProductsData] = useState([]);
    const [modifiedQuantiteValues, setModifiedQuantiteValues] = useState({});
    const [modifiedPrixValues, setModifiedPrixValues] = useState({});
    const [Lignelivraisons, setLignelivraisons] = useState([]);


    const [expandedRows, setExpandedRows] = useState([]);

    const [formData, setFormData] = useState({
        reference: "",
        date: "",
        commande_id: "",
        client_id: "",
        user_id: "",
        Code_produit: "",
        designation: "",
        prix_vente: "",
        quantite: "",
        id_bon__livraisons: "",
    });
    const [errors, setErrors] = useState({
        reference: "",
        date: "",
        commande_id: "",
        client_id: "",
        user_id: "",
    });
    const [formContainerStyle, setFormContainerStyle] = useState({
        right: "-100%",
    });
    const [tableContainerStyle, setTableContainerStyle] = useState({
        marginRight: "0px",
    });
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredlivraisons, setFilteredlivraisons] = useState([]);

    // Pagination calculations
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const indexOfLastLivraison = (page + 1) * rowsPerPage;
    const indexOfFirstLivraison = indexOfLastLivraison - rowsPerPage;
    const currentLivraisons = livraisons.slice(
        indexOfFirstLivraison,
        indexOfLastLivraison
    );

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
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

    const getElementValueById = (id) => {
        return document.getElementById(id)?.value || "";
    };
    // const toggleRow = async (livraisonId) => {
    //     if (!expandedRows.includes(commandeId)) {
    //         try {
    //             // Récupérer les lignes de devis associées à ce devis
    //             const commande = await fetchLivraisons(commandeId);
    //
    //             // Mettre à jour l'état pour inclure les lignes de devis récupérées
    //             setCommandes((pervcommande) => {
    //                 return pervcommande.map((commandeId) => {
    //                     if (commandeId.id === commandeId) {
    //                         return { ...commande, commande };
    //                     }
    //                     return commande;
    //                     console.log("comande",commande)
    //                 });
    //             });
    //
    //             // Ajouter l'ID du devis aux lignes étendues
    //             setExpandedRows([...expandedRows, commandeId]);
    //             console.log("expandsRows",expandedRows);
    //         } catch (error) {
    //             console.error(
    //                 "Erreur lors de la récupération des lignes de commande :",
    //                 error
    //             );
    //         }
    //     }
    // };
    const fetchLignelivraison = async (livraisonsId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/livraisons/${livraisonsId}/lignelivraisons`
            );
            console.log("fetch lign livraison ", response.data.ligneLivraisons);
            return response.data.ligneLivraisons;
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des lignes de livraison :",
                error
            );
            return [];
        }
    };
    const handleShowLigneLivraison = async (livraisonId) => {
        setExpandedRows((prevRows) =>
            prevRows.includes(livraisonId)
                ? prevRows.filter((row) => row !== livraisonId)
                : [...prevRows, livraisonId]
        );
    };
    useEffect(() => {
        // Préchargement des lignes de facture pour chaque facture
        livraisons.forEach(async (livraison) => {
            if (!livraison.ligneLivraisons) {
                try {
                    const ligneLivraisons = await fetchLignelivraison(livraison.id);
                    setLivraisons((prevlivraisons) => {
                        return prevlivraisons.map((prevlivraison) => {
                            if (prevlivraison.id === livraison.id) {
                                return { ...prevlivraison, ligneLivraisons };
                            }
                            return prevlivraison;
                        });
                    });
                } catch (error) {
                    console.error('Erreur lors du préchargement des lignes de livraison:', error);
                }
            }
        });
    }, []); // Le tableau de dépendances vide signifie que ce useEffect ne sera exécuté qu'une seule fois après le montage du composant


    const handleProductSelection = (selectedProduct, index) => {
        console.log("selectedProduct", selectedProduct);
        const updatedSelectedProductsData = [...selectedProductsData];
        updatedSelectedProductsData[index] = selectedProduct;
        setSelectedProductsData(updatedSelectedProductsData);
        console.log("selectedProductsData", selectedProductsData);
    };


    const handleAddEmptyRow = () => {
        setSelectedProductsData([...selectedProductsData, {}]);
        console.log("selectedProductData", selectedProductsData);
    };
    const populateProductInputs = (ligneLivraisonsId, inputType) => {
        console.log("ligneLivraisonsId", ligneLivraisonsId);
        const existingligneLivraisons = selectedProductsData.find(
            (ligneLivraisons) => ligneLivraisons.id === ligneLivraisonsId
        );
        console.log("existing ligneLivraisons", existingligneLivraisons);

        if (existingligneLivraisons) {
            return existingligneLivraisons[inputType];
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
                .delete(`http://localhost:8000/api/lignelivraisons/${id}`)
                .then(() => {
                    fetchLivraisons();
                });
        }
    };


    const fetchLivraisons = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/livraisons");
            setLivraisons(response.data.livraison);
            console.log("API Response:", response.data);
            const ClientResponse = await axios.get(
                "http://localhost:8000/api/clients"
            );
            // console.log("API Response:", response.data);
            setClients(ClientResponse.data.client);
            const SiteclientResponse = await axios.get(
                "http://localhost:8000/api/siteclients"
            );

            setSiteclients(SiteclientResponse.data.siteclient);

            const CommandeResponse = await axios.get(
                "http://localhost:8000/api/commandes"
            );

            setCommandes(CommandeResponse.data.commandes);
            console.log("commande Response:", response.data);

            const lignelivraisonResponse = await axios.get(
                "http://localhost:8000/api/lignelivraisons"
            );
            setLignelivraisons(lignelivraisonResponse.data.ligneLivraisons);



            const produitResponse = await axios.get(
                "http://localhost:8000/api/produits"
            );
            setProduits(produitResponse.data.produit);

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
        fetchLivraisons();
    }, []);
    useEffect(() => {
        const filtered = livraisons.filter((livraison) =>
            livraison.reference.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredlivraisons(filtered);
    }, [livraisons, searchTerm]);
    const handleSearch = (term) => {
        setSearchTerm(term);
    };


    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //
    //     try {
    //         if (formData.id) {
    //             // Editing an existing entry
    //             await axios.put(
    //                 `http://localhost:8000/api/livraisons/${formData.id}`,
    //                 formData
    //             );
    //         } else {
    //             // Adding a new entry
    //             await axios.post("http://localhost:8000/api/livraisons", formData);
    //         }
    //         fetchLivraisons();
    //         // Show success message using SweetAlert
    //         Swal.fire({
    //             icon: "success",
    //             title: "Success!",
    //             text: "Form submitted successfully!",
    //         });
    //         setErrors({
    //             reference: "",
    //             date: "",
    //             commande_id: "",
    //             client_id: "",
    //             user_id: "",
    //         });
    //         clearFormData();
    //         closeForm();
    //     } catch (error) {
    //         if (error.response) {
    //             const serverErrors = error.response.data.error;
    //             console.log(serverErrors);
    //             setErrors({
    //                 reference: serverErrors.reference ? serverErrors.reference[0] : "",
    //                 date: serverErrors.date ? serverErrors.date[0] : "",
    //                 commande_id: serverErrors.commande_id
    //                     ? serverErrors.commande_id[0]
    //                     : "",
    //                 // periode: serverErrors.periode ? serverErrors.periode[0] : "",
    //             });
    //         }
    //         // Handle error as needed
    //     }
    // };

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
            const LivraisonData = {
                reference: formData.reference,
                date: formData.date,
                commande_id: formData.commande_id,
                client_id: selectedClient.id,
                user_id: authId,
            };

            let response;
            if (editinglivraison) {
                // Mettre à jour le Devis existant
                response = await axios.put(
                    `http://localhost:8000/api/livraisons/${editinglivraison.id}`,
                    {
                        reference: formData.reference,
                        date: formData.date,
                        commande_id: formData.commande_id,
                        client_id: selectedClient.id,
                        user_id: authId,
                    }
                );
                const existingLigneDevisResponse = await axios.get(
                    `http://localhost:8000/api/lignelivraisons/${editinglivraison.id}`
                );

                const existingLigneLivraison =
                    existingLigneDevisResponse.data.ligneLivraisons;
                console.log("existing ligneLivraisons", existingLigneLivraison);
                const selectedPrdsData = selectedProductsData.map(
                    (selectedProduct, index) => {
                        // const existingLigneDevis = existingLigneDevis.find(
                        //   (ligneDevis) =>
                        //     ligneDevis.produit_id === selectedProduct.produit_id
                        // );

                        return {
                            id: selectedProduct.id,
                            id_bon__livraisons:editinglivraison.id,
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
                for (const lignelivraisonData of selectedPrdsData) {
                    // Check if ligneDevis already exists for this produit_id and update accordingly

                    if (lignelivraisonData.id) {
                        // If exists, update the existing ligneDevis
                        await axios.put(
                            `http://localhost:8000/api/lignelivraisons/${lignelivraisonData.id}`,
                            lignelivraisonData,
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
                            lignelivraisonData,
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
                // Créer un nouveau Bon Livraison
                response = await axios.post(
                    "http://localhost:8000/api/livraisons",
                    LivraisonData
                );
                console.log(response.data)
                const selectedPrdsData = selectedProductsData.map(
                    (selectProduct, index) => {
                        return {
                            id_bon__livraisons: response.data.livraison.id,
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
                for (const lignelivraisonData of selectedPrdsData) {
                    // Sinon, il s'agit d'une nouvelle ligne de Devis
                    await axios.post(
                        "http://localhost:8000/api/lignelivraisons",
                        lignelivraisonData
                    );
                }

            }
            console.log("response of postDevis: ", response.data);

            fetchLivraisons();

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

    const clearFormData = () => {
        // Reset the form data to empty values
        setFormData({
            reference: "",
            date: "",
            commande_id: "",
            client_id: "",
            user_id: "",
        });
        setErrors({
            reference: "",
            date: "",
            commande_id: "",
            client_id: "",
            user_id: "",
        });
    };

    const handleEdit = (livraison) => {
        setFormData({
            id: livraison.id,
            reference: livraison.reference,
            date: livraison.date,
            commande_id: livraison.commande_id,
            client_id: livraison.client_id,
            user_id: livraison.user_id,
        });
        if (formContainerStyle.right === "-100%") {
            setFormContainerStyle({ right: "0" });
            setTableContainerStyle({ marginRight: "500px" });
        } else {
            closeForm();
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Êtes-vous sûr de vouloir supprimer cette bon de livraison ?",
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
                await axios.delete(`http://localhost:8000/api/livraisons/${id}`);

                // Refresh the list of invoices (if necessary)
                fetchLivraisons(); // Ensure this function retrieves the list of invoices again after deletion

                Swal.fire({
                    icon: "success",
                    title: "Succès!",
                    text: "bon de livraison supprimée avec succès.",
                });
            } else {
                console.log("Suppression annulée");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de la bon de livraison:", error);

            Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression de la bon de livraison.",
            });
        }
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
            ref_BL: "",
            commande_id: "",
            client_id: "",
            user_id: "",
            // Code_produit: "",
            // designation: "",
            // prix_vente: "",
            // quantite: "",
            // id_bon__livraisons: "",
        });
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const getSiteClientInfo = (siteId) => {
        return siteId ? siteclients.find((site) => site.id === siteId) : null;
    };
    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ display: "flex" }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    <Toolbar />
                    <div className="container">
                        <div
                            className="search-container d-flex flex-row-reverse col-3"
                            role="search"
                        >
                            <Search onSearch={handleSearch} type="search" />
                        </div>
                        <Button
                            variant="primary"
                            className="col-2 btn btn-sm m-2"
                            id="showFormButton"
                            onClick={handleShowFormButtonClick}
                        >
                            {showForm ? "Modifier le formulaire" : "Ajouter Bon Livraison"}
                        </Button>
                        <div id="formContainer" className="" style={formContainerStyle}>
                            <Form className="row" onSubmit={handleSubmit}>
                                <Form.Group className="m-2 col-4" controlId="reference">
                                    <Form.Label>Reference:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        name="reference"
                                    />
                                    <Form.Text className="text-danger">
                                        {errors.reference}
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group className="m-2 col-4" controlId="date">
                                    <Form.Label>Date:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        name="date"
                                    />
                                    <Form.Text className="text-danger">
                                        {errors.date}
                                    </Form.Text>
                                </Form.Group>
                                {/* <Form.Group className="m-2 col-4" controlId="ref_BC">
                  <Form.Label>N° BC</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.ref_BC}
                    onChange={handleChange}
                    name="ref_BC"
                  />
                </Form.Group> */}
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
                                <Form.Group className="m-2 col-4" controlId="commande_id">
                                    <Form.Label>Commande</Form.Label>
                                    <Form.Select
                                        value={formData.commande_id}
                                        onChange={handleChange}
                                        name="commande_id"
                                    >
                                        <option value="">Sélectionner une commande</option>
                                        {commandes.map((commande) => (
                                            <option key={commande.id} value={commande.id}>
                                                {commande.reference}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="m-2 col-4" controlId="user_id">
                                    <Form.Label>User_id</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.user_id}
                                        onChange={handleChange}
                                        name="user_id"
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
                                <div className="col-3 mt-5">
                                    <Button
                                        className="btn btn-sm"
                                        variant="primary"
                                        type="submit"
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </Form>
                        </div>
                        <div
                            id="tableContainer"
                            className="table-responsive-sm"
                            style={tableContainerStyle}
                        >
                            <table className="table table-bordered">
                                <thead className="text-center" style={{ backgroundColor: "#adb5bd" }}>
                                <tr>
                                    <th>détails</th>
                                    <th>N° BL</th>
                                    <th>Date</th>
                                    <th>Ref Commande</th>
                                    <th>Client</th>
                                    {/*<th>siteclient</th>*/}
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody className="text-center">
                                {filteredlivraisons
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((livraison) => {
                                        return (
                                            <React.Fragment key={livraison.id}>
                                                <tr key={livraison.id}>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-light"
                                                            onClick={() => handleShowLigneLivraison(livraison.id)}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    expandedRows.includes(livraison.id)
                                                                        ? faMinus
                                                                        : faPlus
                                                                }
                                                            />
                                                        </button>
                                                    </td>
                                                    <td>{livraison.reference}</td>
                                                    <td>{livraison.date}</td>
                                                    <td>{livraison.commande ? livraison.commande.reference : ""}</td>
                                                    <td>{livraison.client.raison_sociale}</td>
                                                    {/*<td>*/}
                                                    {/*    {siteClient*/}
                                                    {/*        ? siteClient.raison_sociale*/}
                                                    {/*        : "aucun site"}*/}
                                                    {/*</td>*/}
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-info m-1"
                                                            onClick={() => handleEdit(livraison)}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <Button className="btn btn-danger btn-sm m-2" onClick={() => handleDelete(livraison.id)}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </Button>
                                                        {/* Uncomment if handleLivraisonExport function is defined */}
                                                        {/* <Button */}
                                                        {/*    className="btn btn-sm m-2" */}
                                                        {/*    onClick={() => handleLivraisonExport(livraison.id)} */}
                                                        {/* > */}
                                                        {/*    <FontAwesomeIcon icon={faFilePdf} /> */}
                                                        {/* </Button> */}
                                                    </td>
                                                </tr>
                                                {expandedRows.includes(livraison.id) && livraison.lignelivraison && (
                                                    <tr>
                                                        <td colSpan="6">
                                                            <div>
                                                                <table className="table table-responsive table-bordered" style={{ backgroundColor: "#adb5bd" }}>
                                                                    <thead>
                                                                    <tr>
                                                                        <th>Code Produit</th>
                                                                        <th>Quantite</th>
                                                                        <th>Prix Vente</th>
                                                                        {/*<th>Quantite</th>*/}
                                                                        {/*<th></th>*/}
                                                                        {/*<th>Total HT </th>*/}
                                                                        {/* <th className="text-center">Action</th> */}
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                    {livraison.lignelivraison.map((ligneLivraisons) => (
                                                                        // const produit = produits.find(prod => prod.id === ligneLivraisons.produit_id);
                                                                        // console.log("prod",produit)
                                                                        // console.log("id",ligneLivraisons.produit_id)
                                                                        // return (
                                                                            <tr key={ligneLivraisons.id}>
                                                                                <td>{ligneLivraisons.produit_id}</td>
                                                                                {/*<td>{ligneLivraisons.designation}</td>*/}
                                                                                {/*<td>{produit.calibre.calibre}</td>*/}
                                                                                <td>{ligneLivraisons.quantite}</td>
                                                                                <td>{ligneLivraisons.prix_vente} DH</td>
                                                                                {/*<td>{(ligneLivraisons.quantite * ligneLivraisons.prix_vente).toFixed(2)} DH</td>*/}
                                                                            </tr>
                                                                    )
                                                                        // );
                                                                   )}
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

                        <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredlivraisons.length}
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

export default LivraisonList;