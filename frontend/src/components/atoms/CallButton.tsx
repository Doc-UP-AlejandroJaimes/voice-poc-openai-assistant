import React from 'react'

interface CallButtonProps {
  isActive: boolean
  onClick: () => void
  disabled?: boolean
}

export const CallButton: React.FC<CallButtonProps> = ({
  isActive,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 ${
        isActive
          ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse'
          : 'bg-green-500 hover:bg-green-600 focus:ring-green-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} shadow-lg`}
    >
      {isActive ? (
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          <line x1="7" y1="7" x2="13" y2="13" stroke="currentColor" strokeWidth="2" />
          <line x1="13" y1="7" x2="7" y2="13" stroke="currentColor" strokeWidth="2" />
        </svg>
      ) : (
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      )}
    </button>
  )
}