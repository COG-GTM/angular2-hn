import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-orange-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <Link to="/news/1" className="text-xl font-bold">
            Hacker News
          </Link>
          <div className="flex space-x-4">
            <Link to="/news/1" className="hover:text-orange-200">News</Link>
            <Link to="/newest/1" className="hover:text-orange-200">New</Link>
            <Link to="/show/1" className="hover:text-orange-200">Show</Link>
            <Link to="/ask/1" className="hover:text-orange-200">Ask</Link>
            <Link to="/jobs/1" className="hover:text-orange-200">Jobs</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
