import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navigation from './Acceuil/Navigation';
import FournisseurList from './Fournisseur/FournisseurList';
import ClientList from './Client/ClientList';
import ProduitList from './Produit/ProduitList';
import Login from './Login/Login';
import CommandeList from './Commande/CommandeList';
import AddUser from './Users/Adduser';
import Users from './Users/Users';
import EditUser from './Users/EditUsers';
import Dashboard from './Acceuil/Dashboard';
import LivreurList from './Livreur/LivreurList';
import VehiculeList from './Vehicule/VehiculeList';
import ObjectifList from './objectif/ObjectifList';
import Vehicule_livreur from './Vehicule_Livreur/Vehicule_livreur';


const App = () => {
 
  return (
    <div>
    <AuthProvider>
      <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/fournisseurs" element={<FournisseurList />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/livreurs" element={<LivreurList />} />
        <Route path="/objectifs" element={<ObjectifList />} />
        <Route path="/vehicules" element={<VehiculeList />} />
        <Route path="/produits" element={<ProduitList />} />
        <Route path="/commandes" element={<CommandeList />} />
        <Route path="/vehicule-livreurs" element={<Vehicule_livreur />} />
        {/* <Route path="/add-user" element={<AddUser />} /> */}
        <Route path="/users" element={<Users />} />
        {/* <Route path="/users/edit/:id" element={<EditUser />} /> */}
      </Routes>
      </AuthProvider>
    </div>
  );
};

export default App;
