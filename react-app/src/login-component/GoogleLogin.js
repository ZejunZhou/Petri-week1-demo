import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {useEffect } from 'react';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';


const GoogleLogin = ({isLogin, setLogin, userInfo, setUserInfo}) => {

  const navigate = useNavigate();

  const handleSuccess = async(codeResponse) => {
    const accessToken = codeResponse.access_token;
    await fetchUserInfo(accessToken);
  }

  const fetchUserInfo = async (accessToken) => {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const handleFailure = (error) => {
        alert("Google Login is Currently unavailable")
  }
  
  // reference from @react-oauth/google Library
  const googleLogin = useGoogleLogin({
    onSuccess: handleSuccess,
    onFailure: handleFailure,
  });
  
  useEffect(() => {
    if (userInfo && !isLogin) {
      setLogin(true);
      navigate('/')
    }
  }, [userInfo, isLogin, navigate]);

//   console.log(isLogin, "from google")
//   console.log(userInfo, "from google")


  return (
   <div style={{textAlign: "center", marginTop: "40px"}}>
    <Button variant="contained" onClick={googleLogin} startIcon={<GoogleIcon />} size="large" style={{textTransform: 'none', fontSize: '16px'}}> 
      <b>Continue with Google</b>
    </Button>
   </div>
  );
};

export default GoogleLogin;