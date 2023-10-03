import React from "react";
import { Button } from "react-bootstrap";
import {
  login_through_google,
  logout,
} from "../scripts/firebase/auth/auth-functions";

const HomePage = () => {
  return (
    <div>
      <div className="wrapper">
        <Button
          onClick={login_through_google}
          variant="outline-dark"
          className="center w-50">
          Sign in with Google
        </Button>
        <Button
          onClick={logout}
          className="center mt-5 w-50"
          variant="outline-dark">
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
