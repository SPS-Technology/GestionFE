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
import PeopleIcon from "@mui/icons-material/People";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BarChartIcon from "@mui/icons-material/BarChart";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
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
  const [livreurs, setLivreurs] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [objectifs, setObjectifs] = useState([]);

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

      const livreursResponse = await axios.get(
        "http://localhost:8000/api/livreurs"
      );
      setLivreurs(livreursResponse.data.count);
      const vehiculeResponse = await axios.get(
        "http://localhost:8000/api/vehicules"
      );
      setVehicules(vehiculeResponse.data.count);
      const objectifrResponse = await axios.get(
        "http://localhost:8000/api/objectifs"
      );
      setObjectifs(objectifrResponse.data.count);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    Nombre de clients
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {clients}
                  </Typography>
                  <PeopleAltIcon style={{ fontSize: 40 }} color="primary" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    Nombre de produits
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {produits}
                  </Typography>
                  <ShoppingCartIcon style={{ fontSize: 40 }} color="primary" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    Nombre des fournisseurs
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {fournisseurs}
                  </Typography>
                  <LocalShippingIcon style={{ fontSize: 40 }} color="primary" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    Nombre de livreurs
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {livreurs}
                  </Typography>
                  <DeliveryDiningIcon
                    style={{ fontSize: 40 }}
                    color="primary"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    Nombre de véhicules
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {vehicules}
                  </Typography>
                  <DirectionsCarIcon style={{ fontSize: 40 }} color="primary" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    Nombre d'objectifs
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {objectifs}
                  </Typography>
                  <BarChartIcon style={{ fontSize: 40 }} color="primary" />
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
