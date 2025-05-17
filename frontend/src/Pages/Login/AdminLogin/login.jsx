import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import api from "../../../api/axios"; // Adjust the import path as necessary
import logo from "../../../assets/YM.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [otp, setOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [enterOTPMode, setEnterOTPMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  const [loadingTransition, setLoadingTransition] = useState(false);

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await api.post('/login', { email, password });

    if (response.data.access_token) {
      localStorage.setItem("auth_token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("username", response.data.user.name);
      console.log("token",localStorage.getItem("auth_token"));
      
      // Determine dashboard based on role
      const dashboardPath = response.data.user.role === 'admin' 
        ? "/admindashboard" 
        : "/salesdashboard";
      
      alert("Login successful!");
      navigate(dashboardPath);
    } else {
      throw new Error("Login failed: No token received");
    }
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Login failed. Please try again.";
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleSendResetEmail = async () => {
  if (!email) {
    alert("Please enter your email to send reset instructions.");
    return;
  }

  try {
    setLoading(true);
    const response = await axios.post(
      "http://localhost:8000/api/send-otp",
      { email },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.message) {
      alert(response.data.message);
      setEnterOTPMode(true);
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    alert(error.response?.data?.message || "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

const handleOTP = async () => {
  if (!otp) {
    alert("Please enter the OTP you received.");
    return;
  }

  if (newPassword !== repeatPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    setLoading(true);

    const response = await axios.post(
      "http://localhost:8000/api/verify-otp",
      { email, otp },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.message === "OTP verified successfully") {
      alert("OTP verified!");
      setChangePasswordMode(true);
    } else {
      alert("OTP Verification Failed!");
    }

  } catch (error) {
    console.error("OTP verification error:", error);
    alert(error.response?.data?.error || "An unexpected error occurred during OTP verification.");
  } finally {
    setLoading(false);
  }
};

const handleChangePassword = async () => {
  if (!newPassword) {
    alert("Please enter a new password.");
    return;
  }

  if (newPassword !== repeatPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    setLoading(true);
    const response = await axios.post(
      "http://localhost:8000/api/reset-password-with-otp",
      {
        email,
        otp,
        password: newPassword,
        password_confirmation: repeatPassword,
      }
    );

    if (response.data.message === "Password reset successfully") {
      setSuccessMessage("Password changed successfully!");
      
      // Clear form and reset modes after 3 seconds
      setTimeout(() => {
        setForgotPasswordMode(false);
        setEnterOTPMode(false);
        setChangePasswordMode(false);
        setEmail("");
        setOTP("");
        setNewPassword("");
        setRepeatPassword("");
        setSuccessMessage("");
      }, 3000);
    }
  } catch (error) {
    alert(error.response?.data?.error || "Failed to reset password");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="AdminLogin">
      <div className="AdminLoginContainer">
        {!forgotPasswordMode && !enterOTPMode && !changePasswordMode ? (
          <form onSubmit={handleSubmit}>
            <h1>Welcome to YM PRODUCTS!</h1>
            <h3>Enter Your Credentials To Access Your Account</h3>
            <div className="InputFields">
              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="AdminLoginButtons">
              <button type="submit" className="LoginButton" disabled={loading}>
                {loading ? "Logging In..." : "Login"}
              </button>
              <button
                type="button"
                className="ForgotPassword"
                onClick={() => setForgotPasswordMode(true)}
              >
                Forgot Password
              </button>
            </div>
          </form>
        ) : forgotPasswordMode && !enterOTPMode && !changePasswordMode ? (
          <form onSubmit={handleSubmit}>
            <h1>Forgot Your Password?</h1>
            <h3>Enter Your Email To Receive Reset Instructions</h3>
            <div className="InputFields">
              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="AdminLoginButtons">
              <button
                type="button"
                className="BackButton"
                onClick={() => setForgotPasswordMode(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="SendEmailButton"
                onClick={handleSendResetEmail}
              >
                Send Email
              </button>
            </div>
          </form>
        ) : enterOTPMode && !changePasswordMode ? (
          <form onSubmit={handleSubmit}>
            <h1>Got Your OTP?</h1>
            <h3>Enter Your OTP To Validate Your Identification</h3>
            <div className="InputFields">
              <input
                placeholder="Enter Your OTP"
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
                required
              />
            </div>
            <div className="AdminLoginButtons">
              <button
                type="button"
                className="BackButton"
                onClick={() => setEnterOTPMode(false)}
              >
                Back
              </button>
              <button type="button" className="ConfirmOTP" onClick={handleOTP}>
                Confirm OTP
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1>Change Password</h1>
            <h3>Enter A New Password To Gain Access To Your Account</h3>
            <div className="InputFields">
              <input
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Repeat New Password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
              />
            </div>
            <div className="AdminLoginButtons">
              <button
                type="button"
                className="BackButton"
                onClick={() => setChangePasswordMode(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="ChangePassword"
                onClick={handleChangePassword}
              >
                Confirm
              </button>
            </div>
          </form>
        )}

        {/* Displaying the loading graphic if loadingTransition is true */}
        {loadingTransition && (
          <div className="LoadingTransition">
            <div className="spinner"></div> {/* You can style this spinner */}
            <p>Please Wait! Redirecting Back To The Login Page...</p>
          </div>
        )}

        <div className="LogoContainer">
          <img src={logo} alt="YM Products Logo" />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
