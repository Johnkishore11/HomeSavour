import React, { createContext, useContext } from 'react';
import { colors } from './colors';

const ThemeContext = createContext(colors);

export const ThemeProvider = ({ children }) => {
    return (
        <ThemeContext.Provider value={colors}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
