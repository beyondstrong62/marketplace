import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './Layout/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProductUploadForm from './components/ProductUploadForm'
import Homepage from './pages/Homepage'
import MyProfile from './pages/MyProfile'
import ProductDetails from './pages/ProductDetails'
import AuthLayout from './pages/AuthLayout'

const App = () => {
  
  return (
    <Layout>

    <Routes>
      {/* homepage and product details anyone can open */}
      <Route path='/' element={<Homepage/>}/> 
      <Route path='/product/:productId' element={<ProductDetails/>}/>

      {/* logged in user cannot open login and signup page */}
      <Route path='/login' element={<AuthLayout authentication={false}><Login/></AuthLayout>}/>
      <Route path='/signup' element={<AuthLayout authentication={false}><Signup/></AuthLayout>}/>
      {/* only logged in user can open my profile , product form and  */}
      <Route path='/add-product' element={<AuthLayout><ProductUploadForm/></AuthLayout>}/>
      <Route path='/my-profile' element={<AuthLayout><MyProfile/></AuthLayout>}/>
    </Routes>
    
    </Layout>
    
  )
}

export default App