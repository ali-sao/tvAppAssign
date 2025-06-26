import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DirectionProvider } from './src/contexts/DirectionContext';
import { MenuProvider } from './src/contexts/MenuContext';

export default function App() {
  return (
    <DirectionProvider>
      <MenuProvider>
        <AppNavigator />
      </MenuProvider>
    </DirectionProvider>
  );
}
