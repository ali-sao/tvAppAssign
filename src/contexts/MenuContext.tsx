import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MenuContextValue {
  isMenuFocused: boolean;
  setMenuFocused: (focused: boolean) => void;
}

interface MenuProviderProps {
  children: ReactNode;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [isMenuFocused, setIsMenuFocused] = useState(false);

  const setMenuFocused = (focused: boolean) => {
    setIsMenuFocused(focused);
  };

  const contextValue: MenuContextValue = {
    isMenuFocused,
    setMenuFocused,
  };

  return (
    <MenuContext.Provider value={contextValue}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = (): MenuContextValue => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}; 