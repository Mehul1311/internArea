import React from 'react';
import Head from 'next/head';

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Us | InternArea</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Contact Us</h1>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>If you have any questions, feedback, or need support, feel free to reach out to us!</p>
            <p><strong>Email:</strong> support@internarea.example.com</p>
            <p><strong>Address:</strong> 123 Tech Park, Innovation Valley, Bengaluru, India</p>
          </div>
        </div>
      </div>
    </>
  );
}
