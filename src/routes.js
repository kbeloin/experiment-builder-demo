import React, { useEffect } from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import rg4js from "raygun4js";
import Hoc from "./hoc/hoc";

import LoginForm from "./containers/Login/LoginForm";
import RegistrationForm from "./containers/Signup/SignupForm";

import Profile from "./containers/Pages/Profile";
import Home from "./containers/Pages/Home";
import Users from "./containers/Pages/Users";

import ModuleList from "./containers/Modules/ModuleList";
import ModuleDetail from "./containers/Modules/ModuleDetail";
import ModuleCreate from "./containers/Modules/ModuleCreate";

import ExperimentList from "./containers/Experiments/ExperimentList";
import ExperimentDetail from "./containers/Experiments/ExperimentDetail";
import ExperimentCreate from "./containers/Experiments/ExperimentCreate";
import Experiment from "./containers/Experiments/Experiment";
// warn user if they try to leave the page without saving
const BaseRouter = ({ auth, is_moderator }) => {
  const location = useLocation();

  useEffect(() => {
    rg4js("trackEvent", { type: "pageView", path: location.pathname });
  }, [location]);

  return (
    <Hoc>
      <Route exact path="/login/" component={LoginForm} />
      <Route exact path="/" component={Home} />

      {auth && (
        <>
          <Route exact path="/profile/:id" component={Profile} />
          <Route exact path="/experiments" component={ExperimentList} />
          <Route exact path="/experiments/:id" component={ExperimentDetail} />
          <Route exact path="/start" component={Experiment} />
          <Route exact path="/modules" component={ModuleList} />
          <Route exact path="/modules/:id" component={ModuleDetail} />

          {is_moderator && (
            <>
              <Route
                exact
                path="/create/experiment"
                component={ExperimentCreate}
              />
              <Route exact path="/signup/" component={RegistrationForm} />
              <Route exact path="/create/module" component={ModuleCreate} />
              <Route exact path="/users" component={Users} />
            </>
          )}
          {/* fallback if no route matches */}
          <Redirect to="/" />
        </>
      )}
    </Hoc>
  );
};

export default BaseRouter;
