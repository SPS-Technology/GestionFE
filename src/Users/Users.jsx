  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import Swal from "sweetalert2";
  import Navigation from "../Acceuil/Navigation";
  import { createTheme, ThemeProvider } from "@mui/material/styles";
  import Box from "@mui/material/Box";
  import { Toolbar } from "@mui/material";
  import Form from "react-bootstrap/Form";
  import Button from "react-bootstrap/Button";
  import { Link, useNavigate } from "react-router-dom";
  import { Modal } from "react-bootstrap";

  const Users = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const token = localStorage.getItem("API_TOKEN");
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({
      id: null,
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
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);

    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formContainerStyle, setFormContainerStyle] = useState({
      right: "-900px",
    });
    const [tableContainerStyle, setTableContainerStyle] = useState({
      marginRight: "0px",
    });
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

    const handlePermissionsModalOpen = () => {
      setShowPermissionsModal(true);
    };

    const handlePermissionsModalClose = () => {
      setShowPermissionsModal(false);
    };
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
      console.log("permissions", users);
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
        [e.target.name]:
          e.target.type === "file" ? e.target.files[0] : e.target.value,
      });
    };

    const handlePermissionChange = (e) => {
      const permission = e.target.value;
      if (selectedPermissions.includes(permission)) {
        setSelectedPermissions(
          selectedPermissions.filter((p) => p !== permission)
        );
      } else {
        setSelectedPermissions([...selectedPermissions, permission]);
      }
    };

    const handleFormSubmit = async (e) => {
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
        console.log(formData);

        const csrfToken = document.querySelector(
          'meta[name="csrf-token"]'
        ).content;

        let response;
        if (isEditing) {
          response = await axios.put(
            `http://localhost:8000/api/users/${user.id}`,
            formData,
            {
              headers: {
                "X-CSRF-TOKEN": csrfToken,
                "Content-Type": "multipart/form-data",
              },
              withCredentials: true,
            }
          );
        } else {
          response = await axios.post(
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
        }

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Utilisateur ajouté avec succès!",
            showConfirmButton: false,
            timer: 1500,
          });

          navigate("/users");

          setUser({
            id: null,
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
          setIsEditing(false);
          closeForm();
        } else {
          // Handle other response statuses if needed
        }
      } catch (error) {
        if (error.response) {
          const serverErrors = error.response.data.errors;

          if (error.response.status === 403) {
            Swal.fire({
              icon: "error",
              title: "Accès refusé",
              text: "Vous n'avez pas l'autorisation d'ajouter ou de modifier un utilisateur.",
            });
          } else {
            setErrors({
              name: serverErrors?.name?.[0] || "",
              email: serverErrors?.email?.[0] || "",
              role: serverErrors?.role?.[0] || "",
              photo: serverErrors?.photo?.[0] || "",
              password: serverErrors?.password?.[0] || "",
            });
          }
        } else if (error.request) {
          console.error(
            "Erreur lors de la communication avec le serveur :",
            error.request
          );
        } else {
          console.error(
            "Erreur lors de la configuration de la requête :",
            error.message
          );
        }
      }
    };
    const handleShowFormButtonClick = () => {
      if (formContainerStyle.right === "-900px") {
        setFormContainerStyle({ right: "0" });
        setTableContainerStyle({ marginRight: "300px" });
      } else {
        closeForm();
      }
    };
    
    const handleEditUser = (userData) => {
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        photo: userData.photo,
        password: userData.password,
        permissions: userData.permissions,
      });
      setIsEditing(true);
      handleShowFormButtonClick();
    };

    const closeForm = () => {
      setUser({
        id: null,
        name: "",
        email: "",
        role: "",
        photo: null,
        password: "",
      });
      setIsEditing(false);
      setFormContainerStyle({ right: "-900px" });
      setTableContainerStyle({ marginRight: "0" });
    };

    return (
      <ThemeProvider theme={createTheme()}>
        <Box sx={{ display: "flex" }}>
          <Navigation />
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
            <Toolbar />

            <Button
              variant="primary"
              className="col-2 btn btn-sm m-2"
              id="showFormButton"
              onClick={handleShowFormButtonClick}
            >
              {isEditing ? "Modifier Utilisateur" : "Ajouter Utilisateur"}{" "}
              <i className="fas fa-user-plus" aria-hidden="true"></i>
            </Button>
            <div id="formContainer" style={formContainerStyle}>
              <Form className="col row" onSubmit={handleFormSubmit}>
                <div>
                  <Form.Label className="text-center m-2">
                    {isEditing ? "Modifier Utilisateur" : "Ajouter Utilisateur"}
                  </Form.Label>
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
                    <Form.Text className="text-danger">
                      {errors.password}
                    </Form.Text>
                  </Form.Group>
                </div>
                <Button
                  variant="primary"
                  className="m-2"
                  onClick={handlePermissionsModalOpen}
                >
                  ajouter Permissions
                </Button>
                {/* <div style={{ marginBottom: "15px" }}>
                  <label style={{ marginRight: "10px" }}>Permissions:</label>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        value="view_all_products"
                        checked={selectedPermissions.includes(
                          "view_all_products"
                        )}
                        onChange={handlePermissionChange}
                      />
                      View All Products
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="create_product"
                        checked={selectedPermissions.includes("create_product")}
                        onChange={handlePermissionChange}
                      />
                      Create Product
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="edit_product"
                        checked={selectedPermissions.includes("edit_product")}
                        onChange={handlePermissionChange}
                      />
                      Edit Product
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="delete_product"
                        checked={selectedPermissions.includes("delete_product")}
                        onChange={handlePermissionChange}
                      />
                      Delete Product
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="view_all_fournisseurs"
                        checked={selectedPermissions.includes(
                          "view_all_fournisseurs"
                        )}
                        onChange={handlePermissionChange}
                      />
                      View All Fournisseur
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="create_fournisseurs"
                        checked={selectedPermissions.includes(
                          "create_fournisseurs"
                        )}
                        onChange={handlePermissionChange}
                      />
                      Create Fournisseur
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="update_fournisseurs"
                        checked={selectedPermissions.includes(
                          "update_fournisseurs"
                        )}
                        onChange={handlePermissionChange}
                      />
                      Edit Fournisseur
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="delete_fournisseurs"
                        checked={selectedPermissions.includes(
                          "delete_fournisseurs"
                        )}
                        onChange={handlePermissionChange}
                      />
                      Delete Fournisseur
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="view_all_clients"
                        checked={selectedPermissions.includes("view_all_clients")}
                        onChange={handlePermissionChange}
                      />
                      View All Clients
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="create_clients"
                        checked={selectedPermissions.includes("create_clients")}
                        onChange={handlePermissionChange}
                      />
                      Create Clients
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="update_clients"
                        checked={selectedPermissions.includes("update_clients")}
                        onChange={handlePermissionChange}
                      />
                      Edit Clients
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="delete_clients"
                        checked={selectedPermissions.includes("delete_clients")}
                        onChange={handlePermissionChange}
                      />
                      Delete Clients
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="view_all_users"
                        checked={selectedPermissions.includes("view_all_users")}
                        onChange={handlePermissionChange}
                      />
                      View All Users
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="create_user"
                        checked={selectedPermissions.includes("create_user")}
                        onChange={handlePermissionChange}
                      />
                      Create User
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="edit_user"
                        checked={selectedPermissions.includes("edit_user")}
                        onChange={handlePermissionChange}
                      />
                      Edit User
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="delete_user"
                        checked={selectedPermissions.includes("delete_user")}
                        onChange={handlePermissionChange}
                      />
                      Delete User
                    </label>
                  </div>
                </div> */}

                <Button variant="primary" type="submit">
                  {isEditing ? "Modifier" : "Ajouter"}
                </Button>
              </Form>
            </div>
            <div className="container" style={tableContainerStyle}>
              <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
                Gestion des utilisateurs
              </h2>
              <table
                className="table table-hover table-responsive"
                id="clientsTable"
              >
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
                        <td style={tableCellStyle}>{user.password}</td>{" "}
                        <td style={tableCellStyle}>
                          <Button
                            variant="warning"
                            onClick={() => handleEditUser(user)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() =>
                              window.confirm("Êtes-vous sûr ?") &&
                              handleDelete(user.id)
                            }
                          >
                            <i className="fas fa-minus-circle"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <Modal
              show={showPermissionsModal}
              onHide={handlePermissionsModalClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "150px",
              }}
            >
              <Modal.Header closeButton>
                <Modal.Title>Ajouter des Permissions</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group controlId="formPermissions">
                  <Form.Check
                    type="checkbox"
                    label="View All Products"
                    value="view_all_products"
                    checked={selectedPermissions.includes("view_all_products")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Create Product"
                    value="create_product"
                    checked={selectedPermissions.includes("create_product")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Edit Product"
                    value="edit_product"
                    checked={selectedPermissions.includes("edit_product")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Delete Product"
                    value="delete_product"
                    checked={selectedPermissions.includes("delete_product")}
                    onChange={handlePermissionChange}
                  />

                  <Form.Check
                    type="checkbox"
                    label="View All Fournisseurs"
                    value="view_all_fournisseurs"
                    checked={selectedPermissions.includes(
                      "view_all_fournisseurs"
                    )}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Create Fournisseur"
                    value="create_fournisseurs"
                    checked={selectedPermissions.includes("create_fournisseurs")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Update Fournisseur"
                    value="update_fournisseurs"
                    checked={selectedPermissions.includes("update_fournisseurs")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Delete Fournisseur"
                    value="delete_fournisseurs"
                    checked={selectedPermissions.includes("delete_fournisseurs")}
                    onChange={handlePermissionChange}
                  />

                  <Form.Check
                    type="checkbox"
                    label="View All Clients"
                    value="view_all_clients"
                    checked={selectedPermissions.includes("view_all_clients")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Create Clients"
                    value="create_clients"
                    checked={selectedPermissions.includes("create_clients")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Update Clients"
                    value="update_clients"
                    checked={selectedPermissions.includes("update_clients")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Delete Clients"
                    value="delete_clients"
                    checked={selectedPermissions.includes("delete_clients")}
                    onChange={handlePermissionChange}
                  />

                  <Form.Check
                    type="checkbox"
                    label="View All Users"
                    value="view_all_users"
                    checked={selectedPermissions.includes("view_all_users")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Create User"
                    value="create_user"
                    checked={selectedPermissions.includes("create_user")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Edit User"
                    value="edit_user"
                    checked={selectedPermissions.includes("edit_user")}
                    onChange={handlePermissionChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Delete User"
                    value="delete_user"
                    checked={selectedPermissions.includes("delete_user")}
                    onChange={handlePermissionChange}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handlePermissionsModalClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </Box>
        </Box>
      </ThemeProvider>
    );
  };

  export default Users;
