/* Lucide-style inline SVG icons. All take size & className. */
const Icon = ({ d, size = 16, className = "", strokeWidth = 1.75, fill = "none", children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);

const IconLayout = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon>;
const IconCalendar = (p) => <Icon {...p}><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v3M16 3v3"/></Icon>;
const IconUsers = (p) => <Icon {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.5c2.8.4 5 2.5 5 5"/></Icon>;
const IconFile = (p) => <Icon {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></Icon>;
const IconActivity = (p) => <Icon {...p}><path d="M3 12h4l2.5-7 4 14 2.5-7H21"/></Icon>;
const IconCard = (p) => <Icon {...p}><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15.5h3"/></Icon>;
const IconReceipt = (p) => <Icon {...p}><path d="M5 3h14v18l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L5 21z"/><path d="M9 8h6M9 12h6M9 16h4"/></Icon>;
const IconChart = (p) => <Icon {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></Icon>;
const IconBuilding = (p) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></Icon>;
const IconTeam = (p) => <Icon {...p}><circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>;
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></Icon>;
const IconBell = (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5"/></Icon>;
const IconChevronDown = (p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>;
const IconChevronRight = (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>;
const IconChevronLeft = (p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IconSun = (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></Icon>;
const IconMoon = (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Icon>;
const IconArrowUp = (p) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>;
const IconArrowDown = (p) => <Icon {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Icon>;
const IconArrowRight = (p) => <Icon {...p}><path d="M5 12h14M12 5l7 7-7 7"/></Icon>;
const IconMore = (p) => <Icon {...p}><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/></Icon>;
const IconDot = (p) => <Icon {...p}><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/></Icon>;
const IconWhatsApp = (p) => <Icon {...p}><path d="M20.5 12a8.5 8.5 0 1 1-15.5 4.8L3 21l4.4-2A8.5 8.5 0 0 0 20.5 12z"/><path d="M8.5 9.5c.2 1.5 1 3 2 4 1 1 2.5 1.8 4 2 .5.1 1-.2 1.2-.7l.3-.7c.2-.4 0-.9-.4-1.1l-1.4-.6c-.4-.2-.8-.1-1.1.2l-.5.5a6 6 0 0 1-2.4-2.4l.5-.5c.3-.3.4-.7.2-1.1l-.6-1.4c-.2-.4-.7-.6-1.1-.4l-.7.3c-.5.2-.8.7-.7 1.2z"/></Icon>;
const IconPlay = (p) => <Icon {...p}><path d="M8 5v14l11-7z" fill="currentColor"/></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
const IconMapPin = (p) => <Icon {...p}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></Icon>;
const IconPhone = (p) => <Icon {...p}><path d="M22 16.92V20a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3.08a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.34a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></Icon>;
const IconHeart = (p) => <Icon {...p}><path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.66 10.94 4.6a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.79 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></Icon>;
const IconWatch = (p) => <Icon {...p}><circle cx="12" cy="12" r="6"/><path d="M16 4l-1-2h-6l-1 2M8 20l1 2h6l1-2"/></Icon>;
const IconHome = (p) => <Icon {...p}><path d="M3 11l9-8 9 8M5 9.5V21h14V9.5"/></Icon>;
const IconMessage = (p) => <Icon {...p}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></Icon>;
const IconUser = (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></Icon>;
const IconList = (p) => <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></Icon>;
const IconFilter = (p) => <Icon {...p}><path d="M3 4h18l-7 9v6l-4-2v-4z"/></Icon>;
const IconStar = (p) => <Icon {...p}><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9L2 9.3l6.9-1z"/></Icon>;
const IconShield = (p) => <Icon {...p}><path d="M12 2l8 3v6c0 5-3.5 9.4-8 11-4.5-1.6-8-6-8-11V5z"/></Icon>;
const IconTrend = (p) => <Icon {...p}><path d="M3 17l6-6 4 4 8-8M14 7h7v7"/></Icon>;
const IconGrid = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>;
const IconLayers = (p) => <Icon {...p}><path d="M12 2l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/></Icon>;
const IconEdit = (p) => <Icon {...p}><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.12 2.12 0 1 1 3 3L12 15l-4 1 1-4z"/></Icon>;
const IconBattery = (p) => <Icon {...p}><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/><rect x="4" y="9" width="10" height="6" fill="currentColor" stroke="none" rx="0.5"/></Icon>;
const IconUpload = (p) => <Icon {...p}><path d="M12 16V4M6 10l6-6 6 6M4 20h16"/></Icon>;
const IconDownload = (p) => <Icon {...p}><path d="M12 4v12M6 10l6 6 6-6M4 20h16"/></Icon>;
const IconBook = (p) => <Icon {...p}><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></Icon>;
const IconLink = (p) => <Icon {...p}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 1 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 1 0 7 7l1.5-1.5"/></Icon>;
const IconLock = (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Icon>;
const IconRefresh = (p) => <Icon {...p}><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></Icon>;
const IconWarning = (p) => <Icon {...p}><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></Icon>;
const IconX = (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>;
const IconCopy = (p) => <Icon {...p}><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M3 15V5a2 2 0 0 1 2-2h10"/></Icon>;
const IconExternal = (p) => <Icon {...p}><path d="M14 4h6v6M20 4l-9 9M16 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h6"/></Icon>;
const IconBriefcase = (p) => <Icon {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></Icon>;
const IconKey = (p) => <Icon {...p}><circle cx="8" cy="14" r="4"/><path d="M11 11l9-9 2 2-2 2 2 2-2 2-2-2-3 3"/></Icon>;
const IconBolt = (p) => <Icon {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></Icon>;
const IconBuilding2 = (p) => <Icon {...p}><path d="M3 21V8l7-5 7 5v13"/><path d="M3 21h18M9 21v-6h2v6M14 21v-6h2v6M7 11h.01M7 14h.01M13 8h.01M13 11h.01"/></Icon>;

const IconPackage = (p) => <Icon {...p}><path d="M21 8L12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v9"/></Icon>;
const IconTrophy = (p) => <Icon {...p}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v3a3 3 0 0 1-3 3M7 5H4v3a3 3 0 0 0 3 3"/></Icon>;
const IconCamera = (p) => <Icon {...p}><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/></Icon>;
const IconUtensils = (p) => <Icon {...p}><path d="M3 3v8a2 2 0 0 0 4 0V3M5 11v10M14 13h6V3a4 4 0 0 0-4 4v6h0v8"/></Icon>;
const IconFlame = (p) => <Icon {...p}><path d="M12 2c2 4-3 5-3 9a3 3 0 0 0 6 0c0-1 1 1 1 3a4 4 0 1 1-8 0c0-5 3-7 4-12z"/></Icon>;
const IconSend = (p) => <Icon {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></Icon>;
const IconMic = (p) => <Icon {...p}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></Icon>;
const IconImage = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="M21 15l-5-5L5 21"/></Icon>;
const IconPaperclip = (p) => <Icon {...p}><path d="M21 12.5l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 1 1-3-3l8-8"/></Icon>;

Object.assign(window, {
  IconPackage, IconTrophy, IconCamera, IconUtensils, IconFlame, IconSend, IconMic, IconImage, IconPaperclip,
  IconLayout, IconCalendar, IconUsers, IconFile, IconActivity, IconCard, IconReceipt, IconChart,
  IconBuilding, IconTeam, IconSettings, IconSearch, IconBell, IconCheck, IconChevronDown, IconChevronRight,
  IconChevronLeft, IconPlus, IconSun, IconMoon, IconArrowUp, IconArrowDown, IconArrowRight, IconMore,
  IconDot, IconWhatsApp, IconPlay, IconClock, IconMapPin, IconPhone, IconHeart, IconWatch, IconHome,
  IconMessage, IconUser, IconList, IconFilter, IconStar, IconShield, IconTrend, IconGrid, IconLayers,
  IconEdit, IconBattery, IconUpload, IconDownload, IconBook, IconLink, IconLock,
  IconRefresh, IconWarning, IconX, IconCopy, IconExternal, IconBriefcase, IconKey, IconBolt, IconBuilding2,
});
