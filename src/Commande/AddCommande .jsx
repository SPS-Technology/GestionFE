import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import axios from "axios";
import swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const AddCommande = ({
  produits,
  clients,
  users,
  csrfToken,
  fetchCommandes,
}) => {
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

  const handleAddCommande = async () => {
    try {
      const userResponse = await axios.get("http://localhost:8000/api/users", {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
      });
console.log(userResponse);
      const authenticatedUserId = userResponse.data[0].id;
      const commandeResponse = await axios.post(
        "http://localhost:8000/api/commandes",
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
          commande_id: commandeResponse.data.commande.id,
          produit_id: productId,

          quantite: getElementValueById(`quantite_${productId}`),
          prix_unitaire: getElementValueById(`prix_${productId}`),
        };
      });

      for (const ligneCommandeData of selectedProductsData) {
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

      const statusCommandeData = {
        commande_id: commandeResponse.data.commande.id,
        status: "En Cours",
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

      swal.fire({
        icon: "success",
        title: "Commande added successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      handleDrawerClose();
      fetchCommandes();
      console.log("Commande added successfully!");
    } catch (error) {
      console.error("Error adding commande:", error);
      swal.fire({
        icon: "error",
        title: "Error adding commande",
        text: "An error occurred while adding the commande. Please try again.",
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
          <table id="selectedProduitTable" className="swal2-input">
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
              {produits.map((produit) => (
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
                    <input
                      type="text"
                      id={`quantite_${produit.id}`}
                      className="quantiteInput"
                      placeholder="Quantite"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`prix_${produit.id}`}
                      className="prixInput"
                      placeholder="Prix"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="swal2-input" style={{ marginBottom: "20px" }}>
            <thead>
              <tr>
                <th>Client</th>
                {/* <th>User</th> */}
              </tr>
              <tr>
                <td>
                  <select id="client_id" className="swal2-input">
                    <option disabled selected>
                      Client
                    </option>
                    {clients.map((client) => (
                      <option key={client.id}>{client.raison_sociale}</option>
                    ))}
                  </select>
                </td>
                {/* <td>
                  <select id="user_id" className="swal2-input">
                    <option disabled selected>
                      User
                    </option>
                    {users.map((user) => (
                      <option key={user.id}>{user.name}</option>
                    ))}
                  </select>
                </td> */}
              </tr>
            </thead>
          </table>
          <div style={{ marginTop: "10px" }}>
            <Button variant="contained" onClick={handleAddCommande}>
              Ajouter
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default AddCommande;