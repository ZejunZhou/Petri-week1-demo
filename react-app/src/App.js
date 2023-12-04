import React from "react";
import { useState } from "react";
import Flow from "./petri-flow-component/Flow";
import GoogleLogin from "./login-component/GoogleLogin";
import { BrowserRouter as Router, Routes, Route, Link, useLocation} from "react-router-dom";
import NatOutlinedIcon from '@mui/icons-material/NatOutlined';

function App() {
   const [isLogin, setLogin] = useState(false);  // props check customer's status
   const [userInfo, setUserInfo] = useState(null); //props hold customer log information

   console.log(isLogin)
   console.log(userInfo)

   return (
    <div>
      <Routes>
        <Route path="/login" element ={<GoogleLogin setLogin={setLogin} setUserInfo={setUserInfo} isLogin={isLogin} userInfo={userInfo}/>} />
        <Route path="/" element={isLogin ? <Flow userInfo={userInfo}/> : 
          <>
            <div style={{background: "linear-gradient(90deg, hsla(208, 33%, 21%, 1) 0%, hsla(211, 36%, 46%, 1) 100%)", paddingTop: "200px", 
            height: "100vh"}}>
              <div style={{textAlign: "center",}}>
                <div style={{display: 'flex', marginLeft: "43%", marginBottom: "100px"}}>
                  <NatOutlinedIcon sx={{width: "40px", height: "40px", mt: '4px', mx: '10px', color: 'warning.main'}}/>
                  <h1 style={{ color: '#FB8C00'}}><b>Statewise</b></h1>
                </div>
                <h3 style={{ color: '#FFFFFF'}}>Please log in to access Statewise</h3>
                <GoogleLogin setLogin={setLogin} setUserInfo={setUserInfo} isLogin={isLogin} userInfo={userInfo}/>
              </div>
            </div>
          </>
        } />
      </Routes>
    </div>
   )
}

export default App;
