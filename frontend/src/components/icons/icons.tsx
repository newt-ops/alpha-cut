import React, { ComponentType, SVGProps } from 'react';
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
  BarChart3,
  Folder,
  Plus,
  Users,
  Settings,
  Volume2,
  VolumeX,
  RefreshCw,
  LucideProps,
} from 'lucide-react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
  filled?: boolean;
}

const createIcon = (LucideIcon: ComponentType<LucideProps>, defaultProps: LucideProps = {}) => {
  return ({ size = 20, color = 'currentColor', strokeWidth = 2, className = '', ...props }: IconProps) => (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      {...defaultProps}
      {...(props as any)}
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
export const IconBarChart = createIcon(BarChart3);
export const IconFolder = createIcon(Folder);
export const IconPlus = createIcon(Plus);
export const IconUsers = createIcon(Users);
export const IconSettings = createIcon(Settings);
export const IconVolume = createIcon(Volume2);
export const IconVolumeMute = createIcon(VolumeX);
export const IconRefreshCw = createIcon(RefreshCw);

export const IconStar: React.FC<IconProps> = ({ size = 20, filled = false, color = 'var(--accent-gold)', className = '', ...props }) => (
  <LucideStar
    size={size}
    color={color}
    fill={filled ? color : 'none'}
    strokeWidth={2}
    className={className}
    {...(props as any)}
  />
);

export const IconPlay: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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

export const IconFilmReel: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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

export const IconSparkles: React.FC<IconProps> = ({ size = 24, color = 'var(--accent-gold)', className = '', ...props }) => (
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

export const IconGoogle: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const IconInstagram: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export const IconTiktok: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

export const IconTelegram: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export const IconBell: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);
