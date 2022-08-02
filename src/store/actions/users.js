import axios from "axios";
import FormData from "form-data";
import * as actionTypes from "./actionTypes";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const getUSERListStart = () => {
  return {
    type: actionTypes.GET_USER_LIST_START,
  };
};

const getUSERListSuccess = (users, callback) => {
  if (callback) {
    callback(users);
  }
  return {
    type: actionTypes.GET_USER_LIST_SUCCESS,
    users,
  };
};

const getUSERListFail = (error) => {
  return {
    type: actionTypes.GET_USER_LIST_FAIL,
    error: error,
  };
};

export const getUSERList = (token, callback) => {
  return (dispatch) => {
    dispatch(getUSERListStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get("/users/participants/")
      .then((res) => {
        const users = res.data;
        dispatch(getUSERListSuccess(users, callback));
      })
      .catch((err) => {
        dispatch(getUSERListFail(err, callback));
      });
  };
};
