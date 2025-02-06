import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function Home() {
  const imageUrl = "https://images.alphacoders.com/135/1354208.jpeg";
  
  return (
    <section className="relative">
      <img src={imageUrl} alt="Space background" className="w-full h-full object-cover"/>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
        <h1 className="text-5xl font-bold mb-4 text-white">Welcome to SpaceY</h1>
        <p className="text-xl mb-8 text-white">
          Pioneering the future of space travel and exploration. We are the future.
        </p>
        <Link href="/">
          <Button>Explore our missions</Button>
        </Link>
      </div>
    </section>
  );
}
