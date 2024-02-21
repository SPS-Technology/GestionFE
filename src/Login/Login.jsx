import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useAuth } from "../AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  const handleEror = () => {
    setError("");
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
    <Container component="main" maxWidth="lg">
      <Grid container>
        <Grid item xs={12} md={6}>
          <div className="px-5 ms-xl-4 mt-4">
            <img
              src="/images/egg.png"
              alt="Logo"
              className="img-fluid me-3"
              style={{ maxWidth: "40px", height: "auto", color: "#709085" }}
            />
            <Typography variant="h1" component="div" className="fw-bold mb-0">
              Logo
            </Typography>
          </div>

          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            className="px-5 mt-2"
          >
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h4" component="div" className="fw-normal mb-2">
                  Log in
                </Typography>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={handleEmailChange}
                  error={Boolean(emailError)}
                  helperText={emailError}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  error={Boolean(passwordError)}
                  helperText={passwordError}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleLogin}
                  sx={{ mt: 2 }}
                >
                  Login
                </Button>
                <Typography variant="body2" color="error" sx={{ mt: 1 }} onChange={handleEror}>
                  {error}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6} className="px-0 d-none d-md-block">
          <img
            src="/images/bayd.jpg"
            alt="Login image"
            className="w-100 vh-100 img-fluid"
            style={{ objectFit: "cover", objectPosition: "left" }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
