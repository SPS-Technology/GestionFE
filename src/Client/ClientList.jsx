import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import Navigation from "../Acceuil/Navigation";
import TablePagination from "@mui/material/TablePagination";
import PrintList from "./PrintList";
import ExportPdfButton from "./exportToPdf";
import "jspdf-autotable";
import Search from "../Acceuil/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PeopleIcon from "@mui/icons-material/People";
import {
  faTrash,
  faFileExcel,
  faPlus,
  faMinus,
  faCircleInfo,
  faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import "../style.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";

//------------------------- CLIENT LIST---------------------//
const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [zones, setZones] = useState([]);
  const [siteClients, setSiteClients] = useState([]);
  //---------------form-------------------//
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    logoC: "",
    CodeClient: "",
    raison_sociale: "",
    abreviation: "",
    type_client: "",
    categorie: "",
    adresse: "",
    tele: "",
    ville: "",
    zone_id: "",
    ice: "",
    code_postal: "",
  });
  const [errors, setErrors] = useState({
    logoC: "",
    CodeClient: "",
    raison_sociale: "",
    abreviation: "",
    type_client: "",
    categorie: "",
    adresse: "",
    tele: "",
    ville: "",
    zone_id: "",
    ice: "",
    code_postal: "",
  });
  const [formContainerStyle, setFormContainerStyle] = useState({
    right: "-100%",
  });
  const [tableContainerStyle, setTableContainerStyle] = useState({
    marginRight: "0px",
  });
  //-------------------edit-----------------------//
  const [editingClient, setEditingClient] = useState(null); // State to hold the client being edited
  const [editingClientId, setEditingClientId] = useState(null);
  //-------------------Pagination-----------------------/
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [filteredclients, setFilteredclients] = useState([]);
  // Pagination calculations
  const indexOfLastClient = (page + 1) * rowsPerPage;
  const indexOfFirstClient = indexOfLastClient - rowsPerPage;
  const currentClients = clients.slice(indexOfFirstClient, indexOfLastClient);
  //-------------------Selected-----------------------/
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  //-------------------Search-----------------------/
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  //------------------------Site-Client---------------------
  const [showFormSC, setShowFormSC] = useState(false);
  const [editingSiteClient, setEditingSiteClient] = useState(null);
  const [editingSiteClientId, setEditingSiteClientId] = useState(null);
  const [formDataSC, setFormDataSC] = useState({
    CodeSiteclient: "",
    raison_sociale: "",
    abreviation: "",
    adresse: "",
    tele: "",
    ville: "",
    zone_id: "",
    ice: "",
    logoSC: "",
    code_postal: "",
    client_id: "",
  });
  const [formContainerStyleSC, setFormContainerStyleSC] = useState({
    right: "-100%",
  });
  const [expandedRows, setExpandedRows] = useState([]);
  const [filteredsiteclients, setFilteredsiteclients] = useState([]);

  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/clients");
      // console.log("API Response:", response.data);
      setClients(response.data.client);

      const userResponse = await axios.get("http://localhost:8000/api/user");
      setUsers(userResponse.data.users);

      const zoneResponse = await axios.get("http://localhost:8000/api/zones");
      setZones(zoneResponse.data.zone);

      const SiteClientResponse = await axios.get(
        "http://localhost:8000/api/siteclients"
      );

      setSiteClients(SiteClientResponse.data.siteclient);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response && error.response.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Accès refusé",
          text: "Vous n'avez pas l'autorisation de voir la liste des Clients.",
        });
      }
    }
  };

  const toggleRow = async (clientId) => {
    if (expandedRows.includes(clientId)) {
      setExpandedRows(expandedRows.filter((id) => id !== clientId));
    } else {
      try {
        // Fetch site clients associés au client
        const siteClients = await fetchSiteClients(clientId);
        // console.log('Site clients:', siteClients);

        // Mettre à jour l'état des clients avec les site clients associés au client
        setClients((prevClients) => {
          return prevClients.map((client) => {
            if (client.id === clientId) {
              return { ...client, siteClients };
            }
            return client;
          });
        });

        // Ajouter le client ID aux lignes étendues
        setExpandedRows([...expandedRows, clientId]);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des site clients:",
          error
        );
      }
    }
  };

  const fetchSiteClients = async (clientId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/clients/${clientId}/siteclients`
      );
      return response.data.siteClients;
    } catch (error) {
      console.error("Erreur lors de la récupération des site clients:", error);
      return [];
    }
  };

  useEffect(() => {
    // Préchargement des site clients pour chaque client
    clients.forEach(async (client) => {
      if (!client.siteClients) {
        const siteClients = await fetchSiteClients(client.id);
        setClients((prevClients) => {
          return prevClients.map((prevClient) => {
            if (prevClient.id === client.id) {
              return { ...prevClient, siteClients };
            }
            return prevClient;
          });
        });
      }
    });
  }, [clients]); // Exécuter lorsqu'il y a un changement dans la liste des clients

  //---------------------------------------------
  useEffect(() => {
    const filtered = clients.filter((client) =>
      Object.values(client).some((value) => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (typeof value === "number") {
          return value.toString().includes(searchTerm.toLowerCase());
        }
        return false;
      })
    );

    setFilteredclients(filtered);
  }, [clients, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChangeSC = (e) => {
    setFormDataSC({
      ...formDataSC,
      [e.target.name]:
        e.target.type === "file" ? e.target.files[0] : e.target.value,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "file" ? e.target.files[0] : e.target.value,
    });
  };

  // const handleChange = (e) => {
  //   setUser({
  //     ...user,
  //     [e.target.name]:
  //       e.target.type === "file" ? e.target.files[0] : e.target.value,
  //   });
  // };
  //------------------------- CLIENT EDIT---------------------//

  const handleEdit = (client) => {
    setEditingClient(client); // Set the client to be edited
    // Populate form data with client details
    setFormData({
      CodeClient: client.CodeClient,
      raison_sociale: client.raison_sociale,
      abreviation: client.abreviation,
      adresse: client.adresse,
      type_client: client.type_client,
      categorie: client.categorie,
      tele: client.tele,
      ville: client.ville,
      zone_id: client.zone_id,
      logoC: client.logoC,
      ice: client.ice,
      code_postal: client.code_postal,
    });
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
  };
  useEffect(() => {
    if (editingClientId !== null) {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    }
  }, [editingClientId]);

  //------------------------- CLIENT SUBMIT---------------------//

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const url = editingClient
  //     ? `http://localhost:8000/api/clients/${editingClient.id}`
  //     : "http://localhost:8000/api/clients";
  //   const method = editingClient ? "put" : "post";

  //   const formDatad = new FormData(); // Créer un objet FormData pour envoyer les données du formulaire

  //   // Ajouter les champs du formulaire à l'objet FormData
  //   formDatad.append("CodeClient", formData.CodeClient);
  //   formDatad.append("raison_sociale", formData.raison_sociale);
  //   formDatad.append("abreviation", formData.abreviation);
  //   formDatad.append("adresse", formData.adresse);
  //   formDatad.append("tele", formData.tele);
  //   formDatad.append("ville", formData.ville);
  //   formDatad.append("zone_id", formData.zone_id);
  //   formDatad.append("ice", formData.ice);
  //   formDatad.append("code_postal", formData.code_postal);

  //   // Ajouter le fichier du logo à l'objet FormData s'il existe
  //   if (formData.logoC) {
  //     formDatad.append("logoC", formData.logoC);
  //   }

  //   axios({
  //     method: method,
  //     url: url,
  //     data: formDatad,
  //   })
  //     .then(() => {
  //       fetchClients();
  //       Swal.fire({
  //         icon: "success",
  //         title: "Succès!",
  //         text: `Client ${editingClient ? "modifié" : "ajouté"} avec succès.`,
  //       });

  //       setFormData({
  //         CodeClient: "",
  //         raison_sociale: "",
  //         abreviation: "",
  //         adresse: "",
  //         tele: "",
  //         ville: "",
  //         zone_id: "",
  //         ice: "",
  //         code_postal: "",
  //         logoC: null, // Réinitialiser le fichier du logo après l'envoi
  //       });
  //       setErrors({
  //         CodeClient: "",
  //         raison_sociale: "",
  //         abreviation: "",
  //         adresse: "",
  //         tele: "",
  //         ville: "",
  //         zone_id: "",
  //         ice: "",
  //         code_postal: "",
  //       });
  //       setEditingClient(null);
  //       closeForm();
  //     })
  //     .catch((error) => {
  //       if (error.response) {
  //         const serverErrors = error.response.data.error;
  //         console.log(serverErrors);
  //         setErrors({
  //           CodeClient: serverErrors.CodeClient
  //             ? serverErrors.CodeClient[0]
  //             : "",
  //           raison_sociale: serverErrors.raison_sociale
  //             ? serverErrors.raison_sociale[0]
  //             : "",
  //           abreviation: serverErrors.abreviation
  //             ? serverErrors.abreviation[0]
  //             : "",
  //           adresse: serverErrors.adresse ? serverErrors.adresse[0] : "",
  //           tele: serverErrors.tele ? serverErrors.tele[0] : "",
  //           ville: serverErrors.ville ? serverErrors.ville[0] : "",
  //           zone_id: serverErrors.zone_id ? serverErrors.zone_id[0] : "",
  //           ice: serverErrors.ice ? serverErrors.ice[0] : "",
  //           code_postal: serverErrors.code_postal
  //             ? serverErrors.code_postal[0]
  //             : "",
  //         });
  //       }
  //     });
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingClient
      ? `http://localhost:8000/api/clients/${editingClient.id}`
      : "http://localhost:8000/api/clients";
    const method = editingClient ? "put" : "post";

    let requestData;

    if (editingClient) {
      requestData = {
        CodeClient: formData.CodeClient,
        raison_sociale: formData.raison_sociale,
        abreviation: formData.abreviation,
        type_client: formData.type_client,
        categorie: formData.categorie,
        adresse: formData.adresse,
        tele: formData.tele,
        ville: formData.ville,
        zone_id: formData.zone_id,
        ice: formData.ice,
        code_postal: formData.code_postal,
      };
    } else {
      const formDatad = new FormData();
      formDatad.append("CodeClient", formData.CodeClient);
      formDatad.append("raison_sociale", formData.raison_sociale);
      formDatad.append("abreviation", formData.abreviation);
      formDatad.append("categorie", formData.categorie);
      formDatad.append("type_client", formData.type_client);
      formDatad.append("adresse", formData.adresse);
      formDatad.append("tele", formData.tele);
      formDatad.append("ville", formData.ville);
      formDatad.append("zone_id", formData.zone_id);
      formDatad.append("ice", formData.ice);
      formDatad.append("code_postal", formData.code_postal);
      if (formData.logoC) {
        formDatad.append("logoC", formData.logoC);
      }
      requestData = formDatad;
    }

    try {
      const response = await axios({
        method: method,
        url: url,
        data: requestData,
      });

      if (response.status === 200) {
        fetchClients();
        const successMessage = `Client ${
          editingClient ? "modifié" : "ajouté"
        } avec succès.`;
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: successMessage,
        });

        setFormData({
          CodeClient: "",
          raison_sociale: "",
          abreviation: "",
          adresse: "",
          tele: "",
          type_client: "",
          categorie: "",
          ville: "",
          zone_id: "",
          ice: "",
          code_postal: "",
          logoC: null,
        });
        setErrors({
          CodeClient: "",
          raison_sociale: "",
          abreviation: "",
          adresse: "",
          type_client: "",
          categorie: "",
          tele: "",
          ville: "",
          zone_id: "",
          ice: "",
          code_postal: "",
        });
        setEditingClient(null);
        closeForm();
      }
    } catch (error) {
      if (error.response) {
        const serverErrors = error.response.data.error;
        console.log(serverErrors);
        setErrors({
          CodeClient: serverErrors.CodeClient ? serverErrors.CodeClient[0] : "",
          raison_sociale: serverErrors.raison_sociale
            ? serverErrors.raison_sociale[0]
            : "",
          abreviation: serverErrors.abreviation
            ? serverErrors.abreviation[0]
            : "",
          type_client: serverErrors.type_client
            ? serverErrors.type_client[0]
            : "",
          categorie: serverErrors.categorie ? serverErrors.categorie[0] : "",
          adresse: serverErrors.adresse ? serverErrors.adresse[0] : "",
          tele: serverErrors.tele ? serverErrors.tele[0] : "",
          ville: serverErrors.ville ? serverErrors.ville[0] : "",
          zone_id: serverErrors.zone_id ? serverErrors.zone_id[0] : "",
          ice: serverErrors.ice ? serverErrors.ice[0] : "",
          code_postal: serverErrors.code_postal
            ? serverErrors.code_postal[0]
            : "",
        });
      }
    }
  };

  //------------------------- CLIENT FORM---------------------//

  const handleShowFormButtonClick = () => {
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
  };

  const closeForm = () => {
    setFormContainerStyle({ right: "-100%" });
    setTableContainerStyle({ marginRight: "0" });
    setShowForm(false); // Hide the form
    setFormData({
      CodeClient: "",
      raison_sociale: "",
      abreviation: "",
      adresse: "",
      tele: "",
      ville: "",
      zone_id: "",
      type_client: "",
      categorie: "",
      user_id: "",
      ice: "",
      code_postal: "",
    });
    setErrors({
      CodeClient: "",
      raison_sociale: "",
      abreviation: "",
      type_client: "",
      categorie: "",
      adresse: "",
      tele: "",
      ville: "",
      zone_id: "",
      ice: "",
      code_postal: "",
    });
    setEditingClient(null); // Clear editing client
  };
  //-------------------------SITE CLIENT----------------------------//
  //-------------------------  SUBMIT---------------------//
  const handleSelectItem = (item) => {
    const selectedIndex = selectedItems.findIndex(
      (selectedItem) => selectedItem.id === item.id
    );

    if (selectedIndex === -1) {
      setSelectedItems([...selectedItems, item]);
    } else {
      const updatedItems = [...selectedItems];
      updatedItems.splice(selectedIndex, 1);
      setSelectedItems(updatedItems);
    }

    console.log("Selected items:", selectedItems);
  };

  const getSelectedClientIds = () => {
    return selectedItems.map((item) => item.id);
  };
  const handleSubmitSC = async (e) => {
    e.preventDefault();
    const selectedClientIds = getSelectedClientIds();
    const url = editingSiteClient
      ? `http://localhost:8000/api/siteclients/${editingSiteClient.id}`
      : "http://localhost:8000/api/siteclients";
    const method = editingSiteClient ? "put" : "post";

    let requestData;

    if (editingClient) {
      requestData = {
        CodeSiteclient: formDataSC.CodeSiteclient,
        raison_sociale: formDataSC.raison_sociale,
        abreviation: formDataSC.abreviation,
        adresse: formDataSC.adresse,
        tele: formDataSC.tele,
        ville: formDataSC.ville,
        zone_id: formDataSC.zone_id,
        ice: formDataSC.ice,
        code_postal: formDataSC.code_postal,
        client_id: selectedClientIds.join(", "),
      };
    } else {
      const formDataScd = new FormData();
      formDataScd.append("CodeSiteclient", formDataSC.CodeSiteclient);
      formDataScd.append("raison_sociale", formDataSC.raison_sociale);
      formDataScd.append("abreviation", formDataSC.abreviation);
      formDataScd.append("adresse", formDataSC.adresse);
      formDataScd.append("tele", formDataSC.tele);
      formDataScd.append("ville", formDataSC.ville);
      formDataScd.append("zone_id", formDataSC.zone_id);
      formDataScd.append("ice", formDataSC.ice);
      formDataScd.append("code_postal", formDataSC.code_postal);
      formDataScd.append("client_id", selectedClientIds.join(", "));
      if (formDataSC.logoSC) {
        formDataScd.append("logoSC", formDataSC.logoSC);
      }
      requestData = formDataScd;
    }

    try {
      const response = await axios({
        method: method,
        url: url,
        data: requestData,
      });

      if (response.status === 200) {
        fetchClients();
        const successMessage = `SiteClient ${
          editingClient ? "modifié" : "ajouté"
        } avec succès.`;
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: successMessage,
        });

        setFormData({
          CodeSiteclient: "",
          raison_sociale: "",
          abreviation: "",
          adresse: "",
          tele: "",
          ville: "",
          zone_id: "",
          ice: "",
          logoSC: null,
          code_postal: "",
          client_id: "",
        });
        setErrors({
          CodeClient: "",
          raison_sociale: "",
          abreviation: "",
          adresse: "",
          tele: "",
          ville: "",
          zone_id: "",
          ice: "",
          code_postal: "",
        });
        setEditingClient(null);
        closeForm();
      }
    } catch (error) {
      if (error.response) {
        const serverErrors = error.response.data.error;
        console.log(serverErrors);
        setErrors({
          CodeSiteclient: serverErrors.CodeSiteclient
            ? serverErrors.CodeSiteclient[0]
            : "",
          raison_sociale: serverErrors.raison_sociale
            ? serverErrors.raison_sociale[0]
            : "",
          abreviation: serverErrors.abreviation
            ? serverErrors.abreviation[0]
            : "",
          adresse: serverErrors.adresse ? serverErrors.adresse[0] : "",
          tele: serverErrors.tele ? serverErrors.tele[0] : "",
          ville: serverErrors.ville ? serverErrors.ville[0] : "",
          zone_id: serverErrors.zone_id ? serverErrors.zone_id[0] : "",
          ice: serverErrors.ice ? serverErrors.ice[0] : "",
          code_postal: serverErrors.code_postal
            ? serverErrors.code_postal[0]
            : "",
        });
      }
    }
  };

  const handleEditSC = (siteClient) => {
    setEditingSiteClient(siteClient); // Set the client to be edited
    // Populate form data with client details
    setFormDataSC({
      CodeSiteclient: siteClient.CodeSiteclient,
      raison_sociale: siteClient.raison_sociale,
      abreviation: siteClient.abreviation,
      adresse: siteClient.adresse,
      tele: siteClient.tele,
      ville: siteClient.ville,
      zone_id: siteClient.zone_id,
      user_id: siteClient.user_id,
      ice: siteClient.ice,
      code_postal: siteClient.code_postal,
      logoSC: siteClient.logoSC,
      client_id: siteClient.client_id,
    });
    if (formContainerStyleSC.right === "-100%") {
      setFormContainerStyleSC({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeFormSC();
    }
  };

  const handleDeleteSiteClient = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer ce site client ?",
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
          .delete(`http://localhost:8000/api/siteclients/${id}`)
          .then(() => {
            fetchClients();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Site Client supprimé avec succès.",
            });
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la suppression du site client:",
              error
            );
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la suppression du site client.",
            });
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  };
  //------------------------- CLIENT FORM---------------------//

  const handleShowFormButtonClickSC = () => {
    if (!selectedItems) {
      console.error("Aucun client sélectionné pour ajouter un site client.");
      return;
    }
    if (formContainerStyleSC.right === "-100%") {
      setFormContainerStyleSC({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeFormSC();
    }
  };

  const closeFormSC = () => {
    setFormContainerStyleSC({ right: "-100%" });
    setTableContainerStyle({ marginRight: "0" });
    setShowFormSC(false); // Hide the form
    setFormDataSC({
      CodeSiteclient: "",
      raison_sociale: "",
      abreviation: "",
      adresse: "",
      tele: "",
      ville: "",
      zone_id: "",
      user_id: "",
      ice: "",
      code_postal: "",
    });
    setEditingSiteClient(null); // Clear editing client
  };

  //------------------------- CLIENT PAGINATION---------------------//

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  //------------------------- CLIENT DELETE---------------------//

  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer ce client ?",
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
          .delete(`http://localhost:8000/api/clients/${id}`)
          .then(() => {
            fetchClients();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Client supprimé avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de la suppression du client:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la suppression du client.",
            });
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  };
  //-------------------------Select Delete --------------------//
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
            .delete(`http://localhost:8000/api/clients/${id}`)
            .then(() => {
              fetchClients();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "Client supprimé avec succès.",
              });
            })
            .catch((error) => {
              console.error("Erreur lors de la suppression du client:", error);
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression du client.",
              });
            });
        });
      }
    });

    setSelectedItems([]);
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(clients.map((client) => client.id));
    }
  };
  const handleCheckboxChange = (itemId) => {
    if (selectedItems.includes(itemId)) {
      console.log("id", selectedItems);
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
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

  //------------------ Zone --------------------//
  const handleDeleteZone = async (zoneId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/zones/${zoneId}`
      );
      console.log(response.data);
      Swal.fire({
        icon: "success",
        title: "Succès!",
        text: "Zone supprimée avec succès.",
      });
    } catch (error) {
      console.error("Error deleting zone:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: "Échec de la suppression de la zone.",
      });
    }
  };

  const handleEditZone = async (zoneId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/zones/${zoneId}`
      );
      const zoneToEdit = response.data;

      if (!zoneToEdit) {
        console.error("Zone not found or data is missing");
        return;
      }

      const { value: editedZone } = await Swal.fire({
        title: "Modifier une zone",
        html: `
          <form id="editZoneForm">
              <input id="swal-edit-input1" class="swal2-input" placeholder="Zone" name="zone" value="${zoneToEdit.zone}">
          </form>
      `,
        showCancelButton: true,
        confirmButtonText: "Modifier",
        cancelButtonText: "Annuler",
        preConfirm: () => {
          const editedZoneValue =
            document.getElementById("swal-edit-input1").value;
          return { zone: editedZoneValue };
        },
      });

      if (editedZone && editedZone.zone !== zoneToEdit.zone) {
        const putResponse = await axios.put(
          `http://localhost:8000/api/zones/${zoneId}`,
          editedZone
        );
        console.log(putResponse.data);
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: "Zone modifiée avec succès.",
        });
      } else {
        console.log("Zone not edited or unchanged");
      }
    } catch (error) {
      console.error("Error editing zone:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: "Échec de la modification de la zone.",
      });
    }
    fetchClients();
  };

  const handleAddZone = async () => {
    const { value: zoneData } = await Swal.fire({
      title: "Ajouter une zone",
      html: `
          <form id="addZoneForm">
              <input id="swal-input1" class="swal2-input" placeholder="Zone" name="zone">
          </form>
          <div class="form-group mt-3">
              <table class="table table-hover">
                  <thead>
                      <tr>
                          <th>Zone</th>
                          <th>Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${zones
                        .map(
                          (zone) => `
                          <tr key=${zone.id}>
                              <td>${zone.zone}</td>
                              <td>
                                  <select class="custom-select" id="actionDropdown_${zone.id}" class="form-control">
                                      <option class="btn btn-light" disabled selected value="">Select Action</option>
                                      <option class="btn btn-danger text-center" value="delete_${zone.id}">Delete</option>
                                      <option class="btn btn-info text-center" value="edit_${zone.id}">Edit</option>
                                  </select>
                              </td>
                          </tr>
                      `
                        )
                        .join("")}
                  </tbody>
              </table>
          </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Ajouter",
      cancelButtonText: "Annuler",
      preConfirm: () => {
        const zone = Swal.getPopup().querySelector("#swal-input1").value;
        return { zone };
      },
    });

    if (zoneData) {
      try {
        const response = await axios.post(
          "http://localhost:8000/api/zones",
          zoneData
        );
        console.log(response.data);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Zone ajoutée avec succès.",
        });
      } catch (error) {
        console.error("Error adding zone:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: "Échec de l'ajout de la zone.",
        });
      }
    }
    fetchClients();
  };

  document.addEventListener("change", async function (event) {
    if (event.target && event.target.id.startsWith("actionDropdown_")) {
      const [action, zoneId] = event.target.value.split("_");
      console.log("Action:", action); // Add this line for debugging
      if (action === "delete") {
        // Delete action
        handleDeleteZone(zoneId);
      } else if (action === "edit") {
        // Edit action
        handleEditZone(zoneId);
      }

      // Clear selection after action
      event.target.value = "";
    }
  });
  //-----------------------------------------//

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <h3 className="text-left" style={{ color: "#A31818" }}>
            <PeopleIcon style={{ fontSize: "24px", marginRight: "8px" }} />
            Liste des Clients
          </h3>
          <div className="d-flex flex-row justify-content-end">
            <div className="btn-group col-2">
              <PrintList
                tableId="clientsTable"
                title="Liste des clients"
                clientList={clients}
                filteredclients={filteredclients}
              />
              <ExportPdfButton
                clients={clients}
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
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                style={{
                  backgroundColor: "white",
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                }}
                variant="primary"
                className="col-3 btn btn-sm"
                id="showFormButton"
                onClick={handleShowFormButtonClick}
              >
                <PeopleIcon style={{ fontSize: "24px", marginRight: "8px" }} />
                Mise à jour Client
              </Button>
              <Button
                variant="primary"
                className="col-3 btn btn-sm m-2"
                style={{
                  backgroundColor: "white",
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                }}
                id="showFormButton"
                onClick={() => {
                  if (selectedItems.length === 1) {
                    handleShowFormButtonClickSC();
                  } else if (selectedItems.length > 1) {
                    console.error(
                      "Vous ne pouvez ajouter qu'un seul site client à la fois."
                    );
                  } else {
                    console.error(
                      "Aucun client sélectionné pour ajouter un site client."
                    );
                  }
                }}
                disabled={
                  selectedItems.length === 0 || selectedItems.length > 1
                }
              >
                <PeopleIcon style={{ fontSize: "24px", marginRight: "8px" }} />
                {showForm ? "Modifier Site Client" : "Ajouter Site Client"}
              </Button>
            </div>

            <div id="formContainer" className="" style={formContainerStyle}>
              <Form className="col row" onSubmit={handleSubmit}>
                <Form.Label className="text-center m-2">
                  <h4>{editingClient ? "Modifier" : "Ajouter"} un Client</h4>
                </Form.Label>
                <Form.Group className="col-sm-5 m-2" controlId="logoC">
                  <Form.Label>Logo du Client</Form.Label>
                  <Form.Control
                    type="file"
                    name="logoC"
                    onChange={handleChange}
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">{errors.logoC}</Form.Text>
                </Form.Group>
                <Form.Group className="col-sm-5 m-2 " controlId="CodeClient">
                  <Form.Label>CodeClient</Form.Label>
                  <Form.Control
                    type="text"
                    name="CodeClient"
                    value={formData.CodeClient}
                    onChange={handleChange}
                    placeholder="CodeClient"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">
                    {errors.CodeClient}
                  </Form.Text>
                </Form.Group>
                <Form.Group
                  className="col-sm-5 m-2 "
                  controlId="raison_sociale"
                >
                  <Form.Label>Raison Sociale</Form.Label>
                  <Form.Control
                    type="text"
                    name="raison_sociale"
                    value={formData.raison_sociale}
                    onChange={handleChange}
                    placeholder="Raison Sociale"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">
                    {errors.raison_sociale}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="col-sm-5 m-2 " controlId="abreviation">
                  <Form.Label>abreviation</Form.Label>
                  <Form.Control
                    type="text"
                    name="abreviation"
                    value={formData.abreviation}
                    onChange={handleChange}
                    placeholder="abreviation"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">
                    {errors.abreviation}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="col-sm-5 m-2" controlId="type_client">
                  <Form.Label>Type de client</Form.Label>
                  <Form.Select
                    name="type_client"
                    value={formData.type_client}
                    onChange={handleChange}
                    className="form-select form-select-sm"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="prospect">Prospect</option>
                    <option value="client">Client</option>
                  </Form.Select>
                  <Form.Text className="text-danger">
                    {errors.type_client}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="col-sm-5 m-2" controlId="categorie">
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleChange}
                    className="form-select form-select-sm"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="premium">Premium</option>
                    <option value="direct">Direct</option>
                    <option value="revendeur">Revendeur</option>
                  </Form.Select>
                  <Form.Text className="text-danger">
                    {errors.categorie}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="col-sm-10 m-2" controlId="adresse">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Adresse"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">
                    {errors.adresse}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="col-sm-5 m-2" controlId="tele">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="tele"
                    value={formData.tele}
                    onChange={handleChange}
                    placeholder="06XXXXXXXX"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">{errors.tele}</Form.Text>
                </Form.Group>
                <Form.Group className="col-sm-5 m-2" controlId="ville">
                  <Form.Label>Ville</Form.Label>
                  <Form.Control
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    placeholder="Ville"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">{errors.ville}</Form.Text>
                </Form.Group>
                <Form.Group className="col-sm-4 m-2" id="zone_id">
                  <FontAwesomeIcon
                    icon={faPlus}
                    className="ml-2 text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={handleAddZone}
                    onChange={handleChange}
                  />
                  <Form.Label>Zone</Form.Label>
                  <Form.Control
                    as="select"
                    name="zone_id"
                    value={formData.zone_id}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner Zone</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.zone}
                      </option>
                    ))}
                    <Form.Text className="text-danger">
                      {errors.zone_id}
                    </Form.Text>
                  </Form.Control>
                </Form.Group>
                <Form.Group className="col-sm-4 m-2" controlId="zone_id">
                  <Form.Label>Code Postal</Form.Label>
                  <Form.Control
                    type="text"
                    name="code_postal"
                    value={formData.code_postal}
                    onChange={handleChange}
                    placeholder="code_postal"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">
                    {errors.code_postal}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="col-sm-4 m-2" controlId="zone_id">
                  <Form.Label>ICE</Form.Label>
                  <Form.Control
                    type="text"
                    name="ice"
                    value={formData.ice}
                    onChange={handleChange}
                    placeholder="ice"
                    className="form-control-sm"
                  />
                  <Form.Text className="text-danger">{errors.ice}</Form.Text>
                </Form.Group>
                {/* <Form.Group className="col-sm-4 m-2" controlId="user_id">
                  <Form.Label>Utilisateur</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    placeholder="user_id"
                    className="form-control-sm"
                  />
                </Form.Group> */}
                <Form.Group className="col m-5 text-center">
                  <Button className="btn btn-danger col-6" type="submit">
                    {editingClient ? "Modifier" : "Ajouter"}
                  </Button>
                  <Button
                    className="btn btn-secondary col-5 offset-1"
                    onClick={closeForm}
                  >
                    Annuler
                  </Button>
                </Form.Group>
              </Form>
            </div>
            <div
              id="formContainer1SC"
              className=""
              style={formContainerStyleSC}
            >
              <Form className="col row" onSubmit={handleSubmitSC}>
                <Form.Label className="text-center m-2">
                  <h4>
                    {editingSiteClient ? "Modifier" : "Ajouter"} Site Client
                  </h4>
                </Form.Label>
                <Form.Group className="col-sm-5 m-2" controlId="logoSC">
                  <Form.Label>Logo du Site Client</Form.Label>
                  <Form.Control
                    type="file"
                    name="logoSC"
                    onChange={handleChangeSC}
                    className="form-control-sm"
                  />{" "}
                </Form.Group>
                <Form.Group
                  className="col-sm-5 m-2 "
                  controlId="CodeSiteclient"
                >
                  <Form.Label>CodeSiteclient</Form.Label>
                  <Form.Control
                    type="text"
                    name="CodeSiteclient"
                    value={formDataSC.CodeSiteclient}
                    onChange={handleChangeSC}
                    placeholder="CodeSiteclient"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group
                  className="col-sm-5 m-2 "
                  controlId="raison_sociale"
                >
                  <Form.Label>Raison Sociale</Form.Label>
                  <Form.Control
                    type="text"
                    name="raison_sociale"
                    value={formDataSC.raison_sociale}
                    onChange={handleChangeSC}
                    placeholder="Raison Sociale"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group className="col-sm-5 m-2 " controlId="abreviation">
                  <Form.Label>abreviation</Form.Label>
                  <Form.Control
                    type="text"
                    name="abreviation"
                    value={formDataSC.abreviation}
                    onChange={handleChangeSC}
                    placeholder="abreviation"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group className="col-sm-10 m-2" controlId="adresse">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control
                    type="text"
                    name="adresse"
                    value={formDataSC.adresse}
                    onChange={handleChangeSC}
                    placeholder="Adresse"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group className="col-sm-5 m-2" controlId="tele">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="tele"
                    value={formDataSC.tele}
                    onChange={handleChangeSC}
                    placeholder="06XXXXXXXX"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group className="col-sm-5 m-2" controlId="ville">
                  <Form.Label>Ville</Form.Label>
                  <Form.Control
                    type="text"
                    name="ville"
                    value={formDataSC.ville}
                    onChange={handleChangeSC}
                    placeholder="Ville"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group className="col-sm-4 m-2" id="zone_id">
                  <FontAwesomeIcon
                    icon={faPlus}
                    className="ml-2 text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={handleAddZone}
                    onChange={handleChangeSC}
                  />
                  <Form.Label>Zone</Form.Label>
                  <Form.Control
                    as="select"
                    name="zone_id"
                    value={formDataSC.zone_id}
                    onChange={handleChangeSC}
                  >
                    <option value="">Sélectionner Zone</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.zone}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="col-sm-4 m-2" controlId="zone_id">
                  <Form.Label>Code Postal</Form.Label>
                  <Form.Control
                    type="text"
                    name="code_postal"
                    value={formDataSC.code_postal}
                    onChange={handleChangeSC}
                    placeholder="code_postal"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group className="col-sm-4 m-2" controlId="zone_id">
                  <Form.Label>ICE</Form.Label>
                  <Form.Control
                    type="text"
                    name="ice"
                    value={formDataSC.ice}
                    onChange={handleChangeSC}
                    placeholder="ice"
                    className="form-control-sm"
                  />
                </Form.Group>
                {/* <Form.Group className="col-sm-4 m-2" controlId="user_id">
                  <Form.Label>Utilisateur</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_id"
                    value={formDataSC.user_id}
                    onChange={handleChangeSC}
                    placeholder="user_id"
                    className="form-control-sm"
                  />
                </Form.Group> */}
                <Form.Group
                  className="col-sm-4 m-2 hidden"
                  controlId="client_id"
                >
                  <Form.Label>Client</Form.Label>
                  <Form.Control
                    type="text"
                    name="client_id"
                    value={
                      selectedItems
                        ? selectedItems.map((client) => client.id).join(", ")
                        : ""
                    }
                    onChange={handleChangeSC}
                    placeholder="client_id"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group className="col-7 m-3">
                  <Button className="col-6" variant="primary" type="submit">
                    {editingSiteClient ? "Modifier" : "Ajouter"}
                  </Button>
                  <Button
                    className="btn btn-secondary col-5 offset-1"
                    onClick={closeFormSC}
                  >
                    Annuler
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
                {clients && clients.length > 0 ? (
                  <table className="table table-bordered" id="clientsTable">
                    <thead className="text-center table-secondary">
                      <tr>
                        <th>{/* vide */}</th>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAllChange}
                          />
                        </th>
                        <th>Logo</th>
                        <th>CodeClient</th>
                        <th>Raison Sociale</th>
                        <th>Abreviation</th>
                        <th>Adresse</th>
                        <th>Téléphone</th>
                        <th>Ville</th>
                        <th>Code Postal</th>
                        <th>ICE</th>
                        <th>Zone</th>
                        <th>Categorie</th>
                        <th>type de client</th>
                        {/* <th>User</th> */}
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {filteredclients
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((client) => (
                          <React.Fragment key={client.id}>
                            <tr>
                              <td>
                                <div className="no-print ">
                                  <button
                                    className="btn btn-sm btn-light"
                                    onClick={() => toggleRow(client.id)}
                                  >
                                    <FontAwesomeIcon
                                      icon={
                                        expandedRows.includes(client.id)
                                          ? faMinus
                                          : faPlus
                                      }
                                    />
                                  </button>
                                </div>
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedItems.some(
                                    (item) => item.id === client.id
                                  )}
                                  onChange={() => handleSelectItem(client)}
                                />
                              </td>
                              <td>
                                {/* {client.logoC && (
                                  <img
                                    src={`http://localhost:8000/storage/${client.logoC}`}
                                    alt="Client Logo"
                                    style={{ width: "50px", height: "50px" }}
                                  />
                                )} */}
                                {client.logoC && (
                                  <img
                                    src={client.logoC}
                                    alt="Logo"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      borderRadius: "50%",
                                    }}
                                  />
                                )}
                              </td>
                              <td>{client.CodeClient}</td>
                              <td>{client.raison_sociale}</td>
                              <td>{client.abreviation}</td>
                              <td>{client.adresse}</td>
                              <td>{client.tele}</td>
                              <td>{client.ville}</td>
                              <td>{client.code_postal}</td>
                              <td>{client.ice}</td>
                              <td>{client.zone.zone}</td>
                              <td>{client.categorie}</td>
                              <td>{client.type_client}</td>
                              <td className="d-inline-flex">
                                <button
                                  className="btn btn-sm btn-info m-1"
                                  onClick={() => handleEdit(client)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn btn-danger btn-sm m-1"
                                  onClick={() => handleDelete(client.id)}
                                >
                                  <i className="fas fa-minus-circle"></i>
                                </button>
                              </td>
                            </tr>
                            {expandedRows.includes(client.id) &&
                              client.siteClients && (
                                <tr>
                                  <td colSpan="12">
                                    <div id="client">
                                      <table
                                        className="table table-responsive"
                                        style={{ backgroundColor: "#adb5bd" }}
                                      >
                                        {/* <thead>
                                        <tr>
                                          <th>Raison Sociale</th>
                                          <th>Abreviation</th>
                                          <th>Adresse</th>
                                          <th>Téléphone</th>
                                          <th>Ville</th>
                                          <th>Code Postal</th>
                                          <th>ICE</th>
                                          <th>Zone</th>
                                          <th className="text-center">Action</th>
                                        </tr>
                                      </thead> */}
                                        <tbody>
                                          {client.siteClients.map(
                                            (siteClient) => (
                                              <tr key={siteClient.id}>
                                                <td colSpan={1}>Site</td>
                                                <td>
                                                  {siteClient.logoSC && (
                                                    <img
                                                      src={siteClient.logoSC}
                                                      alt="Logo"
                                                      style={{
                                                        width: "50px",
                                                        height: "50px",
                                                        borderRadius: "50%",
                                                      }}
                                                    />
                                                  )}
                                                </td>
                                                <td>
                                                  {siteClient.CodeSiteclient}
                                                </td>
                                                <td>
                                                  {siteClient.raison_sociale}
                                                </td>
                                                <td>
                                                  {siteClient.abreviation}
                                                </td>
                                                <td>{siteClient.adresse}</td>
                                                <td>{siteClient.tele}</td>
                                                <td>{siteClient.ville}</td>
                                                <td>
                                                  {siteClient.code_postal}
                                                </td>
                                                <td>{siteClient.ice}</td>
                                                <td>{siteClient.zone_id}</td>
                                                <td className="no-print">
                                                  <button
                                                    className="btn btn-sm btn-info m-1"
                                                    onClick={() => {
                                                      handleEditSC(siteClient);
                                                    }}
                                                  >
                                                    <i className="fas fa-edit"></i>
                                                  </button>
                                                  <button
                                                    className="btn btn-sm btn-danger m-1"
                                                    onClick={() =>
                                                      handleDeleteSiteClient(
                                                        siteClient.id
                                                      )
                                                    }
                                                  >
                                                    <FontAwesomeIcon
                                                      icon={faTrash}
                                                    />
                                                  </button>
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
                ) : (
                  <div className="text-center">
                    <h5>Aucun client</h5>
                  </div>
                )}
                <div>
                  <Button
                    className="btn btn-danger btn-sm"
                    onClick={handleDeleteSelected}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredclients.length}
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

export default ClientList;
