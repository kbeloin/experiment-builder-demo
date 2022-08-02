import axios from "axios";
import rg4js from "raygun4js";
import * as actionTypes from "./actionTypes";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export const authStart = () => {
  return {
    type: actionTypes.AUTH_START,
  };
};

export const authSuccess = (user, callback) => {
  if (callback !== undefined) {
    callback(user);
  }

  console.log(`authSuccess: setting user for raygun: ${user.username}`);
  rg4js("setUser", {
    identifier: user.userId,
    isAnonymous: false,
    fullName: user.username,
  });

  return {
    type: actionTypes.AUTH_SUCCESS,
    user,
  };
};

export const authAddUserSuccess = (user, callback) => {
  if (callback !== undefined) {
    callback(user);
  }
  // try to set user for raygun

  return {
    type: actionTypes.AUTH_ADDUSER_SUCCESS,
  };
};

export const authAddUserFail = (user, callback) => {
  if (callback !== undefined) {
    callback(user);
  }
  return {
    type: actionTypes.AUTH_ADDUSER_FAIL,
  };
};

export const authFail = (error, callback) => {
  if (callback !== undefined) {
    callback(error);
  }
  return {
    type: actionTypes.AUTH_FAIL,
    error: error,
  };
};

export const logout = () => {
  localStorage.removeItem("user");
  rg4js("endSession");

  rg4js("setUser", {
    isAnonymous: true,
  });

  return {
    type: actionTypes.AUTH_LOGOUT,
  };
};

export const checkAuthTimeout = (expirationTime) => {
  return (dispatch) => {
    setTimeout(() => {
      dispatch(logout());
    }, expirationTime * 5000);
  };
};

export const authLogin = (username, password) => {
  return (dispatch) => {
    dispatch(authStart());
    axios
      .post("/rest-auth/login/", {
        username: username,
        password: password,
      })
      .then((res) => {
        const user = {
          token: res.data.key,
          username,
          userId: res.data.user,
          is_participant: res.data.user_type.is_participant,
          is_moderator: res.data.user_type.is_moderator,
          expirationDate: new Date(new Date().getTime() + 36000 * 5000),
        };
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(authSuccess(user));
        dispatch(checkAuthTimeout(36000));
      })
      .catch((err) => {
        console.error(err.response.data);
        dispatch(authFail(err));
      });
  };
};

export const authSignup = (
  username,
  email,
  password1,
  password2,
  userType,
  callback
) => {
  return (dispatch) => {
    dispatch(authStart());
    var is_participant;

    userType === "participant"
      ? (is_participant = true)
      : (is_participant = false);
    axios
      .post("/rest-auth/registration/", {
        username: username,
        email: email,
        password1: password1,
        password2: password2,
        is_participant: is_participant,
        is_moderator: !is_participant,
      })
      .then((res) => {
        const user = {
          token: res.data.key,
          username,
          userId: res.data.user,
          is_participant,
          is_moderator: !is_participant,
          expirationDate: new Date(new Date().getTime() + 36000 * 5000),
        };

        dispatch(authAddUserSuccess(user, callback));
        dispatch(checkAuthTimeout(3600));
      })
      .catch((err) => {
        console.error(err);
        dispatch(authAddUserFail(err, callback));
      });
  };
};

export const authCheckState = () => {
  return (dispatch) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user === undefined || user === null) {
      dispatch(logout());
    } else {
      const expirationDate = new Date(user.expirationDate);
      if (expirationDate <= new Date()) {
        dispatch(logout());
      } else {
        dispatch(authSuccess(user));
        dispatch(
          checkAuthTimeout(
            (expirationDate.getTime() - new Date().getTime()) / 1000
          )
        );
      }
    }
  };
};
