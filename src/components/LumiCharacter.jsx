import React from "react";

export default function LumiCharacter({ thinking, size }) {
  return (
    <div className={"lumi-character" + (thinking ? " lumi-character-thinking" : "")} style={{ width: size, height: size }}>
      <svg viewBox="0 0 720 720" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LUMI, ein freundliches leuchtendes Glühwürmchen">
        <defs>
          <radialGradient id="lumiBodyGrad" cx="36%" cy="22%" r="78%">
            <stop offset="0%" stopColor="#30486e" />
            <stop offset="45%" stopColor="#16243a" />
            <stop offset="100%" stopColor="#07101e" />
          </radialGradient>
          <radialGradient id="lumiFaceGrad" cx="45%" cy="22%" r="70%">
            <stop offset="0%" stopColor="#1c3150" />
            <stop offset="100%" stopColor="#050b15" />
          </radialGradient>
          <radialGradient id="lumiBellyGrad" cx="45%" cy="18%" r="75%">
            <stop offset="0%" stopColor="#fff3a3" />
            <stop offset="42%" stopColor="#ffd15c" />
            <stop offset="100%" stopColor="#ff9f26" />
          </radialGradient>
          <radialGradient id="lumiWingGrad" cx="38%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#f7fff7" stopOpacity=".76" />
            <stop offset="42%" stopColor="#7fd9a8" stopOpacity=".45" />
            <stop offset="100%" stopColor="#ffcf66" stopOpacity=".18" />
          </radialGradient>
          <radialGradient id="lumiTipGrad" cx="42%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff7c6" />
            <stop offset="55%" stopColor="#ffcf66" />
            <stop offset="100%" stopColor="#ffb84d" />
          </radialGradient>
          <filter id="lumiSoftGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 1  0 0.72 0 0 .55  0 0 0.2 0 .12  0 0 0 .75 0" result="gold" />
            <feMerge><feMergeNode in="gold" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="lumiWingGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="lumiShadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="#000000" floodOpacity=".34" />
          </filter>
        </defs>
        <g id="lumiSparkles" opacity=".9">
          <circle cx="134" cy="186" r="4" fill="#ffcf66" /><circle cx="590" cy="192" r="3" fill="#7fd9a8" />
          <circle cx="615" cy="506" r="5" fill="#ffcf66" /><circle cx="112" cy="504" r="3" fill="#7fd9a8" />
          <circle cx="548" cy="404" r="2.8" fill="#ffcf66" /><circle cx="182" cy="404" r="2.8" fill="#fff3a3" />
          <circle cx="644" cy="318" r="3.2" fill="#fff3a3" /><circle cx="82" cy="320" r="3.2" fill="#7fd9a8" />
          <circle cx="480" cy="139" r="2.5" fill="#ffcf66" /><circle cx="247" cy="143" r="2.5" fill="#7fd9a8" />
        </g>
        <ellipse cx="360" cy="590" rx="110" ry="23" fill="#050b15" opacity=".45" filter="url(#lumiShadow)" />
        <g id="lumiBody" filter="url(#lumiShadow)">
          <g id="lumiWings" filter="url(#lumiWingGlow)">
            <path id="lumiLeftWingUpper" d="M300 365 C206 244 118 227 87 298 C58 364 151 420 301 389 C312 386 310 379 300 365Z" fill="url(#lumiWingGrad)" stroke="#ffcf66" strokeOpacity=".75" strokeWidth="4" />
            <path id="lumiRightWingUpper" d="M420 365 C514 244 602 227 633 298 C662 364 569 420 419 389 C408 386 410 379 420 365Z" fill="url(#lumiWingGrad)" stroke="#ffcf66" strokeOpacity=".75" strokeWidth="4" />
            <path id="lumiLeftWingLower" d="M305 402 C214 395 158 443 182 493 C208 548 289 510 331 423 C335 414 324 405 305 402Z" fill="url(#lumiWingGrad)" stroke="#7fd9a8" strokeOpacity=".45" strokeWidth="3" />
            <path id="lumiRightWingLower" d="M415 402 C506 395 562 443 538 493 C512 548 431 510 389 423 C385 414 396 405 415 402Z" fill="url(#lumiWingGrad)" stroke="#7fd9a8" strokeOpacity=".45" strokeWidth="3" />
            <path d="M155 322 C206 334 250 354 295 379" stroke="#d8ffe5" strokeOpacity=".38" strokeWidth="3" strokeLinecap="round" />
            <path d="M565 322 C514 334 470 354 425 379" stroke="#d8ffe5" strokeOpacity=".38" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g id="lumiAntennae" stroke="#16243a" strokeWidth="12" strokeLinecap="round">
            <path id="lumiAntennaLeft" d="M322 221 C301 174 265 156 224 154" />
            <path id="lumiAntennaRight" d="M398 221 C419 174 455 156 496 154" />
            <circle cx="221" cy="154" r="26" fill="url(#lumiTipGrad)" stroke="#ffcf66" strokeWidth="4" filter="url(#lumiSoftGlow)" />
            <circle cx="499" cy="154" r="26" fill="url(#lumiTipGrad)" stroke="#ffcf66" strokeWidth="4" filter="url(#lumiSoftGlow)" />
          </g>
          <ellipse cx="360" cy="326" rx="150" ry="135" fill="url(#lumiBodyGrad)" />
          <ellipse cx="360" cy="342" rx="118" ry="82" fill="url(#lumiFaceGrad)" stroke="#253c60" strokeWidth="3" opacity=".98" />
          <g id="lumiEyes"><ellipse cx="320" cy="333" rx="11" ry="31" fill="#fffdf4" />
          <ellipse cx="400" cy="333" rx="11" ry="31" fill="#fffdf4" /></g>
          <path d="M241 287 C280 207 385 177 464 236" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" opacity=".09" />
          <ellipse cx="360" cy="446" rx="86" ry="86" fill="url(#lumiBodyGrad)" />
          <g id="lumiBellyGlow" filter="url(#lumiSoftGlow)">
            <path d="M271 458 C285 551 435 551 449 458 C422 502 298 502 271 458Z" fill="url(#lumiBellyGrad)" />
            <path d="M286 492 C320 512 398 512 434 492" stroke="#fff3a3" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
          </g>
          <ellipse cx="283" cy="433" rx="24" ry="31" fill="url(#lumiBodyGrad)" transform="rotate(-22 283 433)" />
          <ellipse cx="437" cy="433" rx="24" ry="31" fill="url(#lumiBodyGrad)" transform="rotate(22 437 433)" />
        </g>
      </svg>
    </div>
  );
}
