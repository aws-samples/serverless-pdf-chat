import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const Layout: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    (async () => setUserInfo(await Auth.currentUserInfo()))();
  }, []);

  const handleSignOutClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    await Auth.signOut();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div>
        <Navigation
          userInfo={userInfo}
          handleSignOutClick={handleSignOutClick}
        />
        <div className="container mt-6 mb-6">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
