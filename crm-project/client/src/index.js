import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { createStore } from "redux";

// Simple root reducer (replace with your actual reducer)
const initialState = {};
function rootReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

const store = createStore(rootReducer);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);