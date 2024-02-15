import React from 'react';
import Navbar from './Acceuil/Navbar';
import Footer from './Acceuil/Footer';
import FournisseurList from './Fournisseur/FournisseurList';


const App = () => {
  return (
    <div>
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <Footer />
          <div className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <FournisseurList />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
