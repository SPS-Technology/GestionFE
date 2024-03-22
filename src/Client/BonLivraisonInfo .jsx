import React, { useState, useEffect } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/system";
import Navigation from "../Acceuil/Navigation";
import { Toolbar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
    
const BonLivraisonInfo = () => {
  const [bonLivraison, setBonLivraison] = useState(null);
  const { clientId } = useParams();

  useEffect(() => {
    const fetchBonLivraison = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/clients/${clientId}/bonslivraison`
        );
        setBonLivraison(response.data.bonsLivraison);
        console.log(response.data.bonsLivraison);
      } catch (error) {
        console.error("Error fetching bon de livraison:", error);
      }
    };

    fetchBonLivraison();
  }, [clientId]);

  // Render bon de livraison information in a table
  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Date</th>
                <th>Référence BC</th>
              </tr>
            </thead>
            <tbody>
              {bonLivraison &&
                bonLivraison.map((livraison) => (
                  <tr key={livraison.id}>
                    <td>{livraison.reference}</td>
                    <td>{livraison.date}</td>
                    <td>{livraison.ref_BC}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default BonLivraisonInfo;
