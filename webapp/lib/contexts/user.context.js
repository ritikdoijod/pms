"use client";

import * as React from "react";

const UserContext = React.createContext();

const UserProvider = ({ initialUser, children }) => {
  const [user, setUser] = React.useState(initialUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

const useCurrentUser = () => React.useContext(UserContext);

export { UserProvider, useCurrentUser };
