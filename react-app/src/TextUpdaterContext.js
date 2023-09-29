import React, { createContext, useContext, useState } from "react";

const TextUpdaterContext = createContext();

export const TextUpdaterProvider = ({ children }) => {
  const [inputText, setInputText] = useState("");

  const handleInputChange = (text) => {
    setInputText(text);
  };

  return (
    <TextUpdaterContext.Provider value={{ inputText, handleInputChange }}>
      {children}
    </TextUpdaterContext.Provider>
  );
};

export const useTextUpdater = () => {
  return useContext(TextUpdaterContext);
};
