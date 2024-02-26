import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import "./styles.css";
const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

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
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div>
      <div className="dashboard">
        <h3>Dashboard</h3>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
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
            <Card style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
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
            <Card style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
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
        </Grid>
      </div>
    </div>
  );
};

export default Dashboard;