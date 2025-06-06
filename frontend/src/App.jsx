import React, { useContext, useEffect } from "react";
import "./App.css";
import { Context } from "./main";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import RoleSelection from "./components/Auth/RoleSelection";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import Jobs from "./components/Job/Jobs";
import JobDetails from "./components/Job/JobDetails";
import Application from "./components/Application/Application";
import MyApplications from "./components/Application/MyApplications";
import PostJob from "./components/Job/PostJob";
import NotFound from "./components/NotFound/NotFound";
import MyJobs from "./components/Job/MyJobs";
import UserProfile from "./components/UserProfile/UserProfile";
import OAuthHandler from "./components/Auth/OAuthHandler";

const AppContent = () => {
  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);
  const location = useLocation();

  // Check if this is an OAuth callback
  const isOAuthCallback =
    location.search.includes("auth=success") ||
    location.search.includes("error=oauth_failed");

  useEffect(() => {
    // If it's an OAuth callback, let OAuthHandler handle it
    if (isOAuthCallback) {
      console.log("OAuth callback detected, letting OAuthHandler handle it");
      return;
    }

    // Regular authentication check for non-OAuth requests
    const fetchUser = async () => {
      try {
        console.log("Fetching user data for regular auth check...");
        // The axios interceptor will automatically add the token if available
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/getuser`
        );
        console.log("User data fetched successfully:", response.data.user?.name);
        setUser(response.data.user);
        setIsAuthorized(true);
      } catch (error) {
        console.log("No authenticated user found");
        localStorage.removeItem("authToken"); // Clear invalid token
        setIsAuthorized(false);
      }
    };

    if (!isAuthorized) {
      fetchUser();
    }
  }, [isAuthorized, setIsAuthorized, setUser, isOAuthCallback]);

  // If it's an OAuth callback, render the handler
  if (isOAuthCallback) {
    return <OAuthHandler />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/" element={<Home />} />
        <Route path="/job/getall" element={<Jobs />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/application/:jobId" element={<Application />} />
        <Route path="/applications/me" element={<MyApplications />} />
        <Route path="/job/post" element={<PostJob />} />
        <Route path="/job/me" element={<MyJobs />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
