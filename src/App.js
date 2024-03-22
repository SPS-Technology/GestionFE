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
import LivraisonList from './Livraison/LivraisonList';
import FactureList from './Facture/FactureList';
import DevisList from './Devis/DevisList';
import StockList from './Stock/StockList';
import PrepareCommande from './Commande/PrepareCommande';
import ChargeCommande from './Commande/ChargeCommade';
import InterfaceLogo from './Client/InterfaceLogo';
import SiteClientsPage from './Client/SiteClientsPage';
import BonLivraisonInfo from './Client/BonLivraisonInfo ';


const App = () => {
 
  return (
    <div>
    <AuthProvider>
      <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/fournisseurs" element={<FournisseurList />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients_logo" element={<InterfaceLogo />} />
        <Route path="/clients/:clientId/siteclients" element={<SiteClientsPage />} />
        <Route path="/clients/:clientId/bonslivraison" element={<BonLivraisonInfo />} />
        <Route path="/livreurs" element={<LivreurList />} />
        <Route path="/objectifs" element={<ObjectifList />} />
        <Route path="/vehicules" element={<VehiculeList />} />
        <Route path="/produits" element={<ProduitList />} />
        <Route path="/stock" element={<StockList />} />
        <Route path="/preparingCommand" element={<PrepareCommande />} />
        <Route path="/chargingCommand" element={<ChargeCommande />} />
        <Route path="/livraisons" element={<LivraisonList />} />
        <Route path="/devis" element={<DevisList />} />
        <Route path="/factures" element={<FactureList />} />
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
