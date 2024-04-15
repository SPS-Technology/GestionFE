import React, { useState, useEffect } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Navigation from "../Acceuil/Navigation";
import { Toolbar } from "@mui/material";

const Details = () => {
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:8000/api/commandes"),
      axios.get("http://localhost:8000/api/produits"),
    ])
      .then(([commandesResponse, produitsResponse]) => {
        setCommandes(commandesResponse.data.commandes);
        setProduits(produitsResponse.data.produit);
        console.log(commandesResponse.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box
          component="main"
          sx={{ display: "flex", flexGrow: 1, p: 3, mt: 4 }}
        >
          <Box sx={{ flex: 1 }}>
            <Toolbar />
            <h2>Liste des commandes</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }} className="responsive">
              <thead>
                <tr>
                  <th style={{ border: "1px solid #dddddd", padding: "8px" }}>
                    Reference
                  </th>
                  <th style={{ border: "1px solid #dddddd", padding: "8px" }}>
                    Date de saisie
                  </th>
                  <th style={{ border: "1px solid #dddddd", padding: "8px" }}>
                    Date de commande
                  </th>
                  <th style={{ border: "1px solid #dddddd", padding: "8px" }}>
                    Mode de paiement
                  </th>
                  <th style={{ border: "1px solid #dddddd", padding: "8px" }}>
                    Status
                  </th>
                  <th style={{ border: "1px solid #dddddd", padding: "8px" }}>
                    Client
                  </th>
                  {produits.map((produit, index) => (
                    <React.Fragment key={index}>
                      <th
                        style={{ border: "1px solid #dddddd", padding: "8px" }}
                      >
                        {produit.designation} {" "} {produit.calibre.calibre}
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody>
                {commandes.map((commande) => (
                  <tr key={commande.id}>
                    <td style={{ border: "1px solid #dddddd", padding: "8px" }}>
                      {commande.reference}
                    </td>
                    <td style={{ border: "1px solid #dddddd", padding: "8px" }}>
                      {commande.dateSaisis}
                    </td>
                    <td style={{ border: "1px solid #dddddd", padding: "8px" }}>
                      {commande.dateCommande}
                    </td>
                    <td style={{ border: "1px solid #dddddd", padding: "8px" }}>
                      {commande.mode_payement}
                    </td>
                    <td style={{ border: "1px solid #dddddd", padding: "8px" }}>
                      {commande.status}
                    </td>
                    <td style={{ border: "1px solid #dddddd", padding: "8px" }}>
                      {commande.client.CodeClient} {" "}
                      {commande.client.raison_sociale}
                    </td>
                    {produits.map((produit, index) => {
                      const ligneCommande = commande.ligne_commandes.find(
                        (ligne) => ligne.produit_id === produit.id
                      );
                      const quantite = ligneCommande
                        ? ligneCommande.quantite
                        : null;
                      return (
                        <React.Fragment key={index}>
                          <td
                            style={{
                              border: "1px solid #dddddd",
                              padding: "8px",
                            }}
                          >
                            {quantite}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Details;
