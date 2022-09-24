import React from 'react';
import { Provider } from 'react-redux';
import './App.scss';
import { Navbar } from './auth/navbar';
import store from './common/store';
import { Swap } from './swap/swap-container';

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <Navbar />  
        <Swap />
      </div>
    </Provider>
  );
}

export default App;
