import React, { useState } from "react";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky bg-slate-900 w-full m-0 p-4 justify-between items-center">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 inline-block text-transparent bg-clip-text ml-2">
            Plant Monitering
          </h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
