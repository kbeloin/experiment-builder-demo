//  Module progress encapsulates all question controller logic
// This includes:
// 1. Current question
// 2. Question responses
// 3. Question attempts
// 4. Question timestamps
import axios from "axios";
import * as actionTypes from "./actionTypes";
import { createCompletedMDL } from "./completedModules";
import { batch } from "react-redux";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const startMDLProgress = (mdlId, userModuleId) => {
  const userMdlId = userModuleId["id"];

  // This will usually be called as callback from server response with createdModuleId
  return {
    type: actionTypes.START_MODULE_PROGRESS,
    mdlId,
    userMdlId,
  };
};

const updateMDLProgress = (key, value) => {
  return {
    type: actionTypes.UPDATE_MODULE_PROGRESS,
    key,
    value,
  };
};

const endMDLProgress = (callback) => {
  // Callback to do something after module is completed and reset
  return {
    type: actionTypes.END_MODULE_PROGRESS,
  };
};

const submitMDLProgress = () => {
  return {
    type: actionTypes.UPDATE_MODULE_PROGRESS,
    key: "submitted",
    value: true,
  };
};

const startCreated = (mdlId, userMdlId) => {
  return (dispatch) => {
    dispatch(startMDLProgress(mdlId, userMdlId));
  };
};

// Callback will always be to create the completed module
export const start = (token, mdlId, expId) => {
  return (dispatch) => {
    dispatch(
      createCompletedMDL(token, { mdlId, expId }, (module) =>
        startCreated(mdlId, module)
      )
    );
  };
};

export const submit = () => {
  return (dispatch) => {
    dispatch(submitMDLProgress());
  };
};

export const updateValue = (key, value) => {
  return (dispatch) => {
    dispatch(updateMDLProgress(key, value));
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
        dispatch(updateMDLProgress(key, valuesArray[index]));
      });
    });
  };
};

export const end = () => {
  return (dispatch) => {
    dispatch(endMDLProgress());
  };
};
