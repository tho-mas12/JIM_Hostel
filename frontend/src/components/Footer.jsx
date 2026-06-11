import React from 'react';
import { Link } from 'react-router-dom';
import fwtLogo from '../assets/fwt_logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#0A1128] text-gray-400 py-10 px-8 border-t border-gray-800/40 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Project Branding */}
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">JIM HOSTEL</h2>
          <p className="text-xs text-[#38BDF8]/70 font-semibold tracking-wide">
            Hostel Attendance Management System
          </p>
        </div>

        {/* Middle Side: Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-6 text-xs font-semibold tracking-wide">
          <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
          <Link to="/mark-attendance" className="hover:text-white transition-colors duration-200">Attendance</Link>
          <Link to="/reports" className="hover:text-white transition-colors duration-200">Reports</Link>
          <Link to="/manage-students" className="hover:text-white transition-colors duration-200">Students</Link>
        </nav>

        {/* Right Side: Copyright & Company Logo */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <span className="text-[10px] font-medium tracking-wide">
            &copy; 2026 JIM Hostel. All Rights Reserved.
          </span>
          
          {/* FrontierWox Logo Badge */}
          <div className="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-xl border border-gray-800/40">
            {/* Logo Icon */}
            <img src={fwtLogo} alt="FrontierWox Logo" className="h-8 object-contain" />
            
            {/* Divider Line */}
            <div className="h-6 w-[1px] bg-gray-700/60" />
            
            {/* Company Name */}
            <div className="text-left leading-none">
              <div className="text-xs font-bold tracking-tight text-white flex items-center">
                <span className="text-[#F97316]">Frontier</span>
                <span className="text-[#38BDF8] ml-0.5 font-extrabold">Wox</span>
              </div>
              <div className="text-[6.5px] font-bold tracking-[0.18em] text-gray-400 uppercase leading-none mt-1">
                Tech Private Limited
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
