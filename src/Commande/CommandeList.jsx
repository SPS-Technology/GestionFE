import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Table, Modal } from 'react-bootstrap';
import Navigation from "../nav/Navigation";

const CommandeList = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [produits, setProduits] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const handleClientChange = (event) => {
    setSelectedClient(event.target.value);
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/clients");
      setClients(response.data.client);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/produits");
      setProduits(response.data.produit);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductSelect = (id, isChecked) => {
    const product = produits.find(produit => produit.id === id);
    if (isChecked) {
      setSelectedProduct(product);
      setShowModal(true);
    } else {
      setSelectedProduct(null);
    }
  };

  const handleAddProduct = () => {
    const productToAdd = { ...selectedProduct, quantity };
    setSelectedProducts([...selectedProducts, productToAdd]);
    setShowModal(false);
  };

  const handleRemoveProduct = (id) => {
    const updatedProducts = selectedProducts.filter(product => product.id !== id);
    setSelectedProducts(updatedProducts);
  };

  return (
    <div className="col row" >
      <Navigation />
      <div className="col-2 mt-3">
        <Form.Label><a className=" m-3" href="/clients">Liste des Clients</a></Form.Label>
        <Form.Select className="col-4 m-2 mt-2" value={selectedClient} onChange={handleClientChange}>
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.abreviation}
            </option>
          ))}
        </Form.Select>
      </div>

      <div className="col-4 mt-3">
      <Form.Label>Sélectionner des produits:</Form.Label>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Type Quantité</th>
              <th>Calibre</th>
              <th>Add</th>
            </tr>
          </thead>
          <tbody>
            {produits.map(produit => (
              <tr key={produit.id}>
                <td>{produit.id}</td>
                <td>{produit.nom}</td>
                <td>{produit.type_quantite}</td>
                <td>{produit.calibre}</td>

                <td>
                  <Form.Check
                    type="checkbox"
                    id={`produit-${produit.id}`}
                    onChange={(e) => handleProductSelect(produit.id, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

      </div>

      <div className="container mt-3 col-5" >
        <h4>Produits Sélectionnés</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type Quantité</th>
              <th>Calibre</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedProducts.map(produit => (
              <tr key={produit.id}>
                <td>{produit.nom}</td>
                <td>{produit.type_quantite}</td>
                <td>{produit.calibre}</td>
                <td>
                  <Button variant="danger" onClick={() => handleRemoveProduct(produit.id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sélectionner la quantité</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Quantité:</Form.Label>
          <Form.Control
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleAddProduct}>Ajouter</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommandeList;
