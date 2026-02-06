interface ShuttlecockIconProps {
  className?: string;
}

export function ShuttlecockIcon({ className }: ShuttlecockIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* コルク部分（下部の丸） */}
      <circle cx="12" cy="19" r="3.5" fill="currentColor" opacity="0.9" />
      {/* 羽根部分（上部の扇形） */}
      <path
        d="M12 2C9.5 2 7.5 4 7 7c-.3 1.8 0 3.5.5 5 .8 2.2 2.5 4 4.5 5 2-1 3.7-2.8 4.5-5 .5-1.5.8-3.2.5-5C16.5 4 14.5 2 12 2z"
        fill="currentColor"
        opacity="0.25"
      />
      {/* 羽根の筋（左） */}
      <path
        d="M10 3.5C9 5.5 8.5 8 9 11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* 羽根の筋（中央） */}
      <path
        d="M12 2.5V12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* 羽根の筋（右） */}
      <path
        d="M14 3.5C15 5.5 15.5 8 15 11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
