import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
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
import { Link } from "react-router-dom";
import "../style.css";

const Navigation = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const token = localStorage.getItem("API_TOKEN");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  const { logout } = useAuth();
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

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

  const handleLogoutClick = async () => {
    try {
      // Logout logic

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Logout successful!",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred during logout.",
      });
    }
  };

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        edge="start"
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={handleDrawerClose}
        classes={{
          paper: `custom-drawer-paper ${openDrawer ? 'nav-open' : ''}`,
        }}
      >
        <div className="drawer-header">
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <List>
          {user && (
            <ListItem button style={{ color: "blue" }}>
              <ListItemIcon>
                <Avatar
                  alt={user.name}
                  src={user.photo}
                  style={{ width: "40px", height: "40px" }}
                />
              </ListItemIcon>
              <ListItemText primary={`Hello, ${user.name}`} />
            </ListItem>
          )}
          <ListItem button component={Link} to="/" style={{ color: "blue" }}>
            <ListItemIcon>
              <ShoppingBasketIcon />
            </ListItemIcon>
            <ListItemText primary="Gestion commandes" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/fournisseurs"
            style={{ color: "blue" }}
          >
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText primary="Fournisseurs" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/clients"
            style={{ color: "blue" }}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Clients" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/produits"
            style={{ color: "blue" }}
          >
            <ListItemIcon>
              <AddCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Produits" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/commandes"
            style={{ color: "blue" }}
          >
            <ListItemIcon>
              <ShoppingBasketIcon />
            </ListItemIcon>
            <ListItemText primary="Gestion Commandes" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/add-user"
            style={{ color: "blue" }}
          >
            <ListItemIcon>
              <AddCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Ajouter utilisateur" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/users"
            style={{ color: "blue" }}
          >
            <ListItemIcon>
              <SupervisorAccountIcon />
            </ListItemIcon>
            <ListItemText primary="Gestion utilisateurs" />
          </ListItem>
        </List>
        <List>
          <ListItem
            button
            onClick={handleLogoutClick}
            style={{ color: "red", background: "white" }}
          >
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Se déconnecter" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navigation;
 