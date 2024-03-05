import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from 'react-bootstrap';
import Navigation from "../Acceuil/Navigation";
import TablePagination from "@mui/material/TablePagination";
import PrintList from "./PrintList";
import ExportPdfButton from './exportToPdf';
import "jspdf-autotable";
import Search from "../Acceuil/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFileExcel, faPlus, faMinus, faCircleInfo, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import "../style.css"
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
  const [formData, setFormData] = useState({ raison_sociale: '', abreviation: '', adresse: '', tele: '', ville: '', zone_id: '', user_id: '', ice: '', code_postal: '', });
  const [formContainerStyle, setFormContainerStyle] = useState({ right: '-500px' });
  const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: '0px' });
  //-------------------edit-----------------------//
  const [editingClient, setEditingClient] = useState(null); // State to hold the client being edited
  const [editingClientId, setEditingClientId] = useState(null);
  //-------------------Pagination-----------------------/
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [filteredclients, setFilteredclients] = useState([]);
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
  const [formDataSC, setFormDataSC] = useState({ raison_sociale: '', abreviation: '', adresse: '', tele: '', ville: '', zone_id: '', user_id: '', ice: '', code_postal: '', client_id: '', });
  const [formContainerStyleSC, setFormContainerStyleSC] = useState({ right: '-500px' });
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

      const SiteClientResponse = await axios.get("http://localhost:8000/api/siteclients");

      setSiteClients(SiteClientResponse.data.siteclient);

    } catch (error) {
      console.error("Error fetching data:", error);
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
        console.error('Erreur lors de la récupération des site clients:', error);
      }
    }
  };

  const fetchSiteClients = async (clientId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/clients/${clientId}/siteclients`);
      return response.data.siteClients;
    } catch (error) {
      console.error('Erreur lors de la récupération des site clients:', error);
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
      client.raison_sociale
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
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
    setFormDataSC({ ...formDataSC, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  //------------------------- CLIENT EDIT---------------------//

  const handleEdit = (client) => {
    setEditingClient(client); // Set the client to be edited
    // Populate form data with client details
    setFormData({
      raison_sociale: client.raison_sociale,
      abreviation: client.abreviation,
      adresse: client.adresse,
      tele: client.tele,
      ville: client.ville,
      zone_id: client.zone_id,
      user_id: client.user_id,
      ice: client.ice,
      code_postal: client.code_postal,
    });
    if (formContainerStyle.right === '-500px') {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    } else {
      closeForm();
    }

  };
  useEffect(() => {
    if (editingClientId !== null) {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    }
  }, [editingClientId]);

  //------------------------- CLIENT SUBMIT---------------------//

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingClient ? `http://localhost:8000/api/clients/${editingClient.id}` : 'http://localhost:8000/api/clients';
    const method = editingClient ? 'put' : 'post';
    axios({
      method: method,
      url: url,
      data: formData,
    }).then(() => {
      fetchClients();
      Swal.fire({
        icon: 'success',
        title: 'Succès!',
        text: `Client ${editingClient ? 'modifié' : 'ajouté'} avec succès.`,
      });
      setFormData({
        raison_sociale: '',
        abreviation: '',
        adresse: '',
        tele: '',
        ville: '',
        zone_id: '',
        user_id: '',
        ice: '',
        code_postal: '',
      });
      setEditingClient(null); // Clear editing client
      closeForm();
    }).catch((error) => {
      console.error(`Erreur lors de ${editingClient ? 'la modification' : "l'ajout"} du client:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur!',
        text: `Échec de ${editingClient ? 'la modification' : "l'ajout"} du client.`,
      });
    });
  };
  //------------------------- CLIENT FORM---------------------//

  const handleShowFormButtonClick = () => {
    if (formContainerStyle.right === '-500px') {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    } else {
      closeForm();
    }
  };

  const closeForm = () => {
    setFormContainerStyle({ right: '-500px' });
    setTableContainerStyle({ marginRight: '0' });
    setShowForm(false); // Hide the form
    setFormData({ // Clear form data
      raison_sociale: '',
      abreviation: '',
      adresse: '',
      tele: '',
      ville: '',
      zone_id: '',
      user_id: '',
      ice: '',
      code_postal: '',
    });
    setEditingClient(null); // Clear editing client
  };
  //-------------------------SITE CLIENT----------------------------//
  //-------------------------  SUBMIT---------------------//
  const handleSelectItem = (item) => {
    const selectedIndex = selectedItems.findIndex((selectedItem) => selectedItem.id === item.id);

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
    return selectedItems.map(item => item.id);
  };


  const handleSubmitSC = (e) => {
    e.preventDefault();

    const url = editingSiteClient ? `http://localhost:8000/api/siteclients/${editingSiteClient.id}` : 'http://localhost:8000/api/siteclients';
    const method = editingSiteClient ? 'put' : 'post';

    // Ajoutez l'ID du client sélectionné au formulaire de site client
    const formDataWithClientIds = { ...formDataSC, };
    axios({
      method: method,
      url: url,
      data: formDataWithClientIds,
    }).then(() => {
      fetchClients();
      Swal.fire({
        icon: 'success',
        title: 'Succès!',
        text: `Site Client ${editingSiteClient ? 'modifié' : 'ajouté'} avec succès.`,
      });
      setFormDataSC({
        raison_sociale: '',
        abreviation: '',
        adresse: '',
        tele: '',
        ville: '',
        zone_id: '',
        user_id: '',
        ice: '',
        code_postal: '',
        client_id: '', // Mettez l'ID du client sélectionn
      });
      setEditingSiteClient(null); // Clear editing site client
      closeForm();
    }).catch((error) => {
      console.error(`Erreur lors de ${editingSiteClient ? 'la modification' : "l'ajout"} du site client:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur!',
        text: `Échec de ${editingSiteClient ? 'la modification' : "l'ajout"} du Site client.`,
      });
    });
  };


  const handleEditSC = (siteClient) => {
    setEditingSiteClient(siteClient); // Set the client to be edited
    // Populate form data with client details
    setFormDataSC({
      raison_sociale: siteClient.raison_sociale,
      abreviation: siteClient.abreviation,
      adresse: siteClient.adresse,
      tele: siteClient.tele,
      ville: siteClient.ville,
      zone_id: siteClient.zone_id,
      user_id: siteClient.user_id,
      ice: siteClient.ice,
      code_postal: siteClient.code_postal,
      client_id: siteClient.client_id,
    });
    if (formContainerStyleSC.right === '-500px') {
      setFormContainerStyleSC({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    } else {
      closeFormSC();
    }

  };

  const handleDeleteSiteClient = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer ce site client ?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Oui',
      denyButtonText: 'Non',
      customClass: {
        actions: 'my-actions',
        cancelButton: 'order-1 right-gap',
        confirmButton: 'order-2',
        denyButton: 'order-3',
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
            console.error("Erreur lors de la suppression du site client:", error);
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
    if (formContainerStyleSC.right === '-500px') {
      setFormContainerStyleSC({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    } else {
      closeFormSC();
    }
  };

  const closeFormSC = () => {
    setFormContainerStyleSC({ right: '-500px' });
    setTableContainerStyle({ marginRight: '0' });
    setShowFormSC(false); // Hide the form
    setFormDataSC({ // Clear form data
      raison_sociale: '',
      abreviation: '',
      adresse: '',
      tele: '',
      ville: '',
      zone_id: '',
      user_id: '',
      ice: '',
      code_postal: '',
      client_id: '',

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

  // Pagination calculations
  const indexOfLastClient = (page + 1) * rowsPerPage;
  const indexOfFirstClient = indexOfLastClient - rowsPerPage;
  const currentClients = clients.slice(indexOfFirstClient, indexOfLastClient);

  //------------------------- CLIENT DELETE---------------------//

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer ce client ?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Oui',
      denyButtonText: 'Non',
      customClass: {
        actions: 'my-actions',
        cancelButton: 'order-1 right-gap',
        confirmButton: 'order-2',
        denyButton: 'order-3',
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
      title: 'Êtes-vous sûr de vouloir supprimer ?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Oui',
      denyButtonText: 'Non',
      customClass: {
        actions: 'my-actions',
        cancelButton: 'order-1 right-gap',
        confirmButton: 'order-2',
        denyButton: 'order-3',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        selectedItems.forEach((id) => {
          axios
            .delete(`http://localhost:8000/api/clients/${id}`)
            .then(() => {
              fetchClients();
              Swal.fire({
                icon: 'success',
                title: 'Succès!',
                text: 'Client supprimé avec succès.',
              });
            })
            .catch((error) => {
              console.error("Erreur lors de la suppression du client:", error);
              Swal.fire({
                icon: 'error',
                title: 'Erreur!',
                text: 'Échec de la suppression du client.',
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
      const response = await axios.delete(`http://localhost:8000/api/zones/${zoneId}`);
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
      const response = await axios.get(`http://localhost:8000/api/zones/${zoneId}`);
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
          const editedZoneValue = document.getElementById("swal-edit-input1").value;
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
                      ${zones.map(zone => `
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
                      `).join('')}
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
      <Box sx={{ display: 'flex' }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
            <h3>Liste des Clients</h3>
          <div className="container">
            <div className="d-flex flex-row-reverse col" >      
            <div className="search-container d-flex flex-row-reverse col-3" role="search">
              <Search onSearch={handleSearch} type="search" />
            </div>
            </div>
            <Button variant="primary" className="col-2 btn btn-sm m-2" id="showFormButton" onClick={handleShowFormButtonClick}>
              {showForm ? 'Modifier le formulaire' : 'Ajouter un Client'}
            </Button>
            <Button
              variant="primary"
              className="col-2 btn btn-sm m-2"
              id="showFormButton"
              onClick={() => {
                if (selectedItems.length === 1) {
                  handleShowFormButtonClickSC();
                } else if (selectedItems.length > 1) {
                  console.error("Vous ne pouvez ajouter qu'un seul site client à la fois.");
                } else {
                  console.error("Aucun client sélectionné pour ajouter un site client.");
                }
              }}
              disabled={selectedItems.length === 0 || selectedItems.length > 1} // Désactiver le bouton si aucun client n'est sélectionné ou si plus d'un client est sélectionné
            >
              {showForm ? 'Modifier Site Client' : 'Ajouter Site Client'}
            </Button>
            <div id="formContainer" className="" style={formContainerStyle}>
              <Form className="col row" onSubmit={handleSubmit}>
                <Form.Label className="text-center m-2"><h4>{editingClient ? 'Modifier' : 'Ajouter'} un Client</h4></Form.Label>
                <Form.Group className="col-sm-5 m-2 " controlId="raison_sociale">
                  <Form.Label>Raison Sociale</Form.Label>
                  <Form.Control
                    type="text"
                    name="raison_sociale"
                    value={formData.raison_sociale}
                    onChange={handleChange}
                    placeholder="Raison Sociale"
                    className="form-control-sm"
                  />
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
                  <Form.Control as="select" name="zone_id" value={formData.zone_id} onChange={handleChange}>
                    <option value="">Sélectionner Zone</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>{zone.zone}</option>
                    ))}
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
                </Form.Group>
                <Form.Group className="col-sm-4 m-2" controlId="user_id">
                  <Form.Label>Utilisateur</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    placeholder="user_id"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group className="col-7 m-3">
                  <Button className="col-6" variant="primary" type="submit">
                    {editingClient ? 'Modifier' : 'Ajouter'}
                  </Button>
                  <Button className="btn btn-secondary col-5 offset-1" onClick={closeForm}>Annuler</Button>
                </Form.Group>
              </Form>
            </div>
            <div id="formContainer1SC" className="" style={formContainerStyleSC}>
              <Form className="col row" onSubmit={handleSubmitSC}>
                <Form.Label className="text-center m-2"><h4>{editingSiteClient ? 'Modifier' : 'Ajouter'} Site Client</h4></Form.Label>
                <Form.Group className="col-sm-5 m-2 " controlId="raison_sociale">
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
                  <Form.Control as="select" name="zone_id" value={formDataSC.zone_id} onChange={handleChangeSC}>
                    <option value="">Sélectionner Zone</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>{zone.zone}</option>
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
                <Form.Group className="col-sm-4 m-2" controlId="user_id">
                  <Form.Label>Utilisateur</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_id"
                    value={formDataSC.user_id}
                    onChange={handleChangeSC}
                    placeholder="user_id"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group className="col-sm-4 m-2 hidden" controlId="client_id">
                  <Form.Label>Client</Form.Label>
                  <Form.Control
                    type="text"
                    name="client_id"
                    value={selectedItems ? selectedItems.map(client => client.id).join(', ') : ''}
                    onChange={handleChangeSC}
                    placeholder="client_id"
                    className="form-control-sm"
                  />
                </Form.Group>
                <Form.Group className="col-7 m-3">
                  <Button className="col-6" variant="primary" type="submit">
                    {editingSiteClient ? 'Modifier' : 'Ajouter'}
                  </Button>
                  <Button className="btn btn-secondary col-5 offset-1" onClick={closeFormSC}>Annuler</Button>
                </Form.Group>
              </Form>
            </div>
            <div className="">
            <div className="btn-group col-2 d-flex flex-row-reverse">
                <PrintList tableId="clientsTable" title="Liste des clients" clientList={clients} filteredclients={filteredclients} />
                <ExportPdfButton clients={clients} selectedItems={selectedItems} />
                <Button className="btn btn-success btn-sm " onClick={exportToExcel}>
                  <FontAwesomeIcon icon={faFileExcel} />
                </Button>
              </div>
              <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
                {clients && clients.length > 0 ? (
                  <table className="table table-responsive table-bordered" id="clientsTable">
                    <thead className="text-center table-secondary">
                      <tr>
                        <th>
                          {/* vide */}
                        </th>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAllChange}
                          />
                        </th>
                        <th>Raison Sociale</th>
                        <th>Abreviation</th>
                        <th>Adresse</th>
                        <th>Téléphone</th>
                        <th>Ville</th>
                        <th>Code Postal</th>
                        <th>ICE</th>
                        <th>Zone</th>
                        <th>User</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {filteredclients
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((client) => (
                          <React.Fragment key={client.id}>
                            <tr>
                              <td>
                                <div className="no-print ">
                                  <button className="btn btn-sm btn-light" onClick={() => toggleRow(client.id)}>
                                    <FontAwesomeIcon icon={expandedRows.includes(client.id) ? faMinus : faPlus} />
                                  </button>
                                </div>
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedItems.some((item) => item.id === client.id)}
                                  onChange={() => handleSelectItem(client)}
                                />
                              </td>
                              <td>{client.raison_sociale}</td>
                              <td>{client.abreviation}</td>
                              <td>{client.adresse}</td>
                              <td>{client.tele}</td>
                              <td>{client.ville}</td>
                              <td>{client.code_postal}</td>
                              <td>{client.ice}</td>
                              <td>{client.zone.zone}</td>
                              <td>{client.user.name}</td>
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
                            {expandedRows.includes(client.id) && client.siteClients && (
                              <tr>
                                <td colSpan="12">
                                  <div id="client">
                                    <table className="table table-responsive" style={{ backgroundColor: "#F1F1F1" }}>
                                      <thead>
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
                                      </thead>
                                      <tbody>
                                        {client.siteClients.map((siteClient) => (

                                          <tr key={siteClient.id}>
                                            <td>{siteClient.raison_sociale}</td>
                                            <td>{siteClient.abreviation}</td>
                                            <td>{siteClient.adresse}</td>
                                            <td>{siteClient.tele}</td>
                                            <td>{siteClient.ville}</td>
                                            <td>{siteClient.code_postal}</td>
                                            <td>{siteClient.ice}</td>
                                            <td>{siteClient.zone_id}</td>
                                            <td className="no-print">
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
                                            </td>
                                          </tr>
                                        ))}
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
                <Button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
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
}

export default ClientList;