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
} from "@fortawesome/free-solid-svg-icons";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Toolbar } from "@mui/material";

const ProduitList = () => {
  const [produits, setProduits] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [calibres, setCalibres] = useState([]);
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

  const fetchProduits = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/produits");
      setProduits(response.data.produit);
      console.log("response", response);
      const usersResponse = await axios.get("http://localhost:8000/api/users");
      setUsers(usersResponse.data);

      // // const responseCategories = await axios.get(
      // //   "http://localhost:8000/api/categories"
      // // );
      // // setCategories(responseCategories.data);
      // console.log("categories", responseCategories);
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
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "100%" });
    } else {
      closeForm();
    }
  };

  const closeForm = () => {
    setFormContainerStyle({ right: "-100%" });
    setTableContainerStyle({ marginRight: "0" });
    setShowForm(false); // Hide the form
    setFormData({
      designation: "",
      Code_produit: "",
      type_quantite: "",

      prix_vente: "",
      categorie_id: "",
      calibre_id: "",
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

      prix_vente: produit.prix_vente,
      categorie_id: produit.categorie_id,
      calibre_id: produit.calibre_id,
      user_id: produit.user_id,
    });
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "100%" });
    } else {
      closeForm();
    }
  };
  useEffect(() => {
    if (editingProduitId !== null) {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "100%" });
    }
  }, [editingProduitId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingProduit
      ? `http://localhost:8000/api/produits/${editingProduit.id}`
      : "http://localhost:8000/api/produits";
    const method = editingProduit ? "put" : "post";

    axios({
      method: method,
      url: url,
      data: formData,
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

          prix_vente: "",
          categorie_id: "",
          calibre_id: "",
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

    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "100%" });
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
  const handleAddCategory = async () => {
    const { value: categoryData } = await Swal.fire({
      title: "Ajouter une catégorie",
      html: `
        <form id="addCategoryForm">
          <input id="swal-input1" class="swal2-input" placeholder="Catégorie" name="categorie">
          <input id="swal-input2" class="swal2-input" placeholder="Description" name="description">
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

        fetchCategories();
        console.log(response.data);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Catégorie ajoutée avec succès.",
        });
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

        fetchCategories();
        console.log(response.data);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Calibre ajoutée avec succès.",
        });
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
          <Toolbar />

          <h3>Liste des Produits</h3>
          <div
            className="search-container d-flex flex-row-reverse "
            role="search"
          >
            <Search onSearch={handleSearch} type="search" />
          </div>
          <Button
            variant="primary"
            className="btn btn-sm m-2"
            id="showFormButton"
            onClick={handleShowFormButtonClick}
          >
            {showForm ? "Modifier le formulaire" : "Ajouter un Produit"}
          </Button>
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
                  required
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
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categorie}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="col-sm-5 m-2 " controlId="user_id">
                <Form.Label>User</Form.Label>
                <Form.Control
                  type="text"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  placeholder="Utilisateur"
                  className="form-control-sm"
                  required
                />
              </Form.Group>

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
              {produits && produits.length > 0 && (
                <table className="table table-bordered" id="produitsTable">
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
                      <th style={tableHeaderStyle}>description</th>
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
                          <td style={tableCellStyle}>
                            {produit.calibre.calibre}
                          </td>
                          <td style={tableCellStyle}>{produit.prix_vente}</td>
                          <td style={tableCellStyle}>
                            {produit.categorie.categorie}
                          </td>
                          <td style={tableCellStyle}>
                            {produit.categorie.description}
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
              )}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredProduits.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
              <div className="d-flex flex-row">
                <div className="btn-group col-2">
                  <Button
                    className="btn btn-danger btn-sm"
                    onClick={handleDeleteSelected}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
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
