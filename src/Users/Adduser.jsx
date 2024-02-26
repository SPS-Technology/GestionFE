import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Navigation from "../Acceuil/Navigation";

const AddUser = () => {
  const token = localStorage.getItem("API_TOKEN");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Créez un objet FormData pour envoyer les données du formulaire
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("role", user.role);
      formData.append("password", user.password);
      formData.append("photo", user.photo); // Assurez-vous que user.photo est un objet File
      selectedPermissions.forEach(permission => {
        formData.append("permissions[]", permission);
      }); 
      // Obtenez le jeton CSRF depuis la balise meta dans votre HTML
      const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  
      // Effectuez une requête POST vers votre endpoint d'enregistrement
      const response = await axios.post("http://localhost:8000/api/register", formData, {
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
  
      // Si la requête est réussie, affichez une notification et redirigez l'utilisateur
      Swal.fire({
        icon: "success",
        title: "Utilisateur ajouté avec succès!",
        showConfirmButton: false,
        timer: 1500,
      });
  
      navigate("/users");
  
      // Réinitialisez le formulaire et les erreurs
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
      // En cas d'erreur, gérez les différentes situations
      if (error.response) {
        const serverErrors = error.response.data.errors;
  
        if (error.response.status === 403) {
          // Gérez spécifiquement les erreurs 403
          Swal.fire({
            icon: "error",
            title: "Accès refusé",
            text: "Vous n'avez pas l'autorisation d'ajouter un utilisateur.",
          });
        } else {
          // Affichez les erreurs de validation côté serveur dans la console (à des fins de débogage)
          console.log("Server Validation Errors:", serverErrors);
  
          // Mettez à jour l'état des erreurs pour les afficher dans votre formulaire
          setErrors({
            name: serverErrors?.name?.[0] || "",
            email: serverErrors?.email?.[0] || "",
            role: serverErrors?.role?.[0] || "",
            photo: serverErrors?.photo?.[0] || "",
            password: serverErrors?.password?.[0] || "",
          });
        }
      } else if (error.request) {
        // En cas d'absence de réponse du serveur
        console.error("Erreur lors de la communication avec le serveur :", error.request);
      } else {
        // En cas d'autres types d'erreurs
        console.error("Erreur lors de la configuration de la requête :", error.message);
      }
    }
  };
  
  return (
    <div>
      <Navigation />
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <i className="fas fa-user-plus" aria-hidden="true"></i>
        <h2 style={{ marginBottom: "20px" }}>Ajouter un utilisateur</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Nom:</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            <span style={{ color: "red" }}>{errors.name}</span>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Email:</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            <span style={{ color: "red" }}>{errors.email}</span>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Role:</label>
            <input
              type="text"
              name="role"
              value={user.role}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            <span style={{ color: "red" }}>{errors.role}</span>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Photo:</label>
            <input
              type="file"
              name="photo"
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />

            <span style={{ color: "red" }}>{errors.photo}</span>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Mot de passe:</label>
            <input
              type="text"
              name="password"
              value={user.password}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            <span style={{ color: "red" }}>{errors.password}</span>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Permissions:</label>
            <div>
              <label>
                <input
                  type="checkbox"
                  value="view_all_products"
                  checked={selectedPermissions.includes("view_all_products")}
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
                  checked={selectedPermissions.includes("create_fournisseurs")}
                  onChange={handlePermissionChange}
                />
                Create Fournisseur
              </label>
              <label>
                <input
                  type="checkbox"
                  value="update_fournisseurs"
                  checked={selectedPermissions.includes("update_fournisseurs")}
                  onChange={handlePermissionChange}
                />
                Edit Fournisseur
              </label>
              <label>
                <input
                  type="checkbox"
                  value="delete_fournisseurs"
                  checked={selectedPermissions.includes("delete_fournisseurs")}
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
          </div>
          <button
            type="submit"
            style={{
              background: "#4CAF50",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Ajouter
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
