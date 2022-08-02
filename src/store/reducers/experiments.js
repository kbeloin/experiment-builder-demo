import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  experiments: [],
  currentExperiment: {},
  error: null,
  loading: false,
};

const getEXPListStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const getEXPListSuccess = (state, action) => {
  return updateObject(state, {
    experiments: action.experiments,
    error: null,
    loading: false,
  });
};

const getEXPListFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const getEXPDetailStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const getEXPDetailSuccess = (state, action) => {
  return updateObject(state, {
    currentExperiment: action.experiment,
    error: null,
    loading: false,
  });
};

const getEXPDetailFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const createEXPStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const createEXPSuccess = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: false,
  });
};

const createEXPFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GET_EXPERIMENT_LIST_START:
      return getEXPListStart(state, action);
    case actionTypes.GET_EXPERIMENT_LIST_SUCCESS:
      return getEXPListSuccess(state, action);
    case actionTypes.GET_EXPERIMENT_LIST_FAIL:
      return getEXPListFail(state, action);
    case actionTypes.GET_EXPERIMENT_DETAIL_START:
      return getEXPDetailStart(state, action);
    case actionTypes.GET_EXPERIMENT_DETAIL_SUCCESS:
      return getEXPDetailSuccess(state, action);
    case actionTypes.GET_EXPERIMENT_DETAIL_FAIL:
      return getEXPDetailFail(state, action);
    case actionTypes.CREATE_EXPERIMENT_START:
      return createEXPStart(state, action);
    case actionTypes.CREATE_EXPERIMENT_SUCCESS:
      return createEXPSuccess(state, action);
    case actionTypes.CREATE_EXPERIMENT_FAIL:
      return createEXPFail(state, action);
    default:
      return state;
  }
};

export default reducer;
