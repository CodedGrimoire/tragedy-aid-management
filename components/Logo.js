// components/Logo.js
export default function Logo() {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-lg">
          <svg
            width="28"  
            height="28" 
            viewBox="0 0 24 24"
            fill="none"
            className="text-red-600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3L4 7V17L12 21L20 17V7L12 3Z"
              fill="currentColor"
              fillOpacity="0.1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 8V16M8 12H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900 font-bengali tracking-wide">
            উদ্ধার
          </div>
        </div>
      </div>
    )
  }