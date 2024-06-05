import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import Navigation from "../Acceuil/Navigation";
import Search from "../Acceuil/Search";
import TablePagination from "@mui/material/TablePagination";
import ExportToPdfButton from "./exportToPdf";
import PrintList from "./PrintList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faFilePdf,
    faFileExcel,
    faPrint,
    faEdit,
    faPlus,
    faFilter,
} from "@fortawesome/free-solid-svg-icons";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Toolbar } from "@mui/material";
import { BsShop } from "react-icons/bs";

const ProduitList = () => {
    const [produits, setProduits] = useState([]);
    const [user, setUser] = useState({});
    const [categories, setCategories] = useState([]);
    let isEdit = false;
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProduits, setFilteredProduits] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filteredProduitsByCategory, setFilteredProduitsByCategory] = useState(
        []
    );
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [editingProduit, setEditingProduit] = useState(null);
    const [editingProduitId, setEditingProduitId] = useState(null);
    const [userHasDeletePermission, setUserHasDeletePermission] = useState(true);
    const [formContainerStyle, setFormContainerStyle] = useState({
        right: "-500px",
    });
    const [tableContainerStyle, setTableContainerStyle] = useState({
        marginRight: "0px",
    });

    const tableHeaderStyle = {
        background: "#e0e0e0",
        padding: "10px",
        textAlign: "left",
        borderBottom: "1px solid #ddd",
    };



    const [showForm, setShowForm] = useState(false);
    const [calibres, setCalibres] = useState([]);

    const [formData, setFormData] = useState({
        Code_produit: "",
        designation: "",
        type_quantite: "",
        unite: "",
        seuil_alerte: "",
        stock_initial: "",
        etat_produit: "",
        calibre_id: "",
        user_id: "",
        categorie_id: "",
        prix_vente: "",
        marque: "",
        logoP: "",
    });
    const [errors, setErrors] = useState({
        Code_produit: "",
        designation: "",
        type_quantite: "",
        unite: "",
        seuil_alerte: "",
        stock_initial: "",
        etat_produit: "",
        calibre_id: "",
        user_id: "",
        categorie_id: "",
    });
    useEffect(
        () => {
            fetchCalibres();
            fetchProduits();
            fetchCategories();
        },
        [],
        [],
        []
    );
    const fetchCalibres = async () => {
        try {
            const responseCalibre = await axios.get(
                "http://localhost:8000/api/calibres"
            );
            setCalibres(responseCalibre.data);
            console.log("calibres", responseCalibre);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const fetchCategories = async () => {
        try {
            const responseCategories = await axios.get(
                "http://localhost:8000/api/categories"
            );
            setCategories(responseCategories.data);
            console.log("categories", responseCategories);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const fetchProduits = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/produits");
            setProduits(response.data.produit);
            const usersResponse = await axios.get("http://localhost:8000/api/user");
            const authenticatedUserId = usersResponse.data.id;
            setUser(authenticatedUserId);
            console.log("user authentifié", authenticatedUserId);
            const responseCategories = await axios.get(
                "http://localhost:8000/api/categories"
            );
            setCategories(responseCategories.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response && error.response.status === 403) {
                Swal.fire({
                    icon: "error",
                    title: "Accès refusé",
                    text: "Vous n'avez pas l'autorisation de voir la liste des produits.",
                });
            }
        }
    };

    useEffect(() => {
        if (produits) {
            const filtered = produits.filter((produit) => {
                return Object.entries(produit).some(([key, value]) => {
                    if (
                        key === "Code_produit" ||
                        key === "designation" ||
                        key === "type_quantite" ||
                        key === "unite" ||
                        key === "seuil_alerte" ||
                        key === "stock_initial" ||
                        key === "etat_produit" ||
                        key === "prix_vente"
                    ) {
                        if (typeof value === "string") {
                            return value.toLowerCase().includes(searchTerm.toLowerCase());
                        } else if (typeof value === "number") {
                            return value.toString().includes(searchTerm.toString());
                        }
                    } else if (key === "calibre_id") {
                        return produit["calibre"].calibre
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase());
                    }
                    // } else if (key === "categorie_id") {
                    //   return produit["categorie"].categorie
                    //     .toLowerCase()
                    //     .includes(searchTerm.toLowerCase());
                    // }
                    return false;
                });
            });
            setFilteredProduits(filtered);
        }
    }, [produits, searchTerm]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        console.log("Selected category:", selectedCategory);
        console.log("Produits:", produits);
        const filterProductsByCategory = (categoryId) => {
            if (categoryId === "") {
                console.log("No category selected, displaying all products");
                setFilteredProduitsByCategory(produits);
            } else {
                console.log("Filtering products by category:", categoryId);
                const filtered = produits.filter(
                    (produit) => produit.categorie_id === parseInt(categoryId)
                );
                console.log("Filtered products:", filtered);
                setFilteredProduitsByCategory(filtered);
            }
        };

        // Appel de la fonction pour filtrer les produits par catégorie
        filterProductsByCategory(selectedCategory);
    }, [selectedCategory, produits]);

    const handleCategoryFilterChange = (event) => {
        const categoryId = event.target.value;
        setSelectedCategory(categoryId);
    };

    const handleRadioChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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
            setSelectedItems(produits.map((produit) => produit.id));
        }
    };

    const handleDeleteSelected = () => {
        Swal.fire({
            title: "Êtes-vous sûr de vouloir supprimer ?",
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
                selectedItems.forEach((id) => {
                    axios
                        .delete(`http://localhost:8000/api/produits/${id}`)
                        .then((response) => {
                            fetchProduits();
                            Swal.fire({
                                icon: "success",
                                title: "Success!",
                                text: "produit supprimé avec succès.",
                            });
                        })
                        .catch((error) => {
                            console.error("Error deleting product:", error);
                            if (error.response && error.response.status === 403) {
                                Swal.fire({
                                    icon: "error",
                                    title: "Accès refusé",
                                    text: "Vous n'avez pas l'autorisation de supprimer ce produit.",
                                });
                            } else {
                                Swal.fire({
                                    icon: "error",
                                    title: "Error!",
                                    text: "Échec de la suppression du produit.",
                                });
                            }
                        });
                });
            }
        });
        setSelectedItems([]);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Êtes-vous sûr de vouloir supprimer ce produit ?",
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
                axios
                    .delete(`http://localhost:8000/api/produits/${id}`)
                    .then((response) => {
                        fetchProduits();
                        Swal.fire({
                            icon: "success",
                            title: "Succès!",
                            text: "Produit supprimé avec succès.",
                        });
                    })
                    .catch((error) => {
                        console.error("Error deleting product:", error);
                        if (error.response && error.response.status === 403) {
                            Swal.fire({
                                icon: "error",
                                title: "Accès refusé",
                                text: "Vous n'avez pas l'autorisation de supprimer ce produit.",
                            });
                        } else if (error.response && error.response.status === 400) {
                            // Afficher le message d'erreur dans Swal.fire()
                            Swal.fire({
                                icon: "error",
                                title: "Erreur",
                                text: error.response.data.error
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Erreur!",
                                text: "Échec de la suppression du produit.",
                            });
                        }
                    });
            } else {
                console.log("Suppression annulée");
            }
        });
    };
    const handleShowFormButtonClick = () => {
        if (formContainerStyle.right === "-500px") {
            setFormContainerStyle({ right: "0" });
            setTableContainerStyle({ marginRight: "500px" });
        } else {
            closeForm();
        }
    };

    const closeForm = () => {
        setFormContainerStyle({ right: "-500px" });
        setTableContainerStyle({ marginRight: "0" });
        setShowForm(false); // Hide the form
        setFormData({
            logoP:"",
            marque:"",
            Code_produit: "",
            designation: "",
            type_quantite: "",
            unite: "",
            seuil_alerte: "",
            prix_vente: "",
            stock_initial: "",
            etat_produit: "",
            calibre_id: "",
            user_id: "",
            categorie_id: "",
        });
        setErrors({
            Code_produit: "",
            designation: "",
            type_quantite: "",
            unite: "",
            seuil_alerte: "",
            stock_initial: "",
            etat_produit: "",
            calibre_id: "",
            user_id: "",
            categorie_id: "",
        });
        setEditingProduit(null); // Clear editing client
    };

    const handleEdit = (produit) => {
        setEditingProduit(produit);
        setFormData({
            Code_produit: produit.Code_produit,
            designation: produit.designation,
            type_quantite: produit.type_quantite,
            unite: produit.unite,
            seuil_alerte: produit.seuil_alerte,
            stock_initial: produit.stock_initial,
            etat_produit: produit.etat_produit,
            calibre_id: produit.calibre_id,
            categorie_id: produit.categorie_id,
            marque: produit.marque,
            prix_vente: produit.prix_vente,
        });
        if (formContainerStyle.right === "-500px") {
            setFormContainerStyle({ right: "0" });
            setTableContainerStyle({ marginRight: "500px" });
        } else {
            closeForm();
        }
    };
    useEffect(() => {
        if (editingProduitId !== null) {
            setFormContainerStyle({ right: "0" });
            setTableContainerStyle({ marginRight: "500px" });
        }
    }, [editingProduitId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]:
                e.target.type === "file" ? e.target.files[0] : e.target.value,
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingProduit
            ? `http://localhost:8000/api/produits/${editingProduit.id}`
            : "http://localhost:8000/api/produits";
        const method = editingProduit ? "put" : "post";

        let requestData;

        if (editingProduit) {
            requestData = {
                Code_produit: formData.Code_produit,
                designation: formData.designation,
                calibre_id: formData.calibre_id,
                type_quantite: formData.type_quantite,
                unite: formData.unite,
                seuil_alerte: formData.seuil_alerte,
                stock_initial: formData.stock_initial,
                etat_produit: formData.etat_produit,
                marque: formData.marque,
                prix_vente: formData.prix_vente,
                categorie_id: formData.categorie_id,
            };
        } else {
            const formDatad = new FormData();
            formDatad.append("Code_produit", formData.Code_produit);
            formDatad.append("designation", formData.designation);
            formDatad.append("calibre_id", formData.calibre_id);
            formDatad.append("type_quantite", formData.type_quantite);
            formDatad.append("unite", formData.unite);
            formDatad.append("seuil_alerte", formData.seuil_alerte);
            formDatad.append("stock_initial", formData.stock_initial);
            formDatad.append("etat_produit", formData.etat_produit);
            formDatad.append("marque", formData.marque);
            formDatad.append("prix_vente", formData.prix_vente);
            formDatad.append("categorie_id", formData.categorie_id);
            if (formData.logoP) {
                formDatad.append("logoP", formData.logoP);
            }
            requestData = formDatad;
            console.log(requestData)
        }

        try {
            const response = await axios({
                method: method,
                url: url,
                data: requestData,
            });

            if (response.status === 200) {
                const produitId = response.data.produit.id;

                // Vérifiez si c'est une nouvelle création de produit
                if (!editingProduit) {
                    // Ajouter au stock uniquement pour un nouveau produit
                    const stockData = {
                        produit_id: produitId,
                        quantite: formData.stock_initial,
                        seuil_minimal: formData.seuil_alerte,
                    };

                    await axios.post('http://localhost:8000/api/stock', stockData);
                }
                //  else {
                //   // Si c'est une modification de produit, mettre à jour le stock associé
                //   try {
                //     const stockUpdateData = {
                //       produit_id: produitId,
                //       quantite: formData.stock_initial,
                //       seuil_minimal: formData.seuil_alerte,
                //     };
                //     console.log(stockUpdateData);
                //     await axios.put(`http://localhost:8000/api/stock/${produitId}`, stockUpdateData);
                //   } catch (error) {
                //     console.error("Une erreur est survenue lors de la mise à jour du stock :", error);
                //     // Gérez l'erreur ici, vous pouvez afficher un message d'erreur à l'utilisateur ou effectuer d'autres actions nécessaires.
                //   }
                // }
            }

            // Le reste de votre code pour le message de succès, etc.
            fetchProduits();
            const successMessage = `Produit ${editingProduit ? "modifié" : "ajouté"} avec succès.`;
            Swal.fire({
                icon: "success",
                title: "Succès!",
                text: successMessage,
            });

            // Réinitialiser le formulaire et les erreurs
            setFormData({
                Code_produit: "",
                designation: "",
                calibre_id: "",
                type_quantite: "",
                unite: "",
                seuil_alerte: "",
                stock_initial: "",
                etat_produit: "",
                marque: "",
                categorie_id: "",
                logoP: null,
            });
            setErrors({
                Code_produit: "",
                designation: "",
                calibre_id: "",
                type_quantite: "",
                unite: "",
                seuil_alerte: "",
                stock_initial: "",
                etat_produit: "",
                marque: "",
                categorie_id: "",
            });
            setEditingProduit(null);
            closeForm();
        } catch (error) {
            if (error.response) {
                const serverErrors = error.response.data.error;
                setErrors({
                    logoP: serverErrors.logoP ? serverErrors.logoP[0] : "",
                    Code_produit: serverErrors.Code_produit ? serverErrors.Code_produit[0] : "",
                    designation: serverErrors.designation ? serverErrors.designation[0] : "",
                    calibre_id: serverErrors.calibre_id ? serverErrors.calibre_id[0] : "",
                    type_quantite: serverErrors.type_quantite ? serverErrors.type_quantite[0] : "",
                    unite: serverErrors.unite ? serverErrors.unite[0] : "",
                    seuil_alerte: serverErrors.seuil_alerte ? serverErrors.seuil_alerte[0] : "",
                    stock_initial: serverErrors.stock_initial ? serverErrors.stock_initial[0] : "",
                    etat_produit: serverErrors.etat_produit ? serverErrors.etat_produit[0] : "",
                    marque: serverErrors.marque ? serverErrors.marque[0] : "",
                    categorie_id: serverErrors.categorie_id ? serverErrors.categorie_id[0] : "",
                });
            }
        }
    };


    //------------------------- fournisseur export to excel ---------------------//

    const exportToExcel = () => {
        const selectedProduits = produits.filter((produit) =>
            selectedItems.includes(produit.id)
        );
        const ws = XLSX.utils.json_to_sheet(selectedProduits);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Produits");
        XLSX.writeFile(wb, "produits.xlsx");
    };

    const handleDeletecatgeorie = async (categorieId) => {
        try {
            const response = await axios.delete(
                `http://localhost:8000/api/categories/${categorieId}`
            );
            console.log(response.data);
            Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "Categorie supprimé avec succès.",
            });
            fetchCategories();
        } catch (error) {
            console.error("Error deleting categorie:", error);
            Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression de la categorie.",
            });
        }
    };
    const handleEditcatgeorie = async (categorieId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/categories/${categorieId}`
            );
            const categorieToEdit = response.data;

            const { value: editedCategorie } = await Swal.fire({
                title: "Modifier une categorie",
                html: `
          <form id="editZoneForm">
            <input id="swal-edit-input1" class="swal2-input" placeholder="categorie" name="categorie" value="${categorieToEdit.categorie}">
          </form>
        `,
                showCancelButton: true,
                confirmButtonText: "Modifier",
                cancelButtonText: "Annuler",
                preConfirm: () => {
                    const editedCategorieValue =
                        Swal.getPopup().querySelector("#swal-edit-input1").value;
                    return { categorie: editedCategorieValue };
                },
            });

            if (
                editedCategorie &&
                editedCategorie.categorie !== categorieToEdit.categorie
            ) {
                const putResponse = await axios.put(
                    `http://localhost:8000/api/categories/${categorieId}`,
                    editedCategorie
                );
                console.log(putResponse.data);
                Swal.fire({
                    icon: "success",
                    title: "Succès!",
                    text: "Categorie modifiée avec succès.",
                });
                fetchCategories();
            } else {
                console.log("Categorie not edited or unchanged");
            }
        } catch (error) {
            console.error("Error editing Categorie:", error);
            Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la modification de la Categorie.",
            });
        }
    };

    const handleAddCategory = async () => {
        const { value: categoryData } = await Swal.fire({
            title: "Ajouter une catégorie",
            html: `
          <form id="addCategoryForm">
              <input id="swal-input1" class="swal2-input" placeholder="Catégorie" name="categorie">
              <div class="form-group mt-3">
                  <table class="table">
                      <thead>
                          <tr>
                              <th>Id</th>
                              <th>Catégorie</th>
                              <th>Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${categories
                .map(
                    (categ) => `
                              <tr key=${categ.id}>
                                  <td>${categ.id}</td>
                                  <td>${categ.categorie}</td>
                                  <td>
                                      <select id="actionDropdown_${categ.id}" class="form-control">
                                          <option value="">Select Action</option>
                                          <option value="modify_${categ.id}" style="background-color: yellow;">Modifier</option>
                                          <option value="delete_${categ.id}" style="background-color: red;">Supprimer</option>
                                      </select>
                                  </td>
                              </tr>
                          `
                )
                .join("")}
                      </tbody>
                  </table>
              </div>
          </form>
      `,
            showCancelButton: true,
            confirmButtonText: "Ajouter",
            cancelButtonText: "Annuler",
            preConfirm: () => {
                const categorie = Swal.getPopup().querySelector("#swal-input1").value;

                return { categorie };
            },
        });

        if (categoryData) {
            try {
                const response = await axios.post(
                    "http://localhost:8000/api/categories",
                    categoryData
                );
                console.log(response.data);
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Catégorie ajoutée avec succès.",
                });
                fetchCategories();
            } catch (error) {
                console.error("Error adding category:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur!",
                    text: "Échec de l'ajout de la catégorie.",
                });
            }
        }
    };

    document.addEventListener("change", async function (event) {
        if (event.target && event.target.id.startsWith("actionDropdown_")) {
            const [action, categoryId] = event.target.value.split("_");
            if (action === "delete") {
                // Delete action
                handleDeletecatgeorie(categoryId);
            } else if (action === "modify") {
                handleEditcatgeorie(categoryId);
            }
            event.target.value = "";
        }
    });

    const handleAddCalibre = async () => {
        const { value: calibreData } = await Swal.fire({
            title: "Ajouter un Calibre",
            html: `
        <form id="addCalibreForm">
          <input id="swal-input1" class="swal2-input" placeholder="Calibre" name="calibre">
        </form>
      `,
            showCancelButton: true,
            confirmButtonText: "Ajouter",
            cancelButtonText: "Annuler",
            preConfirm: () => {
                const calibre = Swal.getPopup().querySelector("#swal-input1").value;

                return { calibre };
            },
        });

        if (calibreData) {
            try {
                const response = await axios.post(
                    "http://localhost:8000/api/calibres",
                    calibreData
                );

                console.log(response.data);
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Calibre ajoutée avec succès.",
                });
                fetchCalibres();
            } catch (error) {
                console.error("Error adding calibre:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur!",
                    text: "Échec de l'ajout de la calibre.",
                });
            }
        }
    };
    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ display: "flex" }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    {/* <Toolbar /> */}
                    <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ marginTop: "30px" }}
                    >
                        <h3 className="text-left" style={{ color: "grey" }}>
                            Liste des Produits
                        </h3>
                        <div className="d-flex">
                            <div style={{ width: "500px", marginRight: "20px" }}>
                                <Search onSearch={handleSearch} type="search" />
                            </div>
                            <div>
                                <PrintList
                                    tableId="produitsTable"
                                    title="Liste des produits"
                                    produitList={produits}
                                    filteredProduits={filteredProduits}
                                />
                                <ExportToPdfButton
                                    produits={produits}
                                    selectedItems={selectedItems}
                                    disabled={selectedItems.length === 0}
                                />
                                <FontAwesomeIcon
                                    icon={faFileExcel}
                                    onClick={exportToExcel}
                                    style={{
                                        cursor: "pointer",
                                        color: "green",
                                        fontSize: "2rem",
                                        marginLeft: "15px",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="container-d-flex justify-content-start">
                        <a
                            id="showFormButton"
                            onClick={handleShowFormButtonClick}
                            style={{
                                // textDecoration: "none",
                                color: "rgb(0, 0, 238)",
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer", // Change cursor to indicate clickable element
                            }}
                        >
                            <BsShop style={{ fontSize: "24px", marginRight: "8px" }} />
                            Ajouter Produits
                        </a>
                        <Form.Group
                            controlId="categorieFilter"
                            className="d-flex align-items-center"
                        >
                            <Form.Label className="mb-0 me-2">
                                Filtrer par Catégorie:
                            </Form.Label>
                            <div className="position-relative">
                                <FontAwesomeIcon
                                    icon={faFilter}
                                    className="position-absolute top-50 start-0 translate-middle-y text-muted"
                                />
                                <Form.Select
                                    onChange={handleCategoryFilterChange}
                                    value={selectedCategory}
                                    className="form-select form-select-sm ps-4"
                                >
                                    <option value="">Toutes les catégories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.categorie}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Form.Group>

                        <div style={{ marginTop: "1px" }}>
                            <div
                                id="formContainer"
                                className="mt-3"
                                style={formContainerStyle}
                            >
                                <Form className="col row" onSubmit={handleSubmit}>
                                    <Form.Label className="text-center m-2">
                                        <h4
                                            style={{
                                                fontSize: "25px", // Ajustez la taille de la police au besoin
                                                fontFamily: "Arial, sans-serif", // Définissez la famille de police souhaitée
                                                fontWeight: "bold", // Rendez le texte en gras
                                                color: "black", // Définissez la couleur du texte
                                                borderBottom: "2px solid black", // Ajoutez une bordure inférieure
                                                paddingBottom: "5px", // Espace entre le texte et la bordure
                                                // Ajoutez des styles supplémentaires au besoin
                                            }}
                                        >
                                            {editingProduit ? "Modifier" : "Ajouter"} un Produit
                                        </h4>
                                    </Form.Label>
                                    <Form.Group className="col-sm-5 m-2" controlId="calibre_id">
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            className="ml-2 text-primary"
                                            style={{ cursor: "pointer" }}
                                            onClick={handleAddCalibre}
                                        />
                                        <Form.Label>Calibre</Form.Label>

                                        <Form.Select
                                            name="calibre_id"
                                            value={formData.calibre_id}
                                            onChange={handleChange}
                                            className="form-select form-select-sm"
                                        >
                                            <option value="">Sélectionner un calibre</option>
                                            {calibres.map((calibre) => (
                                                <option key={calibre.id} value={calibre.id}>
                                                    {calibre.calibre}
                                                </option>
                                            ))}
                                            <Form.Text className="text-danger">
                                                {errors.calibre_id}
                                            </Form.Text>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="col-sm-5 m-2" controlId="categorie_id">
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            className="ml-2 text-primary"
                                            style={{ cursor: "pointer" }}
                                            onClick={handleAddCategory}
                                        />
                                        <Form.Label>Categorie</Form.Label>

                                        <Form.Select
                                            name="categorie_id"
                                            value={formData.categorie_id}
                                            onChange={handleChange}
                                            className="form-select form-select-sm"
                                        >
                                            <option value="">Sélectionner une catégorie</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.categorie}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text className="text-danger">
                                            {errors.categorie_id}
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="col-sm-5 m-2" controlId="logoP">
                                        <Form.Label>Logo du Produit</Form.Label>
                                        <Form.Control
                                            type="file"
                                            name="logoP"
                                            onChange={handleChange}
                                            className="form-control-sm"
                                        />
                                        <Form.Text className="text-danger">
                                            {errors.logoP}
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group
                                        className="col-sm-5 m-2 "
                                        controlId="Code_produit"
                                    >
                                        <Form.Label>CodeProduit</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Code_produit"
                                            value={formData.Code_produit}
                                            onChange={handleChange}
                                            placeholder="Code_produit"
                                            className="form-control-sm"
                                        />
                                        <Form.Text className="text-danger">
                                            {errors.Code_produit}
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="col-sm-5 m-2 " controlId="designation">
                                        <Form.Label>Designation</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            placeholder="designation"
                                            className="form-control-sm"
                                        />
                                        <Form.Text className="text-danger">
                                            {errors.designation}
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group
                                        className="col-sm-5 m-2"
                                        controlId="type_quantite"
                                    >
                                        <Form.Label>Type de Quantité</Form.Label>
                                        <div>
                                            <Form.Check
                                                type="radio"
                                                label="kg"
                                                name="type_quantite"
                                                value="kg"
                                                id="radio-kg"
                                                onChange={handleRadioChange}
                                                checked={formData.type_quantite === "kg"}
                                            />
                                            <Form.Check
                                                type="radio"
                                                label="unite"
                                                name="type_quantite"
                                                value="unite"
                                                id="radio-unite"
                                                onChange={handleRadioChange}
                                                checked={formData.type_quantite === "unite"}
                                            />
                                            <Form.Check
                                                type="radio"
                                                label="kg/unite"
                                                name="type_quantite"
                                                value="kg/unite"
                                                id="radio-kg/unite"
                                                onChange={handleRadioChange}
                                                checked={formData.type_quantite === "kg/unite"}
                                            />
                                        </div>
                                        <Form.Text className="text-danger">
                                            {errors.type_quantite}
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="col-sm-5 m-2 " controlId="marque">
                                        <Form.Label>marque</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="marque"
                                            value={formData.marque}
                                            onChange={handleChange}
                                            placeholder="marque"
                                            className="form-control-sm"
                                        />
                                        <Form.Text className="text-danger">
                                            {errors.maque}
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="col-sm-5 m-2 " controlId="unite">
                                        <Form.Label>Unite</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="unite"
                                            value={formData.unite}
                                            onChange={handleChange}
                                            placeholder="unite"
                                            className="form-control-sm"
                                        />
                                        <Form.Text className="text-danger">
                                            {errors.unite}
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group
                                        className="col-sm-5 m-2 "
                                        controlId="seuil_alerte"
                                    >
                                        <Form.Label>Seuil d'alerte</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="seuil_alerte"
                                            value={formData.seuil_alerte}
                                            onChange={handleChange}
                                            placeholder="seuil d'alerte"
                                            className="form-control-sm"
                                        />
                                        <Form.Text className="text-danger">
                                            {errors.seuil_alerte}
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group
                                        className="col-sm-5 m-2 "
                                        controlId="stock_initial"
                                    >
                                        <Form.Label>Stock Initial</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="stock_initial"
                                            value={formData.stock_initial}
                                            onChange={handleChange}
                                            placeholder="stock initial"
                                            className="form-control-sm"
                                        />
                                        <Form.Text className="text-danger">
                                            {errors.stock_initial}
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group
                                        className="col-sm-5 m-2 "
                                        controlId="etat_produit"
                                    >
                                        <Form.Label>Etat de produit</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="etat_produit"
                                            value={formData.etat_produit}
                                            onChange={handleChange}
                                            placeholder="etat de produit"
                                            className="form-control-sm"
                                        />
                                        <Form.Text className="text-danger">
                                            {errors.etat_produit}
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="col-sm-5 m-2 " controlId="prix_vente">
                                        <Form.Label>Prix Vente</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="prix_vente"
                                            value={formData.prix_vente}
                                            onChange={handleChange}
                                            placeholder="Prix Vente"
                                            className="form-control-sm"
                                        />
                                    </Form.Group>


                                    {/* <Form.Group className="col-sm-5 m-2 " controlId="user_id">
                  <Form.Label>User</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    placeholder="Utilisateur"
                    className="form-control-sm"
                    required
                    readOnly
                  />
                </Form.Group> */}

                                    <div className="mt-5">
                                        <Form.Group className="col m-3 text-center">
                                            <Button
                                                type="submit"
                                                className="btn btn-danger col-md-4 m-3"
                                            >
                                                {editingProduit ? "Modifier" : "Ajouter"}
                                            </Button>
                                            <Button
                                                className="btn btn-secondary col-md-4 m-3"
                                                onClick={closeForm}
                                            >
                                                Annuler
                                            </Button>
                                        </Form.Group>
                                    </div>
                                </Form>
                            </div>
                        </div>

                        <div className="">
                            <div
                                id="tableContainer"
                                className="table-responsive-sm"
                                style={tableContainerStyle}
                            >
                                <table
                                    className="table table-responsive table-bordered "
                                    id="produitsTable"
                                    style={{
                                        marginTop:"10px"
                                    }}
                                >
                                    <thead className="text-center">
                                    <tr>
                                        <th style={tableHeaderStyle}>
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAllChange}
                                            />
                                        </th>
                                        <th style={tableHeaderStyle}>Logo Produit</th>
                                        <th style={tableHeaderStyle}>Code_produit</th>
                                        <th style={tableHeaderStyle}>designation</th>
                                        <th style={tableHeaderStyle}>Type de Quantité</th>
                                        <th style={tableHeaderStyle}>Marque</th>
                                        <th style={tableHeaderStyle}>Unite</th>
                                        <th style={tableHeaderStyle}>Seuil d'alerte</th>
                                        <th style={tableHeaderStyle}>Stock initial</th>
                                        <th style={tableHeaderStyle}>Etat de produit</th>
                                        <th style={tableHeaderStyle}>Calibre</th>
                                        <th style={tableHeaderStyle}>Prix vente</th>
                                        <th style={tableHeaderStyle}>categorie</th>
                                        <th style={tableHeaderStyle}>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredProduitsByCategory.length > 0
                                        ? filteredProduitsByCategory
                                            .filter((produit) => {
                                                return Object.entries(produit).some(
                                                    ([key, value]) => {
                                                        if (
                                                            key === "Code_produit" ||
                                                            key === "designation" ||
                                                            key === "type_quantite" ||
                                                            key === "unite" ||
                                                            key === "seuil_alerte" ||
                                                            key === "stock_initial" ||
                                                            key === "etat_produit" ||
                                                            key === "prix_vente"
                                                        ) {
                                                            if (typeof value === "string") {
                                                                return value
                                                                    .toLowerCase()
                                                                    .includes(searchTerm.toLowerCase());
                                                            } else if (typeof value === "number") {
                                                                return value
                                                                    .toString()
                                                                    .includes(searchTerm.toString());
                                                            }
                                                        } else if (key === "calibre_id") {
                                                            return produit["calibre"].calibre
                                                                .toLowerCase()
                                                                .includes(searchTerm.toLowerCase());
                                                        }
                                                        return false;
                                                    }
                                                );
                                            })
                                            .slice(
                                                page * rowsPerPage,
                                                page * rowsPerPage + rowsPerPage
                                            )
                                            .map((produit) => (
                                                <tr key={produit.id}>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(produit.id)}
                                                            onChange={() =>
                                                                handleCheckboxChange(produit.id)
                                                            }
                                                        />
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.logoP && (
                                                            <img
                                                                src={produit.logoP}
                                                                alt="Logo"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    borderRadius: "50%",
                                                                }}
                                                            />
                                                        )}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.Code_produit}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.designation}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.type_quantite}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.marque}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.unite}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.seuil_alerte}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.stock_initial}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.etat_produit}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.calibre.calibre}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.prix_vente}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.categorie.categorie}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        <FontAwesomeIcon
                                                            onClick={() => handleEdit(produit)}
                                                            icon={faEdit}
                                                            style={{
                                                                color: "#007bff",
                                                                cursor: "pointer",
                                                            }}
                                                        />
                                                        <span style={{ margin: "0 8px" }}></span>
                                                        <FontAwesomeIcon
                                                            onClick={() => handleDelete(produit.id)}
                                                            icon={faTrash}
                                                            style={{
                                                                color: "#ff0000",
                                                                cursor: "pointer",
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        :
                                        filteredProduits
                                            .slice(
                                                page * rowsPerPage,
                                                page * rowsPerPage + rowsPerPage
                                            )
                                            .map((produit) => (
                                                <tr key={produit.id}>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(produit.id)}
                                                            onChange={() =>
                                                                handleCheckboxChange(produit.id)
                                                            }
                                                        />
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.logoP && (
                                                            <img
                                                                src={produit.logoP}
                                                                alt="Logo"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    borderRadius: "50%",
                                                                }}
                                                            />
                                                        )}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.Code_produit}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.designation}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.type_quantite}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.marque}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.unite}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.seuil_alerte}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.stock_initial}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.etat_produit}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.calibre.calibre}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.prix_vente}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        {produit.categorie.categorie}
                                                    </td>
                                                    <td style={{ backgroundColor: "white" }}>
                                                        <FontAwesomeIcon
                                                            onClick={() => handleEdit(produit)}
                                                            icon={faEdit}
                                                            style={{
                                                                color: "#007bff",
                                                                cursor: "pointer",
                                                            }}
                                                        />
                                                        <span style={{ margin: "0 8px" }}></span>
                                                        <FontAwesomeIcon
                                                            onClick={() => handleDelete(produit.id)}
                                                            icon={faTrash}
                                                            style={{
                                                                color: "#ff0000",
                                                                cursor: "pointer",
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                <Button
                                    className="btn btn-danger btn-sm"
                                    onClick={handleDeleteSelected}
                                    disabled={selectedItems.length === 0}
                                >
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    Supprimer selection
                                </Button>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={filteredProduits.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </div>
                        </div>
                    </div>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

const tableCellStyle = {
    padding: "10px",
    borderBottom: "1px solid #ddd",
};

export default ProduitList;
