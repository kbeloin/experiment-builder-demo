// Experiment Progress Actions
// Should store user progress in the following way:
// 1. User starts experiment
// 2. User submits experiment
// 3. User changes modules in experiment

//  Module progress encapsulates all question controller logic
// This includes:
// 1. Current question
// 2. Question responses
// 3. Question attempts
// 4. Question timestamps
import axios from "axios";
import * as actionTypes from "./actionTypes";
import { createCompletedEXP } from "./completedExperiments";
import { batch } from "react-redux";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const startEXPProgress = (currentExperiment, userExperimentId) => {
  // Expand current experiment
  return {
    type: actionTypes.START_EXPERIMENT_PROGRESS,
    currentExperiment,
    userExperimentId,
  };
};

const updateEXPProgress = (key, value, callback) => {
  if (callback) callback(value);
  return {
    type: actionTypes.UPDATE_EXPERIMENT_PROGRESS,
    key,
    value,
  };
};

const endEXPProgress = () => {
  return {
    type: actionTypes.END_EXPERIMENT_PROGRESS,
  };
};

const submitEXPProgress = () => {
  return {
    type: actionTypes.UPDATE_EXPERIMENT_PROGRESS,
    key: "submitted",
    value: true,
  };
};

const startCreated = (currentExperiment, userExperiment) => {
  return (dispatch) => {
    dispatch(startEXPProgress(currentExperiment, userExperiment));
  };
};

// Callback will always be to create the completed module
export const start = (token, currentExperiment) => {
  const { id } = currentExperiment;
  return (dispatch) => {
    dispatch(
      createCompletedEXP(token, { expId: id }, (userExperiment) =>
        dispatch(startCreated(currentExperiment, userExperiment))
      )
    );
  };
};

export const submit = () => {
  return (dispatch) => {
    dispatch(submitEXPProgress());
  };
};

export const updateValue = (key, value, callback) => {
  return (dispatch) => {
    dispatch(updateEXPProgress(key, value, callback));
  };
};

export const updateValues = (values) => {
  // get keys and values from values object
  const keys = Object.keys(values);
  const valuesArray = Object.values(values);
  return (dispatch) => {
    // dispatch update values for each key
    batch(() => {
      keys.forEach((key, index) => {
        dispatch(updateEXPProgress(key, valuesArray[index]));
      });
    });
  };
};

export const end = () => {
  return (dispatch) => {
    dispatch(endEXPProgress());
  };
};
