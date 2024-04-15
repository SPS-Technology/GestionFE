import React, { useState, useEffect } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Navigation from "../Acceuil/Navigation";
import { Form, Button } from "react-bootstrap";
import { Toolbar } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PrintList from "./PrintList";
import ExportPdfButton from "./exportToPdf";
import TablePagination from "@mui/material/TablePagination";
import {
  faTrash,
  faPlus,
  faMinus,
  faList,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import Select from "react-dropdown-select";
import "jspdf-autotable";
import Swal from "sweetalert2";
import Search from "../Acceuil/Search";
const CommandeList = () => {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [commandes, setCommandes] = useState([]);
  const [warningIndexes, setWarningIndexes] = useState([]);
  const [clients, setClients] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [expandedPrepRows, setExpandedPrepRows] = useState([]);
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [modifiedLotValues, setModifiedLotValues] = useState({});
  const [modifiedQuantiteValues, setModifiedQuantiteValues] = useState({});
  const [selectedProductsData, setSelectedProductsData] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const csrfTokenMeta = document.head.querySelector('meta[name="csrf-token"]');
  const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : null;
  const [selectedClientId, setSelectedClientId] = useState(null);
  useState(null);
  const [formData, setFormData] = useState({
    reference: "",
    dateCommande: "",
    datePreparationCommande: "",
    client_id: "",
    site_id: "",
    mode_payement: "",
    status: "",
    user_id: "",
    produit_id: "",
    prix_unitaire: "",
    quantite: "",
  });
  const [
    existingLignePreparationCommandes,
    setExistingLignePreparationCommandes,
  ] = useState([]);

  const [existingLigneCommandes, setExistingLigneCommandes] = useState([]);

  const [editingCommandes, setEditingCommandes] = useState(null);
  const [editingCommandesId, setEditingCommandesId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expand_total, setExpandTotal] = useState([]);
  const [expand_status, setExpandedStatus] = useState([]);
  const calibres = produits.map((produit) => produit.calibre.calibre);
  const uniqueCalibres = [...new Set(calibres)];
  const [siteClients, setSiteClients] = useState([]);
  const [formContainerStyle, setFormContainerStyle] = useState({
    right: "-100%",
  });
  const [tableContainerStyle, setTableContainerStyle] = useState({
    marginRight: "0px",
  });

  // const fetchData = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:8000/api/commandes");
  //     setCommandes(response.data.commandes);
  //     const clientResponse = await axios.get(
  //       "http://localhost:8000/api/clients"
  //     );
  //     setClients(clientResponse.data.client);

  //     const produitResponse = await axios.get(
  //       "http://localhost:8000/api/produits"
  //     );
  //     setProduits(produitResponse.data.produit);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  useEffect(() => {
    if (editingCommandesId) {
      fetchExistingLigneCommandes(editingCommandesId);
      fetchExistingLignePreparationCommandes(editingCommandesId);
    }
  }, [editingCommandesId]);

  const fetchExistingLigneCommandes = async (commandId) => {
    axios
      .get(`http://localhost:8000/api/ligneCommandes/${commandId}`)
      .then((ligneCommandesResponse) => {
        const existingLigneCommandes =
          ligneCommandesResponse.data.ligneCommandes;

        setExistingLigneCommandes(existingLigneCommandes);
      });
  };
  const fetchExistingLignePreparationCommandes = async (commandId) => {
    axios
      .get(`http://localhost:8000/api/lignePreparationCommandes/${commandId}`)
      .then((lignePreparationCommandesResponse) => {
        const existingLignePreparationCommandes =
          lignePreparationCommandesResponse.data.lignePreparationCommandes;

        setExistingLignePreparationCommandes(existingLignePreparationCommandes);
      });
  };

  const handleShowTotalDetails = (commande) => {
    setExpandTotal((prevRows) =>
      prevRows.includes(commande)
        ? prevRows.filter((row) => row !== commande)
        : [...prevRows, commande]
    );
  };
  const handleShowLigneCommandes = async (commande) => {
    setExpandedRows((prevRows) =>
      prevRows.includes(commande)
        ? prevRows.filter((row) => row !== commande)
        : [...prevRows, commande]
    );
  };
  const handleShowLignePreparationCommandes = async (commande) => {
    setExpandedPrepRows((prevRows) =>
      prevRows.includes(commande)
        ? prevRows.filter((row) => row !== commande)
        : [...prevRows, commande]
    );
  };
  const handleShowStatusCommandes = async (commande) => {
    setExpandedStatus((prevRows) =>
      prevRows.includes(commande)
        ? prevRows.filter((row) => row !== commande)
        : [...prevRows, commande]
    );
  };
  const exportToExcel = () => {
    const selectedClients = clients.filter((client) =>
      selectedItems.includes(client.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedClients);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, "clients.xlsx");
  };
  const fetchData = async () => {
    try {
      const [
        commandesResponse,
        clientsResponse,
        siteClientResponse,
        produitsResponse,
      ] = await Promise.all([
        axios.get("http://localhost:8000/api/commandes"),
        axios.get("http://localhost:8000/api/clients"),
        axios.get("http://localhost:8000/api/siteclients"),
        axios.get("http://localhost:8000/api/produits"),
      ]);
      setCommandes(commandesResponse.data.commandes);
      setClients(clientsResponse.data.client);
      setSiteClients(siteClientResponse.data.siteclient);
      setProduits(produitsResponse.data.produit);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    // Update formData.client_id when commande changes
    if (editingCommandes) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        client_id: editingCommandes.client_id,
      }));
    }
  }, [editingCommandes]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getElementValueById = (id) => {
    return document.getElementById(id)?.value || "";
  };
  const calculateTotalQuantity = (ligneCommandes) => {
    // fetchData();
    return ligneCommandes.reduce((total, ligneCommande) => {
      return total + ligneCommande.quantite;
    }, 0);
  };

  const getQuantity = (ligneCommandes, calibre, designation) => {
    const correspondingProduct = produits.find(
      (product) =>
        product.calibre.calibre === calibre &&
        product.designation === designation
    );

    if (!correspondingProduct) {
      return 0; // If no corresponding product is found, return 0
    }

    const correspondingLigneCommande = ligneCommandes.find(
      (ligne) => ligne.produit_id === correspondingProduct.id
    );

    return correspondingLigneCommande ? correspondingLigneCommande.quantite : 0;
  };
  // const populateProductInputs = (productId, inputType) => {
  //   console.log("productId", productId);
  //   const existingLignePreparationCommande =
  //     existingLignePreparationCommandes.find(
  //       (lignePreparationCommande) =>
  //         lignePreparationCommande.produit_id === productId
  //     );
  //   console.log("existing LigneCommande", existingLigneCommandes);

  //   if (existingLignePreparationCommande) {
  //     return existingLignePreparationCommande[inputType];
  //   }
  //   return "";
  // };
  const populateProductInputs = (id, inputType) => {
    // console.log("existing LigneCommande", existingLigneCommandes);
    console.log(
      "existing LignePreparationCommande",
      existingLignePreparationCommandes
    );
    // const existingLigneCommande = existingLigneCommandes.find(
    //   (ligneCommande) => ligneCommande.produit_id === productId
    // );
    const existingLignePreparationCommande = selectedProductsData.find(
      (data) => data.id === id
    );

    // if (existingLigneCommande && inputType === "quantite") {
    //   return existingLigneCommande[inputType];
    // }
    if (existingLignePreparationCommande) {
      return existingLignePreparationCommande[inputType];
    }
    return "";
  };

  const getTotalForCalibre = (lignePreparationCommandes, calibre, produits) => {
    // Filter lignePreparationCommandes for the given calibre
    const lignePreparationCommandesForCalibre =
      lignePreparationCommandes.filter(
        (ligne) =>
          produits.find((produit) => produit.id === ligne.produit_id)?.calibre
            .calibre === calibre
      );

    // Calculate the total quantity for the calibre
    const total = lignePreparationCommandesForCalibre.reduce(
      (acc, ligne) => acc + ligne.quantite,
      0
    );

    return total;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userResponse = await axios.get("http://localhost:8000/api/users", {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
      });

      const authenticatedUserId = userResponse.data[0].id;
      console.log("auth user", authenticatedUserId);

      if (editingCommandes) {
        const response = await axios.put(
          `http://localhost:8000/api/commandes/${editingCommandes.id}`,
          {
            datePreparationCommande: formData.datePreparationCommande,
            client_id: editingCommandes.client_id,
            status: editingCommandes.status,
            user_id: authenticatedUserId,
          }
        );

        const existingLigneCommandesResponse = await axios.get(
          `http://localhost:8000/api/ligneCommandes/${editingCommandes.id}`
        );
        const existingLigneCommandes =
          existingLigneCommandesResponse.data.ligneCommandes;

        const existingLignePreparationCommandesResponse = await axios.get(
          `http://localhost:8000/api/lignePreparationCommandes/${editingCommandes.id}`
        );

        // const existingLignePreparationCommandes =
        //   existingLignePreparationCommandesResponse.data
        //     .lignePreparationCommandes;
        const selectedPrdsData = selectedProductsData.map(
          (selectedProduct, index) => {
            // const existingLignePreparationCommande =
            //   existingLignePreparationCommandes.find(
            //     (lignePreparationCommande) =>
            //       lignePreparationCommande.produit_id ===
            //       selectedProduct.produit_id
            //   );

            const existingLigneCommande = existingLigneCommandes.find(
              (ligneCommande) =>
                ligneCommande.produit_id === selectedProduct.produit_id
            );

            return {
              id: selectedProduct ? selectedProduct.id : undefined,
              commande_id: editingCommandes.id,
              produit_id: selectedProduct.produit_id,
              prix_unitaire: existingLigneCommande
                ? existingLigneCommande.prix_unitaire
                : undefined,
              quantite: getElementValueById(
                `quantite_${index}_${selectedProduct.produit_id}`
              ),
              lot: getElementValueById(
                `lot_${index}_${selectedProduct.produit_id}`
              ),
            };
          }
        );
        console.log("selectedPrdsData", selectedPrdsData);
        for (const lignePreparationCommandeData of selectedPrdsData) {
          // Check if lignePreparationCommande already exists for this produit_id and update accordingly

          console.log(
            "existing lignePreparationCommandeData:",
            lignePreparationCommandeData
          );

          if (lignePreparationCommandeData.id) {
            // If exists, update the existing lignePreparationCommande
            await axios.put(
              `http://localhost:8000/api/lignePreparationCommandes/${lignePreparationCommandeData.id}`,
              lignePreparationCommandeData,
              {
                withCredentials: true,
                headers: {
                  "X-CSRF-TOKEN": csrfToken,
                },
              }
            );
          } else {
            //   // If doesn't exist, create a new lignePreparationCommande
            if (
              lignePreparationCommandeData.quantite &&
              lignePreparationCommandeData.lot
            ) {
              await axios.post(
                "http://localhost:8000/api/lignePreparationCommandes",
                lignePreparationCommandeData,
                {
                  withCredentials: true,
                  headers: {
                    "X-CSRF-TOKEN": csrfToken,
                  },
                }
              );
            }
          }
        }
      }

      fetchData();

      // Réinitialiser les données du formulaire
      setFormData({
        datePreparationCommande: "",

        user_id: "",
        produit_id: "",
        prix_unitaire: "",
        quantite: "",
        lot: "",
      });

      // Fermer le formulaire si nécessaire
      setShowForm(false);
      //setExistingLignePreparationCommandes([]);
      // Afficher un message de succès à l'utilisateur
      Swal.fire({
        icon: "success",
        title: "Succès !",
        text: "Succès.",
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
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 5));
    setPage(0);
  };
  const getProduitValue = (produitId, field) => {
    // Find the product in the produits array based on produitId
    const produit = produits.find((p) => p.id === produitId);

    // If the product is found, return the value of the specified field
    if (produit) {
      return produit[field];
    }

    // If the product is not found, return an empty string or any default value
    return "";
  };
  const handleEdit = (commande) => {
    setModifiedLotValues({});
    setModifiedQuantiteValues({});
    setEditingCommandesId(commande.id);
    setEditingCommandes(commande);
    console.log("Editing Commande", editingCommandes);
    setFormData({
      reference: commande.reference,
      dateCommande: commande.dateCommande,
      datePreparationCommande: commande.datePreparationCommande,
      client_id: commande.client_id,
      site_id: commande.site_id,
      mode_payement: commande.mode_payement,
      status: commande.status,
    });

    console.log("formData,", formData);

    if (commande.ligne_preparation_commandes.length === 0) {
      const selectedProducts = commande.ligne_commandes.map((ligneCommande) => {
        const product = produits.find(
          (produit) => produit.id === ligneCommande.produit_id
        );

        return {
          //id: ligneCommande.id,
          Code_produit: product.Code_produit,
          calibre_id: product.calibre_id,
          designation: product.designation,
          produit_id: ligneCommande.produit_id,
          quantite: ligneCommande.quantite,

          prix_unitaire: ligneCommande.prix_unitaire,
        };
      });
      setSelectedProductsData(selectedProducts);
    } else {
      const selectedProducts = commande.ligne_preparation_commandes.map(
        (lignePreparationCommande, index) => {
          const product = produits.find(
            (produit) => produit.id === lignePreparationCommande.produit_id
          );

          const ligneCommande = commande.ligne_commandes.find(
            (ligne) => ligne.produit_id === lignePreparationCommande.produit_id
          );

          return {
            id: lignePreparationCommande.id,
            Code_produit: product.Code_produit,
            calibre_id: product.calibre_id,
            designation: product.designation,
            produit_id: lignePreparationCommande.produit_id,
            quantite: ligneCommande.quantite,
            quantite_lot: lignePreparationCommande.quantite,
            prix_unitaire: lignePreparationCommande.prix_unitaire,
            lot: lignePreparationCommande.lot,
          };
        }
      );
      console.log("selectedProducts in handle Edit", selectedProducts);
      setSelectedProductsData(selectedProducts);
    }
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "1200px" });
    } else {
      closeForm();
    }
  };
  const handleInputChange = (index, inputType, event) => {
    const newValue = event.target.value;
    console.log("selectedProductsData", selectedProductsData);
    console.log("index", index);
    if (selectedProductsData[index]) {
      const productId = selectedProductsData[index].produit_id;
      const quantite = selectedProductsData[index].quantite;
      if (inputType === "lot") {
        setModifiedLotValues((prev) => {
          const updatedValues = {
            ...prev,
            [`${index}_${productId}`]: newValue,
          };
          console.log("Modified Lot values:", updatedValues);
          return updatedValues;
        });
      } else if (inputType === "quantite") {
        if (newValue > quantite) {
          setWarningIndexes((prev) => [...prev, index]); // Add index to warning indexes
        } else {
          setWarningIndexes((prev) => prev.filter((item) => item !== index)); // Remove index from warning indexes

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
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer ce Commandes ?",
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
          .delete(`http://localhost:8000/api/commandes/${id}`)
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Commandes supprimé avec succès.",
            });
            fetchData();
          })
          .catch((error) => {
            console.error("Erreur lors de la suppression du Commandes:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la suppression du Commandes.",
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
      setTableContainerStyle({ marginRight: "1200px" });
    } else {
      closeForm();
    }
  };
  const handleDeleteAllSelection = () => {
    // Clear the selected products data
    setSelectedProductsData([]);
  };
  const closeForm = () => {
    handleDeleteAllSelection();
    setFormContainerStyle({ right: "-100%" });
    setTableContainerStyle({ marginRight: "0" });
    setShowForm(false); // Hide the form
    setFormData({
      // Clear form data
      reference: "",
      dateCommande: "",
      datePreparationCommande: "",
      client_id: "",
      site_id: "",
      mode_payement: "",
      status: "",
      user_id: "",
      produit_id: "",
      prix_unitaire: "",
      quantite: "",
    });
    setEditingCommandes(null); // Clear editing client
  };
  //---------------------------Produit--------------------------

  const handleProductSelection = (selectedProduct, index) => {
    console.log("selectedProduct", selectedProduct);
    const updatedSelectedProductsData = [...selectedProductsData];
    updatedSelectedProductsData[index] = selectedProduct;
    setSelectedProductsData(updatedSelectedProductsData);
    console.log("selectedProductsData", selectedProductsData);
  };

  useEffect(() => {
    const filtered = commandes.filter((Commandes) =>
      Commandes.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCommandes(filtered);
  }, [commandes, searchTerm]);

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
      setSelectedItems(commandes.map((Commandes) => Commandes.id));
    }
  };
  const handleAddEmptyRow = () => {
    setSelectedProductsData([...selectedProductsData, {}]);
    console.log("selectedProductData", selectedProductsData);
  };
  const handleClientSelection = (selected) => {
    if (selected && selected.length > 0) {
      console.log("selectedClient", selected);
      setSelectedClientId(selected[0].value);
    }
  };
  const handleDeleteProduct = (index, id) => {
    const updatedSelectedProductsData = [...selectedProductsData];
    updatedSelectedProductsData.splice(index, 1);
    setSelectedProductsData(updatedSelectedProductsData);
    if (id) {
      axios
        .delete(`http://localhost:8000/api/lignePreparationCommandes/${id}`)
        .then(() => {
          fetchData();
        });
    }
  };
  const getClientValue = (clientId, field) => {
    // Find the product in the produits array based on produitId
    const client = clients.find((p) => p.id === clientId);

    // If the product is found, return the value of the specified field
    if (client) {
      return client[field];
    }

    // If the product is not found, return an empty string or any default value
    return "";
  };
  const getSiteClientValue = (siteClientId, field) => {
    // Find the product in the produits array based on produitId
    const site = siteClients.find((p) => p.id === siteClientId);

    // If the product is found, return the value of the specified field
    if (site) {
      return site[field];
    }

    // If the product is not found, return an empty string or any default value
    return "";
  };
  const calculateRowColor = (commande) => {
    // Implement your logic here to determine row color based on quantity data
    if (commande.ligne_preparation_commandes.length !== 0) {
      const preparedQuantites = calculateTotalQuantity(
        commande.ligne_preparation_commandes
      );
      return preparedQuantites ===
        calculateTotalQuantity(commande.ligne_commandes)
        ? "#87A922"
        : "#FCDC2A";
    } else return "#FF8787";
  };

  // Function to calculate total quantity
  // const calculateTotalQuantity = (ligne_commandes) => {
  //   // Implement your logic here to calculate total quantity
  //   // For example:
  //   let total = 0;
  //   ligne_commandes.forEach((ligne) => {
  //     total += ligne.quantite;
  //   });
  //   return total;
  // };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />

          <div className="d-flex justify-content-center align-items-center">
            <div className="col-md-auto" style={{ width: "700px" }}>
              <Search onSearch={handleSearch} type="search" />
            </div>
          </div>

          <div className="d-flex justify-content-end align-items-center">
            <div className="btn-group col-1">
              <PrintList
                tableId="produitsTable"
                title="Liste des produits"
                produitList={produits}
                filteredProduits={filteredCommandes}
              />
              <ExportPdfButton
                produits={produits}
                selectedItems={selectedItems}
                disabled={selectedItems.length === 0}
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
          <h3>Preparation des Commandes</h3>
          <div
            id="formContainerCommande"
            style={{ ...formContainerStyle, padding: "50px" }}
          >
            {/* <Form className="row" onSubmit={handleSubmit}>
                <div className="col-md-4">
                  <Form.Group controlId="datePreparationCommande">
                    <Form.Label>Date Preparation Commande:</Form.Label>
                    <Form.Control
                      type="date"
                      name="datePreparationCommande"
                      value={formData.datePreparationCommande}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-12">
                  {console.log("selectedProductsData:", selectedProductsData)}
                  <Form.Group controlId="selectedProduitTable">
                    <table className="table table-bordered table-responsive-sm">
                      <thead>
                        <tr>
                          <th>
                            <Select
                              options={produits.map((produit) => ({
                                value: produit.id,
                                label: produit.Code_produit,
                                placeholder: "Code Produit",
                              }))}
                              onChange={(selected) =>
                                handleProductSelection(
                                  selected[0].value,
                                  selected[0].designation
                                )
                              }
                              value={selectedProductId}
                            />
                          </th>
                          <th>Designation</th>
                          <th>Calibre</th>
                          <th>Quantité</th>
                          <th>Lot</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProductsData.map((productData, index) => (
                          <tr
                            key={index}
                            className={
                              productData.quantity ===
                              getElementValueById(`quantite_${productData.id}`)
                                ? "green-row"
                                : "yellow-row"
                            }
                          >
                            <td>
                              {getProduitValue(productData.id, "Code_produit")}
                            </td>
                            <td>
                              {getProduitValue(productData.id, "designation")}
                            </td>
                            <td>
                              {getProduitValue(productData.id, "calibre_id")}
                            </td>
                            <td>
                              <input
                                type="text"
                                id={`quantite_${productData.id}`}
                                className="quantiteInput"
                                placeholder="Quantite"
                                value={
                                  modifiedQuantiteValues[productData.id] ||
                                  populateProductInputs(
                                    productData.id,
                                    "quantite"
                                  )
                                }
                                onChange={(event) =>
                                  handleInputChange(
                                    productData.id,
                                    "quantite",
                                    event
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                id={`lot_${productData.id}`}
                                className="lotInput"
                                placeholder="Lot"
                                value={
                                  modifiedLotValues[productData.id] ||
                                  populateProductLotInputs(
                                    productData.id,
                                    "lot"
                                  )
                                }
                                onChange={(event) =>
                                  handleInputChange(
                                    productData.id,
                                    "lot",
                                    event
                                  )
                                }
                              />
                            </td>
                            <td>
                              <Button
                                className=" btn btn-danger btn-sm m-1"
                                onClick={() => handleDeleteProduct(index)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Form.Group>
                </div>

                <div className="col-md-12 mt-3">
                  <Button
                    className="btn btn-sm"
                    variant="primary"
                    type="submit"
                  >
                    Submit
                  </Button>
                </div>
              </Form> */}
            <Form className="row" onSubmit={handleSubmit}>
              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="mode_payement" className="col-form-label">
                      Mode Paiement:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      className="form-control"
                      id="mode_payement"
                      name="mode_payement"
                      value={formData.mode_payement}
                      readOnly // Make the input read-only
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="client_id" className="col-form-label">
                      Client:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      className="form-control"
                      id="client_id"
                      name="client_id"
                      value={getClientValue(
                        formData.client_id,
                        "raison_sociale"
                      )}
                      readOnly // Make the input read-only
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="site_id" className="col-form-label">
                      Site Client:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      className={
                        formData.site_id
                          ? "form-control"
                          : "text-danger form-control"
                      }
                      id="site_id"
                      name="site_id"
                      value={
                        formData.site_id
                          ? getSiteClientValue(
                              formData.site_id,
                              "raison_sociale"
                            )
                          : "aucun site"
                      }
                      readOnly // Make the input read-only
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="status" className="col-form-label">
                      Status:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      className="form-control"
                      id="status"
                      name="status"
                      value={formData.status}
                      readOnly // Make the input read-only
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="dateCommande" className="col-form-label">
                      Date Commande:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      className="form-control"
                      id="dateCommande"
                      name="dateCommande"
                      value={formData.dateCommande}
                      readOnly // Make the input read-only
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label
                      htmlFor="datePreparationCommande"
                      className="col-form-label"
                    >
                      Date Preparation Commande:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <Form.Group controlId="datePreparationCommande">
                      <Form.Control
                        type="date"
                        name="datePreparationCommande"
                        value={formData.datePreparationCommande}
                        onChange={handleChange}
                        className="form-control-sm"
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>
              {editingCommandes && (
                <>
                  {calculateTotalQuantity(
                    editingCommandes.ligne_preparation_commandes
                  ) !==
                    calculateTotalQuantity(
                      editingCommandes.ligne_commandes
                    ) && (
                    <div>
                      <Button
                        className="btn btn-sm mb-2"
                        variant="primary"
                        onClick={handleAddEmptyRow}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      <strong>Ajouter Produit</strong>
                    </div>
                  )}

                  {/* Add other JSX elements with the same condition */}
                </>
              )}

              <div className="col-md-12">
                {console.log("selectedProductsData:", selectedProductsData)}
                <Form.Group controlId="selectedProduitTable">
                  <div className="table-responsive">
                    <table className="table table-bordered ">
                      <thead>
                        <tr>
                          <th>Code Produit</th>
                          <th>Designation</th>
                          <th>Calibre</th>
                          <th>Quantité</th>
                          <th>Lot</th>
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
                                className={
                                  warningIndexes.includes(index)
                                    ? "input-warning"
                                    : ""
                                }
                                id={`quantite_${index}_${productData.produit_id}`}
                                // className="quantiteInput"
                                placeholder={productData.quantite}
                                value={
                                  modifiedQuantiteValues[
                                    `${index}_${productData.produit_id}`
                                  ] ||
                                  populateProductInputs(
                                    productData.id,
                                    "quantite_lot"
                                  )
                                }
                                onChange={(event) =>
                                  handleInputChange(index, "quantite", event)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                id={`lot_${index}_${productData.produit_id}`}
                                className="lotInput"
                                placeholder="Lot"
                                value={
                                  modifiedLotValues[
                                    `${index}_${productData.produit_id}`
                                  ] ||
                                  populateProductInputs(productData.id, "lot")
                                }
                                onChange={(event) =>
                                  handleInputChange(index, "lot", event)
                                }
                              />
                            </td>
                            <td>
                              <Button
                                className=" btn btn-danger btn-sm m-1"
                                onClick={() =>
                                  handleDeleteProduct(index, productData.id)
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

              <Form.Group className="col m-3 text-center">
                <Button type="submit" className="btn btn-sm col-4">
                  {editingCommandes ? "Modifier" : "Valider"}
                </Button>
                <Button
                  className="btn btn-secondary col-4 offset-1"
                  onClick={closeForm}
                >
                  Annuler
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
                style={{ backgroundColor: "#ddd" }}
              >
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                    />
                  </th>
                  <th>Reference</th>
                  <th>Client</th>
                  <th>Site Client</th>
                  <th>Date Commande</th>
                  <th>Date Preparation Commande</th>

                  <th>Mode de Paiement</th>

                  <th>Status</th>
                  <th>Total</th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {filteredCommandes &&
                  filteredCommandes.map((commande) => (
                    <React.Fragment key={commande.id}>
                      <tr>
                        <td>
                          {/* <input
                              type="checkbox"
                              checked={selectedItems.some(
                                (item) => item.id === Commandes.id
                              )}
                              onChange={() => handleSelectItem(Commandes)}
                            /> */}
                          <input
                            type="checkbox"
                            onChange={() => handleCheckboxChange(commande.id)}
                            checked={selectedItems.includes(commande.id)}
                          />
                        </td>
                        <td
                          style={{
                            backgroundColor: calculateRowColor(commande),
                          }}
                        >
                          <Button
                            className="btn btn-sm btn-light"
                            style={{ marginRight: "10px" }}
                            onClick={() =>
                              handleShowLignePreparationCommandes(commande.id)
                            }
                          >
                            <FontAwesomeIcon
                              icon={
                                expandedPrepRows.includes(commande.id)
                                  ? faMinus
                                  : faPlus
                              }
                            />
                          </Button>

                          {commande.reference}
                        </td>
                        <td>
                          {getClientValue(commande.client_id, "raison_sociale")}
                        </td>
                        <td className={commande.site_id ? "" : "text-danger"}>
                          {commande.site_id
                            ? getSiteClientValue(
                                commande.site_id,
                                "raison_sociale"
                              )
                            : "aucun site"}
                        </td>
                        <td>{commande.dateCommande}</td>
                        <td>{commande.datePreparationCommande}</td>

                        <td>{commande.mode_payement}</td>
                        <td>
                          <Button
                            className="btn btn-sm btn-light"
                            style={{ marginRight: "10px" }}
                            onClick={() =>
                              handleShowStatusCommandes(commande.id)
                            }
                          >
                            <FontAwesomeIcon
                              icon={
                                expand_status.includes(commande.id)
                                  ? faMinus
                                  : faPlus
                              }
                            />
                          </Button>

                          {commande.status}
                        </td>
                        <td>
                          <Button
                            className="btn btn-sm btn-light"
                            style={{ marginRight: "10px" }}
                            onClick={() => handleShowTotalDetails(commande.id)}
                          >
                            <FontAwesomeIcon
                              icon={
                                expand_total.includes(commande.id)
                                  ? faMinus
                                  : faPlus
                              }
                            />
                          </Button>

                          {calculateTotalQuantity(commande.ligne_commandes)}
                        </td>
                        <td>
                          <div className="d-inline-flex text-center">
                            <Button
                              className=" btn btn-sm btn-info m-1"
                              onClick={() => handleEdit(commande)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            {/* <Button
                                className=" btn btn-danger btn-sm m-1"
                                onClick={() => handleDelete(commande.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button> */}
                            <Button
                              className="btn btn-sm btn-light"
                              onClick={() =>
                                handleShowLigneCommandes(commande.id)
                              }
                            >
                              <FontAwesomeIcon icon={faList} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedPrepRows.includes(commande.id) &&
                        commande.ligne_preparation_commandes && (
                          <tr>
                            <td
                              colSpan="12"
                              style={{
                                padding: "0",
                              }}
                            >
                              <div id="lignesCommandes">
                                <table
                                  className="table-bordered"
                                  style={{
                                    borderCollapse: "collapse",

                                    width: "100%",
                                  }}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        Colspan="4"
                                        style={{
                                          backgroundColor: "#EEEEEE",
                                        }}
                                      >
                                        Liste des ligne de Preparation Commandes
                                      </th>
                                    </tr>
                                    <tr>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Code Produit
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Designation
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Quantite
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Calibre
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Prix Unitaire
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Lot
                                      </th>
                                      {/* <th className="text-center">Action</th> */}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {commande.ligne_preparation_commandes.map(
                                      (lignePreparationCommande) => {
                                        const produit = produits.find(
                                          (prod) =>
                                            prod.id === lignePreparationCommande.produit_id
                                        );

                                        return (
                                          <tr key={lignePreparationCommande.id}>
                                             <td>{produit.Code_produit}</td>
                                             <td>{produit.designation}</td>
                                            <td>
                                              {
                                                lignePreparationCommande.quantite
                                              }
                                            </td>
                                            <td>{produit.calibre.calibre}</td>

                                            <td>
                                              {
                                                lignePreparationCommande.prix_unitaire
                                              }{" "}
                                              DH
                                            </td>
                                            <td>
                                              {lignePreparationCommande.lot}
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
                                        );
                                      }
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      {expandedRows.includes(commande.id) &&
                        commande.ligne_commandes && (
                          <tr>
                            <td
                              colSpan="12"
                              style={{
                                padding: "0",
                              }}
                            >
                              <div id="lignesCommandes">
                                <table
                                  className="table-bordered"
                                  style={{
                                    borderCollapse: "collapse",

                                    width: "100%",
                                  }}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        Colspan="4"
                                        style={{
                                          backgroundColor: "#EEEEEE",
                                        }}
                                      >
                                        Liste des ligne de Commandes
                                      </th>
                                    </tr>
                                    <tr>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Produit
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Quantite
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Prix Vente
                                      </th>

                                      {/* <th className="text-center">Action</th> */}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {commande.ligne_commandes.map(
                                      (ligneCommande) => (
                                        <tr key={ligneCommande.id}>
                                          <td>{ligneCommande.produit_id}</td>
                                          <td>{ligneCommande.quantite}</td>
                                          <td>
                                            {ligneCommande.prix_unitaire} DH
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
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      {expand_total.includes(commande.id) && (
                        <tr>
                          <td
                            style={{
                              padding: "0",
                            }}
                            colSpan="12"
                          >
                            {/* Increased colspan to accommodate the new Total column */}
                            <table
                              className="table-bordered"
                              style={{
                                borderCollapse: "collapse",
                                width: "100%",
                              }}
                            >
                              <thead>
                                <tr>
                                  <th></th>
                                  {commande.ligne_commandes.map((ligne) => {
                                    const produit = produits.find(
                                      (prod) => prod.id === ligne.produit_id
                                    );
                                    return (
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                        key={produit.designation}
                                      >
                                        {produit.designation}
                                      </th>
                                    );
                                  })}
                                  <th
                                    style={{
                                      backgroundColor: "#ddd",
                                    }}
                                  >
                                    Total (Unité) / Calibre
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {uniqueCalibres.map((calibre) => (
                                  <tr key={calibre}>
                                    <td
                                      style={{
                                        backgroundColor: "#ddd",
                                      }}
                                    >
                                      <strong>calibre : [{calibre}]</strong>
                                    </td>
                                    {commande.ligne_commandes.map((ligne) => {
                                      const produit = produits.find(
                                        (prod) => prod.id === ligne.produit_id
                                      );
                                      return (
                                        <td key={produit.designation}>
                                          {getQuantity(
                                            commande.ligne_commandes,
                                            calibre,
                                            produit.designation
                                          )}
                                        </td>
                                      );
                                    })}
                                    <td>
                                      <strong>
                                        {getTotalForCalibre(
                                          commande.ligne_commandes,
                                          calibre,
                                          produits
                                        )}
                                      </strong>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                      {expand_status.includes(commande.id) &&
                        commande.status_commandes && (
                          <tr>
                            <td
                              colSpan="12"
                              style={{
                                padding: "0",
                              }}
                            >
                              <div id="statusCommandes">
                                <table
                                  className="table-bordered"
                                  style={{
                                    borderCollapse: "collapse",

                                    width: "100%",
                                  }}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Status
                                      </th>
                                      <th
                                        style={{
                                          backgroundColor: "#ddd",
                                        }}
                                      >
                                        Date Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {commande.status_commandes.map(
                                      (statusCommande) => (
                                        <tr key={statusCommande.id}>
                                          <td>{statusCommande.status}</td>
                                          <td>{statusCommande.date_status}</td>
                                        </tr>
                                      )
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
              count={filteredCommandes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CommandeList;
