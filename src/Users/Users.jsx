// Users.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../Acceuil/Navigation";
import Swal from "sweetalert2";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
const Users = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const token = localStorage.getItem("API_TOKEN");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/users", {
        withCredentials: true,
      });
      console.log(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response && error.response.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Accès refusé",
          text: "Vous n'avez pas l'autorisation de voir la liste des clients.",
        });
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/users/${id}`, {
        withCredentials: true,
      });
      console.log("User deleted successfully");
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response && error.response.status === 403) {
        // User doesn't have access to delete
        Swal.fire({
          icon: "error",
          title: "Accès refusé",
          text: "Vous n'avez pas l'autorisation de supprimer cet utilisateur.",
        });
      }
    }
  };

  return (
    <ThemeProvider theme={createTheme()}>
    <Box sx={{ display: 'flex' }}>
      <Navigation />
      <Box component="main"  sx={{ flexGrow: 1, p: 3, mt: 4 }}>
        <Toolbar />
      <div className="container">
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Gestion des utilisateurs
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Role</th>
              <th style={tableHeaderStyle}>Photo</th>
              <th style={tableHeaderStyle}>Password</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map((user) => (
                <tr key={user.id}>
                  <td style={tableCellStyle}>{user.name}</td>
                  <td style={tableCellStyle}>{user.email}</td>
                  <td style={tableCellStyle}>
                    {user.roles.length > 0 ? user.roles[0].name : "No Role"}
                  </td>
                  <td style={tableCellStyle}>
                    {user.photo && (
                      <img
                        src={user.photo}
                        alt="Photo de l'utilisateur"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </td>
                  <td style={tableCellStyle}>{user.password}</td>
                  <td style={tableCellStyle}>
                    <Link
                      to={`/users/edit/${user.id}`}
                      className="btn btn-warning"
                    >
                      <i className="fas fa-edit" aria-hidden="true"></i>
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        window.confirm("vous êtes sûr ?") &&
                        handleDelete(user.id)
                      }
                    >
                      <i className="fas fa-minus-circle" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      </Box>
      </Box>
    </ThemeProvider>
  );
};

const tableHeaderStyle = {
  background: "#f2f2f2",
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
};

export default Users;
