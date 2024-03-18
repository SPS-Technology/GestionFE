import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import axios from "axios";
import swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Toolbar } from "@mui/material";


const AddDevis = ({produits,clients,users,csrfToken,fetchDevis,}) => {
  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProductCheckboxChange = (productId) => {
    const updatedSelectedProducts = selectedProducts.includes(productId)
      ? selectedProducts.filter((id) => id !== productId)
      : [...selectedProducts, productId];
    setSelectedProducts(updatedSelectedProducts);

    console.log(updatedSelectedProducts);
  };

  const getElementValueById = (id) => {
    return document.getElementById(id)?.value || "";
  };

  const handleAddDevis = async () => {
    try {
      const userResponse = await axios.get("http://localhost:8000/api/users", {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
        
      });
      
      const authenticatedUserId = userResponse.data[0].id;
      const DevisResponse = await axios.post(
        "http://localhost:8000/api/devises",
        {
          client_id: findClientId(getElementValueById("client_id")),
          user_id: authenticatedUserId,
        },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );

      const selectedProductsData = selectedProducts.map((productId) => {
        return {
          devis_id: DevisResponse.data.devis.id,
          produit_id: productId,

          quantite: getElementValueById(`quantite_${productId}`),
          prix_unitaire: getElementValueById(`prix_${productId}`),
        };
      });

      for (const ligneDevisData of selectedProductsData) {
        await axios.post(
          "http://localhost:8000/api/lignedevis",
          ligneDevisData,
          {
            withCredentials: true,
            headers: {
              "X-CSRF-TOKEN": csrfToken,
            },
          }
        );
      }

      swal.fire({
        icon: "success",
        title: "Devis added successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      handleDrawerClose();
      fetchDevis();
      console.log("Devis added successfully!");
    } catch (error) {
      console.error("Error adding Devis:", error);
      swal.fire({
        icon: "error",
        title: "Error adding devis",
        text: "An error occurred while adding the devis. Please try again.",
      });
    }
  };

  const findClientId = (raisonSociale) => {
    return clients.find((client) => client.raison_sociale === raisonSociale)
      ?.id;
  };

  const findUserId = (userName) => {
    return users.find((user) => user.name === userName)?.id;
  };

  return (
    <div>
        <Toolbar/>
        
      <Button
        variant="contained"
        onClick={handleDrawerOpen}
        style={{ marginBottom: "10px" }}
      >
        <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
        Ajouter
      </Button>
      <Drawer anchor="right" open={open} onClose={handleDrawerClose}>
        <div style={{ padding: "20px" }}>
          <table id="selectedProduitTable" className="swal2-input table table-hover">
            <thead>
              <tr>
                <th>Select</th>
                <th>Product</th>
                <th>Type Quantite</th>
                <th>Calibre</th>
                <th>Quantite</th>
                <th>Prix</th>
              </tr>
            </thead>
            <tbody>
              {produits && produits.map((produit) => (
                <tr key={produit.id}>
                  <td>
                    <input
                      type="checkbox"
                      id={`produit_${produit.id}`}
                      name="selectedProducts"
                      value={produit.id}
                      onChange={() => handleProductCheckboxChange(produit.id)}
                    />
                  </td>
                  <td>{produit.nom}</td>
                  <td>{produit.type_quantite}</td>
                  <td>{produit.calibre}</td>
                  <td>
                    <input type="text" id={`quantite_${produit.id}`} className="quantiteInput" placeholder="Quantite" />
                  </td>
                  <td>
                    <input type="text" id={`prix_${produit.id}`} className="prixInput" placeholder="Prix"/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="swal2-input">
            <thead>
              <tr>
                <th>Client : </th>
              </tr>
              <tr>
                <td>
                  <select id="client_id" className="form-select col-2">
                    <option disabled selected>
                      Client
                    </option>
                    {clients && clients.map((client) => (
                      <option key={client.id}>{client.raison_sociale}</option>
                    ))}
                  </select>
                </td>
              </tr>
            </thead>
          </table>
          <div className="text-center">
            <Button variant="contained" className="col-3" onClick={handleAddDevis}>
              Ajouter
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default AddDevis;