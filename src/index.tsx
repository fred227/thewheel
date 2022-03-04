import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { Manual } from './doc/manual';
import { Link ,Router, Route,Routes,BrowserRouter} from 'react-router-dom';
import { MyTest } from './component/MyTest';

//
//<Route path="/manual" component={Manual}/>
ReactDOM.render(
    <StrictMode>
        <BrowserRouter>
        <Routes>
         <Route path="/*" element={<App/>}/>
         <Route path="/manual" element={<Manual/>}/>
         <Route path="/config" element={<MyTest/>}/>
        </Routes>
        </BrowserRouter>
    </StrictMode>,
    document.getElementById('app')
);