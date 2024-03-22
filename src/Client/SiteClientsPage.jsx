import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Toolbar } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Navigation from "../Acceuil/Navigation";
import Swal from "sweetalert2";

const SiteClientsPage = () => {
  const [siteClients, setSiteClients] = useState([]);
  const { clientId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchSiteClients = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/clients/${clientId}/siteclients`
        );
        setSiteClients(response.data.siteClients);

        // Vérifier si aucun site client n'a été récupéré
        if (response.data.siteClients.length === 0) {
          // Afficher une boîte de dialogue SweetAlert
          Swal.fire({
            icon: "info",
            title: "Aucun site client trouvé",
            text: "Le client sélectionné n'a pas de site client associé.",
          });
          navigate("/clients_logo");
        }
       
      } catch (error) {
        console.error("Erreur lors du chargement des site clients:", error);
      }
    };

    fetchSiteClients();
  }, [clientId]);

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
        <Toolbar />
          <Typography variant="h5" gutterBottom component="div">
            Liste des site clients du client sélectionné
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <div className="site-clients">
              {siteClients.map((siteClient) => (
                <Card
                  key={siteClient.id}
                  sx={{
                    maxWidth: 300,
                    margin: "0 auto",
                    marginBottom: "20px",
                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={siteClient.logoSC}
                    alt={siteClient.raison_sociale}
                    sx={{ objectFit: "cover", height: "140px" }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {siteClient.raison_sociale}
                    </Typography>
                    <Typography variant="body1">
                      Adresse : {siteClient.adresse}
                    </Typography>
                    <Typography variant="body1">
                      Téléphone : {siteClient.tele}
                    </Typography>
                    <Typography variant="body1">
                      Ville : {siteClient.ville}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default SiteClientsPage;
