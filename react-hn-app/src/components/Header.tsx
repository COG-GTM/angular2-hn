import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

export default function Header() {
  const location = useLocation()
  const { toggleSettings } = useSettings()

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  return (
    <header className="bg-orange-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/news/1" className="text-xl font-bold hover:text-orange-100">
              HN
            </Link>
            <nav className="flex space-x-4">
              <Link
                to="/news/1"
                className={`hover:text-orange-100 ${isActive('/news') ? 'font-semibold' : ''}`}
              >
                News
              </Link>
              <Link
                to="/newest/1"
                className={`hover:text-orange-100 ${isActive('/newest') ? 'font-semibold' : ''}`}
              >
                New
              </Link>
              <Link
                to="/show/1"
                className={`hover:text-orange-100 ${isActive('/show') ? 'font-semibold' : ''}`}
              >
                Show
              </Link>
              <Link
                to="/ask/1"
                className={`hover:text-orange-100 ${isActive('/ask') ? 'font-semibold' : ''}`}
              >
                Ask
              </Link>
              <Link
                to="/jobs/1"
                className={`hover:text-orange-100 ${isActive('/jobs') ? 'font-semibold' : ''}`}
              >
                Jobs
              </Link>
            </nav>
          </div>
          <button
            onClick={toggleSettings}
            className="p-2 hover:bg-orange-600 rounded"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
