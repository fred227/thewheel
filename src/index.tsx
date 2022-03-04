import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { Manual } from './doc/manual';
import { Route,Routes,BrowserRouter} from 'react-router-dom';

//
//<Route path="/manual" component={Manual}/>
ReactDOM.render(
    <StrictMode>
        <BrowserRouter>
        <Routes>
         <Route path="/*" element={<App/>}/>

        </Routes>
        </BrowserRouter>
    </StrictMode>,
    document.getElementById('app')
);