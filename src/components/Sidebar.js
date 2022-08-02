import React from "react";
import { Menu, Sidebar } from "semantic-ui-react";
import { Link } from "react-router-dom";

const CustomSidebar = (props) => {
  const { userId, authenticated, visible, setVisible, is_moderator } = props;
  return (
    <Sidebar
      as={Menu}
      animation="overlay"
      inverted
      onHide={() => setVisible(false)}
      vertical
      visible={visible}
      width="thin"
      style={{ background: "var(--primary-bg-color-dark)" }}
    >
      {authenticated && (
        <React.Fragment>
          <Link to={`/profile/${userId}`}>
            <Menu.Item link>Profile</Menu.Item>
          </Link>
          <Link to={`/experiments`}>
            <Menu.Item link>Lessons</Menu.Item>
          </Link>
          {is_moderator && (
            <>
              <Link to={`/modules`}>
                <Menu.Item link>Assignments</Menu.Item>
              </Link>
              <Link to={`/create/experiment`}>
                <Menu.Item link>Create Lesson</Menu.Item>
              </Link>
              <Link to={`/create/module`}>
                <Menu.Item link>Create Assignment</Menu.Item>
              </Link>
              <Link to={`/signup/`}>
                <Menu.Item link>Add User</Menu.Item>
              </Link>
              <Link to={`/profile/${userId}`}>
                <Menu.Item link>Profile</Menu.Item>
              </Link>
            </>
          )}
        </React.Fragment>
      )}
    </Sidebar>
  );
};

export default CustomSidebar;
