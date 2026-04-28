'use client';

import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center pt-16">
      <Image
        src="/logo_motoclub.gif"
        alt="Logo Moto Club"
        width={250}
        height={250}
        priority
      />
    </div>
  );
}
