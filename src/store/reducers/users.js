import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  users: [],
  error: null,
  loading: false,
};

const getUSERListStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const getUSERListSuccess = (state, action) => {
  return updateObject(state, {
    users: action.users,
    error: null,
    loading: false,
  });
};

const getUSERListFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GET_USER_LIST_START:
      return getUSERListStart(state, action);
    case actionTypes.GET_USER_LIST_SUCCESS:
      return getUSERListSuccess(state, action);
    case actionTypes.GET_USER_LIST_FAIL:
      return getUSERListFail(state, action);
    default:
      return state;
  }
};

export default reducer;
