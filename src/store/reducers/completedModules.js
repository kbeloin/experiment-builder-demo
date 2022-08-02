import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  modules: [],
  error: null,
  loading: false,
  submittedModule: null,
};

const getCompletedMDLListStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const getCompletedMDLListSuccess = (state, action) => {
  return updateObject(state, {
    modules: action.modules,
    error: null,
    loading: false,
  });
};

const getCompletedMDLListFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const createCompletedMDLStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const createCompletedMDLSuccess = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: false,
  });
};

const createCompletedMDLFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GET_COMPLETED_MODULE_LIST_START:
      return getCompletedMDLListStart(state, action);
    case actionTypes.GET_COMPLETED_MODULES_LIST_SUCCESS:
      return getCompletedMDLListSuccess(state, action);
    case actionTypes.GET_COMPLETED_MODULES_LIST_FAIL:
      return getCompletedMDLListFail(state, action);
    case actionTypes.CREATE_COMPLETED_MODULE_START:
      return createCompletedMDLStart(state, action);
    case actionTypes.CREATE_COMPLETED_MODULE_SUCCESS:
      return createCompletedMDLSuccess(state, action);
    case actionTypes.CREATE_COMPLETED_MODULE_FAIL:
      return createCompletedMDLFail(state, action);
    default:
      return state;
  }
};

export default reducer;
