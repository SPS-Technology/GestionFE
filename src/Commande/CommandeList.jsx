import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Table } from 'react-bootstrap';
import Navigation from "../nav/Navigation";

const CommandeList = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [produits, setProduits] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

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
      setClients(response.data.client); // Utiliser response.data.client au lieu de response.data.client
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

  const handleProductSelect = (id) => {
    console.log("Selected Product ID:", id); // Ajoutez cette ligne pour vérifier la valeur sélectionnée
    const selectedProduct = produits.find(produit => produit.id === id);
    setSelectedProducts([...selectedProducts, selectedProduct]);
    
    console.log("Selected Products:", selectedProducts);
  };

  return (
    <div className="col row" >
      <Navigation />
      <div className="col-2 mt-2 ">
      <Form.Label className="mt-2 m-2"><a  href="/clients">LISTE DES CLIENTS</a>:</Form.Label>
        <Form.Select className="col-4 m-2 mt-2" value={selectedClient} onChange={handleClientChange}>
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.abreviation}
            </option>
          ))}
        </Form.Select>
      </div>

      <div className="col-3 mt-3">
        <Form.Group controlId="productSelect">
          <Form.Label>Sélectionner un produit:</Form.Label>
          <Form.Control as="select" onChange={(e) => handleProductSelect(e.target.value)}>
            <option value="">Choisir un produit</option>
            {produits.map(produit => (
              <option key={produit.id} value={produit.id}>{produit.nom}</option>
            ))}
          </Form.Control>
        </Form.Group>
      </div>

      <div className="container mt-3 col-6" >
        <Form.Label>Produits Sélectionnés</Form.Label>
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
            {selectedProducts && selectedProducts.map(produit => (
              produit && (
                <tr key={produit.id}>
                  <td>{produit.nom}</td>
                  <td>{produit.type_quantite}</td>
                  <td>{produit.calibre}</td>
                  <td>
                    <Button variant="danger">Supprimer</Button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default CommandeList;
