import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  modules: [],
  currentModule: {},
  error: null,
  loading: false,
};

const updateCurrentMDL = (state, action) => {
  return updateObject(state, {
    currentModule: action.module,
  });
};

const getMDLListStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const getMDLListSuccess = (state, action) => {
  return updateObject(state, {
    modules: action.modules,
    error: null,
    loading: false,
  });
};

const getMDLListFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const getMDLDetailStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const getMDLDetailSuccess = (state, action) => {
  return updateObject(state, {
    currentModule: action.module,
    error: null,
    loading: false,
  });
};

const getMDLDetailFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const createMDLStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const createMDLSuccess = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: false,
  });
};

const createMDLFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GET_MODULE_LIST_START:
      return getMDLListStart(state, action);
    case actionTypes.GET_MODULES_LIST_SUCCESS:
      return getMDLListSuccess(state, action);
    case actionTypes.GET_MODULES_LIST_FAIL:
      return getMDLListFail(state, action);
    case actionTypes.GET_MODULE_DETAIL_START:
      return getMDLDetailStart(state, action);
    case actionTypes.GET_MODULE_DETAIL_SUCCESS:
      return getMDLDetailSuccess(state, action);
    case actionTypes.GET_MODULE_DETAIL_FAIL:
      return getMDLDetailFail(state, action);
    case actionTypes.CREATE_MODULE_START:
      return createMDLStart(state, action);
    case actionTypes.CREATE_MODULE_SUCCESS:
      return createMDLSuccess(state, action);
    case actionTypes.CREATE_MODULE_FAIL:
      return createMDLFail(state, action);
    case actionTypes.UPDATE_CURRENT_MODULE:
      return updateCurrentMDL(state, action);
    default:
      return state;
  }
};

export default reducer;
