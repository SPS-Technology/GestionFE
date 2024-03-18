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
  const [selectAll, setSelectAll] = useState(false);

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
    role: "",
    photo: "",
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
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedPermissions([
        "view_all_products",
        "create_product",
        "edit_product",
        "delete_product",
        "view_all_fournisseurs",
        "create_fournisseurs",
        "update_fournisseurs",
        "delete_fournisseurs",
        "view_all_clients",
        "create_clients",
        "update_clients",
        "delete_clients",
        "view_all_users",
        "create_user",
        "edit_user",
        "delete_user",
      ]);
    } else {
      setSelectedPermissions([]);
    }
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
          text: "Vous n'avez pas l'autorisation de voir la liste des utilisateurs.",
        });
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // const handleDelete = async (id) => {

  //   try {
  //     await axios.delete(`http://localhost:8000/api/users/${id}`, {
  //       withCredentials: true,
  //     });
  //     setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  //   } catch (error) {
  //     console.error("Error deleting user:", error);
  //     if (error.response && error.response.status === 403) {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Accès refusé",
  //         text: "Vous n'avez pas l'autorisation de supprimer cet utilisateur.",
  //       });
  //     }
  //   }
  // };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer cet user ?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Oui",
      denyButtonText: "Non",
      customClass: {
        actions: "my-actions",
        cancelButton: "order-1 right-gap",
        confirmButton: "order-2",
        denyButton: "order-3",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8000/api/users/${id}`)
          .then((response) => {
            fetchUsers();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Utilisateur supprimé avec succès.",
            });
          })
          .catch((error) => {
            console.error("Error deleting user:", error);
            if (error.response && error.response.status === 403) {
              Swal.fire({
                icon: "error",
                title: "Accès refusé",
                text: "Vous n'avez pas l'autorisation de supprimer cet utlisateur.",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression du user.",
              });
            }
          });
      } else {
        console.log("Suppression annulée");
      }
    });
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

  const handleEditUser = (userData) => {
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.roles[0].name,
      photo: userData.photo,
      password: userData.password,
      permissions: userData.roles[0].permissions.map(
        (permission) => permission.name
      ),
    });
    setSelectedPermissions(
      userData.roles[0].permissions.map((permission) => permission.name)
    );
    setIsEditing(true);
    handleShowFormButtonClick();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const userData = {
        name: user.name,
        email: user.email,
        role: user.role,
        // photo:user.photo,
        password: user.password,
        permissions: selectedPermissions,
      };

      const csrfToken = document.querySelector(
        'meta[name="csrf-token"]'
      ).content;

      let response;

      if (isEditing) {
        response = await axios.put(
          `http://localhost:8000/api/users/${user.id}`,
          userData,
          {
            withCredentials: true,
            headers: {
              "X-CSRF-TOKEN": csrfToken,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        const formData = new FormData();
        formData.append("name", user.name);
        formData.append("email", user.email);
        formData.append("role", user.role);
        formData.append("password", user.password);
        selectedPermissions.forEach((permission) => {
          formData.append("permissions[]", permission);
        });

        if (user.photo) {
          formData.append("photo", user.photo);
        }

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
        let successMessage = "Utilisateur ajouté avec succès!";

        if (isEditing) {
          successMessage = "Utilisateur modifié avec succès!";
        }

        Swal.fire({
          icon: "success",
          title: successMessage,
          showConfirmButton: false,
          timer: 1500,
        });

        fetchUsers();

        setUser({
          id: null,
          name: "",
          email: "",
          role: "",
          photo: "null",
          password: "",
          permission: "",
        });

        setErrors({
          name: "",
          email: "",
          role: "",
          photo: "",
          password: "",
          permission: "",
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
          let errorMessage = "Vous n'avez pas l'autorisation ";

          if (isEditing) {
            errorMessage += "de modifier un utilisateur.";
          } else {
            errorMessage += "d'ajouter un utilisateur.";
          }

          Swal.fire({
            icon: "error",
            title: "Accès refusé",
            text: errorMessage,
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

  const closeForm = () => {
    setSelectedPermissions([]);
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
      permission: "",
    });
    setIsEditing(false);
    setFormContainerStyle({ right: "-900px" });
    setTableContainerStyle({ marginRight: "0" });
  };

  const renderPermissionsCheckbox = (value, label) => (
    <Form.Check
      type="checkbox"
      label={label}
      value={value}
      checked={selectedPermissions.includes(value)}
      onChange={handlePermissionChange}
    />
  );

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <div className="container-d-flex justify-content-start">
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
                  <Button
                    onClick={handlePermissionsModalOpen}
                    style={{
                      backgroundColor: "transparent",
                      color: "black",
                      marginTop: "24px",
                      border: "none",
                      marginLeft: "339px",
                    }}
                  >
                    <i style={{ fontSize: "24px" }} className="fas fa-key"></i>
                  </Button>
                  <Form.Label
                    className="text-center m-2"
                    style={{
                      color: "black", // Choisissez la couleur du texte souhaitée
                      fontSize: "20px", // Choisissez la taille de police souhaitée
                      padding: "10px", // Ajoutez du rembourrage pour améliorer l'apparence
                      textAlign: "center",
                    }}
                  >
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
                    <Form.Text className="text-danger">
                      {errors.email}
                    </Form.Text>
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

                    <Form.Text className="text-danger">
                      {errors.photo}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="col-sm m-2 " controlId="formPassword">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                      type="text"
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
                  style={{ marginTop: "24px" }}
                  variant="primary"
                  type="submit"
                >
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
                          {user.roles.length > 0
                            ? user.roles[0].name
                            : "No Role"}
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
                            onClick={() => handleDelete(user.id)}
                          >
                            <i className="fas fa-minus-circle"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
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
              <Modal.Title> gerer les Permissions</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <label>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
                Check All
              </label>
              <table className="table">
                <thead>
                  <tr>
                    <th>interface</th>
                    <th>Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Produits</td>
                    <td>
                      {renderPermissionsCheckbox(
                        "view_all_products",
                        "View All Products"
                      )}
                      {renderPermissionsCheckbox(
                        "create_product",
                        "Create Product"
                      )}
                      {renderPermissionsCheckbox(
                        "edit_product",
                        "Edit Product"
                      )}
                      {renderPermissionsCheckbox(
                        "delete_product",
                        "Delete Product"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Fournisseurs</td>
                    <td>
                      {renderPermissionsCheckbox(
                        "view_all_fournisseurs",
                        "View All Fournisseurs"
                      )}
                      {renderPermissionsCheckbox(
                        "create_fournisseurs",
                        "Create Fournisseur"
                      )}
                      {renderPermissionsCheckbox(
                        "update_fournisseurs",
                        "Update Fournisseur"
                      )}
                      {renderPermissionsCheckbox(
                        "delete_fournisseurs",
                        "Delete Fournisseur"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Clients</td>
                    <td>
                      {renderPermissionsCheckbox(
                        "view_all_clients",
                        "View All Clients"
                      )}
                      {renderPermissionsCheckbox(
                        "create_clients",
                        "Create Clients"
                      )}
                      {renderPermissionsCheckbox(
                        "update_clients",
                        "Update Clients"
                      )}
                      {renderPermissionsCheckbox(
                        "delete_clients",
                        "Delete Clients"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Utilisateurs</td>
                    <td>
                      {renderPermissionsCheckbox(
                        "view_all_users",
                        "View All Users"
                      )}
                      {renderPermissionsCheckbox("create_user", "Create User")}
                      {renderPermissionsCheckbox("edit_user", "Edit User")}
                      {renderPermissionsCheckbox("delete_user", "Delete User")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={handlePermissionsModalClose}>
                valider
              </Button>
            </Modal.Footer>
          </Modal>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Users;
