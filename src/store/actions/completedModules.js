import axios from "axios";
import * as actionTypes from "./actionTypes";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const getCompletedMDLListStart = () => {
  return {
    type: actionTypes.GET_COMPLETED_MODULE_LIST_START,
  };
};

const getCompletedMDLListSuccess = (module, callback) => {
  if (callback) callback(module);
  return {
    type: actionTypes.GET_COMPLETED_MODULES_LIST_SUCCESS,
    modules: module,
  };
};

const getCompletedMDLListFail = (error) => {
  return {
    type: actionTypes.GET_COMPLETED_MODULES_LIST_FAIL,
    error: error,
  };
};
// This needs to change to just create the module without recording the answers
// Will function similar ot experiment
export const getCompletedMDLS = (username, token, expId, callback, all) => {
  // expId is optional
  let params = [];
  if (expId) {
    params.push(`experiment=${expId}`);
  }

  if (username) {
    params.push(`username=${username}`);
  }

  if (all) {
    params.push(`all=${all}`);
  }

  return (dispatch) => {
    dispatch(getCompletedMDLListStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get(`/completed-modules/?${params.join("&")}`)
      .then((res) => {
        const modules = res.data;
        dispatch(getCompletedMDLListSuccess(modules, callback));
      })
      .catch((err) => {
        dispatch(getCompletedMDLListFail(err));
      });
  };
};

const createCompletedMDLStart = () => {
  return {
    type: actionTypes.CREATE_COMPLETED_MODULE_START,
  };
};

const createCompletedMDLSuccess = (module, callback) => {
  if (callback) callback(module);
  return {
    type: actionTypes.CREATE_COMPLETED_MODULE_SUCCESS,
    module: module,
  };
};

const createCompletedMDLFail = (error) => {
  console.error(error);
  return {
    type: actionTypes.CREATE_COMPLETED_MODULE_FAIL,
    error: error,
  };
};

export const createCompletedMDL = (token, mdl, callback) => {
  return (dispatch) => {
    dispatch(createCompletedMDLStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .post(`/completed-modules/create/`, mdl)
      .then((res) => {
        console.info("success");
        dispatch(createCompletedMDLSuccess(res.data, callback));
      })
      .catch((err) => {
        dispatch(createCompletedMDLFail());
      });
  };
};
