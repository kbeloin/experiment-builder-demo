import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  token: null,
  error: null,
  loading: false,
  username: null,
  is_participant: null,
  is_moderator: null,
  userId: null,
};

const authAddUserSuccess = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: false,
  });
};

const authAddUserFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const authStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const authSuccess = (state, action) => {
  return updateObject(state, {
    token: action.user.token,
    error: null,
    loading: false,
    username: action.user.username,
    is_participant: action.user.is_participant,
    is_moderator: action.user.is_moderator,
    userId: action.user.userId,
  });
};

const authFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const authLogout = (state, action) => {
  return updateObject(state, {
    token: null,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.AUTH_START:
      return authStart(state, action);
    case actionTypes.AUTH_SUCCESS:
      return authSuccess(state, action);
    case actionTypes.AUTH_FAIL:
      return authFail(state, action);
    case actionTypes.AUTH_LOGOUT:
      return authLogout(state, action);
    case actionTypes.AUTH_ADDUSER_SUCCESS:
      return authAddUserSuccess(state, action);
    case actionTypes.AUTH_ADDUSER_FAIL:
      return authAddUserFail(state, action);
    default:
      return state;
  }
};

export default reducer;
