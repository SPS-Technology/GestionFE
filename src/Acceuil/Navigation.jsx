import React, { useEffect, useState } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import MuiDrawer from "@mui/material/Drawer";
import ReportTwoToneIcon from '@mui/icons-material/ReportTwoTone';
import AttachMoneyTwoToneIcon from '@mui/icons-material/AttachMoneyTwoTone';
import AccountBalanceWalletTwoToneIcon from '@mui/icons-material/AccountBalanceWalletTwoTone';
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceTwoToneIcon from '@mui/icons-material/AccountBalanceTwoTone';
import { GiBank } from "react-icons/gi";

import PeopleIcon from "@mui/icons-material/People";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { Link } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: "grey",
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const defaultTheme = createTheme();

const Navigation = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [open, setOpen] = React.useState(true);
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

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open} className="beige-appbar">
          <Toolbar
            sx={{
              pr: "24px",
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >

            </Typography>
            <IconButton color="inherit">
              <Badge  color="secondary">
                {user && (
                  <ListItem button style={{ color: "white" }}>
                    <ListItemIcon>
                      <Avatar
                        alt={user.name}
                        src={user.photo}
                        style={{ width: "40px", height: "40px" }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={`${user.name}`} />
                  </ListItem>
                )}
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List>
            {user && (
              <ListItem button style={{ color: "blue" }}>
                {/*<ListItemIcon>*/}
                {/*  <Avatar*/}
                {/*    alt={user.name}*/}
                {/*    src={user.photo}*/}
                {/*    style={{ width: "40px", height: "40px" }}*/}
                {/*  />*/}
                {/*</ListItemIcon>*/}
                <ListItemText primary={``} />
              </ListItem>
            )}
            <ListItem button component={Link} to="/" style={{  color: "grey" }}>
              <ListItemIcon>
                <ShoppingBasketIcon  />
              </ListItemIcon>
              <ListItemText primary="Accueil" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/fournisseurs"
              style={{ color: "grey" }}
            >
              <ListItemIcon>
                <BusinessIcon   />
              </ListItemIcon>
              <ListItemText primary="Fournisseurs" />
            </ListItem>
            <ListItem
                button
                component={Link}
                to="/recouverements"
                style={{ color: "grey" }}
            >
              <ListItemIcon>
                <AccountBalanceWalletTwoToneIcon   />
              </ListItemIcon>
              <ListItemText primary="Recouvrements" />
            </ListItem>
            <ListItem
                button
                component={Link}
                to="/chiffreaffaires"
                style={{ color: "grey" }}
            >
              <ListItemIcon>
                <AttachMoneyTwoToneIcon   />
              </ListItemIcon>
              <ListItemText primary="Chiffre d'Affaire" />
            </ListItem>
            <ListItem
                button
                component={Link}
                to="/reclamations"
                style={{ color: "grey" }}
            >
              <ListItemIcon>
                <ReportTwoToneIcon   />
              </ListItemIcon>
              <ListItemText primary="Réclamation" />
            </ListItem>
            <ListItem
                button
                component={Link}
                to="/comptes"
                style={{ color: "grey" }}
            >
              <ListItemIcon>
                <ReportTwoToneIcon   />
              </ListItemIcon>
              <ListItemText primary="Compte" />
            </ListItem>
            <ListItem
                button
                component={Link}
                to="/encaissements"
                style={{ color: "grey" }}
            >
              <ListItemIcon>
                <ReportTwoToneIcon   />
              </ListItemIcon>
              <ListItemText primary="Encaissement" />
            </ListItem>
            <ListItem
                button
                component={Link}
                to="/banques"
                style={{ color: "grey" }}
            >
              <ListItemIcon>
                <AccountBalanceTwoToneIcon />

              </ListItemIcon>
              <ListItemText primary="Banque" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/clients"
              style={{ color: "grey" }}
            >
              <ListItemIcon>
                <PeopleIcon   />
              </ListItemIcon>
              <ListItemText primary="Clients" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/produits"
              style={{ color: "grey" }}
            >
              <ListItemIcon>
                <AddCircleIcon  />
              </ListItemIcon>
              <ListItemText primary="Produits" />
            </ListItem>
            <ListItem
                button
                component={Link}
                to="/devis"
                style={{ color: "grey" }}
            >
              <ListItemIcon>
                <AddCircleIcon  />
              </ListItemIcon>
              <ListItemText primary="Devis" />
            </ListItem>
            <ListItem
                button
                component={Link}
                to="/factures"
                style={{ color: "grey" }}
            >
              <ListItemIcon>
                <AddCircleIcon  />
              </ListItemIcon>
              <ListItemText primary="Facture" />
            </ListItem>
            <ListItem
                button
                component={Link}
                to="/livraisons"
                style={{ color: "grey" }}
            >
              <ListItemIcon>
                <AddCircleIcon  />
              </ListItemIcon>
              <ListItemText primary="Livraison" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/commandes"
              style={{ color: "grey" }}
            >
              <ListItemIcon>
                <ShoppingBasketIcon />
              </ListItemIcon>
              <ListItemText primary="Gestion Commandes" />
            </ListItem>
            {/*<ListItem*/}
            {/*  button*/}
            {/*  component={Link}*/}
            {/*  to="/add-user"*/}
            {/*  style={{ color: "grey" }}*/}
            {/*>*/}
            {/*  <ListItemIcon>*/}
            {/*    <AddCircleIcon  />*/}
            {/*  </ListItemIcon>*/}
            {/*  <ListItemText primary="Ajouter utilisateur" />*/}
            {/*</ListItem>*/}
            <ListItem
              button
              component={Link}
              to="/users"
              style={{ color: "grey" }}
            >
              <ListItemIcon>
                <SupervisorAccountIcon  />
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
                <ExitToAppIcon  style={{ color:"red"}} />
              </ListItemIcon>
              <ListItemText primary="Se déconnecter" />
            </ListItem>
          </List>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
};

export default Navigation;
