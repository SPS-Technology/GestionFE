import React, { useState, useEffect } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Navigation from "../Acceuil/Navigation";
import { Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import Select from "react-dropdown-select";
import "jspdf-autotable";
import Swal from "sweetalert2";

const CommandeList = () => {
  const [commandes, setCommandes] = useState([]);

  const [clients, setClients] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [modifiedPrixValues, setModifiedPrixValues] = useState({});
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
    client_id: "",
    mode_payement: "",
    status: "",
    user_id: "",
    produit_id: "",
    prix_unitaire: "",
    quantite: "",
  });
  const [existingLigneCommandes, setExistingLigneCommandes] = useState([]);

  const [editingCommandes, setEditingCommandes] = useState(null);
  const [editingCommandesId, setEditingCommandesId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expand_total, setExpandTotal] = useState([]);
  const [expand_status, setExpandedStatus] = useState([]);
  const calibres = produits.map((produit) => produit.calibre.calibre);
  const uniqueCalibres = [...new Set(calibres)];
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
      console.log(existingLigneCommandes);
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
  const handleShowStatusCommandes = async (commande) => {
    setExpandedStatus((prevRows) =>
      prevRows.includes(commande)
        ? prevRows.filter((row) => row !== commande)
        : [...prevRows, commande]
    );
  };
  // const fetchLigneCommandes = async (CommandesId) => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:8000/api/ligneCommandes/${CommandesId}`
  //     );
  //     return response.data.ligneCommandes;
  //   } catch (error) {
  //     console.error(
  //       "Erreur lors de la récupération des lignes de Commandes :",
  //       error
  //     );
  //     return [];
  //   }
  // };
  // const fetchStatusCommandes = async (CommandesId) => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:8000/api/statusCommandes/${CommandesId}`
  //     );
  //     return response.data.statusCommandes;
  //   } catch (error) {
  //     console.error(
  //       "Erreur lors de la récupération des lignes de Commandes :",
  //       error
  //     );
  //     return [];
  //   }
  // };

  // useEffect(() => {
  //   // Préchargement des lingeCommandes pour chaque Commandes
  //   commandes.forEach(async (Commandes) => {
  //     if (!Commandes.ligne_commandes) {
  //       const ligneCommandes = await fetchLigneCommandes(Commandes.id);
  //       setClients((prevCommandes) => {
  //         return prevCommandes.map((prevCommandes) => {
  //           if (prevCommandes.id === Commandes.id) {
  //             return { ...prevCommandes, ligneCommandes };
  //           }
  //           return prevCommandes;
  //         });
  //       });
  //     }
  //   });
  // }, [commandes]);
  const fetchData = async () => {
    try {
      const [commandesResponse, clientsResponse, produitsResponse] =
        await Promise.all([
          axios.get("http://localhost:8000/api/commandes"),
          axios.get("http://localhost:8000/api/clients"),
          axios.get("http://localhost:8000/api/produits"),
        ]);
      setCommandes(commandesResponse.data.commandes);
      setClients(clientsResponse.data.client);
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
  const populateProductInputs = (productId, inputType) => {
    console.log("productId", productId);
    const existingLigneCommande = existingLigneCommandes.find(
      (ligneCommande) => ligneCommande.produit_id === productId
    );
    console.log("existing LigneCommande", existingLigneCommandes);

    if (existingLigneCommande) {
      return existingLigneCommande[inputType];
    }
    return "";
  };

  const getTotalForCalibre = (ligneCommandes, calibre, produits) => {
    // Filter ligneCommandes for the given calibre
    const ligneCommandesForCalibre = ligneCommandes.filter(
      (ligne) =>
        produits.find((produit) => produit.id === ligne.produit_id)?.calibre
          .calibre === calibre
    );

    // Calculate the total quantity for the calibre
    const total = ligneCommandesForCalibre.reduce(
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
      // Préparer les données du Commandes
      const CommandesData = {
        dateCommande: formData.dateCommande,
        status: formData.status,
        mode_payement: formData.mode_payement,

        client_id: selectedClientId,
        user_id: authenticatedUserId,
      };

      let response;
      if (editingCommandes) {
        // Mettre à jour le Commandes existant
        response = await axios.put(
          `http://localhost:8000/api/commandes/${editingCommandes.id}`,
          {
            dateCommande: formData.dateCommande,
            status: formData.status,
            mode_payement: formData.mode_payement,

            client_id: selectedClientId,
            user_id: authenticatedUserId,
          }
        );
      } else {
        // Créer un nouveau Commandes
        response = await axios.post(
          "http://localhost:8000/api/commandes",
          CommandesData
        );
      }
      console.log("response of postCommande: ", response);

      //   // Envoyer une requête PUT pour mettre à jour le Commandes
      //   const updatedCommandesResponse = await axios.put(
      //     `http://localhost:8000/api/commandes/${response.data.Commandes.id}`,
      //     updatedCommandesData
      //   );

      //   console.log("Commandes mis à jour:", updatedCommandesResponse.data);
      // }

      // Préparer les données des lignes de Commandes
      const selectedPrdsData = selectedProductsData.map((selectProduct) => {
        if (editingCommandes) {
          return {
            commande_id: editingCommandes.id,
            produit_id: selectProduct.id,
            quantite: getElementValueById(`quantite_${selectProduct.id}`),
            prix_unitaire: getElementValueById(`prix_${selectProduct.id}`),
          };
        } else {
          return {
            commande_id: response.data.commande.id,
            produit_id: selectProduct.id,
            quantite: getElementValueById(`quantite_${selectProduct.id}`),
            prix_unitaire: getElementValueById(`prix_${selectProduct.id}`),
          };
        }
      });

      console.log("selectedPrdsData", selectedPrdsData);

      for (const ligneCommandesData of selectedPrdsData) {
        if (ligneCommandesData.id) {
          // Si l'ID existe, il s'agit d'une modification
          await axios.put(
            `http://localhost:8000/api/ligneCommandes/${ligneCommandesData.id}`,
            ligneCommandesData
          );
        } else {
          // Sinon, il s'agit d'une nouvelle ligne de Commandes
          await axios.post(
            "http://localhost:8000/api/ligneCommandes",
            ligneCommandesData
          );
        }
      }
      const statusCommandeData = {
        commande_id: response.data.commande.id,
        status: "En cours",
      };
      await axios.post(
        "http://localhost:8000/api/statusCommande",
        statusCommandeData,
        {
          withCredentials: true,
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );

      // Récupérer les données mises à jour
      fetchData();

      // Réinitialiser les données du formulaire
      setFormData({
        reference: "",
        dateCommande: "",
        client_id: "",
        mode_payement: "",
        status: "",
        user_id: "",
        produit_id: "",
        prix_unitaire: "",
        quantite: "",
      });

      // Fermer le formulaire si nécessaire
      setShowForm(false);

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
    setEditingCommandesId(commande.id);
    setEditingCommandes(commande);
    console.log(commande);
    setFormData({
      reference: commande.reference,
      dateCommande: commande.dateCommande,
      client_id: commande.client_id,
      mode_payement: commande.mode_payement,
      status: commande.status,
    });

    console.log("formData,", formData);

    const selectedProducts = commande.ligne_commandes.map((ligneCommande) => ({
      produit_id: ligneCommande.produit_id,
      quantite: ligneCommande.quantite,
      prix_unitaire: ligneCommande.prix_unitaire,
    }));
    setSelectedProductsData(selectedProducts);

    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
  };
  const handleInputChange = (productId, inputType, event) => {
    const newValue = event.target.value;
    if (inputType === "prix_unitaire") {
      setModifiedPrixValues((prev) => ({ ...prev, [productId]: newValue }));
    } else if (inputType === "quantite") {
      setModifiedQuantiteValues((prev) => ({ ...prev, [productId]: newValue }));
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
      dateCommande: "",
      client_id: "",
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

  const handleClientSelection = (selected) => {
    console.log("selectedClientId", selected[0].value);
    setSelectedClientId(selected[0].value);
  };

  const handleProductSelection = (productId, designation) => {
    console.log("selectedProductData before: ", selectedProductsData);

    const selectedProduct = produits.find(
      (product) => product.id === productId
    );

    if (selectedProduct) {
      setSelectedProductsData((prevData) => [...prevData, selectedProduct]);
    }
    console.log("selectedProductData after: ", selectedProductsData);

    setSelectedProductId(null); // Clear the selected product ID
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

  const handlePrint = (CommandesId) => {
    // Récupérer les informations spécifiques au Commandes sélectionné
    const selectedCommandes = commandes.find(
      (Commandes) => Commandes.id === CommandesId
    );

    // Création d'une nouvelle instance de jsPDF
    const doc = new jsPDF();

    // Position de départ pour l'impression des données
    let startY = 20;

    // Dessiner les informations du client dans un tableau à gauche
    const clientInfo = [
      {
        label: "Raison sociale:",
        value: selectedCommandes.client.raison_sociale,
      },
      { label: "Adresse:", value: selectedCommandes.client.adresse },
      { label: "Téléphone:", value: selectedCommandes.client.tele },
      { label: "ICE:", value: selectedCommandes.client.ice },
      // Ajoutez d'autres informations client si nécessaire
    ];

    // Dessiner le tableau d'informations client à gauche
    doc.setFontSize(10); // Police plus petite pour les informations du client
    clientInfo.forEach((info) => {
      doc.text(`${info.label}`, 10, startY);
      doc.text(`${info.value}`, 40, startY);
      startY += 10; // Espacement entre les lignes du tableau
    });

    // Dessiner le tableau des informations du Commandes à droite
    const CommandesInfo = [
      { label: "N° Commandes:", value: selectedCommandes.reference },
      { label: "Date:", value: selectedCommandes.date },
      {
        label: "Validation de l'offre:",
        value: selectedCommandes.validation_offer,
      },
      { label: "Mode de Paiement:", value: selectedCommandes.modePaiement },
    ];

    // Dessiner le tableau des informations du Commandes à droite
    startY = 20; // Réinitialiser la position Y
    CommandesInfo.forEach((info) => {
      doc.text(`${info.label}`, 120, startY);
      doc.text(`${info.value}`, 160, startY);
      startY += 10; // Espacement entre les lignes du tableau
    });

    // Vérifier si les détails des lignes de Commandes sont définis
    if (selectedCommandes.ligneCommandes) {
      // Dessiner les en-têtes du tableau des lignes de Commandes
      const headersLigneCommandes = [
        "Code produit",
        "Désignation",
        "Quantité",
        "Prix",
        "Total HT",
      ];

      // Récupérer les données des lignes de Commandes
      const rowsLigneCommandes = selectedCommandes.ligneCommandes.map(
        (ligneCommandes) => [
          ligneCommandes.Code_produit,
          ligneCommandes.designation,
          ligneCommandes.quantite,
          ligneCommandes.prix_vente,
          // Calculate the total for each product line
          (ligneCommandes.quantite * ligneCommandes.prix_vente).toFixed(2), // Assuming the price is in currency format
        ]
      );

      // Dessiner le tableau des lignes de Commandes
      doc.autoTable({
        head: [headersLigneCommandes],
        body: rowsLigneCommandes,
        startY: startY + 20, // Décalage vers le bas pour éviter de chevaucher les informations du Commandes
        margin: { top: 20 },
        styles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fontSize: 8, // Police plus petite pour les lignes de Commandes
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
      // const montantTable = [
      //   [
      //     "Montant Total Hors Taxes:",
      //     getTotalHT(selectedCommandes.ligneCommandes).toFixed(2),
      //   ],
      //   [
      //     "TVA (20%):",
      //     calculateTVA(getTotalHT(selectedCommandes.ligneCommandes)).toFixed(2),
      //   ],
      //   ["TTC:", getTotalTTC(selectedCommandes.ligneCommandes).toFixed(2)],
      // ];

      // doc.autoTable({
      //   body: montantTable,
      //   startY: doc.autoTable.previous.finalY + 10,
      //   margin: { top: 20 },
      //   styles: {
      //     lineWidth: 0.1,
      //     lineColor: [0, 0, 0],
      //     fontSize: 10, // Police plus petite pour les montants
      //   },
      // });
    }

    // Enregistrer le fichier PDF avec le nom 'Commandes.pdf'
    doc.save("Commandes.pdf");
  };
  const handleDeleteProduct = (index) => {
    const updatedSelectedProductsData = [...selectedProductsData];
    updatedSelectedProductsData.splice(index, 1);
    setSelectedProductsData(updatedSelectedProductsData);
  };
  const handleProductCheckboxChange = (selectedOptions) => {
    const selectedProductIds = selectedOptions.map((option) => option.value);

    const updatedSelectedProducts = produits
      .map((produit) => ({
        ...produit,
        prix: produit.prix_vente, // Initialize prix with prix_vente
      }))
      .filter((produit) => selectedProductIds.includes(produit.id));

    setSelectedProducts(updatedSelectedProducts);
    console.log("selectedProducts :", selectedProducts);
  };

  // Fonction pour calculer le montant total hors taxes
  // const getTotalHT = (ligneCommandes) => {
  //   return ligneCommandes.reduce(
  //     (total, item) => total + item.quantite * item.prix_vente,
  //     0
  //   );
  // };

  // // Fonction pour calculer la TVA
  // const calculateTVA = (totalHT) => {
  //   return totalHT * 0.2; // 20% de TVA
  // };

  // // Fonction pour calculer le montant total toutes taxes comprises (TTC)
  // const getTotalTTC = (ligneCommandes) => {
  //   return (
  //     getTotalHT(ligneCommandes) + calculateTVA(getTotalHT(ligneCommandes))
  //   );
  // };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <h2 className="mt-3">Liste des Commandes</h2>
          <div className="container">
            <Button
              variant="primary"
              className="col-2 btn btn-sm m-2"
              id="showFormButton"
              onClick={handleShowFormButtonClick}
            >
              {showForm ? "Modifier le formulaire" : "Ajouter un Commandes"}
            </Button>
            <div
              id="formContainer"
              className="col"
              style={{ ...formContainerStyle }}
            >
              <Form className="row" onSubmit={handleSubmit}>
                <div className="col-md-4">
                  <Form.Group controlId="client_id">
                    <Form.Label>Client:</Form.Label>
                    <Select
                      options={clients.map((client) => ({
                        value: client.id,
                        label: client.raison_sociale,
                      }))}
                      onChange={handleClientSelection}
                      value={formData.client_id}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group controlId="mode_payement">
                    <Form.Label>Mode Paiement:</Form.Label>
                    <Form.Select
                      name="mode_payement"
                      value={formData.mode_payement}
                      onChange={handleChange}
                    >
                      <option disabled selected>
                        Mode de Paiement
                      </option>
                      <option value="Espece">Espece</option>
                      <option value="Tpe">Tpe</option>
                      <option value="Cheque">Cheque</option>
                      {/* Add more payment types as needed */}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  {editingCommandes && (
                    <Form.Group controlId="status">
                      <Form.Label>Status:</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option disabled selected>
                          Status
                        </option>
                        <option value="En cours">En cours</option>
                        <option value="Valide">Valide</option>
                        <option value="Non Valide">Non Valide</option>
                        {/* Add more payment types as needed */}
                      </Form.Select>
                    </Form.Group>
                  )}
                </div>

                <div className="col-md-4">
                  <Form.Group controlId="dateCommande">
                    <Form.Label>Date Commande:</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateCommande"
                      value={formData.dateCommande}
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
                          <th>Prix vente</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProductsData.map((productData, index) => (
                          <tr key={index}>
                            <td>
                              {getProduitValue(
                                productData.produit_id,
                                "Code_produit"
                              )}
                            </td>
                            <td>
                              {getProduitValue(
                                productData.produit_id,
                                "designation"
                              )}
                            </td>
                            <td>
                              {getProduitValue(
                                productData.produit_id,
                                "calibre_id"
                              )}
                            </td>
                            <td>
                              <input
                                type="text"
                                id={`quantite_${productData.produit_id}`}
                                className="quantiteInput"
                                placeholder="Quantite"
                                value={
                                  modifiedQuantiteValues[
                                    productData.produit_id
                                  ] ||
                                  populateProductInputs(
                                    productData.produit_id,
                                    "quantite"
                                  )
                                }
                                onChange={(event) =>
                                  handleInputChange(
                                    productData.produit_id,
                                    "quantite",
                                    event
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                id={`prix_unitaire_${productData.produit_id}`}
                                className="prixInput"
                                placeholder="Prix"
                                value={
                                  modifiedPrixValues[productData.produit_id] ||
                                  populateProductInputs(
                                    productData.produit_id,
                                    "prix_unitaire"
                                  )
                                }
                                onChange={(event) =>
                                  handleInputChange(
                                    productData.produit_id,
                                    "prix_unitaire",
                                    event
                                  )
                                }
                              />
                            </td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteProduct(index)}
                              >
                                Delete
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
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                      />
                    </th>
                    <th colSpan="2">reference</th>
                    <th>dateCommande</th>
                    <th>Client</th>
                    <th>Mode de Paiement</th>

                    <th colSpan="2">Status</th>
                    <th colSpan="2">Total</th>

                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {commandes &&
                    commandes.map((commande) => (
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
                          <td>
                            <div className="no-print ">
                              <Button
                                className="btn btn-sm btn-light"
                                onClick={() =>
                                  handleShowLigneCommandes(commande.id)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={
                                    expandedRows.includes(commande.id)
                                      ? faMinus
                                      : faPlus
                                  }
                                />
                              </Button>
                            </div>
                          </td>
                          <td>{commande.reference}</td>
                          <td>{commande.dateCommande}</td>
                          <td>{commande.client_id}</td>
                          <td>{commande.mode_payement}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-light"
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
                            </button>
                          </td>
                          <td>{commande.status}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-light"
                              onClick={() =>
                                handleShowTotalDetails(commande.id)
                              }
                            >
                              <FontAwesomeIcon
                                icon={
                                  expand_total.includes(commande.id)
                                    ? faMinus
                                    : faPlus
                                }
                              />
                            </button>
                          </td>
                          <td>
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
                              <Button
                                className=" btn btn-danger btn-sm m-1"
                                onClick={() => handleDelete(commande.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows.includes(commande.id) &&
                          commande.ligne_commandes && (
                            <tr>
                              <td
                                colSpan="11"
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
                                        <th>Produit</th>
                                        <th>Quantite</th>
                                        <th>Prix Vente</th>
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
                              colSpan="11"
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
                                    {produits
                                      .filter((produit) =>
                                        commande.ligne_commandes.some(
                                          (ligne) =>
                                            ligne.produit_id === produit.id
                                        )
                                      )
                                      .map((produit) => (
                                        <th key={produit.designation}>
                                          {produit.designation}
                                        </th>
                                      ))}
                                    <th>Total (Unité) / Calibre</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {uniqueCalibres.map((calibre) => (
                                    <tr key={calibre}>
                                      <td>
                                        <strong>calibre : [{calibre}]</strong>
                                      </td>
                                      {produits
                                        .filter((produit) =>
                                          commande.ligne_commandes.some(
                                            (ligne) =>
                                              ligne.produit_id === produit.id
                                          )
                                        )
                                        .map((produit) => (
                                          <td key={produit.designation}>
                                            {getQuantity(
                                              commande.ligne_commandes,
                                              calibre,
                                              produit.designation
                                            )}
                                          </td>
                                        ))}
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
                                colSpan="11"
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
                                        <th>Status</th>
                                        <th>Date Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {commande.status_commandes.map(
                                        (statusCommande) => (
                                          <tr key={statusCommande.id}>
                                            <td>{statusCommande.status}</td>
                                            <td>
                                              {statusCommande.date_status}
                                            </td>
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
            </div>
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CommandeList;
