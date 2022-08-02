import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";
// reducer for userSession.js:
// To store user progress, the completed module must be created first.
// Then, once the module is completed, responses can be stored.
const initialState = {
  mdlId: null,
  userMdlId: null,
  submitted: false,
  started: false,
  completed: false,
  usersAnswers: {},
  questions: [], // questions from module (stored as component array)
  current: 0,
  timestamps: {},
  files: [],
  attempts: [],
  targetMet: [false, null],
  responseAttempts: {},
  showFeeback: [false, null, null],
  allTargets: [],
  allTargetsMet: [],
};
// Module is started once:
// 1. current module is set
// 2. module is started and completed record is created
const startModule = (state, action) => {
  const userModule = action.module;
  return updateObject(state, {
    started: true,
    mdlId: userModule.module,
    userMdlId: userModule.id,
    current: 0,
    // submitted: false,
  });
};

const updateModule = (state, action) => {
  // Array of key value pairs

  const { key, value } = action;

  return updateObject(state, {
    [key]: value,
  });
};

const endModule = (state, action) => {
  return updateObject(state, {
    mdlId: null,
    userMdlId: null,
    submitted: false,
    started: false,
    completed: false,
    usersAnswers: {},
    questions: [], // questions from module (stored as component array)
    currentQuestion: 0,
    timestamps: {},
    current: 0,
    files: [],
    attempts: [],
    targetMet: [false, null],
    responseAttempts: {},
    showFeeback: [false, null, null],
    allTargets: [],
    allTargetsMet: [],
    callback: null,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.CREATE_COMPLETED_MODULE_SUCCESS:
      return startModule(state, action);
    case actionTypes.START_MODULE_PROGRESS:
      return startModule(state, action);
    case actionTypes.UPDATE_MODULE_PROGRESS:
      return updateModule(state, action);
    case actionTypes.END_MODULE_PROGRESS:
      return endModule(state, action);
    default:
      return state;
  }
};

export default reducer;
