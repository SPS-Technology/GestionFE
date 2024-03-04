import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Card from "@mui/material/Card";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import MapIcon from '@mui/icons-material/Map';
import "../style.css";
import Navigation from "./Navigation";
import { Toolbar } from "@mui/material";
import { Container } from "@mui/system";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [zones, setZones] = useState([]);
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchCounts = async () => {
    try {
      const clientResponse = await axios.get(
        "http://localhost:8000/api/clients"
      );
      setClients(clientResponse.data.count);

      const produitResponse = await axios.get(
        "http://localhost:8000/api/produits"
      );
      setProduits(produitResponse.data.count);

      const fournisseurResponse = await axios.get(
        "http://localhost:8000/api/fournisseurs"
      );
      setFournisseurs(fournisseurResponse.data.count);

      const zoneResponse = await axios.get(
        "http://localhost:8000/api/zones"
      );
      setZones(zoneResponse.data.count);
      const commandeResponse = await axios.get(
        "http://localhost:8000/api/commandes"
      );
      setCommandes(commandeResponse.data.count);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: 'flex' }}>
        <Navigation />
        
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Clients <PeopleAltIcon style={{ fontSize: 40 }} color="primary" />
                </Typography>
                <Typography variant="h4" color="primary">
                  {clients}
                </Typography>
                
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Produits <ShoppingCartIcon style={{ fontSize: 40 }} color="primary" />
                </Typography>
                <Typography variant="h4" color="primary">
                  {produits} 
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                Fournisseurs <LocalShippingIcon style={{ fontSize: 40 }} color="primary" />
                </Typography>
                <Typography variant="h4" color="primary">
                  {fournisseurs}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Zones <MapIcon style={{ fontSize: 40 }} color="primary" />
                </Typography>
                <Typography variant="h4" color="primary">
                  {zones}
                </Typography>           
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Commandes <ShoppingCartCheckoutIcon style={{ fontSize: 40 }} color="primary" />
                </Typography>
                <Typography variant="h4" color="primary">
                {commandes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      </Box>
    </ThemeProvider>
 
  );
};

export default Dashboard;
