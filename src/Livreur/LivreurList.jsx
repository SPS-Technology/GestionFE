import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button, Table, Row, Col } from "react-bootstrap";
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
import { IoIosPersonAdd } from "react-icons/io";
import PrintList from "./PrintList";
import ExportPdfButton from "./exportToPdf";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";

const LivreurList = () => {
  // const [existingFournisseur, setExistingFournisseur] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLivreurs, setFilteredLivreurs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [livreurs, setLivreurs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [permis, setPermis] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  //-------------------edit-----------------------//
  const [editingLivreur, setEditingLivreur] = useState(null); // State to hold the fournisseur being edited
  const [editingLivreurId, setEditingLivreurId] = useState(null);

  //---------------form-------------------//
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    tele: "",
    cin: "",
    type_permis: [],
    details: [],
  });
  const [errors, setErrors] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    tele: "",
    cin: "",
    n_permis: "",
    type_permis: "",
    date_permis: "",
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
  const [expandedRows, setExpandedRows] = useState([]);

  const fetchLivreurs = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/livreurs");

      console.log("API Response:", response.data);

      setLivreurs(response.data.livreurs);
      const permisResponse = await axios.get(
        "http://localhost:8000/api/permis"
      );
      setPermis(permisResponse.data.permis);
      console.log(permis);
      const usersResponse = await axios.get("http://localhost:8000/api/users");
      setUsers(usersResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchLivreurs();
  }, []);

  useEffect(() => {
    const filtered = livreurs.filter((livreur) => {
      const nomMatch = livreur.nom
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const prenomMatch = livreur.prenom
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const adresseMatch = livreur.adresse
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const teleMatch = livreur.tele
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const cinMatch = livreur.cin
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return nomMatch || prenomMatch || adresseMatch || teleMatch || cinMatch;
    });

    setFilteredLivreurs(filtered);
  }, [livreurs, searchTerm]);

  const toggleRow = async (livreurId) => {
    if (expandedRows.includes(livreurId)) {
      setExpandedRows(expandedRows.filter((id) => id !== livreurId));
    } else {
      try {
        // Récupérer les permis associés à ce livreur
        const permis = await fetchPermis(livreurId);

        // Mettre à jour l'état pour inclure les permis récupérés
        setLivreurs((prevLivreurs) =>
          prevLivreurs.map((livreur) =>
            livreur.id === livreurId ? { ...livreur, permis } : livreur
          )
        );

        // Ajouter l'ID du livreur aux lignes étendues
        setExpandedRows([...expandedRows, livreurId]);
      } catch (error) {
        console.error("Erreur lors de la récupération des permis :", error);
      }
    }
  };

  const fetchPermis = async (livreurId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/permis/${livreurId}`
      );
      console.log(livreurId);
      return response.data.permis;
    } catch (error) {
      console.error("Erreur lors de la récupération des permis :", error);
      return [];
    }
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
            .delete(`http://localhost:8000/api/livreurs/${id}`)
            .then((response) => {
              fetchLivreurs();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "livreur supprimé avec succès.",
              });
            })
            .catch((error) => {
              if (error.response && error.response.status === 500) {
                Swal.fire({
                  icon: "error",
                  title: "Erreur!",
                  text: "Impossible de supprimer le livreur car il est associé à des véhicules.",
                });
              } else {
                // Other errors
                Swal.fire({
                  icon: "error",
                  title: "Erreur!",
                  text: `Échec de la suppression du livreur. Veuillez consulter la console pour plus d'informations.`,
                });
              }
            });
        }); // Fermez la parenthèse ici
      }
    });

    setSelectedItems([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "type_permis" && value !== "") {
      setShowDetails(true);
    } else {
      setShowDetails(false);
    }
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(livreurs.map((livreur) => livreur.id));
    }
  };
  const handleTypeChange = (e, index) => {
    const updatedTypePermis = [...formData.type_permis]; // Crée une copie du tableau type_permis
    updatedTypePermis[index] = e.target.value; // Met à jour la valeur du type de permis à l'index spécifié
    setFormData((prevFormData) => ({
      ...prevFormData,
      type_permis: updatedTypePermis, // Met à jour le state avec le nouveau tableau mis à jour
    }));
  };

  const handleDateChange = (e, index) => {
    const { value } = e.target;
    const newDetails = [...formData.details];
    newDetails[index] = {
      ...newDetails[index],
      date_permis: value,
    };
    setFormData({
      ...formData,
      details: newDetails,
    });
  };

  const handleNumChange = (e, index) => {
    const { value } = e.target;
    const newDetails = [...formData.details];
    newDetails[index] = {
      ...newDetails[index],
      n_permis: value,
    };
    setFormData({
      ...formData,
      details: newDetails,
    });
  };

  const handleAddPermis = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      type_permis: [...prevFormData.type_permis, ""],
      details: [...prevFormData.details, { n_permis: "", date_permis: "" }], // Ajoute un nouvel objet vide à details
    }));
  };

  const handleRemovePermis = (index) => {
    const newTypes = [...formData.type_permis];
    newTypes.splice(index, 1);
    const newDetails = [...formData.details];
    newDetails.splice(index, 1);
    setFormData({
      ...formData,
      type_permis: newTypes,
      details: newDetails,
    });
  };

  const exportToExcel = () => {
    const selectedLivreurs = livreurs.filter((livreurs) =>
      selectedItems.includes(livreurs.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedLivreurs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Livreurs");
    XLSX.writeFile(wb, "livreurs.xlsx");
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer ce livreur ?",
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
          .delete(`http://localhost:8000/api/livreurs/${id}`)
          .then((response) => {
            if (response.data.message) {
              // Successful deletion
              fetchLivreurs();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "livreur supprimé avec succès",
              });
            }
          })
          .catch((error) => {
            if (error.response && error.response.status === 500) {
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Impossible de supprimer le livreur car il est associé à des véhicules.",
              });
            } else {
              // Other errors
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: `Échec de la suppression du livreur. Veuillez consulter la console pour plus d'informations.`,
              });
            }
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  };

  //------------------------- fournisseur EDIT---------------------//
  const handleEdit = (livreur) => {
    setEditingLivreur(livreur);

    setFormData({
      nom: livreur.nom,
      prenom: livreur.prenom,
      adresse: livreur.adresse,
      tele: livreur.tele,
      cin: livreur.cin,
      type_permis: livreur.permis.map((permis) => permis.type_permis), // Récupérer les types de permis du livreur
      details: livreur.permis.map((permis) => ({
        n_permis: permis.n_permis,
        date_permis: permis.date_permis,
        id_permis: permis.id,
      })),
    });

    if (formContainerStyle.right === "-500px") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
  };

  useEffect(() => {
    if (editingLivreurId !== null) {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    }
  }, [editingLivreurId]);

  //------------------------- fournisseur SUBMIT---------------------//

  useEffect(() => {
    fetchLivreurs();
  }, []);

  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   // Déterminer si le livreur est mis à jour ou ajouté
  //   const method = editingLivreur ? "put" : "post";

  //   // Endpoint pour le livreur
  //   const livreurUrl = editingLivreur
  //     ? `http://localhost:8000/api/livreurs/${editingLivreur.id}`
  //     : "http://localhost:8000/api/livreurs";

  //   // Soumettre la requête pour le livreur
  //   axios({
  //     method: method,
  //     url: livreurUrl,
  //     data: {
  //       nom: formData.nom,
  //       prenom: formData.prenom,
  //       adresse: formData.adresse,
  //       tele: formData.tele,
  //       cin: formData.cin,
  //     },
  //   })

  //     .then((response) => {
  //       console.log(response.data);
  //       const livreurId = response.data.livreur.id;
  //       if (method === "put") {
  //         const updatePromises = formData.details.map((detail, index) => {
  //           const permisId = detail.id_permis;
  //           console.log(permisId);
  //           return axios.put(`http://localhost:8000/api/permis/${permisId}`, {
  //             livreur_id: livreurId,
  //             n_permis: detail.n_permis,
  //             type_permis: formData.type_permis[index],
  //             date_permis: detail.date_permis,
  //           });
  //         });
  //         Promise.all(updatePromises)
  //           .then((results) => {
  //             console.log("Permis mis à jour avec succès :", results);
  //           })
  //           .catch((error) => {
  //             console.error(
  //               "Erreur lors de la mise à jour des permis :",
  //               error
  //             );
  //           });
  //       } else {
  //         // Sinon, si la méthode est POST, ajoutez de nouveaux permis
  //         formData.type_permis.forEach((type_permis, index) => {
  //           axios
  //             .post("http://localhost:8000/api/permis", {
  //               livreur_id: livreurId,
  //               n_permis: formData.details[index].n_permis,
  //               type_permis: type_permis,
  //               date_permis: formData.details[index].date_permis,
  //             })
  //             .catch((error) => {
  //               console.error("Erreur lors de l'insertion du permis :", error);
  //             });
  //         });
  //       }

  //       // Réinitialisation du formulaire et des erreurs après une soumission réussie
  //       setFormData({
  //         nom: "",
  //         prenom: "",
  //         adresse: "",
  //         tele: "",
  //         cin: "",
  //         type_permis: [],
  //         details: [],
  //       });
  //       setErrors({
  //         nom: "",
  //         prenom: "",
  //         adresse: "",
  //         tele: "",
  //         cin: "",
  //         details: [],
  //         type_permis: [],
  //       });
  //       setEditingLivreur(null); // Clear editing livreur
  //       closeForm();
  //       Swal.fire({
  //         icon: "success",
  //         title: "Succès!",
  //         text: `Livreur ${
  //           editingLivreur ? "modifié" : "ajouté"
  //         } avec succès.`,
  //       });
  //       fetchLivreurs();
  //       fetchPermis();
  //     })

  //     .catch((error) => {
  //       if (error.response) {
  //         const serverErrors = error.response.data.error;
  //         console.log(serverErrors);
  //         setErrors({
  //           nom: serverErrors.nom ? serverErrors.nom[0] : "",
  //           prenom: serverErrors.prenom ? serverErrors.prenom[0] : "",
  //           adresse: serverErrors.adresse ? serverErrors.adresse[0] : "",
  //           tele: serverErrors.tele ? serverErrors.tele[0] : "",
  //           cin: serverErrors.cin ? serverErrors.cin[0] : "",
  //         });
  //       }
  //     });
  // };
  const handleSubmit = (e) => {
    e.preventDefault();

    // Déterminer si le livreur est mis à jour ou ajouté
    const method = editingLivreur ? "put" : "post";

    // Endpoint pour le livreur
    const livreurUrl = editingLivreur
      ? `http://localhost:8000/api/livreurs/${editingLivreur.id}`
      : "http://localhost:8000/api/livreurs";

    // Soumettre la requête pour le livreur
    axios({
      method: method,
      url: livreurUrl,
      data: {
        nom: formData.nom,
        prenom: formData.prenom,
        adresse: formData.adresse,
        tele: formData.tele,
        cin: formData.cin,
      },
    })
      .then((response) => {
        console.log(response.data);
        const livreurId = response.data.livreur.id;

        // Si la méthode est PUT, mettez à jour les permis existants
        if (method === "put") {
          const updatePromises = formData.details.map((detail, index) => {
            const permisId = detail.id_permis;
            console.log(permisId);
            // Si le permis existe, effectuez une requête PUT pour le mettre à jour
            if (permisId) {
              return axios.put(`http://localhost:8000/api/permis/${permisId}`, {
                livreur_id: livreurId,
                n_permis: detail.n_permis,
                type_permis: formData.type_permis[index],
                date_permis: detail.date_permis,
              });
            } else {
              // Sinon, effectuez une requête POST pour ajouter un nouveau permis
              return axios.post("http://localhost:8000/api/permis", {
                livreur_id: livreurId,
                n_permis: formData.details[index].n_permis,
                type_permis: formData.type_permis[index],
                date_permis: formData.details[index].date_permis,
              });
            }
          });

          // Exécuter toutes les requêtes en parallèle
          Promise.all(updatePromises)
            .then((results) => {
              console.log("Permis mis à jour avec succès :", results);
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la mise à jour des permis :",
                error
              );
            });
        } else {
          // Sinon, si la méthode est POST, ajoutez de nouveaux permis
          formData.type_permis.forEach((type_permis, index) => {
            axios
              .post("http://localhost:8000/api/permis", {
                livreur_id: livreurId,
                n_permis: formData.details[index].n_permis,
                type_permis: type_permis,
                date_permis: formData.details[index].date_permis,
              })
              .catch((error) => {
                console.error("Erreur lors de l'insertion du permis :", error);
              });
          });
        }

        // Réinitialisation du formulaire et des erreurs après une soumission réussie
        setFormData({
          nom: "",
          prenom: "",
          adresse: "",
          tele: "",
          cin: "",
          type_permis: [],
          details: [],
        });
        setErrors({
          nom: "",
          prenom: "",
          adresse: "",
          tele: "",
          cin: "",
          details: [],
          type_permis: [],
        });
        setEditingLivreur(null); // Clear editing livreur
        closeForm();
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: `Livreur ${editingLivreur ? "modifié" : "ajouté"} avec succès.`,
        });
        fetchLivreurs();
        fetchPermis();
      })

      .catch((error) => {
        if (error.response) {
          const serverErrors = error.response.data.error;
          console.log(serverErrors);
          setErrors({
            nom: serverErrors.nom ? serverErrors.nom[0] : "",
            prenom: serverErrors.prenom ? serverErrors.prenom[0] : "",
            adresse: serverErrors.adresse ? serverErrors.adresse[0] : "",
            tele: serverErrors.tele ? serverErrors.tele[0] : "",
            cin: serverErrors.cin ? serverErrors.cin[0] : "",
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
      nom: "",
      prenom: "",
      adresse: "",
      tele: "",
      cin: "",
      type_permis: [],
      details: [],
    });
    setErrors({
      nom: "",
      prenom: "",
      adresse: "",
      tele: "",
      cin: "",
      type_permis: [],
      details: [],
    });
    setEditingLivreur(null); // Clear editing fournisseur
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />

        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <h3 className="text-left" style={{ color: "#A31818" }}>
            <DeliveryDiningIcon
              style={{ fontSize: "24px", marginRight: "8px" }}
            />
            Liste des Livreurs
          </h3>
          <div className="d-flex flex-row justify-content-end">
            <div className="btn-group col-2">
              <PrintList
                tableId="LivreurTable"
                title="Liste des livreurs"
                LivreurList={livreurs}
                filtredlivreurs={filteredLivreurs}
              />
              <ExportPdfButton
                livreurs={livreurs}
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
                <DeliveryDiningIcon
                  style={{ fontSize: "24px", marginRight: "8px" }}
                />
                Mise a jour Livreur
              </Button>

              <div
                id="formContainer"
                className="mt-2"
                style={formContainerStyle}
              >
                <Form className="col row" onSubmit={handleSubmit}>
                  <Form.Label className="text-center m-2">
                    <h5>
                      {editingLivreur
                        ? "Modifier Livreur"
                        : "Ajouter un Livreur"}
                    </h5>
                  </Form.Label>
                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">{errors.nom}</Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Prenom</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">
                      {errors.prenom}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-10 m-2">
                    <Form.Label>Adresse</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Adresse"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">
                      {errors.adresse}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Téléphone"
                      name="tele"
                      value={formData.tele}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">{errors.tele}</Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Cin</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="cin"
                      name="cin"
                      value={formData.cin}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-danger">{errors.cin}</Form.Text>
                  </Form.Group>
                  {/* <Form.Group className="col-sm-5 m-2">
                    <Form.Label>Type de Permis</Form.Label>
                    <Form.Select
                      name="type_permis"
                      value={formData.type_permis}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionnez le type de permis</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="EB">EB</option>
                      <option value="EC">EC</option>
                      <option value="ED">ED</option>
                    </Form.Select>
                  </Form.Group>

                  {showDetails && (
                    <Table bordered striped>
                      <tbody>
                        <tr>
                          <td>Type de permis sélectionné:</td>
                          <td>{formData.type_permis}</td>
                        </tr>
                        <tr>
                          <td>Numéro de Permis:</td>
                          <td>
                            <Form.Control
                              type="text"
                              placeholder="Numéro de Permis"
                              name="n_permis"
                              value={formData.n_permis}
                              onChange={handleChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Date de Permis:</td>
                          <td>
                            <Form.Control
                              type="date"
                              name="date_permis"
                              value={formData.date_permis}
                              onChange={handleChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  )} */}
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Type de Permis</th>
                          <th>Numéro de Permis</th>
                          <th>Date de Permis</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.type_permis.map((type_permis, index) => (
                          <tr key={index}>
                            <td>
                              <Form.Select
                                name="type_permis"
                                value={type_permis}
                                onChange={(e) => handleTypeChange(e, index)}
                              >
                                <option value="">
                                  Sélectionnez le type de permis
                                </option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="EB">EB</option>
                                <option value="EC">EC</option>
                                <option value="ED">ED</option>
                              </Form.Select>
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                placeholder="Numéro de Permis"
                                value={formData.details[index]?.n_permis || ""}
                                onChange={(e) => handleNumChange(e, index)}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="date"
                                value={
                                  formData.details[index]?.date_permis || ""
                                }
                                onChange={(e) => handleDateChange(e, index)}
                              />
                            </td>
                            <td>
                              {formData.type_permis.length > 1 && (
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="text-danger"
                                  onClick={() => handleRemovePermis(index)}
                                  style={{ cursor: "pointer" }}
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <Row className="justify-content-center">
                    <Col xs={6} className="text-center">
                      <Button onClick={handleAddPermis}>
                        Ajouter un permis
                      </Button>
                    </Col>
                  </Row>
                  <div className="mt-5">
                    <Form.Group className="col m-3 text-center">
                      <Button type="submit" className="btn btn-danger col-6">
                        {editingLivreur ? "Modifier" : "Ajouter"}
                      </Button>
                      <Button
                        className="btn btn-secondary col-5 offset-1"
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
                    <th>{/* Vide */}</th>
                    <th style={tableHeaderStyle}>
                      <input type="checkbox" onChange={handleSelectAllChange} />
                    </th>
                    <th style={tableHeaderStyle}>Nom </th>
                    <th style={tableHeaderStyle}>Prenom</th>
                    <th style={tableHeaderStyle}>Cin</th>
                    <th style={tableHeaderStyle}>Adresse</th>
                    <th style={tableHeaderStyle}>Téléphone</th>
                    <th style={tableHeaderStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLivreurs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((livreur) => (
                      <React.Fragment key={livreur.id}>
                        <tr>
                          <td>
                            <div className="no-print">
                              <button
                                className="btn btn-sm btn-light"
                                onClick={() => toggleRow(livreur.id)}
                              >
                                {expandedRows.includes(livreur.id) ? "-" : "+"}
                              </button>
                            </div>
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              onChange={() => handleCheckboxChange(livreur.id)}
                              checked={selectedItems.includes(livreur.id)}
                            />
                          </td>
                          <td>{livreur.nom}</td>
                          <td>{livreur.prenom}</td>
                          <td>{livreur.cin}</td>
                          <td>{livreur.adresse}</td>
                          <td>{livreur.tele}</td>
                          <td className="d-inline-flex">
                            <Button
                              className="btn btn-sm btn-success m-1"
                              onClick={() => handleEdit(livreur)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              className="btn btn-danger btn-sm m-1"
                              onClick={() => handleDelete(livreur.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                        {expandedRows.includes(livreur.id) &&
                          livreur.permis && (
                            <tr>
                              <td colSpan="8">
                                <table
                                  className="table table-responsive table-bordered"
                                  style={{ backgroundColor: "#adb5bd" }}
                                >
                                  <thead>
                                    <tr>
                                      <th>Numéro Permis</th>
                                      <th>Type Permis</th>
                                      <th>Date Permis</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {livreur.permis.map((permis) => (
                                      <tr key={permis.id}>
                                        <td>{permis.n_permis}</td>
                                        <td>{permis.type_permis}</td>
                                        <td>{permis.date_permis}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
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
                count={filteredLivreurs.length}
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

export default LivreurList;
