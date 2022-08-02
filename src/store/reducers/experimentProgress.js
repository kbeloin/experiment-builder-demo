import { updateObject } from "../utility";
import * as actionTypes from "../actions/actionTypes";

const initialState = {
  expId: null,
  userExpId: null,
  submitted: false,
  started: false,
  completed: false,
  modules: [], // modules for experiemnt (stored as tuple array, retrieved from db as [order, baseModuleId, completedModuleId])
  current: 0, // current module (stored as index in modules array)
};

const startExperiment = (state, action) => {
  const { currentExperiment, userExperimentId } = action;

  return updateObject(state, {
    expId: currentExperiment.id,
    userExpId: userExperimentId["id"],
    modules: currentExperiment.modules,
    started: true,
  });
};

const updateExperiment = (state, action) => {
  const { key, value } = action;

  return updateObject(state, {
    [key]: value,
  });
};

const endExperiment = (state, action) => {
  return updateObject(state, {
    expId: null,
    userExpId: null,
    submitted: false,
    started: false,
    completed: false,
    modules: [], // modules for experiemnt (stored as tuple array, retrieved from db as [order, baseModuleId, completedModuleId])
    current: 0, // current module (stored as index in modules array)
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.START_EXPERIMENT_PROGRESS:
      return startExperiment(state, action);
    case actionTypes.UPDATE_EXPERIMENT_PROGRESS:
      return updateExperiment(state, action);
    case actionTypes.END_EXPERIMENT_PROGRESS:
      return endExperiment(state, action);
    default:
      return state;
  }
};

export default reducer;
