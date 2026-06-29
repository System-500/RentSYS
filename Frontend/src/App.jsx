import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import CarList from './components/CarList';
import Form from './components/Form';
import Owner from './components/Owner';
import ProtectedRoute from './components/Protected';
import UserUpdate from './components/UserUpdate';
import Catalog from './components/Catalog';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/car" element={
          <ProtectedRoute> <CarList /> </ProtectedRoute>
        } />
        
        <Route path="/owner/:id" element={
          <ProtectedRoute> <Owner /> </ProtectedRoute>
        } />

        <Route path="/form" element={
          <ProtectedRoute> <Form /> </ProtectedRoute>
        } />
        
        <Route path="/form/:id" element={
          <ProtectedRoute> <Form /> </ProtectedRoute>
        } />

        <Route path="/userUpdate" element={
          <ProtectedRoute> <UserUpdate /> </ProtectedRoute>
        } />
        <Route path="/catalog" element={
          <ProtectedRoute> <Catalog /> </ProtectedRoute>
        } />

        <Route path="/catalog/:id" element={
          <ProtectedRoute> <Catalog /> </ProtectedRoute>
        } />


      </Routes>
    </BrowserRouter>
  );
}

export default App;