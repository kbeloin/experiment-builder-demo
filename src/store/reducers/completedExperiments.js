import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  experiments: [],
  incomplete: {},
  error: null,
  loading: false,
  export: {
    loading: false,
    error: null,
    data: null,
    next: null,
    total: null,
  },
};

const getCompletedEXPListStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const getCompletedEXPListSuccess = (state, action) => {
  return updateObject(state, {
    experiments: action.experiments,
    incomplete: action.incomplete,
    error: null,
    loading: false,
  });
};

const getCompletedEXPListFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const createCompletedEXPStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const createCompletedEXPSuccess = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: false,
  });
};

const createCompletedEXPFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GET_COMPLETED_EXPERIMENT_LIST_START:
      return getCompletedEXPListStart(state, action);
    case actionTypes.GET_COMPLETED_EXPERIMENT_LIST_SUCCESS:
      return getCompletedEXPListSuccess(state, action);
    case actionTypes.GET_COMPLETED_EXPERIMENT_LIST_FAIL:
      return getCompletedEXPListFail(state, action);
    case actionTypes.CREATE_COMPLETED_EXPERIMENT_START:
      return createCompletedEXPStart(state, action);
    case actionTypes.CREATE_COMPLETED_EXPERIMENT_SUCCESS:
      return createCompletedEXPSuccess(state, action);
    case actionTypes.CREATE_COMPLETED_EXPERIMENT_FAIL:
      return createCompletedEXPFail(state, action);
    default:
      return state;
  }
};

export default reducer;
