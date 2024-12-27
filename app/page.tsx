import Header from './components/Header'
import localFont from 'next/font/local'
 
const koch = localFont({
  src: '../public/fonts/Koch Fraktur.ttf',
  weight: '100',
})

export default function Home() {
  return (
    <div>
      <Header />
      <main className='flex min-h-screen flex-col items-center justify-between'>
        <h1 className={`${koch.className} font-koch text-6xl mt-3`}>Chiqueirinho Avaloniano</h1>
      </main>
    </div>
  );
}
