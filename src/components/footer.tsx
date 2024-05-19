"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="mt-8 bg-gray-100 dark:bg-gray-800 py-6 px-4 md:px-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © 2024 luminus
        </p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <a
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            href="https://github.com/luminus-xd/Recruit-Arknights"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon className="w-5 h-5" />
            <span className="sr-only">GitHub</span>
          </a>
          <a
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            href="https://x.com/Midnight_dev2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TwitterIcon className="w-5 h-5" />
            <span className="sr-only">Twitter</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

interface GithubIconProps extends React.SVGProps<SVGSVGElement> {}
interface TwitterIconProps extends React.SVGProps<SVGSVGElement> {}

function GithubIcon(props: GithubIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0  0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function TwitterIcon(props: TwitterIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}
