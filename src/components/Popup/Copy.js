import { useState, useRef } from "react";
import { Menu, Popup, Button, Input } from "semantic-ui-react";
import { createContextFromEvent } from "../utility";

const CopyContextIcon = ({ onClick }) => {
  const contextRef = useRef();
  const [open, setOpen] = useState(false);
  const [copyNumber, setCopyNumber] = useState(1);

  const menuItems = [
    {
      key: "copy",
      content: "Copy",
      icon: "copy",
      onClick: () => {
        onClick(copyNumber);
        setOpen(false);
      },
    },
    {
      key: "copy_multiple",
      content: (
        <>
          <Input
            //   Submit on Enter
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onClick(copyNumber);
              }
            }}
            type={"number"}
            value={copyNumber}
            onChange={(e) => {
              setCopyNumber(e.target.value);
            }}
          />
        </>
      ),
    },
  ];

  return (
    <>
      <Button
        link
        icon="copy"
        style={{ marginLeft: "auto" }}
        onClick={(e) => {
          e.preventDefault();
          contextRef.current = createContextFromEvent(e);
          onClick ? setOpen(true) : console.log("No onClick function");
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          contextRef.current = createContextFromEvent(e);
          setOpen(true);
        }}
      />
      <Popup
        basic
        context={contextRef}
        onClose={() => setOpen(false)}
        open={open}
      >
        <Menu items={menuItems} secondary vertical />
      </Popup>
    </>
  );
};

export default CopyContextIcon;
