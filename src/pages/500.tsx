import React from 'react';
import Link from 'next/link';

export default function Custom500() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <h1 className="text-9xl font-extrabold text-red-600 tracking-widest">500</h1>
      <div className="bg-red-500 text-white px-2 text-sm rounded rotate-12 absolute">
        Server Error
      </div>
      <button className="mt-8">
        <Link
          href="/"
          className="relative inline-block text-sm font-medium text-red-500 group active:text-red-600 focus:outline-none focus:ring"
        >
          <span className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-red-500 group-hover:translate-y-0 group-hover:translate-x-0"></span>
          <span className="relative block px-8 py-3 bg-[#1A2238] border border-current">
            <div className="flex items-center gap-2 text-white">Go Home</div>
          </span>
        </Link>
      </button>
    </div>
  );
}
