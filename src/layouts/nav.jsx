// Navigation.js
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Avatar from "@mui/material/Avatar";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { Menu, MenuItem } from "@mui/material";
// import handleLogout from "../Auth/handleLogout";
import { useAuth } from "../AuthContext";
const Navigation = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const token = localStorage.getItem("API_TOKEN");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  const [user, setUser] = useState();
  const { logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/user", {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const handleLogoutClick = async () => {
    try {
      // Votre logique de déconnexion ici

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Déconnexion réussie!",
      });
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);

      // Notification d'erreur
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur s'est produite lors de la déconnexion.",
      });
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container ">
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse " id="navbarNav">
            <ul className="navbar-nav ml-auto">

            <Link to="/commandes" className="navbar-brand">
              Gestion de Commandes
            </Link>
              <Link to="/fournisseurs" className="navbar-brand">
                Fournisseurs
              </Link>
              <Link to="/clients" className="navbar-brand">
                Clients
              </Link>
              <Link to="/produits" className="navbar-brand">
                Produits
              </Link>

            </ul>
            <div>
              <button
                style={{
                  background: "none",
                  textDecoration: "none",
                  border: 0,
                  color: "white",
                  fontFamily: "monospace",
                  
                }}
                onClick={() => {
                  handleLogoutClick();
                  logout();
                }}
              >
                <i className="fas fa-sign-out-alt" aria-hidden="true" /> déconnecter
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
