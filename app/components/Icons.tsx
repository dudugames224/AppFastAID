import React from "react";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

export const XIcon = ({ color = "#A9A9A9", size = 28 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);
export const HomeIcon = ({ color = "#A9A9A9"}) => (
  <Svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);
export const PracticeIcon = ({ color = "#A9A9A9" }) => (
  <Svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </Svg>
);
export const TrophyIcon = ({ color = "#A9A9A9" }) => (
  <Svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <Path d="M4 22h16" />
    <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <Path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Svg>
);
export const ShopIcon = ({ color = "#A9A9A9" }) => (
  <Svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <Path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <Path d="M2 7h20" />
  </Svg>
);
export const ProfileIcon = ({ color = "#A9A9A9" }) => (
  <Svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);


export const FireIcon = ({ color = "#fff", size = 32 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M14.5 10c-2.12 2.12-2.12 5.28 0 7.4-2.12 2.12-5.28 2.12-7.4 0-2.12-2.12-2.12-5.28 0-7.4 2.12-2.12 5.28-2.12 7.4 0Z" />
    <Path d="M12 22c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8Z" />
    <Path d="M12 2a4 4 0 0 0-4 4c0 2.21 1.79 4 4 4s4-1.79 4-4a4 4 0 0 0-4-4Z" />
  </Svg>
);
export const BrainIcon = ({ color = "#fff", size = 32 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h-3A2.5 2.5 0 0 1 4 4.5v0A2.5 2.5 0 0 1 6.5 2h3z M14.5 2A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7h-3A2.5 2.5 0 0 1 9 4.5v0A2.5 2.5 0 0 1 11.5 2h3z M9.5 17a2.5 2.5 0 0 1 2.5-2.5v0a2.5 2.5 0 0 1-2.5-2.5h-3A2.5 2.5 0 0 1 4 14.5v0A2.5 2.5 0 0 1 6.5 17h3z M14.5 17a2.5 2.5 0 0 1 2.5-2.5v0a2.5 2.5 0 0 1-2.5-2.5h-3a2.5 2.5 0 0 1-2.5 2.5v0a2.5 2.5 0 0 1 2.5 2.5h3z M16 22a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3z M8 22a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3z" />
  </Svg>
);
export const ThermometerIcon = ({ size = 32 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" />
  </Svg>
);
export const DropletsIcon = ({ size = 32 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.7-3.12l-1.1-1.1c-.2-.2-.5-.2-.7 0l-1.1 1.1C5.27 9.87 4.7 10.97 4.7 12.13c0 2.22 1.8 4.17 4 4.17zM12.7 20s.7-2 .7-3.5c0-1.8-1.3-3.5-3-3.5s-3 1.7-3 3.5c0 1.5.7 3.5.7 3.5" />
  </Svg>
);
export const BiohazardIcon = ({ size = 32 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke="#fff"
    strokeWidth="8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="50" cy="50" r="10" />
    <Path d="M50 35 V20" />
    <Path d="M50 65 V80" />
    <Path d="M25 75 L40 60" />
    <Path d="M75 75 L60 60" />
    <Path d="M25 25 L40 40" />
    <Path d="M75 25 L60 40" />
    <Path d="M50 60 A 25 25 0 0 1 25 75" />
    <Path d="M50 60 A 25 25 0 0 0 75 75" />
    <Path d="M50 40 A 25 25 0 0 1 25 25" />
    <Path d="M50 40 A 25 25 0 0 0 75 25" />
  </Svg>
);
export const FlaskIcon = ({ size = 32 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M9 2v13.63a4 4 0 0 0 .53 1.95l1.58 2.47a2 2 0 0 0 3.79-.11l1.57-2.47A4 4 0 0 0 17 15.63V2H9zm-2 0H5v1.63A4 4 0 0 0 5 3a4 4 0 0 0 0 1.37V10" />
  </Svg>
);
export const ZapIcon = ({ size = 32 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Svg>
);


export const HeartIcon = () => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="#EF4444"
    stroke="#EF4444"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);
export const PotionIcon = () => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#8A2BE2"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="m10 13 4-4" />
    <Path d="m14 13-4-4" />
  </Svg>
);
export const CheckCircleIcon = ({ size = 32 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <Polyline points="22 4 12 14.01 9 11.01" />
  </Svg>
);
export const CircleIcon = ({ size = 80, color = "grey" }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="42" fill={color} stroke="#333" strokeWidth="4" />
    <Circle
      cx="50"
      cy="50"
      r="30"
      fill="none"
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="3"
      strokeDasharray="5 5"
    />
  </Svg>
);
export const LockIcon = () => (
  <Svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="#A9A9A9"
    stroke="#121212"
    strokeWidth="2"
  >
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);
export const ChevronDownIcon = ({ color = "#A9A9A9" }) => (
  <Svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="m6 9 6 6 6-6" />
  </Svg>
);

export const RCPIcon = ({ size = 32, color = "#FF4B4B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C12 21 4 13 4 8C4 5 6 3 9 3C11 3 12 5 12 5C12 5 13 3 15 3C18 3 20 5 20 8C20 13 12 21 12 21Z"
      fill={color}
    />
    <Rect x="10" y="10" width="4" height="6" fill="#FFF" />
  </Svg>
);
export const BookIcon = ({ size = 32, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 2H16C17.1046 2 18 2.89543 18 4V20C18 21.1046 17.1046 22 16 22H4V2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 6H22V20H18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);


export const SirenIcon = ({ size = 32, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10.063 8.5C10.0219 8.34019 10 8.17265 10 8C10 6.89543 10.8954 6 12 6C12.1413 6 12.2792 6.01466 12.4122 6.04253M5 4L3 3M19 4L21 3M4 10H3M21 10H20M5.6 21H18.4C18.9601 21 19.2401 21 19.454 20.891C19.6422 20.7951 19.7951 20.6422 19.891 20.454C20 20.2401 20 19.9601 20 19.4V18.6C20 18.0399 20 17.7599 19.891 17.546C19.7951 17.3578 19.6422 17.2049 19.454 17.109C19.2401 17 18.9601 17 18.4 17H5.6C5.03995 17 4.75992 17 4.54601 17.109C4.35785 17.2049 4.20487 17.3578 4.10899 17.546C4 17.7599 4 18.0399 4 18.6V19.4C4 19.9601 4 20.2401 4.10899 20.454C4.20487 20.6422 4.35785 20.7951 4.54601 20.891C4.75992 21 5.03995 21 5.6 21ZM17 14V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V14H17Z" />
  </Svg>
);

export const CrossIcon = ({ size = 32, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="10" y="4" width="4" height="16" fill={color} />
    <Rect x="4" y="10" width="16" height="4" fill={color} />
  </Svg>
);
