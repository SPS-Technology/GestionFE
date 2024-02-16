import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { useAuth } from "../AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const navigate = useNavigate();
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(""); // Réinitialisez l'erreur email
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(""); // Réinitialisez l'erreur password
  };
  const handleEror = (e) => {
    setError(""); // Réinitialisez l'erreur 
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/api/login",
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const existingToken = localStorage.getItem("API_TOKEN");

      if (!existingToken) {
        localStorage.setItem("API_TOKEN", response.data.token);
      } else {
        localStorage.setItem("API_TOKEN", response.data.token);
      }

      const userData = response.data.user;

      login(userData);

      navigate("/");
    } catch (error) {
      console.error(error);

      if (error.response) {
        if (error.response.status === 422) {
          setEmailError(error.response.data.errors.email);
          setPasswordError(error.response.data.errors.password);
        } else if (error.response.status === 401) {
          navigate("/login");
        } else if (error.response && error.response.status === 400) {
          setError("Email or password incorrect");
        } else if (error.response.status === 200) {
          navigate("/");
        }
      }
    }
  };

  return (
    <section className="vh-100">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6 text-black">
            <div className="px-5 ms-xl-4">
              <img
                src="/images/egg.png"
                alt="Logo"
                className="img-fluid me-3 pt-4 mt-xl-3"
                style={{ maxWidth: "40px", height: "auto", color: "#709085" }}
              />{" "}
              <span className="h1 fw-bold mb-0">Logo</span>
            </div>

            <div className="d-flex align-items-center h-custom-2 px-5 ms-xl-4 mt-2 pt-4 pt-xl-0 mt-xl-n4">
              <form style={{ width: "23rem" }} onSubmit={handleLogin}>
                <h3
                  className="fw-normal mb-1 pb-2"
                  style={{ letterSpacing: "1px" }}
                >
                  Log in
                </h3>
                <div className="form-outline mb-4">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleEmailChange}
                    id="form2Example18"
                    className="form-control form-control-lg"
                    placeholder="entrez votre email"
                  />

                  <span style={{ color: "red" }} className="error">
                    {emailError}
                  </span>
                </div>

                <div className="form-outline mb-4">
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    id="form2Example28"
                    className="form-control form-control-lg"
                    placeholder="entrer votre password"
                  />
                  <span style={{ color: "red" }} className="error">
                    {passwordError}
                  </span>
                </div>

                <div className="pt-1 mb-4">
                  <button
                    className="btn btn-info btn-lg btn-block"
                    type="submit"
                  >
                    Login
                  </button>
                  <span style={{ color: "red" }}    onChange={handleEror} className="error">
                    {error}
                  </span>
                </div>
              </form>
            </div>
          </div>
          <div className="col-sm-6 px-0 d-none d-sm-block">
            <img
              src="/images/bayd.jpg"
              alt="Login image"
              className="w-100 vh-100 img-fluid"
              style={{ objectFit: "cover", objectPosition: "left" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
