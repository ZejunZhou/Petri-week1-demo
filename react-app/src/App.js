import React from "react";
import { useState } from "react";
import Flow from "./petri-flow-component/Flow";
import GoogleLogin from "./login-component/GoogleLogin";
import { BrowserRouter as Router, Routes, Route, Link, useLocation} from "react-router-dom";

function App() {
   const [isLogin, setLogin] = useState(false);  // props check customer's status
   const [userInfo, setUserInfo] = useState(null); //props hold customer log information

   console.log(isLogin)
   console.log(userInfo)

   return (
    <div>
      <Routes>
        <Route path="/login" element ={<GoogleLogin setLogin={setLogin} setUserInfo={setUserInfo} isLogin={isLogin} userInfo={userInfo}/>} />
        <Route path="/" element={isLogin ? <Flow userInfo={userInfo}/> : <div><h1>Please log in to access the reactflow-app</h1><a href="/login">link to login</a></div>} />
      </Routes>
    </div>
   )
}

export default App;