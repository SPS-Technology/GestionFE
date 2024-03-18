import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import axios from "axios";
import swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-dropdown-select";

const AddCommande = ({ produits, clients, csrfToken, fetchCommandes }) => {
  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProductCheckboxChange = (selectedOptions) => {
    const selectedProductIds = selectedOptions.map((option) => option.value);

    const updatedSelectedProducts = produits
        .map((produit) => ({
          ...produit,
          prix: produit.prix_vente, // Initialize prix with prix_vente
        }))
        .filter((produit) => selectedProductIds.includes(produit.id));

    setSelectedProducts(updatedSelectedProducts);
    console.log("selectedProducts :", selectedProducts);
  };
  const handlePrixChange = (productId, newPrix) => {
    setSelectedProducts((prevSelectedProducts) =>
        prevSelectedProducts.map((produit) =>
            produit.id === productId ? { ...produit, prix: newPrix } : produit
        )
    );
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

      const authenticatedUserId = userResponse.data[0].id;
      console.log("auth user", authenticatedUserId);
      const commandeResponse = await axios.post(
          "http://localhost:8000/api/commandes",
          {
            client_id: findClientId(getElementValueById("client_id")),
            mode_payement: getElementValueById("modePaiement"),
            user_id: authenticatedUserId,
            dateCommande: getElementValueById("dateCommande"),
          },
          {
            withCredentials: true,
            headers: {
              "X-CSRF-TOKEN": csrfToken,
            },
          }
      );

      console.log(commandeResponse);
      const selectedProductsData = selectedProducts.map((selectedProduct) => {
        return {
          commande_id: commandeResponse.data.commande.id,
          produit_id: selectedProduct.id,

          quantite: getElementValueById(`quantite_${selectedProduct.id}`),
          prix_unitaire: getElementValueById(`prix_${selectedProduct.id}`),
        };
      });
      console.log("selectProducts", selectedProducts);

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
        status: "EN COURS",
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
        title: "Commande ajoutée avec succès!",
        showConfirmButton: false,
        timer: 1500,
      });
      setSelectedProducts([]);
      handleDrawerClose();
      fetchCommandes();
      console.log("Commande ajoutée avec succès!");
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

  return (
      <div>
        <Button
            variant="contained"
            onClick={handleDrawerOpen}

            style={{ marginBottom: "10px", backgroundColor: 'white', color: 'black' }}

        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />

        </Button>
        <Drawer anchor="right" open={open} onClose={handleDrawerClose}>
          <div style={{ padding: "20px", marginTop: "100px" }}>
            <table className="swal2-input">
              <thead>
              <tr>
                <th>Client : </th>

                <th>Mode Paiement :</th>
                <th>Date Commande : </th>
                <th>Produit : </th>
              </tr>
              <tr>
                <td>
                  <select id="client_id" className="form-select col-2">
                    <option disabled selected>
                      Client
                    </option>
                    {clients.map((client) => (
                        <option key={client.id}>{client.raison_sociale}</option>
                    ))}
                  </select>
                </td>

                <td>
                  <select id={`modePaiement`} className="form-select col-2">
                    <option disabled selected>
                      Mode de Paiement
                    </option>
                    <option value="Espece">Espece</option>
                    <option value="Tpe">Tpe</option>
                    <option value="Virement">Cheque</option>
                    {/* Add more payment types as needed */}
                  </select>
                </td>
                <td>
                  <input type="date" id={`dateCommande`} />
                </td>
                <td>
                  <Select
                      options={produits.map((produit) => ({
                        value: produit.id,
                        label: produit.designation,
                      }))}
                      onChange={handleProductCheckboxChange}
                      multi
                  />
                </td>
              </tr>
              </thead>
            </table>
            <table
                id="selectedProduitTable"
                className="swal2-input table table-hover"
            >
              <thead>
              <tr>
                <th>Code Produit</th>
                <th>designation</th>
                <th>Type Quantite</th>
                <th>Calibre</th>
                <th>Quantite</th>
                <th>Prix</th>
              </tr>
              </thead>
              <tbody>
              {selectedProducts.map((produit) => (
                  <tr key={produit.id}>
                    <td>{produit.Code_produit}</td>
                    <td>{produit.designation}</td>
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
                          value={produit.prix}
                          className="prixInput"
                          placeholder="Prix"
                          onChange={(e) =>
                              handlePrixChange(produit.id, e.target.value)
                          }
                      />
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
            <div className="text-center">
              <Button
                  variant="contained"
                  className="col-3"
                  onClick={handleAddCommande}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </Drawer>
      </div>
  );
};

export default AddCommande;