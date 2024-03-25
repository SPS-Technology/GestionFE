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
  const populateProductInputs = (ligneCommandId, inputType) => {
    console.log("ligneCommandId", ligneCommandId);
    const existingLigneCommande = existingLigneCommandes.find(
      (ligneCommande) => ligneCommande.id === ligneCommandId
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
        const existingLigneCommandesResponse = await axios.get(
          `http://localhost:8000/api/ligneCommandes/${editingCommandes.id}`
        );

        const existingLigneCommandes =
          existingLigneCommandesResponse.data.ligneCommandes;
        const selectedPrdsData = selectedProductsData.map(
          (selectedProduct, index) => {
            const existingLigneCommande = existingLigneCommandes.find(
              (ligneCommande) =>
                ligneCommande.produit_id === selectedProduct.produit_id
            );

            return {
              id: existingLigneCommande ? existingLigneCommande.id : undefined,
              commande_id: editingCommandes.id,
              produit_id: selectedProduct.produit_id,
              quantite: getElementValueById(
                `quantite_${index}_${selectedProduct.id}`
              ),
              prix_unitaire: getElementValueById(
                `prix_unitaire_${index}_${selectedProduct.id}`
              ),
              // Update other properties as needed
            };
          }
        );
        for (const ligneCommandeData of selectedPrdsData) {
          // Check if ligneCommande already exists for this produit_id and update accordingly

          console.log("existing LigneCommande:", selectedPrdsData);

          if (ligneCommandeData.id) {
            // If exists, update the existing ligneCommande
            await axios.put(
              `http://localhost:8000/api/ligneCommandes/${ligneCommandeData.id}`,
              ligneCommandeData,
              {
                withCredentials: true,
                headers: {
                  "X-CSRF-TOKEN": csrfToken,
                },
              }
            );
          } else {
            // If doesn't exist, create a new ligneCommande
            await axios.post(
              "http://localhost:8000/api/ligneCommandes",
              ligneCommandeData,
              {
                withCredentials: true,
                headers: {
                  "X-CSRF-TOKEN": csrfToken,
                },
              }
            );
          }
        }

        const existingStatusesResponse = await axios.get(
          "http://localhost:8000/api/statusCommande"
        );
        const existingStatuses = existingStatusesResponse.data.StatusCommande;

        const selectedStatus = getElementValueById("status");
        const statusExists = existingStatuses.some(
          (status) => status.status === selectedStatus
        );
        const statusCommandeData = {
          commande_id: editingCommandes.id,
          status: getElementValueById("status"),
          // Update other properties as needed
        };
        // if (!statusExists) {
        await axios.post(
          `http://localhost:8000/api/statusCommande/`,
          statusCommandeData,
          {
            withCredentials: true,
            headers: {
              "X-CSRF-TOKEN": csrfToken,
            },
          }
        );
      } else {
        // Créer un nouveau Commandes
        response = await axios.post(
          "http://localhost:8000/api/commandes",
          CommandesData
        );
        const selectedPrdsData = selectedProductsData.map(
          (selectProduct, index) => {
            return {
              commande_id: response.data.commande.id,
              produit_id: selectProduct.produit_id,
              quantite: getElementValueById(
                `quantite_${index}_${selectProduct.id}`
              ),
              prix_unitaire: getElementValueById(
                `prix_unitaire_${index}_${selectProduct.id}`
              ),
            };
          }
        );
        console.log("selectedPrdsData", selectedPrdsData);
        for (const ligneCommandesData of selectedPrdsData) {
          // Sinon, il s'agit d'une nouvelle ligne de Commandes
          await axios.post(
            "http://localhost:8000/api/ligneCommandes",
            ligneCommandesData
          );
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
      }
      console.log("response of postCommande: ", response.data);

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

      fetchData();

      setShowForm(false);

      setSelectedClientId(null);
      setSelectedProductsData([]);
      fetchExistingLigneCommandes();

      // Delete all selections in the table
      // selectedProductsData.forEach((product, index) => {
      //   handleDeleteProduct(index, product.id);
      // });

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
  const handleEdit = (commande) => {
    setModifiedQuantiteValues({});
    setModifiedPrixValues({});
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

    const selectedProducts = commande.ligne_commandes.map((ligneCommande) => {
      const product = produits.find(
        (produit) => produit.id === ligneCommande.produit_id
      );
      return {
        id: ligneCommande.id,
        Code_produit: product.Code_produit,
        calibre_id: product.calibre_id,
        designation: product.designation,
        produit_id: ligneCommande.produit_id,
        quantite: ligneCommande.quantite,
        prix_unitaire: ligneCommande.prix_unitaire,
      };
    });
    setSelectedProductsData(selectedProducts);

    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
  };
  const handleInputChange = (index, inputType, event) => {
    const newValue = event.target.value;
    console.log("selectedProductsData", selectedProductsData);
    console.log("index", index);
    if (selectedProductsData[index]) {
      const productId = selectedProductsData[index].id;

      if (inputType === "prix_unitaire") {
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

  // const handleInputChange = (index, inputType, event) => {
  //   const newValue = event.target.value;
  //   const productId = selectedProductsData[index].id;

  //   if (inputType === "prix_unitaire") {
  //     setModifiedPrixValues((prev) => ({
  //       ...prev,
  //       [`${productId}_${index}`]: newValue,
  //     }));
  //   } else if (inputType === "quantite") {
  //     setModifiedQuantiteValues((prev) => ({
  //       ...prev,
  //       [`${productId}_${index}`]: newValue,
  //     }));
  //   }
  // };
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
    handleDeleteAllSelection();

    setFormContainerStyle({ right: "-100%" });
    setTableContainerStyle({ marginRight: "0" });
    setShowForm(false); // Hide the form
    setSelectedClientId(null);
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
    if (selected && selected.length > 0) {
      console.log("selectedClient", selected);
      setSelectedClientId(selected[0].value);
    }
  };
  // const handleClientSelection = (selectedOption) => {
  //   console.log("Selected option:", selectedOption);
  //   if (selectedOption && selectedOption.length > 0) {
  //     // Handle the selected client
  //     console.log("Selected client:", selectedOption[0].value);
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       client_id: selectedOption.value,
  //     }));
  //   } else {
  //     console.log("No client selected");
  //   }
  // };

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
  const handleDeleteProduct = (index, id) => {
    const updatedSelectedProductsData = [...selectedProductsData];
    updatedSelectedProductsData.splice(index, 1);
    setSelectedProductsData(updatedSelectedProductsData);
    if (id) {
      axios
        .delete(`http://localhost:8000/api/ligneCommandes/${id}`)
        .then(() => {
          fetchData();
        });
    }
  };
  const handleDeleteAllSelection = () => {
    // Clear the selected products data
    setSelectedProductsData([]);
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
  const handleAddEmptyRow = () => {
    setSelectedProductsData([...selectedProductsData, {}]);
    console.log("selectedProductData", selectedProductsData);
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <h2 className="mt-4">Liste des Commandes</h2>

          <Button
            variant="primary"
            className="btn btn-sm m-2"
            id="showFormButton"
            onClick={handleShowFormButtonClick}
          >
            {showForm ? "Modifier le formulaire" : "Passer une Commande"}
          </Button>
          <div
            id="formContainerCommande"
            style={{ ...formContainerStyle, padding: "50px" }}
          >
            <Form className="row" onSubmit={handleSubmit}>
              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="client_id" className="col-form-label">
                      Client:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <Select
                      options={clients.map((client) => ({
                        value: client.id,
                        label: client.raison_sociale,
                      }))}
                      onChange={handleClientSelection}
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
                      placeholder="Select client ..."
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="mode_payement" className="col-form-label">
                      Mode Paiement:
                    </label>
                  </div>
                  <div className="col-sm-6">
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
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                {editingCommandes && (
                  <div className="row mb-3">
                    <div className="col-sm-6">
                      <label htmlFor="status" className="col-form-label">
                        Status:
                      </label>
                    </div>
                    <div className="col-sm-6">
                      <Form.Select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="En cours">En cours</option>
                        <option value="Valide">Valide</option>
                        <option value="Non Valide">Non Valide</option>
                        {/* Add more statuses as needed */}
                      </Form.Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="dateCommande" className="col-form-label">
                      Date Commande:
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <Form.Group controlId="dateCommande">
                      <Form.Control
                        controlId="dateCommande"
                        type="date"
                        name="dateCommande"
                        value={formData.dateCommande}
                        onChange={handleChange}
                        className="form-control-sm"
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              {console.log("selectedProductsData:", selectedProductsData)}
              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-sm-12">
                    <Form.Group controlId="selectedProduitTable">
                      <div className="table-responsive">
                        <table className="table-bordered ">
                          <thead>
                            <tr>
                              <th>
                                {" "}
                                <Button
                                  className="btn btn-sm "
                                  variant="primary"
                                  onClick={handleAddEmptyRow}
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </Button>
                              </th>
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
                                <td colSpan="2">
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
                                    id={`quantite_${index}_${productData.id}`}
                                    className="quantiteInput"
                                    placeholder="Quantite"
                                    value={
                                      modifiedQuantiteValues[
                                        `${index}_${productData.id}`
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
                                    id={`prix_unitaire_${index}_${productData.id}`}
                                    className="prixInput"
                                    placeholder="Prix"
                                    value={
                                      modifiedPrixValues[
                                        `${index}_${productData.id}`
                                      ] ||
                                      populateProductInputs(
                                        productData.id,
                                        "prix_unitaire"
                                      )
                                    }
                                    onChange={(event) =>
                                      handleInputChange(
                                        index,
                                        "prix_unitaire",
                                        event
                                      )
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
                </div>
              </div>

              <div className="col-md-12">
                <div className="text-center">
                  <Button type="submit" className=" btn-sm col-4">
                    {editingCommandes ? "Modifier" : "Valider"}
                  </Button>
                  <Button
                    className=" btn-sm btn-secondary col-4 offset-1 "
                    onClick={closeForm}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </Form>
          </div>
          <div
            id="tableContainer"
            className="table-responsive-sm"
            style={tableContainerStyle}
          >
            <table className="table table-responsive table-bordered">
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
                  <th colSpan="2">reference</th>
                  <th>Client</th>
                  <th>Date Commande</th>

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
                        <td>{commande.client_id}</td>
                        <td>{commande.dateCommande}</td>

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
                            onClick={() => handleShowTotalDetails(commande.id)}
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
                                  className=" table-bordered"
                                  style={{
                                    borderCollapse: "collapse",
                                    // backgroundColor: "#f2f2f2",
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
                            colSpan="11"
                          >
                            {/* Increased colspan to accommodate the new Total column */}
                            <table
                              className="table-bordered"
                              style={{
                                borderCollapse: "collapse",
                                // backgroundColor: "#f2f2f2",
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
                                    // backgroundColor: "#f2f2f2",
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
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CommandeList;
