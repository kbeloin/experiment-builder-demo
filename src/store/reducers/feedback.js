// reducers for feedback

import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

initialState = {
  feedbacks: [],
  feedback: null,
  loading: false,
  error: null,
};

export const getFeedbackListStart = () => {
  updateObject(state, {
    error: null,
    loading: true,
  });
};

export const getFeedbackListSuccess = (feedbacks) => {
  updateObject(state, {
    feedbacks: feedbacks,
    error: null,
    loading: false,
  });
};

export const getFeedbackListFail = (error) => {
  updateObject(state, {
    error: error,
    loading: false,
  });
};

export const getFeedbackList = (token) => {
  updateObject(state, {
    error: null,
    loading: true,
  });
};
