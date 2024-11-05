'use client'

import { useEffect } from 'react';
import Header from './components/Header';

export default function Home() {

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log("Erro ao buscar usuários:", error);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <Header />
      <h1>Home</h1>
    </div>
  );
}
