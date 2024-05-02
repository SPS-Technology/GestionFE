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
import { IoIosPersonAdd } from "react-icons/io";

import {
    faTrash,
    faFilePdf,
    faFileExcel,
    faPrint,
    faEdit,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Toolbar } from "@mui/material";

const ProduitList = () => {
    const [produits, setProduits] = useState([]);
    const [user, setUser] = useState({});
    const [categories, setCategories] = useState([]);
    const [calibres, setCalibres] = useState([]);
    let isEdit = false;
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProduits, setFilteredProduits] = useState([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [editingProduit, setEditingProduit] = useState(null);
    const [editingProduitId, setEditingProduitId] = useState(null);

    const [formContainerStyle, setFormContainerStyle] = useState({
        right: "-500px",
    });
    const [tableContainerStyle, setTableContainerStyle] = useState({
        marginRight: "0px",
    });
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        Code_produit: "",
        designation: "",
        type_quantite: "",
        calibre_id: "",
        user_id: "",
        prix_vente: "",
        categorie_id: "",
    });

    useEffect(() => {
        fetchProduits();
    }, []);

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
            const responseCalibres = await axios.get(
                "http://localhost:8000/api/calibres"
            );
            setCalibres(responseCalibres.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        if (produits) {
            const filtered = produits.filter((produit) =>
                produit.designation.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProduits(filtered);
        }
    }, [produits, searchTerm]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
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
                            Swal.fire({
                                icon: "error",
                                title: "Error!",
                                text: "Échec de la suppression du produit.",
                            });
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
                        Swal.fire({
                            icon: "error",
                            title: "Erreur!",
                            text: "Échec de la suppression du produit.",
                        });
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
            designation: "",
            Code_produit: "",
            type_quantite: "",
            calibre_id: "",
            categorie_id: "",
            user_id: "",
        });
        setEditingProduit(null); // Clear editing client
    };

    const handleEdit = (produit) => {
        setEditingProduit(produit);
        setFormData({
            Code_produit: produit.Code_produit,
            designation: produit.designation,
            type_quantite: produit.type_quantite,
            calibre_id: produit.calibre_id,
            categorie_id: produit.categorie_id,
            prix_vente: produit. prix_vente,
            user_id: user.id,
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (user) {
            console.log("User ID before setting in formData:", user.id);
        }
        const updatedFormData = { ...formData, user_id: user.id };
        setFormData(updatedFormData);

        console.log("User ID after setting in formData:", user.id);

        const url = editingProduit
            ? `http://localhost:8000/api/produits/${editingProduit.id}`
            : "http://localhost:8000/api/produits";
        const method = editingProduit ? "put" : "post";

        axios({
            method: method,
            url: url,
            data: updatedFormData,
        })
            .then(() => {
                fetchProduits();
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: `Product ${editingProduit ? "updated" : "added"} successfully.`,
                });
                setFormData({
                    Code_produit: "",
                    designation: "",
                    type_quantite: "",
                    calibre_id: "",
                    prix_vente: "",
                    categorie_id: "",
                    user_id: "",
                });
                setEditingProduit(null);
            })
            .catch((error) => {
                console.error(
                    `Error ${editingProduit ? "updating" : "adding"} product:`,
                    error
                );

                if (error.response && error.response.status === 403) {
                    Swal.fire({
                        icon: "error",
                        title: "Accès refusé",
                        text: `Vous n'avez pas l'autorisation de ${
                            editingProduit ? "modifier" : "ajouter"
                        } un produit.`,
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error!",
                        text: `Failed to ${editingProduit ? "update" : "add"} product.`,
                    });
                }
            });

        if (formContainerStyle.right === "-500px") {
            setFormContainerStyle({ right: "0" });
            setTableContainerStyle({ marginRight: "500px" });
        } else {
            closeForm();
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
            fetchProduits();
        } catch (error) {
            console.error("Error deleting categorie:", error);
            Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression de la categorie.",
            });
        }
    };
    const handleDeletecalibre = async (calibreId) => {
        try {
            const response = await axios.delete(
                `http://localhost:8000/api/calibres/${calibreId}`
            );
            console.log(response.data);
            Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "Calibre supprimé avec succès.",
            });
            fetchProduits();
        } catch (error) {
            console.error("Error deleting calibre:", error);
            Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression du calibre.",
            });
        }
    };
    const handleAddCategory = async () => {
        const { value: categoryData } = await Swal.fire({
            title: "Ajouter une catégorie",
            html: `
          <form id="addCategoryForm">
              <input id="swal-input1" class="swal2-input" placeholder="Catégorie" name="categorie">
              <input id="swal-input2" class="swal2-input" placeholder="Description" name="description">
              <div class="form-group mt-3">
                  <table class="table table-hover">
                      <thead>
                          <tr>
                              <th>Id</th>
                              <th>Catégorie</th>
                              <th>Description</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${categories
                .map(
                    (categ) => `
                              <tr key=${categ.id}>
                                  <td>${categ.id}</td>
                                  <td>${categ.categorie}</td>
                                  <td>${categ.description}</td>
                                  <td>
                                      <select id="actionDropdown_${categ.id}" class="form-control">
                                          <option value="">Select Action</option>
                                          <option value="modify_${categ.id}">Modifier</option>
                                          <option value="delete_${categ.id}">Supprimer</option>
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
                const description = Swal.getPopup().querySelector("#swal-input2").value;

                return { categorie, description };
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
                fetchProduits();
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
    const handleAddCalibre = async () => {
        const { value: calibreData } = await Swal.fire({
            title: "Ajouter un calibre",
            html: `
          <form id="addCategoryForm">
              <input id="swal-input1" class="swal2-input" placeholder="Calibre" name="calibre">
            
              <div class="form-group mt-3">
                  <table class="table table-hover">
                      <thead>
                          <tr>
                              <th>Id</th>
                              <th>Calibre</th>
                           
                          </tr>
                      </thead>
                      <tbody>
                          ${calibres
                .map(
                    (calibre) => `
                              <tr key=${calibre.id}>
                                  <td>${calibre.id}</td>
                                  <td>${calibre.calibre}</td>
                                 
                                  <td>
                                      <select id="actionDropdown_${calibre.id}" class="form-control">
                                          <option value="">Select Action</option>
                                          <option value="modify_${calibre.id}">Modifier</option>
                                          <option value="delete_${calibre.id}">Supprimer</option>
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
                const calibre = Swal.getPopup().querySelector("#swal-input1").value;

                return { calibre};
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
                fetchProduits();
            } catch (error) {
                console.error("Error adding calibre:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur!",
                    text: "Échec de l'ajout du calibre.",
                });
            }
        }
    };
    document.addEventListener("change", async function (event) {
        if (event.target && event.target.id.startsWith("actionDropdown_")) {
            const [action, calibreId] = event.target.value.split("_");
            if (action === "delete") {
                // Delete action
                handleDeletecalibre(calibreId);
            } else if (action === "modify") {
                // Modify action
                try {
                    const response = await axios.get(
                        `http://localhost:8000/api/calibres/${calibreId}`
                    );
                    const calibreToModify = response.data;

                    if (!calibreToModify) {
                        console.error("Category not found or data is missing");
                        return;
                    }

                    const calibreValue =
                        calibreToModify && calibreToModify.calibre
                            ? calibreToModify.calibre
                            : "";



                    const { value: modifiedData } = await Swal.fire({
                        title: "Modifier un calibre",
                        html: `
                    <form id="modifyCalibreForm">
                        <input id="swal-modify-input1" class="swal2-input" placeholder="Calibre" name="calibre" value="${calibreValue}">
                    </form>
                `,
                        showCancelButton: true,
                        confirmButtonText: "Modifier",
                        cancelButtonText: "Annuler",
                        preConfirm: () => {
                            const modifiedCalibre = Swal.getPopup().querySelector(
                                "#swal-modify-input1"
                            ).value;


                            return {
                                calibre: modifiedCalibre,

                            };
                        },
                    });

                    if (modifiedData) {
                        const modifyResponse = await axios.put(
                            `http://localhost:8000/api/calibres/${calibreId}`,
                            modifiedData
                        );
                        console.log(modifyResponse.data);
                        Swal.fire({
                            icon: "success",
                            title: "Succès!",
                            text: "Calibre modifiée avec succès.",
                        });
                        fetchProduits();
                    }
                } catch (error) {
                    console.error(
                        "Erreur lors de la modification du Calibre:",
                        error
                    );
                    Swal.fire({
                        icon: "error",
                        title: "Erreur!",
                        text: "Échec de la modification du Calibre.",
                    });
                }
            }
            event.target.value = "";
        }
    });

    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ display: "flex" }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    <Toolbar />
                    <div>
                        <h3>Liste des Produits</h3>
                        <div
                            className="search-container d-flex flex-row-reverse "
                            role="search"
                        >
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

                        <div className="d-flex flex-row justify-content-end">
                            <div className="btn-group col-2">
                                <PrintList
                            tableId="produitsTable"
                            title="Liste des produits"
                            produitList={produits}
                            filteredProduits={filteredProduits}
                        />
                        <ExportToPdfButton
                            produits={produits}
                            selectedItems={selectedItems}
                        />
                        <Button
                            className="btn btn-success btn-sm ml-2"
                            onClick={exportToExcel}
                        >
                            <FontAwesomeIcon icon={faFileExcel} />
                        </Button>
                    </div>
                </div>
                        <div id="formContainer" className="mt-3" style={formContainerStyle}>
                            <Form className="col row" onSubmit={handleSubmit}>
                                <Form.Label className="text-center m-2">
                                    <h4>{editingProduit ? "Modifier" : "Ajouter"} un Produit</h4>
                                </Form.Label>
                                <Form.Group className="col-sm-5 m-2 " controlId="Code_produit">
                                    <Form.Label>CodeProduit</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Code_produit"
                                        value={formData.Code_produit}
                                        onChange={handleChange}
                                        placeholder="Code_produit"
                                        className="form-control-sm"
                                        required
                                    />
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
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="col-sm-5 m-2" controlId="type_quantite">
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
                                </Form.Group>
                                <Form.Group className="col-sm-5 m-2" controlId="calibre-id">
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
                                    </Form.Select>
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
                                        required
                                    />
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

                                <Form.Group className="col-7 m-3">
                                    <Button className="col-6" variant="primary" type="submit">
                                        {editingProduit ? "Modifier" : "Ajouter"}
                                    </Button>
                                </Form.Group>
                            </Form>
                        </div>

                        <div className="">
                            <div
                                id="tableContainer"
                                className="table-responsive-sm"
                                style={tableContainerStyle}
                            >
                                <table className="table table-responsive table-bordered " id="produitsTable" >
                                    <thead className="text-center">
                                    <tr>
                                        <th
                                            style={Object.assign({}, tableHeaderStyle, {
                                                textAlign: "left",
                                            })}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAllChange}
                                            />
                                        </th>
                                        <th style={tableHeaderStyle}>Code_produit</th>
                                        <th style={tableHeaderStyle}>designation</th>
                                        <th style={tableHeaderStyle}>Type de Quantité</th>
                                        <th style={tableHeaderStyle}>Calibre</th>
                                        <th style={tableHeaderStyle}>Prix Vente</th>
                                        <th style={tableHeaderStyle}>categorie</th>
                                        <th style={tableHeaderStyle}>user</th>
                                        <th
                                            className="text-center"
                                            style={Object.assign({}, tableHeaderStyle, {
                                                textAlign: "left",
                                            })}
                                        >
                                            Action
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="text-center">
                                    {filteredProduits
                                        .slice(
                                            page * rowsPerPage,
                                            page * rowsPerPage + rowsPerPage
                                        )
                                        .map((produit) => (
                                            <tr key={produit.id}>
                                                <td
                                                    style={Object.assign({}, tableCellStyle, {
                                                        textAlign: "left",
                                                    })}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(produit.id)}
                                                        onChange={() => handleCheckboxChange(produit.id)}
                                                    />
                                                </td>
                                                <td style={tableCellStyle}>{produit.Code_produit}</td>
                                                <td style={tableCellStyle}>{produit.designation}</td>
                                                <td style={tableCellStyle}>
                                                    {produit.type_quantite}
                                                </td>
                                                <td style={tableCellStyle}>{produit.calibre_id}</td>
                                                <td style={tableCellStyle}>{produit.prix_vente}</td>
                                                <td style={tableCellStyle}>
                                                    {produit.categorie
                                                        ? produit.categorie.categorie
                                                        : "no categorie"}
                                                </td>
                                                <td style={tableCellStyle}>
                                                    {produit.user.name}
                                                </td>

                                                <td
                                                    className="d-inline-flex"
                                                    style={Object.assign({}, tableCellStyle, {
                                                        textAlign: "left",
                                                    })}
                                                >
                                                    <button
                                                        className="btn btn-sm btn-warning m-1"
                                                        onClick={() => handleEdit(produit)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm m-1"
                                                        onClick={() => handleDelete(produit.id)}
                                                    >
                                                        <i className="fas fa-minus-circle"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={filteredProduits.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />

                                        <Button
                                            className="btn btn-danger btn-sm"
                                            onClick={handleDeleteSelected}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>


                            </div>
                        </div>
                    </div>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

const tableHeaderStyle = {
    background: "#f2f2f2",
    padding: "10px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
    padding: "10px",
    borderBottom: "1px solid #ddd",
};

export default ProduitList;