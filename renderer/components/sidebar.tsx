"use client";
import { useState } from "react";
import Link from 'next/link';  // Import Link from Next.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBars, faCog} from '@fortawesome/free-solid-svg-icons';
import router from "next/router";
const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const Menus = [
    { title: "Home", src: faHouse, path: "/home" },
    
    { title: "Setting", src: faCog, gap: true,path: "/settings" },
  ];

  return (
    <div className="flex">
      <div
  className={` ${open ? "w-72" : "w-20 "} bg-white border-b  h-screen p-5 pt-8 relative duration-300 backdrop-blur-md `}
>
        {/* <img
          src="/assets/control.png"
          className={`absolute cursor-pointer -right-3 top-9 w-7 border-dark-purple
           border-2 rounded-full  ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)}
        /> */}
        {/* <FontAwesomeIcon icon={faBars} className={`absolute cursor-pointer -right-3 top-9 w-7 border-dark-purple
           border-2 rounded-full  ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)}/> */}
        <div className="flex gap-x-4 items-center p-3">
          {/* <img
            src="/assets/smiley.svg"
            className={`cursor-pointer duration-500 ${open && "rotate-[360deg]"}`}
          /> */}
        <FontAwesomeIcon icon={faBars} className={`hover:bg-gray-400 cursor-pointer duration-500 text-gray-800 ${open && "rotate-[360deg]"}`} onClick={() => setOpen(!open)}/>

          <h1 onClick={() => setOpen(!open)}
            className={`text-gray-800 origin-left font-medium text-xl duration-200 ${!open && "scale-0"}`}
          >
            Control Panel
          </h1>
        </div>
        <ul className="pt-6">
          {Menus.map((Menu, index) => (
            <li
              key={index}
              className={`flex rounded-md p-3 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 hover:bg-gray-400
              ${Menu.gap ? "mt-9" : "mt-2"} ${index === 0 && "bg-light-white"}`}
              onClick={() => router.push(Menu.path)}
            >
              <Link href={Menu.path} className="flex items-center gap-x-4">
                <FontAwesomeIcon icon={Menu.src} className="text-gray-800"/>
                <span className={`${!open && "hidden"} origin-left duration-200 text-gray-800` }>{Menu.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
