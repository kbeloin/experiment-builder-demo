import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
// import registerServiceWorker from "./registerServiceWorker";
import { createStore, compose, applyMiddleware, combineReducers } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import authReducer from "./store/reducers/auth";
import modulesReducer from "./store/reducers/modules";
import moduleProgressReducer from "./store/reducers/moduleProgress";
import completedModuleReducer from "./store/reducers/completedModules";
import experimentProgressReducer from "./store/reducers/experimentProgress";
import completedExperimentReducer from "./store/reducers/completedExperiments";
import s3Reducer from "./store/reducers/s3";
import experimentReducer from "./store/reducers/experiments";
import usersReducer from "./store/reducers/users";

const composeEnhances = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  auth: authReducer,
  modules: modulesReducer,
  moduleProgress: moduleProgressReducer,
  completedModules: completedModuleReducer,
  experimentProgress: experimentProgressReducer,
  completedExperiments: completedExperimentReducer,
  s3: s3Reducer,
  experiments: experimentReducer,
  users: usersReducer,
});

const store = createStore(rootReducer, composeEnhances(applyMiddleware(thunk)));

const app = (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(app, document.getElementById("root"));
