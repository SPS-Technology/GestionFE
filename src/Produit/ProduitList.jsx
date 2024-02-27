import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import Navigation from "../layouts/Navigation";
import Search from "../layouts/Search";
import TablePagination from '@mui/material/TablePagination';
import ExportToPdfButton from './exportToPdf';
import PrintList from './printList'; // Adjust the path if necessary
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFilePdf, faFileExcel, faPrint, faEdit } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ProduitList = () => {
  const [produits, setProduits] = useState([]);
  const [users, setUsers] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProduits, setFilteredProduits] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [editingProduit, setEditingProduit] = useState(null);
  const [editingProduitId, setEditingProduitId] = useState(null);


  const [formContainerStyle, setFormContainerStyle] = useState({ right: '-500px' });
  const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: '0px' });
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    type_quantite: "",
    calibre: "",
    fournisseur_id: "",
    user_id: "",
  });

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/produits");
      setProduits(response.data.produit);
      const fournisseursResponse = await axios.get(
        "http://localhost:8000/api/fournisseurs"
      );
      setFournisseurs(fournisseursResponse.data.fournisseur);
      const usersResponse = await axios.get("http://localhost:8000/api/users");
      setUsers(usersResponse.data);
      console.log("users", users);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (produits) {
      const filtered = produits.filter((produit) =>
        produit.nom.toLowerCase().includes(searchTerm.toLowerCase())
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
          axios.delete(`http://localhost:8000/api/produits/${id}`)
            .then((response) => {
              fetchProduits();
              Swal.fire({
                icon: "success",
                title: "Success!",
                text: 'produit supprimé avec succès.',
              });
            })
            .catch((error) => {
              console.error("Error deleting product:", error);
              Swal.fire({
                icon: "error",
                title: "Error!",
                text: 'Échec de la suppression du produit.',
              });
            });
        });
      }
    });
    setSelectedItems([]);
  }


  const handleDelete = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
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
        axios.delete(`http://localhost:8000/api/produits/${id}`)
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
      nom: "",
      type_quantite: "",
      calibre: "",
      fournisseur_id: "",
      user_id: "",
    });
    setEditingProduit(null); // Clear editing client
  };


  const handleEdit = (produit) => {
    setEditingProduit(produit);
    setFormData({
      nom: produit.nom,
      type_quantite: produit.type_quantite,
      calibre: produit.calibre,
      fournisseur_id: produit.fournisseur_id,
      user_id: produit.user_id,

    });
    if (formContainerStyle.right === '-500px') {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    } else {
      closeForm();
    }
  };
  useEffect(() => {
    if (editingProduitId !== null) {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
    }
  }, [editingProduitId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingProduit ? `http://localhost:8000/api/produits/${editingProduit.id}` : 'http://localhost:8000/api/produits';
    const method = editingProduit ? 'put' : 'post';
    axios({
      method: method,
      url: url,
      data: formData,
    }).then(() => {
      fetchProduits();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Product ${editingProduit ? 'updated' : 'added'} successfully.`,
      });
      setFormData({ nom: '', type_quantite: '', calibre: '', fournisseur_id: '', user_id: '' });
      setEditingProduit(null);
    }).catch((error) => {
      console.error(`Error ${editingProduit ? 'updating' : 'adding'} product:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to ${editingProduit ? 'update' : 'add'} product.`,
      });
    });
    if (formContainerStyle.right === '-500px') {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '500px' });
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

  return (
    <div>
      <Navigation />
      <div className="container">
        <h3>Liste des Produits</h3>
        <div className="search-container d-flex flex-row-reverse " role="search">
          <Search onSearch={handleSearch} type="search" />
        </div>
        <Button variant="primary" className="col-2 btn btn-sm m-2" id="showFormButton" onClick={handleShowFormButtonClick}>
          {showForm ? 'Modifier le formulaire' : 'Ajouter un Produit'}
        </Button>
        <div id="formContainer" className="mt-3" style={formContainerStyle}>
          <Form className="col row" onSubmit={handleSubmit}>
            <Form.Label className="text-center m-2"><h4>{editingProduit ? 'Modifier' : 'Ajouter'} un Produit</h4></Form.Label>
            <Form.Group className="col-sm-5 m-2 " controlId="nom">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom"
                className="form-control-sm"
                required
              />
            </Form.Group>
            <Form.Group className="col-sm-5 m-2 " controlId="type_quantite">
              <Form.Label>Type de Quantité</Form.Label>
              <Form.Control
                type="text"
                name="type_quantite"
                value={formData.type_quantite}
                onChange={handleChange}
                placeholder="Type de Quantité"
                className="form-control-sm"
                required
              />
            </Form.Group>
            <Form.Group className="col-sm-5 m-2 " controlId="calibre">
              <Form.Label>Calibre</Form.Label>
              <Form.Control
                type="text"
                name="calibre"
                value={formData.calibre}
                onChange={handleChange}
                placeholder="Calibre"
                className="form-control-sm"
                required
              />
            </Form.Group>
            <Form.Group className="col-sm-5 m-2 " controlId="fournisseur_id">
              <Form.Label>Fournisseur</Form.Label>
              <Form.Control as="select" name="fournisseur_id" value={formData.fournisseur_id} onChange={handleChange}>
                  <option value="">Sélectionner</option>
                  {fournisseurs.map((fournisseur) => (
                    <option key={fournisseur.id} value={fournisseur.id}>{fournisseur.raison_sociale}</option>
                  ))}
                </Form.Control>
            </Form.Group>
            <Form.Group className="col-sm-5 m-2 " controlId="user_id">
              <Form.Label>User</Form.Label>
              <Form.Control as="select" name="user_id" value={formData.user_id} onChange={handleChange}>
                  <option value="">Sélectionner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </Form.Control>
            </Form.Group>
            <Form.Group className="col-7 m-3">
              <Button className="col-6" variant="primary" type="submit">
                {editingProduit ? 'Modifier' : 'Ajouter'}
              </Button>
            </Form.Group>
          </Form>
        </div>

        <div className="">
          <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
            {produits && produits.length > 0 ? (
              <table className="table table-hover" id="produitsTable">
                <thead className="text-center">
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                      />
                    </th>
                    <th>Nom</th>
                    <th>Type de Quantité</th>
                    <th>Calibre</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {filteredProduits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((produit) => (
                    <tr key={produit.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(produit.id)}
                          onChange={() => handleCheckboxChange(produit.id)}
                        />
                      </td>
                      <td>{produit.nom}</td>
                      <td>{produit.type_quantite}</td>
                      <td>{produit.calibre}</td>
                      <td className="d-inline-flex no-print text-center">
                        <button
                          className="btn btn-sm btn-info m-1"
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
            ) : (
              <div className="text-center">
                <h5>Aucun Produit</h5>
              </div>
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
                <Button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
                  <FontAwesomeIcon icon={faTrash} /></Button>
                <PrintList tableId="produitsTable" title="Liste des produits" produitList={produits} filteredProduits={filteredProduits} />
                <ExportToPdfButton produits={produits} selectedItems={selectedItems} />
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
};

export default ProduitList;
