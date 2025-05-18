import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ChatPage from './pages/ChatPage';
import CallPage from './pages/CallPage';
import NotificationsPage from './pages/NotificationsPage';
import OnboardingPage from './pages/OnboardingPage';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import PageLoader from './components/PageLoader';
import Layout from './components/Layout';
import { useThemeStore } from './store/useThemeStore';



const App = () => {
  const { token, user } = useAuth();
  console.log(token);
  const Isonbordering = user?.isOnboarded ?? false;

  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore()

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);



  // useEffect(() => {
  //   const checkAuth = async () => {
  //     if (!token) return; // لو التوكن مش موجود، متكملش

  //     try {
  //       const res = await axios.get('http://localhost:5000/boards/me', {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       console.log(res.data);
  //       return res.data;
  //     } catch (error) {
  //       console.error('Error:', error.response?.data?.message || error.message);
  //     }
  //   };

  //   checkAuth();
  // }, [token]); // يتنفذ كل ما التوكن يتغير

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className='h-screen' data-theme={theme}>
      <Routes>
        <Route path='/' element={token && Isonbordering ? (<Layout showSidebar={true}><HomePage /></Layout>) : (<Navigate to={!token ? '/login' : '/onboarding'} />)} />
        <Route
          path="/chat/:id"
          element={
            token && Isonbordering ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!token ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/call/:id"
          element={
            token && Isonbordering ? (
              <CallPage />
            ) : (
              <Navigate to={!token ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route path='/notifications'
          element={
            token && Isonbordering ? (
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={!token ? "/login" : "/onboarding"} />
            )
          } />
        <Route path='/onboarding'
          element={
            token ? (
              !Isonbordering ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          } />
        <Route path='/login' element={
          !token ? <LoginPage /> : <Navigate to={Isonbordering ? "/" : "/onboarding"} />
        } />
        <Route path='/signup' element={<SignUpPage />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
