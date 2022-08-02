import axios from "axios";
import * as actionTypes from "./actionTypes";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export const updateCurrentMDL = (module) => {
  return {
    type: actionTypes.UPDATE_CURRENT_MODULE,
    module: module,
  };
};

const getMDLListStart = () => {
  return {
    type: actionTypes.GET_MODULE_LIST_START,
  };
};

const getMDLListSuccess = (modules) => {
  return {
    type: actionTypes.GET_MODULES_LIST_SUCCESS,
    modules,
  };
};

const getMDLListFail = (error) => {
  return {
    type: actionTypes.GET_MODULES_LIST_FAIL,
    error: error,
  };
};

export const getMDLS = (token) => {
  return (dispatch) => {
    dispatch(getMDLListStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get("/modules/")
      .then((res) => {
        const modules = res.data;
        dispatch(getMDLListSuccess(modules));
      })
      .catch((err) => {
        dispatch(getMDLListFail());
      });
  };
};

const getMDLDetailStart = () => {
  return {
    type: actionTypes.GET_MODULE_DETAIL_START,
  };
};

const getMDLDetailSuccess = (module, callback) => {
  if (callback) callback(module);
  return {
    type: actionTypes.GET_MODULE_DETAIL_SUCCESS,
    module,
  };
};

const getMDLDetailFail = (error) => {
  console.log(error);
  return {
    type: actionTypes.GET_MODULE_DETAIL_FAIL,
    error: error,
  };
};

export const getMDLSDetail = (token, id, callback) => {
  console.log(id);
  return (dispatch) => {
    dispatch(getMDLDetailStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get(`/modules/${id}/`)
      .then((res) => {
        const modules = res.data;
        dispatch(getMDLDetailSuccess(modules, callback));
      })
      .catch((err) => {
        dispatch(getMDLDetailFail());
      });
  };
};

const createMDLStart = () => {
  return {
    type: actionTypes.CREATE_MODULE_START,
  };
};

const createMDLSuccess = (module, callback) => {
  if (callback !== undefined) {
    callback(module);
  }
  return {
    type: actionTypes.CREATE_MODULE_SUCCESS,
    module,
  };
};

const createMDLFail = (error, callback) => {
  if (callback !== undefined) {
    callback(error);
  }
  return {
    type: actionTypes.CREATE_MODULE_FAIL,
    error: error,
  };
};

export const createMDL = (token, mdl, callback) => {
  return (dispatch) => {
    dispatch(createMDLStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .post(`/modules/`, mdl)
      .then((res) => {
        dispatch(createMDLSuccess(res, callback));
      })
      .catch((err) => {
        dispatch(createMDLFail(err, callback));
      });
  };
};
