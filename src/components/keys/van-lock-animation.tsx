"use client";

import { cn } from "@/lib/format";

/**
 * Side view of the van. Unlocking turns the body brass, lifts the door pin,
 * blinks the indicators and sends signal waves from the phone.
 */
export function VanLockAnimation({ unlocked, pulse }: { unlocked: boolean; pulse: number }): React.JSX.Element {
  return (
    <div className="w-full max-w-[420px]">
      <svg viewBox="0 0 400 190" className="h-auto w-full overflow-visible" role="img"
        aria-label={unlocked ? "Van unlocked" : "Van locked"}>
        <g key={`phone-${pulse}`}>
          <rect x="16" y="92" width="30" height="52" rx="6" fill="#0E1626" stroke="#0E1626" strokeWidth="2.2" />
          <rect x="21" y="98" width="20" height="36" rx="3"
            className="transition-colors duration-500" fill={unlocked ? "#A8761F" : "#5A6880"} />
          {[["M58 108 a18 18 0 0 1 0 24", 0], ["M68 101 a28 28 0 0 1 0 38", 0.1], ["M78 94 a38 38 0 0 1 0 52", 0.2]]
            .map(([d, delay]) => (
              <path key={String(d)} d={String(d)} fill="none" stroke="#A8761F" strokeWidth="2.4" strokeLinecap="round"
                style={{ opacity: 0, animation: pulse ? `vhWave .7s ${delay as number}s cubic-bezier(.22,.9,.3,1) forwards` : undefined }} />
            ))}
        </g>

        <g key={`van-${pulse}`} className={pulse > 0 ? "animate-settle" : undefined} style={{ transformOrigin: "center bottom" }}>
          <path
            d="M112 148 V74 a10 10 0 0 1 10-10 h108 a14 14 0 0 1 11 5 l34 42 h41 a16 16 0 0 1 16 16 v21 a8 8 0 0 1-8 8 H120 a8 8 0 0 1-8-8 z"
            className="transition-all duration-500" fill={unlocked ? "#A8761F" : "#0E1626"}
            stroke={unlocked ? "#A8761F" : "#0E1626"} strokeWidth="2.4" strokeLinejoin="round" />

          <rect x="128" y="78" width="46" height="34" rx="4" className="transition-colors duration-500"
            fill={unlocked ? "#F3E2C5" : "#5A6880"} stroke="#0E1626" strokeWidth="2" />
          <rect x="182" y="78" width="46" height="34" rx="4" className="transition-colors duration-500"
            fill={unlocked ? "#F3E2C5" : "#5A6880"} stroke="#0E1626" strokeWidth="2" />
          <path d="M238 78 h-2 v34 h40 z" className="transition-colors duration-500"
            fill={unlocked ? "#F3E2C5" : "#5A6880"} stroke="#0E1626" strokeWidth="2" />

          <rect x="118" y="132" width="196" height="7" rx="3.5" fill="#A8761F"
            className="transition-opacity duration-500" opacity={unlocked ? 0 : 0.9} />

          <path d="M178 70 V148" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2" />
          <path d="M186 124 h18" fill="none" stroke="#A8761F" strokeWidth="2.6" strokeLinecap="round" />

          <circle cx="172" cy="124" r="6" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2" />
          <rect x="169" y="118" width="6" height="11" rx="3" fill="#fff"
            className="transition-transform duration-500 ease-soft"
            style={{ transform: unlocked ? "translateY(-7px)" : "none" }} />

          {[[330, 128], [120, 126]].map(([cx, cy]) => (
            <circle key={cx} cx={cx} cy={cy} r="6" fill="#E8EDF6"
              style={{ animation: pulse ? "vhLamp .34s steps(1) 2" : undefined }} />
          ))}

          <circle cx="162" cy="152" r="19" fill="#0E1626" />
          <circle cx="162" cy="152" r="7.5" className="transition-colors duration-500" fill={unlocked ? "#fff" : "#A8761F"} />
          <circle cx="296" cy="152" r="19" fill="#0E1626" />
          <circle cx="296" cy="152" r="7.5" className="transition-colors duration-500" fill={unlocked ? "#fff" : "#A8761F"} />
        </g>

        <path d="M96 174 H132 M150 174 H236 M254 174 H340" stroke="#D5DCE8" strokeWidth="2.5" strokeLinecap="round" />

        <style>{`
          @keyframes vhWave { 0%{opacity:0;transform:translateX(-6px)} 35%{opacity:1} 100%{opacity:0;transform:translateX(10px)} }
          @keyframes vhLamp { 0%,100%{fill:#F5A524} 50%{fill:#E8EDF6} }
        `}</style>
      </svg>
    </div>
  );
}
