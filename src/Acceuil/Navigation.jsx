import React, { useEffect, useState } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import MuiDrawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import MenuIcon from "@mui/icons-material/Menu";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import "../style.css";
import Avatar from "@mui/material/Avatar";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { Link, useNavigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Swal from "sweetalert2";
import StoreIcon from "@mui/icons-material/Store";
import { useAuth } from "../AuthContext";
const drawerWidth = 300;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
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
  backgroundColor: "white",
}));

const defaultTheme = createTheme();

const Navigation = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [open, setOpen] = React.useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const token = localStorage.getItem("API_TOKEN");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  const { logout } = useAuth();
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleOptionChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);

    // Redirect to the corresponding route based on the selected option
    if (selectedValue === "charging") {
      navigate("/chargingCommand"); // Replace with your actual route
    } else if (selectedValue === "preparing") {
      navigate("/preparingCommand"); // Replace with your actual route
    } else if (selectedValue === "list") {
      navigate("/commandes"); // Replace with your actual route
    }
  };
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
        <AppBar position="absolute" open={open}>
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
            ></Typography>
            <IconButton color="inherit">
              <Badge color="secondary">
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
              <ListItem button style={{ color: "black" }}>
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

            <ListItem
              button
              component={Link}
              to="/fournisseurs"
              style={{ color: "black" }}
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
              style={{ color: "black" }}
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
              style={{ color: "black" }}
            >
              <ListItemIcon>
                <AddCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Produits" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/stock"
              style={{ color: "black" }}
            >
              <ListItemIcon>
                <StoreIcon />
              </ListItemIcon>

              <ListItemText primary="Stock" />
            </ListItem>
            <ListItem button style={{ color: "black", display: "flex" }}>
              <ListItemIcon>
                <ShoppingBasketIcon />
              </ListItemIcon>

              <Select
                value={selectedOption}
                onChange={handleOptionChange}
                displayEmpty
                style={{
                  marginLeft: "-10px",
                  border: "none",
                  borderBottom: "none",
                  textDecoration: "none",
                }}
                variant="standard"
              >
                <MenuItem value="" disabled>
                  <ListItemText
                    primary="Gestion commandes"
                    style={{ marginLeft: "10px" }}
                  />
                </MenuItem>
                <MenuItem value="list">Liste des Commandes</MenuItem>
                <MenuItem value="charging">Chargement Commandes</MenuItem>
                <MenuItem value="preparing">Préparation Commandes</MenuItem>
              </Select>
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/devises"
              style={{ color: "black" }}
            >
              <ListItemIcon>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Devises" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/add-user"
              style={{ color: "black" }}
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
              style={{ color: "black" }}
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
      </Box>
    </ThemeProvider>
  );
};

export default Navigation;
