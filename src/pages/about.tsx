import React from 'react';
import Head from 'next/head';

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us | InternArea</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">About InternArea</h1>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              Welcome to InternArea! We are a platform dedicated to connecting students and recent graduates with meaningful internships and full-time opportunities across the globe.
            </p>
            <p>
              Our mission is to bridge the gap between academic learning and industry requirements. By partnering with startups, enterprises, and NGOs, we ensure that you get the best hands-on experience to kickstart your career.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Vision</h2>
            <p>
              To create a world where every student has access to opportunities that match their skills and ambitions, regardless of their background or location.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verified internships and jobs</li>
              <li>Easy application process</li>
              <li>Resources for resume building and interview preparation</li>
              <li>A supportive community for peer-to-peer learning</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
