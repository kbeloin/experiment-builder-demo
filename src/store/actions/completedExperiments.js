import axios from "axios";
import * as actionTypes from "./actionTypes";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const downloadCompletedEXPStart = () => {
  return {
    type: actionTypes.DOWNLOAD_COMPLETED_EXPERIMENTS_START,
  };
};

const downloadCompletedEXPSuccess = (experiment, callback) => {
  return {
    type: actionTypes.DOWNLOAD_COMPLETED_EXPERIMENTS_SUCCESS,
    payload: experiment,
    callback: callback,
  };
};

const downloadCompletedEXPSFail = (error) => {
  return {
    type: actionTypes.DOWNLOAD_COMPLETED_EXPERIMENTS_FAIL,
    payload: error,
  };
};

const getCompletedEXPListStart = () => {
  return {
    type: actionTypes.GET_COMPLETED_EXPERIMENT_LIST_START,
  };
};

const getCompletedEXPListSuccess = (experiment, callback) => {
  const incomplete = experiment.length
    ? experiment.filter(({ completed }, i) => !completed)
    : [];
  if (callback) callback(experiment);
  return {
    type: actionTypes.GET_COMPLETED_EXPERIMENT_LIST_SUCCESS,
    experiments: experiment,
    incomplete,
  };
};

const getCompletedEXPListFail = (error) => {
  return {
    type: actionTypes.GET_COMPLETED_EXPERIMENT_LIST_FAIL,
    error: error,
  };
};

export const getCompletedEXPS = (token, expId, callback, all) => {
  return (dispatch) => {
    // expId is optional
    let params = [];
    if (expId) {
      params.push(`experiment=${expId}`);
    }

    if (all) {
      params.push(`all=${all}`);
    }

    dispatch(getCompletedEXPListStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get(`/completed-experiments/?${params.join("&")}`)
      .then((res) => {
        const experiments = res.data;
        dispatch(getCompletedEXPListSuccess(experiments, callback));
      })
      .catch((err) => {
        dispatch(getCompletedEXPListFail(err));
      });
  };
};

const createCompletedEXPStart = () => {
  return {
    type: actionTypes.CREATE_COMPLETED_EXPERIMENT_START,
  };
};

const createCompletedEXPSuccess = (experiment, callback) => {
  if (callback) callback(experiment);
  return {
    type: actionTypes.CREATE_COMPLETED_EXPERIMENT_SUCCESS,
  };
};

const createCompletedEXPFail = (error) => {
  console.error(error);
  return {
    type: actionTypes.CREATE_COMPLETED_EXPERIMENT_FAIL,
    error: error,
  };
};

export const createCompletedEXP = (token, exp, callback) => {
  return (dispatch) => {
    dispatch(createCompletedEXPStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .post(`/completed-experiments/create/`, exp)
      .then((res) => {
        dispatch(createCompletedEXPSuccess(res.data, callback));
      })
      .catch((err) => {
        dispatch(createCompletedEXPFail(err));
      });
  };
};
