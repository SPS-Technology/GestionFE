// Search.jsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const Search = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
      <Form inline>
        <Form.Control
            type="text"
            placeholder="Chercher"
            className="mr-sm-2"
            value={searchTerm}
            onChange={handleSearch}
            style={{ borderRadius: '20px' }} // Ajout du style pour les coins arrondis
        />
      </Form>

  );
};

export default Search;