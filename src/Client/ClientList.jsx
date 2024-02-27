import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from 'react-bootstrap';
import Navigation from "../layouts/Navigation";
import TablePagination from "@mui/material/TablePagination";
import PrintList from './printList'; // Adjust the path if necessary
import ExportToPdfButton from './exportToPdf';
import "jspdf-autotable";
import Search from "../layouts/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFilePdf, faFileExcel, faPrint, } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import "../style.css"

//------------------------- CLIENT LIST---------------------//
const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  //---------------form-------------------//
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ raison_sociale: '', abreviation: '', adresse: '', tele: '', ville: '', zone: '', user_id: '', });
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

  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/clients");
      console.log("API Response:", response.data);
      setClients(response.data.client);

      const userResponse = await axios.get("http://localhost:8000/api/user");
      setUsers(userResponse.data.users);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

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
      zone: client.zone,
      user_id: client.user_id,
    });
    if (formContainerStyle.right === '-500px') {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    } else {
      closeForm();
    }
    // Show form
    // setShowForm(true);
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
        zone: '',
        user_id: '',
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
      zone: '',
      user_id: '',
    });
    setEditingClient(null); // Clear editing client
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

  return (
    <div>
      <Navigation />
      <h3>Liste des Clients</h3>
      <div className="container">    
        <div className="search-container d-flex flex-row-reverse " role="search">
          <Search onSearch={handleSearch} type="search" />
        </div>
        <Button variant="primary" className="col-2 btn btn-sm m-2" id="showFormButton" onClick={handleShowFormButtonClick}>
          {showForm ? 'Modifier le formulaire' : 'Ajouter un Client'}
        </Button>
        <div id="formContainer" className="mt-3" style={formContainerStyle}>
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
            <Form.Group className="col-sm-4 m-2" controlId="zone">
              <Form.Label>Zone</Form.Label>
              <Form.Control
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                placeholder="Zone"
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

        <div className="">
          <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
            {clients && clients.length > 0 ? (
              <table className="table table-hover" id="clientsTable">
                <thead className="text-center">
                  <tr>
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
                    <th>Zone</th>
                    <th>User</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {filteredclients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((client) => (
                    <tr key={client.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(client.id)}
                          onChange={() => handleCheckboxChange(client.id)}
                        />
                      </td>
                      <td>{client.raison_sociale}</td>
                      <td>{client.abreviation}</td>
                      <td>{client.adresse}</td>
                      <td>{client.tele}</td>
                      <td>{client.ville}</td>
                      <td>{client.zone}</td>
                      <td>{client.user_id}</td>
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
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center">
                <h5>Loading...</h5>
              </div>
            )}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredclients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <div className="d-flex flex-row">
              <div className="btn-group col-2">
                <Button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
                  <FontAwesomeIcon icon={faTrash} /></Button>
                <PrintList tableId="clientsTable" title="Liste des clients" clientList={clients} filteredclients={filteredclients} />
                <ExportToPdfButton clients={clients} selectedItems={selectedItems} />
                <Button className="btn btn-success btn-sm ml-2" onClick={exportToExcel}>
                  <FontAwesomeIcon icon={faFileExcel} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientList;
