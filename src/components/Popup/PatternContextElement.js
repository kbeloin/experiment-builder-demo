import { useState, useRef } from "react";
import { Menu, Popup, Button, Input } from "semantic-ui-react";
import { createContextFromEvent } from "../utility";
import {
  PatternResponseElement,
  patternResponseClickAction,
} from "../PatternElement";
import { checkPropTypes } from "prop-types";

const PatternContextElement = ({
  onClick,
  onEdit,
  onDelete,
  choice,
  index,
  extraStyle,
}) => {
  const contextRef = useRef();
  const [open, setOpen] = useState(false);
  const [choiceInfo, setChoiceInfo] = useState({
    ...choice,
  });
  const [elementRef, setRef] = useState(null);

  // only show if onDelete is defined
  const menuItems =
    onDelete !== undefined
      ? [
          //   Delete option
          {
            key: "delete",
            content: "Delete",
            icon: "delete",
            onClick: () => {
              onDelete(index);
            },
          },
        ]
      : [];

  // only show remaining options if onClick is defined
  const remainingOptions = onEdit
    ? [
        {
          key: "text",
          content: (
            <Input
              //   Submit on Enter
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onEdit(choiceInfo);
                }
              }}
              placeholder="Title"
              value={choiceInfo.text}
              onChange={(e) => {
                setChoiceInfo({
                  ...choiceInfo,
                  text: e.target.value,
                });
              }}
            />
          ),
        },
        {
          key: "data",
          content: (
            <Input
              //   Submit on Enter
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onEdit(choiceInfo);
                }
              }}
              placeholder="Data"
              value={choiceInfo.data}
              onChange={(e) => {
                setChoiceInfo({
                  ...choiceInfo,
                  data: e.target.value,
                });
              }}
            />
          ),
        },
        {
          key: "save",
          content: (
            <Button
              //   Submit on Enter
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onEdit(choiceInfo);
                }
              }}
              type={"button"}
              content="Save"
              icon="save"
              value={choiceInfo.data}
              onClick={() => {
                onEdit(choiceInfo);
              }}
            />
          ),
        },
      ]
    : [];

  return (
    <>
      <Button
        style={extraStyle || { "": "" }}
        link
        onClick={(e) => {
          e.preventDefault(e);
          patternResponseClickAction(choice, elementRef.current);

          if (onClick) {
            onClick(index);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          contextRef.current = createContextFromEvent(e);
          setOpen(true);
        }}
      >
        {choice.text}
        <PatternResponseElement choice={choice} setRef={setRef} />
      </Button>
      {/* Only show popup if onEdit or onDelete is defined */}
      {onEdit || onDelete ? (
        <Popup
          basic
          context={contextRef}
          onClose={() => setOpen(false)}
          open={open}
        >
          <Menu
            items={[...menuItems, ...remainingOptions]}
            secondary
            vertical
          />
        </Popup>
      ) : null}
    </>
  );
};

export default PatternContextElement;
