import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navigation from "../Acceuil/Navigation";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from "react-router-dom";


const Users = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const token = localStorage.getItem("API_TOKEN");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    photo: null,
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    role: "",
    photo: "",
    password: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("products");


  const [formContainerStyle, setFormContainerStyle] = useState({ right: '-900px' });
  const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: '0px' });

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


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/users", {
        withCredentials: true,
      });
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
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response && error.response.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Accès refusé",
          text: "Vous n'avez pas l'autorisation de supprimer cet utilisateur.",
        });
      }
    }
  };

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.type === "file" ? e.target.files[0] : e.target.value,
    });
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const getPermissionsForCategory = () => {
    switch (selectedCategory) {
      case "products":
        return ["view_all_products", "create_product", "edit_product", "delete_product"];
      case "fournisseurs":
        return ["view_all_fournisseurs", "create_fournisseurs", "update_fournisseurs", "delete_fournisseurs"];
      case "clients":
        return ["view_all_clients", "create_clients", "update_clients", "delete_clients"];
      case "users":
        return ["view_all_users", "create_user", "edit_user", "delete_user"];
      default:
        return [];
    }
  };

  const handlePermissionChange = (event) => {
    const permissionsForCategory = getPermissionsForCategory();
    const permission = event.target.value;

    if (permissionsForCategory.includes(permission)) {
      if (selectedPermissions.includes(permission)) {
        setSelectedPermissions(selectedPermissions.filter((p) => p !== permission));
      } else {
        setSelectedPermissions([...selectedPermissions, permission]);
      }
    } else {
      // Handle the case where the permission is not valid for the selected category
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("role", user.role);
      formData.append("password", user.password);
      formData.append("photo", user.photo);

      selectedPermissions.forEach((permission) => {
        formData.append("permissions[]", permission);
      });

      const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

      const response = await axios.post(
        "http://localhost:8000/api/register",
        formData,
        {
          headers: {
            "X-CSRF-TOKEN": csrfToken,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Utilisateur ajouté avec succès!",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/users");

      setUser({
        name: "",
        email: "",
        role: "",
        photo: null,
        password: "",
      });
      setErrors({
        name: "",
        email: "",
        role: "",
        photo: "",
        password: "",
      });
      setSelectedPermissions([]);
    } catch (error) {
      if (error.response) {
        const serverErrors = error.response.data.errors;

        if (error.response.status === 403) {
          Swal.fire({
            icon: "error",
            title: "Accès refusé",
            text: "Vous n'avez pas l'autorisation d'ajouter un utilisateur.",
          });
        } else {
          console.log("Server Validation Errors:", serverErrors);
          setErrors({
            name: serverErrors?.name?.[0] || "",
            email: serverErrors?.email?.[0] || "",
            role: serverErrors?.role?.[0] || "",
            photo: serverErrors?.photo?.[0] || "",
            password: serverErrors?.password?.[0] || "",
          });
        }
      } else if (error.request) {
        console.error("Erreur lors de la communication avec le serveur :", error.request);
      } else {
        console.error("Erreur lors de la configuration de la requête :", error.message);
      }
    }
  };
  const handleShowFormButtonClick = () => {
    if (formContainerStyle.right === '-900px') {
      setFormContainerStyle({ right: '0' });
      setTableContainerStyle({ marginRight: '300px' });
    } else {
      closeForm();
    }
  };
  const closeForm = () => {
    setFormContainerStyle({ right: '-900px' });
    setTableContainerStyle({ marginRight: '0' });
  };


  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: 'flex' }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          {/* Add User Form */}
          <Button variant="primary" className="col-2 btn btn-sm m-2" id="showFormButton" onClick={handleShowFormButtonClick}>
            add User <i className="fas fa-user-plus" aria-hidden="true"></i>
          </Button>
          <div id="formContainer" style={formContainerStyle}>
            <Form className="col row" onSubmit={handleAddUser}>
            <div className="col-6" >
            <Form.Label className="text-center m-2">Add Utilisateur</Form.Label>
              <Form.Group className="col-sm m-2" controlId="formName">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  placeholder="Entrez le nom"
                />
                <Form.Text className="text-danger">{errors.name}</Form.Text>
              </Form.Group>
              <Form.Group className="col-sm m-2 " controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Entrez l'email"
                />
                <Form.Text className="text-danger">{errors.email}</Form.Text>
              </Form.Group>
              <Form.Group className="col-sm m-2 " controlId="formRole">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  type="text"
                  name="role"
                  value={user.role}
                  onChange={handleChange}
                  placeholder="Entrez le rôle"
                />
                <Form.Text className="text-danger">{errors.role}</Form.Text>
              </Form.Group>
              <Form.Group className="col-sm m-2 " controlId="formPhoto">
                <Form.Label>Photo</Form.Label>
                <Form.Control
                  type="file"
                  name="photo"
                  onChange={handleChange}
                />
                <Form.Text className="text-danger">{errors.photo}</Form.Text>
              </Form.Group>
              <Form.Group className="col-sm m-2 " controlId="formPassword">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Entrez le mot de passe"
                />
                <Form.Text className="text-danger">{errors.password}</Form.Text>
              </Form.Group>
              </div>
              <div className="col-6 mt-5" >
              <Form.Group className="m-2" controlId="formCategory">
                <Form.Label>Catégorie</Form.Label>
                <Form.Select value={selectedCategory} onChange={handleCategoryChange}>
                  <option value="products">Produits</option>
                  <option value="fournisseurs">Fournisseurs</option>
                  <option value="clients">Clients</option>
                  <option value="users">Utilisateurs</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="m-2" controlId="formPermissions">
                <Form.Label>Permissions</Form.Label>
                {getPermissionsForCategory().map((permission) => (
                  <Form.Check
                    key={permission}
                    type="checkbox"
                    label={permission.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                    value={permission}
                    checked={selectedPermissions.includes(permission)}
                    onChange={handlePermissionChange}
                  />
                ))}
              </Form.Group>
              </div>
              <Button variant="primary" type="submit">
                Ajouter
              </Button>
            </Form>
            </div>
          {/* Users Table */}
          <div className="container" style={tableContainerStyle}>
            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
              Gestion des utilisateurs
            </h2>
            <table className="table table-hover table-responsive" id="clientsTable">
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

export default Users;
