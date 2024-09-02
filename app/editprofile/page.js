// app/page.js

import React from "react";

const [activeComponent, setActiveComponent] = useState("postContainer");

const handleMenuClick = (componentName) => {
  setActiveComponent(componentName);
};

const handleProfileClick = () => {
  setActiveComponent("userProfile");
};

const DummyPage = () => {
  return (
    <div>
      <Sidebar onMenuClick={handleMenuClick} />
      <Header onProfileClick={handleProfileClick} />
    </div>
  );
};

export default DummyPage;
