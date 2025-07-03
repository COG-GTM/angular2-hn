import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-8">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600">
        <p>
          Built with React • Inspired by{' '}
          <a
            href="https://news.ycombinator.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-600"
          >
            Hacker News
          </a>
        </p>
      </div>
    </footer>
  )
}
