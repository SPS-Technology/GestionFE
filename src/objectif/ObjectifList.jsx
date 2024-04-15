import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import "../style.css";
import Navigation from "../Acceuil/Navigation";
import Search from "../Acceuil/Search";
import TablePagination from "@mui/material/TablePagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFilePdf,
  faFileExcel,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import { ImStarHalf } from "react-icons/im";
import ExportPdfButton from "./exportToPdf";
import PrintList from "./PrintList";
const ObjectifList = () => {
  // const [existingFournisseur, setExistingFournisseur] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredObjectifs, setFilteredObjectifs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [objectifs, setObjectifs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  //-------------------edit-----------------------//
  const [editingObjectif, setEditingObjectif] = useState(null); // State to hold the fournisseur being edited
  const [editingObjectifId, setEditingObjectifId] = useState(null);

  //---------------form-------------------//
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type_objectif: "",
    unite: "",
    valeur: "",
    periode: "",
  });
  const [errors, setErrors] = useState({
    type_objectif: "",
    unite: "",
    valeur: "",
    periode: "",
  });
  const [formContainerStyle, setFormContainerStyle] = useState({
    right: "-500px",
  });
  const [tableContainerStyle, setTableContainerStyle] = useState({
    marginRight: "0px",
  });
  const tableHeaderStyle = {
    background: "#f2f2f2",
    padding: "10px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
  };

  const fetchObjectifs = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/objectifs");

      console.log("API Response:", response.data);

      setObjectifs(response.data.objectifs);

      const usersResponse = await axios.get("http://localhost:8000/api/users");
      setUsers(usersResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchObjectifs();
  }, []);

  useEffect(() => {
    const filtered = objectifs.filter((objectif) => {
      const typeObjectifMatch = objectif.type_objectif
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const uniteMatch = objectif.unite
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const valeurMatch = objectif.valeur
        .toString()
        .includes(searchTerm.toString());
      const periodeMatch = objectif.periode
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return typeObjectifMatch || uniteMatch || valeurMatch || periodeMatch;
    });

    setFilteredObjectifs(filtered);
  }, [objectifs, searchTerm]);

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
  //------------------------- fournisseur Delete Selected ---------------------//

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
            .delete(`http://localhost:8000/api/objectifs/${id}`)
            .then((response) => {
              fetchObjectifs();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "objectif supprimé avec succès.",
              });
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la suppression du objectif:",
                error
              );
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression du livreur.",
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
      setSelectedItems(objectifs.map((objectif) => objectif.id));
    }
  };

  const exportToExcel = () => {
    const selectedObjectifs = objectifs.filter((objectif) =>
      selectedItems.includes(objectif.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedObjectifs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "objectifs");
    XLSX.writeFile(wb, "objectifs.xlsx");
  };

  //------------------------- fournisseur Delete---------------------//
  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer cet objectif ?",
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
          .delete(`http://localhost:8000/api/objectifs/${id}`)
          .then((response) => {
            if (response.data.message) {
              // Successful deletion
              fetchObjectifs();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "objectif supprimé avec succès",
              });
            }
          })
          .catch((error) => {
            // Request error
            console.error("Erreur lors de la suppression du objectif:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: `Échec de la suppression du objectif. Veuillez consulter la console pour plus d'informations.`,
            });
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  };
  //------------------------- fournisseur EDIT---------------------//

  const handleEdit = (objectif) => {
    setEditingObjectif(objectif); // Set the fournisseurs to be edited
    // Populate form data with fournisseurs details
    setFormData({
      type_objectif: objectif.type_objectif,
      unite: objectif.unite,
      valeur: objectif.valeur,
      periode: objectif.periode,
    });
    if (formContainerStyle.right === "-500px") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
    // Show form
    // setShowForm(true);
  };
  useEffect(() => {
    if (editingObjectifId !== null) {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    }
  }, [editingObjectifId]);

  //------------------------- fournisseur SUBMIT---------------------//

  useEffect(() => {
    fetchObjectifs();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingObjectif
      ? `http://localhost:8000/api/objectifs/${editingObjectif.id}`
      : "http://localhost:8000/api/objectifs";
    const method = editingObjectif ? "put" : "post";
    axios({
      method: method,
      url: url,
      data: formData,
    })
      .then(() => {
        fetchObjectifs();
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: `objectif ${
            editingObjectif ? "modifié" : "ajouté"
          } avec succès.`,
        });
        setFormData({
          type_objectif: "",
          unite: "",
          valeur: "",
          periode: "",
        });
        setErrors({
          type_objectif: "",
          unite: "",
          valeur: "",
          periode: "",
        });

        setEditingObjectif(null); // Clear editing fournisseur
        closeForm();
      })
      .catch((error) => {
        if (error.response) {
          const serverErrors = error.response.data.error;
          console.log(serverErrors);
          setErrors({
            type_objectif: serverErrors.type_objectif
              ? serverErrors.type_objectif[0]
              : "",
            unite: serverErrors.unite ? serverErrors.unite[0] : "",
            valeur: serverErrors.valeur ? serverErrors.valeur[0] : "",
            periode: serverErrors.periode ? serverErrors.periode[0] : "",
          });
        }
      });
  };
  //------------------------- fournisseur FORM---------------------//

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
      type_objectif: "",
      unite: "",
      valeur: "",
      periode: "",
    });
    setErrors({
      type_objectif: "",
      unite: "",
      valeur: "",
      periode: "",
    });
    setEditingObjectif(null); // Clear editing fournisseur
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <h3 className="text-left" style={{ color: "#A31818" }}>
            <ImStarHalf
              style={{
                fontSize: "24px",
                marginRight: "8px",
                verticalAlign: "middle",
              }}
            />
            Liste des objectifs
          </h3>
          <div className="d-flex flex-row justify-content-end">
            <div className="btn-group col-2">
              <PrintList
                tableId="LivreurTable"
                title="Liste des objectifs"
                ObjectifList={objectifs}
                filteredobjectifs={filteredObjectifs}
              />
              <ExportPdfButton
                objectifs={objectifs}
                selectedItems={selectedItems}
              />
              <Button
                className="btn btn-success btn-sm ml-2"
                onClick={exportToExcel}
                disabled={selectedItems.length === 0}
              >
                <FontAwesomeIcon icon={faFileExcel} />
              </Button>
            </div>
          </div>
          <div className="search-container d-flex justify-content-center align-items-center mb-3">
            <Search onSearch={handleSearch} />
          </div>
          <div className="container-d-flex justify-content-start">
            <div className="add-Ajout-form">
              <Button
                id="showFormButton"
                onClick={handleShowFormButtonClick}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ImStarHalf style={{ fontSize: "24px", marginRight: "8px" }} />
                Mise a jour Objectifs
              </Button>
              <div
                id="formContainer"
                className="mt-2"
                style={formContainerStyle}
              >
                <Form className="col row" onSubmit={handleSubmit}>
                  <Form.Label className="text-center m-2">
                    <h5>
                      {editingObjectif
                        ? "Modifier objectif"
                        : "Ajouter un objectif"}
                    </h5>
                  </Form.Label>

                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Type</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Type"
                      name="type_objectif"
                      value={formData.type_objectif}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">
                      {errors.type_objectif}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Unite</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        type="radio"
                        label="kg"
                        name="unite"
                        value="kg"
                        checked={formData.unite === "kg"}
                        onChange={handleChange}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        label="Monétaire"
                        name="unite"
                        value="monétaire"
                        checked={formData.unite === "monétaire"}
                        onChange={handleChange}
                      />
                    </div>
                    <Form.Text className="text-danger">
                      {errors.unite}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="col-sm-10 m-2">
                    <Form.Label>valeur a atteindre </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="valeur"
                      name="valeur"
                      value={formData.valeur}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">
                      {errors.valeur}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="col-sm-6 m-2">
                    <Form.Label>Periode</Form.Label>
                    <Form.Control
                      as="select"
                      name="periode"
                      value={formData.periode}
                      onChange={handleChange}
                    >
                      <option value="">Choisir une période</option>
                      <option value="journaliere">Journalière</option>
                      <option value="semestrielle">Semestrielle</option>
                      <option value="trimestrielle">Trimestrielle</option>
                      <option value="mensuelle">Mensuelle</option>
                      <option value="annuelle">Annuelle</option>
                    </Form.Control>
                    <Form.Text className="text-danger">
                      {errors.periode}
                    </Form.Text>
                  </Form.Group>
                  <div className="mt-5">
                    <Form.Group className="col m-3 text-center">
                      <Button
                        type="submit"
                        className="btn btn-danger col-md-4 m-3"
                      >
                        {editingObjectif ? "Modifier" : "Ajouter"}
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
            <div
              id="tableContainer"
              className="table-responsive-sm"
              style={tableContainerStyle}
            >
              <table
                className="table table-responsive table-bordered "
                id="LivreurTable"
              >
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>
                      <input type="checkbox" onChange={handleSelectAllChange} />
                    </th>
                    <th style={tableHeaderStyle}>Type </th>
                    <th style={tableHeaderStyle}>Unite</th>
                    <th style={tableHeaderStyle}>valeur a atteindre</th>
                    <th style={tableHeaderStyle}>Periode</th>
                    <th style={tableHeaderStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredObjectifs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((objectif) => (
                      <tr key={objectif.id}>
                        <td>
                          <input
                            type="checkbox"
                            onChange={() => handleCheckboxChange(objectif.id)}
                            checked={selectedItems.includes(objectif.id)}
                          />
                        </td>
                        <td>{objectif.type_objectif}</td>
                        <td>{objectif.unite}</td>
                        <td>{objectif.valeur}</td>
                        <td>{objectif.periode}</td>

                        <td className="d-inline-flex">
                          <Button
                            className="btn btn-sm btn-info m-1"
                            onClick={() => handleEdit(objectif)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            className="btn btn-danger btn-sm m-1"
                            onClick={() => handleDelete(objectif.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
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
                <FontAwesomeIcon icon={faTrash} />
                supprimer selection
              </Button>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredObjectifs.length}
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

export default ObjectifList;
