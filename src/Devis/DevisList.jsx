import React, { useState, useEffect } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import Navigation from "../Acceuil/Navigation";
import { Form, Button, Modal, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFilePdf, faPrint } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const ListDevis = () => {
  const [devises, setDevis] = useState([]);
  const [lignedevis, setLigneDevis] = useState([]);
  const [clients, setClients] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const handleModalClose = () => setShowModal(false);
  const [totals, setTotals] = useState({});

  const [produits, setProduits] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

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

  const fetchDevis = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/devises");
      setDevis(response.data.devis);
  
      const lignedevisResponse = await axios.get("http://localhost:8000/api/lignedevis");
      setLigneDevis(lignedevisResponse.data.lignedevis);
  
      const clientResponse = await axios.get("http://localhost:8000/api/clients");
      setClients(clientResponse.data.client);
  
      const produitResponse = await axios.get("http://localhost:8000/api/produits");
      setProduits(produitResponse.data.produit);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

  useEffect(() => {
    fetchDevis();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getElementValueById = (id) => {
    return document.getElementById(id)?.value || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare Devis data
      const devisData = {
        reference: formData.reference,
        date: formData.date,
        validation_offer: formData.validation_offer,
        modePaiement: formData.modePaiement,
        status: formData.status,
        client_id: formData.client_id,
        user_id: formData.user_id,
      };

      // Send a POST request to save Devis data
      const devisResponse = await axios.post(
        "http://localhost:8000/api/devises",
        devisData
      );
      console.log("devisResponse", devisResponse.data.devis.id);

      // Prepare Ligne Devis data
      // const ligneDevisData = {
      //   ligne: formData.ligne,
      //   Code_produit: formData.Code_produit,
      //   designation: formData.designation,
      //   quantite: formData.quantite,
      //   prix_vente: formData.prix_vente,
      //   id_devis: devisResponse.data.devis.id,
      // };

      // Set id_devis field for Ligne Devis
      //ligneDevisData.id_devis = ;

      const selectedProductsData = selectedProducts.map((productId) => {
        const selectedProduct = produits.find((product) => product.id === productId);
      
        if (selectedProduct) {
          return {
            ligne: formData.ligne,
            Code_produit: selectedProduct.Code_produit,
            designation: selectedProduct.designation,
            id_devis: devisResponse.data.devis.id,
            quantite: getElementValueById(`quantite_${productId}`),
            prix_vente: getElementValueById(`prix_vente_${productId}`),
          };
        } else {
          console.error(`Product with ID ${productId} not found in produits array.`);
          return null; // or handle the error in a way that suits your needs
        }
      });
        console.log("selectedProductsData", selectedProductsData);

      for (const ligneDevisData of selectedProductsData) {
        await axios.post(
          "http://localhost:8000/api/lignedevis",
          ligneDevisData
        );
      }

      // // Send a POST request to save Ligne Devis data
      // await axios.post("http://localhost:8000/api/lignedevis", ligneDevisData);

      // // Handle success
      // console.log("Devi added successfully.");

      // Fetch updated data
      fetchDevis();

      // Reset form data
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

      // Close the form if needed
      setShowForm(false);

      // Show success message to the user
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Devis and Ligne Devis details added successfully.",
      });
    } catch (error) {
      console.error("Error submitting data:", error);

      // Show error message to the user
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add Devis and Ligne Devis details.",
      });
    }
  };

  // const findProduitId = (Code_produit) => {
  //   return produits.find((produit) => produit.Code_produit === Code_produit)?.id;
  // };
  // const getProduitByDesignation = (designation) => {
  //   return produits.find((produit) => produit.designation === designation)?.id;
  // };

  const handleEdit = (devis) => {
    setEditingDevis(devis); // Set the client to be edited
    // Populate form data with client details
    setFormData({
      reference: devis.reference,
      date: devis.date,
      validation_offer: devis.validation_offer,
      modePaiement: devis.modePaiement,
      status: devis.status,
      client_id: devis.client_id,
      user_id: devis.user_id,
    });
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
        axios
          .delete(`http://localhost:8000/api/devises/${id}`)
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

  const handleProductSelection = () => {
    // Collect selected products
    const selectedProductsData = produits.map((produit) => {
      const productId = produit.id;
      const isChecked = document.getElementById(`produit_${productId}`).checked;
      if (isChecked) {
        const quantite = document.getElementById(`quantite_${productId}`).value;
        const prixVente = document.getElementById(`prix_vente_${productId}`).value;
        return {
          productId,
          quantite,
          prixVente,
        };
      }
      return null;
    }).filter((product) => product !== null);
  
    // Handle saving selected products
    // For example, you can send selectedProductsData to the server
    // using an axios.post request.
    console.log(selectedProductsData);
  
    // Close the modal
    setShowModal(false);
  };
  

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <h2 className="mt-3">Liste des Devis</h2>
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
                  <Form.Label>Status:</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={handleChange}
                    name="status"
                  >
                    <option value="">select</option>
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
                <Form.Group className="col-sm-2" controlId="">
                  <Button variant="primary" onClick={handleModalShow}>
                    produits
                  </Button>
                </Form.Group>
                <Modal show={showModal} onHide={handleModalClose}>
                <Toolbar />
                <Toolbar />
                  <Modal.Header closeButton>
                    <Modal.Title>Sélectionner les produits</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="mt-3">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>Désignation</th>
                            <th>Quantité</th>
                            <th>Prix vente</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducts.map((productId) => {
                            const selectedProduct = produits.find(
                              (product) => product.id === productId
                            );
                            if (!selectedProduct) return null;

                            return (
                              <tr key={productId}>
                                <td>{selectedProduct.Code_produit}</td>
                                <td>{selectedProduct.designation}</td>
                                <td>
                                  <input
                                    className="col-3"
                                    type="text"
                                    value={
                                      formData[`quantite_${productId}`] || ""
                                    }
                                    onChange={(e) =>
                                      handleChange({
                                        target: {
                                          name: `quantite_${productId}`,
                                          value: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="col-3"
                                    value={
                                      formData[`prix_vente_${productId}`] || ""
                                    }
                                    onChange={(e) =>
                                      handleChange({
                                        target: {
                                          name: `prix_vente_${productId}`,
                                          value: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                      Annuler
                    </Button>
                    <Button variant="primary" onClick={handleProductSelection}>
                      Valider la sélection
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* <Form.Group className="mb-3" controlId="Code_produit">
                  <Form.Label>Code produit:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.Code_produit}
                    onChange={handleChange}
                    name="Code_produit"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="designation">
                  <Form.Label>Designation:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.designation}
                    onChange={handleChange}
                    name="designation"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="prix_vente">
                  <Form.Label>Prix vente:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.prix_vente}
                    onChange={handleChange}
                    name="prix_vente"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="quantite">
                  <Form.Label>Quantite:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.quantite}
                    onChange={handleChange}
                    name="quantite"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="ligne">
                  <Form.Label>Ligne:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.ligne}
                    onChange={handleChange}
                    name="ligne"
                  />
                </Form.Group> */}
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
                <thead className="text-center">
                  <tr>
                    <th>N° Devis</th>
                    <th>date</th>
                    <th>Validation de l'offre</th>
                    <th>Mode de Paiement</th>
                    <th>Status</th>
                    <th>Client</th>
                    <th>User</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {devises &&
                    devises.map((devis) => (
                      <tr key={devis.id}>
                        <td>{devis.reference}</td>
                        <td>{devis.date}</td>
                        <td>{devis.validation_offer}</td>
                        <td>{devis.modePaiement}</td>
                        <td>{devis.status}</td>
                        <td>{devis.client_id}</td>
                        <td>{devis.user_id}</td>
                        <td>
                          <div className="d-inline-flex text-center">
                            <Button
                              className="btn btn-sm btn-info m-1"
                              onClick={() => handleEdit(devis)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              className="btn btn-danger btn-sm m-1"
                              onClick={() => handleDelete(devis.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ListDevis;
