import axios from "axios";
import * as actionTypes from "./actionTypes";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

// feedback actions

export const getFeedbackListStart = () => {
  return {
    type: actionTypes.GET_FEEDBACK_LIST_START,
  };
};

export const getFeedbackListSuccess = (feedbacks) => {
  return {
    type: actionTypes.GET_FEEDBACK_LIST_SUCCESS,
    feedbacks,
  };
};

export const getFeedbackListFail = (error) => {
  return {
    type: actionTypes.GET_FEEDBACK_LIST_FAIL,
    error: error,
  };
};

export const getFeedbackList = (token) => {
  return (dispatch) => {
    dispatch(getFeedbackListStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get("/feedback/")
      .then((res) => {
        const feedbacks = res.data;
        dispatch(getFeedbackListSuccess(feedbacks));
      })
      .catch((err) => {
        dispatch(getFeedbackListFail(err));
      });
  };
};

export const getFeedbackDetailStart = () => {
  return {
    type: actionTypes.GET_FEEDBACK_DETAIL_START,
  };
};

export const getFeedbackDetailSuccess = (feedback) => {
  return {
    type: actionTypes.GET_FEEDBACK_DETAIL_SUCCESS,
    feedback,
  };
};

export const getFeedbackDetailFail = (error) => {
  return {
    type: actionTypes.GET_FEEDBACK_DETAIL_FAIL,
    error: error,
  };
};

export const getFeedbackDetail = (token, id) => {
  return (dispatch) => {
    dispatch(getFeedbackDetailStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get(`/feedback/${id}/`)
      .then((res) => {
        const feedback = res.data;
        dispatch(getFeedbackDetailSuccess(feedback));
      })
      .catch((err) => {
        dispatch(getFeedbackDetailFail(err));
      });
  }; // end of return
}; // end of getFeedbackDetail

export const createFeedbackStart = () => {
  return {
    type: actionTypes.CREATE_FEEDBACK_START,
  };
};

export const createFeedbackSuccess = (feedback) => {
  return {
    type: actionTypes.CREATE_FEEDBACK_SUCCESS,
    feedback,
  };
};

export const createFeedbackFail = (error) => {
  return {
    type: actionTypes.CREATE_FEEDBACK_FAIL,
    error: error,
  };
};

export const createFeedback = (token, feedback) => {
  return (dispatch) => {
    dispatch(createFeedbackStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .post("/feedback/", feedback)
      .then((res) => {
        const feedback = res.data;
        dispatch(createFeedbackSuccess(feedback));
      })
      .catch((err) => {
        dispatch(createFeedbackFail(err));
      });
  }; // end of return
}; // end of createFeedback

export const updateFeedbackStart = () => {
  return {
    type: actionTypes.UPDATE_FEEDBACK_START,
  };
};

export const updateFeedbackSuccess = (feedback) => {
  return {
    type: actionTypes.UPDATE_FEEDBACK_SUCCESS,
    feedback,
  };
};

export const updateFeedbackFail = (error) => {
  return {
    type: actionTypes.UPDATE_FEEDBACK_FAIL,
    error: error,
  };
};

export const updateFeedback = (token, feedback) => {
  return (dispatch) => {
    dispatch(updateFeedbackStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .put(`/feedback/${feedback.id}/`, feedback)
      .then((res) => {
        const feedback = res.data;
        dispatch(updateFeedbackSuccess(feedback));
      })
      .catch((err) => {
        dispatch(updateFeedbackFail(err));
      });
  }; // end of return

  // end of updateFeedback
}; // end of export
