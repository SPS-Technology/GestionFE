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
import RecouverementList from "./etat de recouvrement/RecouverementList";
import ChiffreAffaireList from "./Chiffre D'Affaire/ChiffreAffaireList";
import ReclamationList from "./Reclamations/ReclamationList";
import BanqueList from "./Banques/BanqueList";


const App = () => {

  return (
    <div>
    <AuthProvider>
      <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/fournisseurs" element={<FournisseurList />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/produits" element={<ProduitList />} />
        <Route path="/commandes" element={<CommandeList />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/edit/:id" element={<EditUser />} />
        <Route path="/recouverements" element={<RecouverementList />} />
        <Route path="/chiffreaffaires" element={<ChiffreAffaireList/>}/>
        <Route path="/reclamations" element={<ReclamationList/>}/>
        <Route path="/banques" element={<BanqueList/>}/>
      </Routes>
      </AuthProvider>
    </div>
  );
};

export default App;
