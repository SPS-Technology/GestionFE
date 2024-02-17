// Navigation.js
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
// import handleLogout from "../Auth/handleLogout";
import { useAuth } from "../AuthContext";
const Navigation = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const token = localStorage.getItem("API_TOKEN");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  const [user,setUser]=useState();
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
        withCredentials: true,});
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
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/">
            Gestion de Commandes
          </a>
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
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              
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
                color: "red",
                fontFamily: "monospace",
              }}
              onClick={() => {
                handleLogoutClick();
                logout();
              }}
            >
              <i className="fas fa-sign-out-alt" aria-hidden="true" /> Se déconnecter
            </button>
          </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
