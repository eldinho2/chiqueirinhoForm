import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dungeon');
  
  return null;
}
