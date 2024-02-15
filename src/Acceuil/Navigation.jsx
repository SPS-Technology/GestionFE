// Navigation.js
import React from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
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
              <li className="nav-item">
                <a className="nav-link" href="/commands">
                  Commands
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
