'use client'

import Header from './components/Header'
import localFont from 'next/font/local'
import Leaderboard from "@/app/components/leaderboard/Leaderboard";
import Loading from '@/utils/Loading';

import { useEffect, useState } from 'react';

const koch = localFont({
  src: '../public/fonts/Koch Fraktur.ttf',
  weight: '100',
})

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

  //console.log(weekData);
  
  

  return (
    <div>
      <Header />
      {loading ? ( <Loading /> ) : (
      <main className='flex min-h-screen flex-col items-center justify-between'>
        <h1 className={`${koch.className} font-koch text-6xl mt-3`}>Chiqueirinho Avaloniano</h1>
        <div>
          <Leaderboard dungeons={weekData} />
        </div>
      </main>
      )}
    </div>
  );
}
