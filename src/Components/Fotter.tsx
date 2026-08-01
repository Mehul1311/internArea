import { Facebook, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <FooterSection 
            title="Internships by places" 
            items={[
              { name: "Delhi", link: "/internship" }, 
              { name: "Mumbai", link: "/internship" }, 
              { name: "Bangalore", link: "/internship" }, 
              { name: "Pune", link: "/internship" }, 
              { name: "Hyderabad", link: "/internship" }
            ]} 
          />
          <FooterSection 
            title="Internships by stream" 
            items={[
              { name: "Computer Science", link: "/internship" }, 
              { name: "Marketing", link: "/internship" }, 
              { name: "Finance", link: "/internship" }, 
              { name: "Graphic Design", link: "/internship" }, 
              { name: "Data Science", link: "/internship" }
            ]} 
          />
          <FooterSection 
            title="Jobs by places" 
            items={[
              { name: "Delhi", link: "/job" }, 
              { name: "Mumbai", link: "/job" }, 
              { name: "Bangalore", link: "/job" }, 
              { name: "Pune", link: "/job" }
            ]} 
          />
          <FooterSection 
            title="Jobs by streams" 
            items={[
              { name: "Software Engineer", link: "/job" }, 
              { name: "HR", link: "/job" }, 
              { name: "Sales", link: "/job" }, 
              { name: "Data Analyst", link: "/job" }
            ]} 
          />
          <FooterSection 
            title="About InternArea" 
            items={[
              { name: "About Us", link: "/about" }, 
              { name: "Careers", link: "/careers" }, 
              { name: "Contact", link: "/contact" },
              { name: "Terms & Conditions", link: "/terms" },
              { name: "Privacy Policy", link: "/privacy" }
            ]} 
          />
        </div>

        <hr className="my-10 border-gray-600" />

        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center">
          <p className="flex items-center gap-2 border border-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700">
            <i className="bi bi-google-play"></i> Get Android App
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Facebook className="w-6 h-6 hover:text-blue-400 cursor-pointer" />
            <Twitter className="w-6 h-6 hover:text-blue-400 cursor-pointer" />
            <Instagram className="w-6 h-6 hover:text-pink-400 cursor-pointer" />
          </div>
          <p className="mt-4 sm:mt-0 text-sm text-gray-400">© Copyright 2025. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ title, items }: { title: string, items: { name: string, link: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-300">{title}</h3>
      <div className="flex flex-col items-start mt-4 space-y-3">
        {items.map((item, index) => (
          <Link key={index} href={item.link} className="text-gray-400 hover:text-blue-400 hover:underline text-sm">
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}