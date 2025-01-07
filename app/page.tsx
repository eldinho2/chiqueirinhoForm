'use client'

import Header from './components/Header'
import Leaderboard from "@/app/components/leaderboard/Leaderboard";
import Loading from '@/utils/Loading';

import { useEffect, useState } from 'react';


export default function Home() {
  const [weekData, setWeekData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeekData = async () => {
      const response = await fetch('/api/getAllTimeData');
      const data = await response.json();
      setWeekData(data);
      setLoading(false);
    };
    fetchWeekData();
  }, []);
  
  

  return (
    <div>
      <Header />
      {loading ? ( <Loading /> ) : (
      <main className='flex min-h-screen flex-col items-center justify-between'>
        <div>
          <Leaderboard dungeons={weekData} />
        </div>
      </main>
      )}
    </div>
  );
}
