import React from 'react';
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Check,
  Star as LucideStar,
  Upload,
  Film,
  Search,
  User,
  AlertCircle,
  CheckCircle2,
  Info,
  Shield,
  Zap,
  Lock,
  LogOut,
  Sliders,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
} from 'lucide-react';

const createIcon = (LucideIcon, defaultProps = {}) => {
  return ({ size = 20, color = 'currentColor', strokeWidth = 2, className = '', ...props }) => (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      {...defaultProps}
      {...props}
    />
  );
};

export const IconMenu = createIcon(Menu);
export const IconClose = createIcon(X);
export const IconSun = createIcon(Sun);
export const IconMoon = createIcon(Moon);
export const IconChevronDown = createIcon(ChevronDown);
export const IconChevronRight = createIcon(ChevronRight);
export const IconArrowRight = createIcon(ArrowRight);
export const IconCheck = createIcon(Check);
export const IconUpload = createIcon(Upload);
export const IconFilm = createIcon(Film);
export const IconSearch = createIcon(Search);
export const IconUser = createIcon(User);
export const IconAlert = createIcon(AlertCircle);
export const IconSuccess = createIcon(CheckCircle2);
export const IconInfo = createIcon(Info);
export const IconShield = createIcon(Shield);
export const IconZap = createIcon(Zap);
export const IconLock = createIcon(Lock);
export const IconLogOut = createIcon(LogOut);
export const IconSliders = createIcon(Sliders);
export const IconDollar = createIcon(DollarSign);
export const IconCalendar = createIcon(Calendar);
export const IconClock = createIcon(Clock);
export const IconFileText = createIcon(FileText);
export const IconExternalLink = createIcon(ExternalLink);

export const IconStar = ({ size = 20, filled = false, color = 'var(--accent-gold)', className = '', ...props }) => (
  <LucideStar
    size={size}
    color={color}
    fill={filled ? color : 'none'}
    strokeWidth={2}
    className={className}
    {...props}
  />
);

export const IconPlay = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M8.5 5.25L19.25 12L8.5 18.75V5.25Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconFilmReel = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="2" />
    <path d="M7 4V20" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M17 4V20" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M3 12H21" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const IconSparkles = ({ size = 24, color = 'var(--accent-gold)', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M12 2L14.25 9.75L22 12L14.25 14.25L12 22L9.75 14.25L2 12L9.75 9.75L12 2Z"
      fill={color}
    />
    <path
      d="M19 2L20.125 5.875L24 7L20.125 8.125L19 12L17.875 8.125L14 7L17.875 5.875L19 2Z"
      fill={color}
      opacity="0.7"
    />
  </svg>
);
