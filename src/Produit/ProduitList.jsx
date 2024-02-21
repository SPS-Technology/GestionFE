
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button, Modal } from 'react-bootstrap';
import Navigation from "../nav/Navigation";

const ProduitList = () => {
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    type_quantite: 'kg',
    calibre: '',
    fournisseur_id: '',
    user_id: '',
  });

  const fetchProduits = async () => {
    try {
      const produitsResponse = await axios.get(
        "http://localhost:8000/api/produits"
      );
      setProduits(produitsResponse.data.produit);

      const fournisseursResponse = await axios.get(
        "http://localhost:8000/api/fournisseurs"
      );
      setFournisseurs(fournisseursResponse.data.fournisseur);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const handleEdit = (id) => {
    const existingProduit = produits.find((produit) => produit.id === id);

    const fournisseurOptions = fournisseurs.map((fournisseur) => ({
      value: fournisseur.id,
      label: fournisseur.raison_sociale,
    }));

    Swal.fire({
      title: "Modifier Produit",
      html:
      `<label for="nom">Nom</label>` +
      `<input type="text" id="nom" class="swal2-input" value="${existingProduit.nom}">` +
      `<label for="type_quantite">Type Quantité</label>` +
      `<input type="text" id="type_quantite" class="swal2-input" value="${existingProduit.type_quantite}">` +
      `<label for="calibre">Calibre</label>` +
      `<input type="text" id="calibre" class="swal2-input" value="${existingProduit.calibre}">` +
      `<label for="user_id">User</label>` +
      `<input type="text" id="user_id" class="swal2-input" value="${existingProduit.user_id}">` +
      `<label for="fournisseur_id">Fournisseur</label>` +
      `<input type="text" id="fournisseur_id" class="swal2-input" value="${existingProduit.fournisseur_id}">`
        ,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          nom: document.getElementById("nom").value,
          type_quantite: document.getElementById("type_quantite").value,
          calibre: document.getElementById("calibre").value,
          fournisseur_id: document.getElementById("fournisseur_id").value,
          user_id: document.getElementById("user_id").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`http://localhost:8000/api/produits/${id}`, result.value)
          .then(() => {
            fetchProduits();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Produit modifié avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de la modification du produit:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la modification du produit.",
            });
          });
      }
    });
  };


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
        axios
          .delete(`http://localhost:8000/api/produits/${id}`)
          .then(() => {
            fetchProduits();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Produit supprimé avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de la suppression du produit:", error);
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


  const handleClose = () => setShow(false);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = () => {
    axios
      .post("http://localhost:8000/api/produits", formData)
      .then(() => {
        fetchProduits();
        setShow(false);
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: "Produit ajouté avec succès.",
        });
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout du produit:", error);
        setShow(false);
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: "Échec de l'ajout du produit.",
        });
      });
  };

  return (
    <div>
      <Navigation />
      <h2 className="text-center m-2">Liste des Produits</h2>
      <button className="btn btn-primary col-2 m-2 " onClick={() => setShow(true)}>
        Ajouter Produit
      </button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter Produit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="col-12 row">
            <Form.Group className="col-6" controlId="nom">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom"
              />
            </Form.Group>
            <Form.Group className="col-4" controlId="type_quantite">
              <Form.Label>Type Quantité</Form.Label>
              <Form.Control
                as="select"
                name="type_quantite"
                value={formData.type_quantite}
                onChange={handleChange}
              >
                <option value="kg">KG</option>
                <option value="unitaire">UNITAIRE</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="col-6 mt-2" controlId="calibre">
              <Form.Label>Calibre</Form.Label>
              <Form.Control
                type="text"
                name="calibre"
                value={formData.calibre}
                onChange={handleChange}
                placeholder="Calibre"
              />
            </Form.Group>
            <Form.Group className="col-7 mt-2" controlId="fournisseur_id">
              <Form.Label>Fournisseur</Form.Label>
              <Form.Control
                as="select"
                name="fournisseur_id"
                value={formData.fournisseur_id}
                onChange={handleChange}
              >
                {fournisseurs.map((fournisseur) => (
                  <option key={fournisseur.id} value={fournisseur.id}>
                    {fournisseur.raison_sociale}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="col-4 mt-2" controlId="user_id">
              <Form.Label>User</Form.Label>
              <Form.Control
                type="text"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                placeholder="User ID"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit}>
            Ajouter
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="container mt-5" >
      {produits && produits.length > 0 ? (
        <table className="table table-hover table-bordered">
          <thead className="text-center">
            <tr>
              <th colSpan={2}>ID</th>
              <th>Nom</th>
              <th>Type Quantité</th>
              <th>Calibre</th>
              <th>fournisseur</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {produits.map((produit) => {
              const fournisseur = fournisseurs.find(
                (fournisseur) => fournisseur.id === produit.fournisseur_id
              );

              return (
                <tr key={produit.id}>
                  <td>
                    <div className="custom-control custom-checkbox">
                      <input type="checkbox" className="custom-control-input" id="checkbox"></input>
                    </div>
                  </td>
                  <td>{produit.id}</td>
                  <td>{produit.nom}</td>
                  <td>{produit.type_quantite}</td>
                  <td>{produit.calibre}</td>
                  <td>
                    {fournisseur ? (
                      <>{fournisseur.abreviation}</>
                    ) : (
                      <div>No Fournisseur found</div>
                    )}
                  </td>
                  <td className="col-2 text-center">
                    <button
                      className="col-3 btn btn-warning mx-2"
                      onClick={() => handleEdit(produit.id)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="col-3 btn btn-danger mx-2"
                      onClick={() => handleDelete(produit.id)}
                    >
                      <i className="fas fa-minus-circle"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="text-center"><h5>Loading...</h5></div>
      )}
    </div>
    </div>
  );
};

export default ProduitList;
