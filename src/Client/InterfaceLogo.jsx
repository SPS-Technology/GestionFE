  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import Navigation from "../Acceuil/Navigation";
  import { Toolbar } from "@mui/material";
  import { createTheme, ThemeProvider } from "@mui/material/styles";
  import Box from "@mui/material/Box";
  import PeopleIcon from "@mui/icons-material/People";
  import Card from "@mui/material/Card";
  import CardContent from "@mui/material/CardContent";
  import CardMedia from "@mui/material/CardMedia";
  import Typography from "@mui/material/Typography";
  import Button from "@mui/material/Button";
  import { Link } from "react-router-dom";

  const InterfaceLogo = () => {
    const [clients, setClients] = useState([]);

    useEffect(() => {
      // Charger les données des clients depuis votre API
      const fetchClients = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/clients'); 
          setClients(response.data.client);
        } catch (error) {
          console.error('Erreur lors du chargement des clients:', error);
        }
      };

      fetchClients();
    }, []);

    return (
      <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <Typography variant="h5" gutterBottom component="div" sx={{ color: "#A31818", display: "flex", alignItems: "center" }}>
            <PeopleIcon sx={{ fontSize: "24px", marginRight: "8px" }} />
            Liste des clients avec les logos 
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
            <div className="d-flex flex-row justify-content-start flex-wrap">
              {clients.map(client => (
                <Card key={client.id} sx={{ maxWidth: 300, marginBottom: "20px", marginRight: "20px", boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)" }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={client.logoC}
                    alt={client.raison_sociale}
                    sx={{ objectFit: 'cover', height: '140px' }} // Ajout des styles pour ajuster la taille de l'image
                  />
                  <CardContent sx={{ backgroundColor: "#f9f9f9" }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ color: "#333" }}>
                      {client.raison_sociale}
                    </Typography>
                    <Link to={`/clients/${client.id}/siteclients`}>
                      <Button variant="contained" sx={{ backgroundColor: "#A31818", color: "#fff" }}>Voir</Button>
                    </Link>
                    <Link to={`/clients/${client.id}/bonslivraison`}>
                    <Button variant="contained" sx={{ backgroundColor: "#A31818", color: "#fff" }}>Voir Bons Livraison</Button>
                  </Link>
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

export default InterfaceLogo; 