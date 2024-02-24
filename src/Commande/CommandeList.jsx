import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Table, Modal } from 'react-bootstrap';
import Navigation from "../layouts/Navigation";

const CommandeList = () => {
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);
  const [selectedProductPrice, setSelectedProductPrice] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const handleClientChange = (event) => {
    const clientId = event.target.value;
    if (clientId === "") {
      setSelectedClient(null);
    } else {
      const client = clients.find(client => client.id === parseInt(clientId));
      setSelectedClient(client);
    }
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
    if (isChecked) {
      // Ajouter le produit sélectionné au tableau des produits sélectionnés
      const productToAdd = produits.find(product => product.id === id);
      setSelectedProducts([...selectedProducts, productToAdd]);
    } else {
      // Supprimer le produit décoché du tableau des produits sélectionnés
      const updatedProducts = selectedProducts.filter(product => product.id !== id);
      setSelectedProducts(updatedProducts);
    }
  };

  const handleAddProduct = () => {
    const productToAdd = {
      ...selectedProduct,
      quantity: selectedProductQuantity,
      prix_unitaire: selectedProductPrice
    };
    setSelectedProducts([...selectedProducts, productToAdd]);
    setShowModal(false);
  };

  const handleRemoveProduct = (id) => {
    const updatedProducts = selectedProducts.filter(product => product.id !== id);
    setSelectedProducts(updatedProducts);
  };

  const addProductsToCommande = async () => {
    try {
      const commandeResponse = await axios.post("http://localhost:8000/api/commandes", {
        client_id: selectedClient,
        user_id: "1",
        status: "En cours"
      });
      const commande_id = commandeResponse.data.id;

      for (const product of selectedProducts) {
        const { id: produit_id, quantity: quantite, prix_unitaire } = product;
        await axios.post("http://localhost:8000/api/ligneCommandes", {
          commande_id,
          produit_id,
          quantite,
          prix_unitaire
        });
      }

      setSelectedProducts([]);
    } catch (error) {
      console.error("Error adding products to commande:", error);
    }
  };

  return (
    <div className="col row">
      <Navigation />
      <div className="col-3 mt-3">
        <Form.Label><a className=" m-3" href="/clients">Liste des Clients</a></Form.Label>
        <Form.Select className="col-4 m-2 mt-2" value={selectedClient} onChange={handleClientChange}>
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.abreviation}
            </option>
          ))}
        </Form.Select>
        {selectedClient ? (
          <div className="col row align-items-start">

            <div className="col-10">
              <ul className="clientS">
                <span>Client sélectionné :</span>
                <li>Raison Sociale : {selectedClient.raison_sociale}</li>
              </ul>
            </div>
            <div className="col-2">
              <Button variant="danger" className="btn-sm" onClick={() => setSelectedClient(null)}>X</Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="col-3 mt-3">
        <Form.Label>Sélectionner des produits</Form.Label>
        <Button variant="primary" onClick={() => setShowModal(true)}>Sélectionner des produits</Button>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Sélectionner des produits</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Sélectionner</th>
                </tr>
              </thead>
              <tbody>
                {produits.map(produit => (
                  <tr key={produit.id}>
                    <td>{produit.nom}</td>
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
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowModal(false)}>Ajouter</Button>
          </Modal.Footer>
        </Modal>
      </div>

      <div className="container mt-3 col-5">
        <Form.Label>Produits Sélectionnés</Form.Label>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type Quantité</th>
              <th>Calibre</th>
              <th>Quantité</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedProducts.map(produit => (
              <tr key={produit.id}>
                <td>{produit.nom}</td>
                <td>{produit.type_quantite}</td>
                <td>{produit.calibre}</td>
                <td><Form.Control
                  type="number"
                  value={produit.quantity}
                  required
                  onChange={(e) => {
                    const updatedProducts = selectedProducts.map(prod => {
                      if (prod.id === produit.id) {
                        return { ...prod, quantity: parseInt(e.target.value) };
                      }
                      return prod;
                    });
                    setSelectedProducts(updatedProducts);
                  }}
                /></td>
                <td>
                  <Button variant="danger" onClick={() => handleRemoveProduct(produit.id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div>
          <Button variant="primary" onClick={addProductsToCommande}>Ajouter à la commande</Button>
        </div>
      </div>
    </div>
  );
};

export default CommandeList;
