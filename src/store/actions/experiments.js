import axios from "axios";
import * as actionTypes from "./actionTypes";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const getEXPListStart = () => {
  return {
    type: actionTypes.GET_EXPERIMENT_LIST_START,
  };
};

const getEXPListSuccess = (experiments) => {
  return {
    type: actionTypes.GET_EXPERIMENT_LIST_SUCCESS,
    experiments,
  };
};

const getEXPListFail = (error) => {
  return {
    type: actionTypes.GET_EXPERIMENT_LIST_FAIL,
    error: error,
  };
};

export const getEXPS = (token) => {
  return (dispatch) => {
    dispatch(getEXPListStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get("/experiments/")
      .then((res) => {
        const experiments = res.data;
        dispatch(getEXPListSuccess(experiments));
      })
      .catch((err) => {
        dispatch(getEXPListFail());
      });
  };
};

const getEXPDetailStart = () => {
  return {
    type: actionTypes.GET_EXPERIMENT_DETAIL_START,
  };
};

const getEXPDetailSuccess = (experiment) => {
  return {
    type: actionTypes.GET_EXPERIMENT_DETAIL_SUCCESS,
    experiment,
  };
};

const getEXPDetailFail = (error) => {
  return {
    type: actionTypes.GET_EXPERIMENT_DETAIL_FAIL,
    error: error,
  };
};

export const getEXPSDetail = (token, id) => {
  return (dispatch) => {
    dispatch(getEXPDetailStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get(`/experiments/${id}/`)
      .then((res) => {
        const experiments = res.data;
        dispatch(getEXPDetailSuccess(experiments));
      })
      .catch((err) => {
        dispatch(getEXPDetailFail());
      });
  };
};

const createEXPStart = () => {
  return {
    type: actionTypes.CREATE_EXPERIMENT_START,
  };
};

const createEXPSuccess = (experiment, callback) => {
  if (callback !== undefined) {
    callback(experiment);
  }
  return {
    type: actionTypes.CREATE_EXPERIMENT_SUCCESS,
    experiment,
  };
};

const createEXPFail = (error, callback) => {
  if (callback !== undefined) {
    callback(error);
  }
  return {
    type: actionTypes.CREATE_EXPERIMENT_FAIL,
    error: error,
  };
};

export const createEXP = (token, exp, callback) => {
  return (dispatch) => {
    dispatch(createEXPStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .post(`/experiments/`, exp)
      .then((res) => {
        dispatch(createEXPSuccess(res, callback));
      })
      .catch((err) => {
        dispatch(createEXPFail(err, callback));
      });
  };
};
