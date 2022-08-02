import MultipleChoiceQuestion from "./Create/MultipleChoiceQuestion";
import ShortResponseQuestion from "./Create/ShortResponseQuestion";
import AudioResponseQuestion from "./Create/AudioResponseQuestion";
import TextSelectionQuestion from "./Create/TextSelectionQuestion";
import CustomQuestion from "./Create/CustomQuestion";
import BlankQuestion from "./Create/BlankQuestion";

import Choice from "./Detail/Choices";
import TextView from "./Detail/Text";
import RecorderView from "./Detail/Recorder";
import TextSelection from "./Detail/TextSelection";
import PatternMatching from "./Detail/PatternMatching";
import Slider from "./Detail/Slider";

import ChoiceBase from "./Create/Base/Choice";
import ShortResponseBase from "./Create/Base/ShortResponse";
import TextSelectionBase from "./Create/Base/TextSelection";
import AudioResponseBase from "./Create/Base/Audio";
import PatternMatchingBase from "./Create/Base/Pattern";
import SliderResponseBase from "./Create/Base/SliderResponse";

export const questionTypes = {
  multiple_choice: {
    name: "Multiple Choice",
    create: MultipleChoiceQuestion,
    target_type: "exact",
    view: Choice,
    attachment: false,
    base: ChoiceBase,
    default_value: JSON.stringify({
      choices: [],
      answer: null,
      title: "",
    }),
  },

  short_response: {
    name: "Short Response",
    create: ShortResponseQuestion,
    target_type: "complete",
    view: TextView,
    attachment: false,
    base: ShortResponseBase,
    default_value: JSON.stringify({
      title: "",
    }),
  },

  audio_response: {
    name: "Audio Response",
    create: AudioResponseQuestion,
    target_type: "complete",
    view: RecorderView,
    base: AudioResponseBase,
    default_value: JSON.stringify({
      title: "",
      process: "",
    }),
    attachment: true,
    contentType: "application/octet-stream",
  },

  text_selection: {
    name: "Text Selection",
    create: TextSelectionQuestion,
    target_type: "partial",
    view: TextSelection,
    attachment: false,
    base: TextSelectionBase,
    default_value: JSON.stringify({
      choices: [],
      answer: null,
      source: "",
      title: "",
    }),
  },

  pattern_matching: {
    name: "Pattern Matching",
    target_type: "complete",
    view: PatternMatching,
    base: PatternMatchingBase,
    default_value: JSON.stringify({
      title: "",
      answer: [],
      choices: [], // choices is an array of objects with the following properties: { text: "", type: "", data: "", id: "" }
      extra: {},
    }),
    attachment: true,
  },

  slider: {
    name: "Slider Response",
    target_type: "complete",
    view: Slider,
    base: SliderResponseBase,
    default_value: JSON.stringify({
      title: "",
      min: 0,
      max: 100,
      step: 1,
    }),
    attachment: true,
  },

  custom: {
    name: "Custom Question",
    create: CustomQuestion,
    target_type: "exact",
    attachment: false,
    base: false,
  },

  blank: {
    name: "Blank",
    create: BlankQuestion,
    target_type: "partial",
    attachment: false,
    base: false,
  },
};

export default questionTypes;
