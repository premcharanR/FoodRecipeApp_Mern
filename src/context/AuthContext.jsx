
import React, { createContext, useReducer, useEffect } from "react";

const initialState = {
    user: JSON.parse(localStorage.getItem("user")) || null, 
    isLoggedIn: !!localStorage.getItem("token"), 
};

const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return {
                user: action.payload,
                isLoggedIn: true,
            };
        case "LOGOUT":
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return {
                user: null,
                isLoggedIn: false,
            };
        default:
            return state;
    }
};

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
       
        if (state.user) {
            localStorage.setItem("user", JSON.stringify(state.user));
        }
    }, [state.user]); 

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};