import React, { useContext, memo, useEffect } from "react";
import { Context } from "../../main";
import { Navigate, useSearchParams } from "react-router-dom";
import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import PopularCategories from "./PopularCategories";
import PopularCompanies from "./PopularCompanies";

const Home = memo(() => {
  const { isAuthorized } = useContext(Context);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle Google OAuth success and role selection
    const oauth = searchParams.get('oauth');
    const newUser = searchParams.get('new_user');
    
    if (oauth === 'success' && newUser === 'true') {
      const selectedRole = localStorage.getItem('selectedRole');
      if (selectedRole) {
        // Update user role via API call
        // You can implement this API call if needed
        localStorage.removeItem('selectedRole');
      }
    }
  }, [searchParams]);

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  return (
    <main className="home-page">
      <HeroSection />
      <HowItWorks />
      <PopularCategories />
      <PopularCompanies />
    </main>
  );
});

export default Home;
