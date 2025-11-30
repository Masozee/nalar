/**
 * Icon Mapping: Common Names → HugeIcons
 *
 * This file maps common icon names to their HugeIcons equivalents.
 * Provides aliases for easier icon usage.
 *
 * Format: { CommonName: "HugeIconName" }
 */

export const iconMap: Record<string, string> = {
  // Common icons
  Home: "Home01Icon",
  User: "User01Icon",
  Users: "UserMultiple02Icon",
  Settings: "Settings01Icon",
  Search: "Search01Icon",
  Menu: "Menu01Icon",
  X: "Cancel01Icon",
  Check: "Checkmark01Icon",
  ChevronRight: "ArrowRight01Icon",
  ChevronLeft: "ArrowLeft01Icon",
  ChevronUp: "ArrowUp01Icon",
  ChevronDown: "ArrowDown01Icon",
  Plus: "Add01Icon",
  Minus: "Subtract01Icon",
  Edit: "Edit01Icon",
  Trash: "Delete01Icon",
  Save: "Save01Icon",
  Download: "Download01Icon",
  Upload: "Upload01Icon",
  Mail: "Mail01Icon",
  Phone: "Call01Icon",
  Calendar: "Calendar01Icon",
  Clock: "Clock01Icon",
  MapPin: "Location01Icon",
  Star: "Star01Icon",
  Heart: "Favourite01Icon",
  Share: "Share01Icon",
  Copy: "Copy01Icon",
  File: "File01Icon",
  Folder: "Folder01Icon",
  Image: "Image01Icon",
  Video: "Video01Icon",
  Music: "MusicNote01Icon",
  Bell: "Notification01Icon",
  Lock: "Lock01Icon",
  Unlock: "Unlock01Icon",
  Eye: "View01Icon",
  EyeOff: "ViewOff01Icon",
  Filter: "Filter01Icon",
  RefreshCw: "Refresh01Icon",
  MoreVertical: "MoreVertical01Icon",
  MoreHorizontal: "MoreHorizontal01Icon",
  Info: "InformationCircle01Icon",
  AlertCircle: "Alert01Icon",
  CheckCircle: "CheckmarkCircle01Icon",
  XCircle: "CancelCircleIcon",
  HelpCircle: "HelpCircle01Icon",
  ExternalLink: "Link01Icon",
  Link: "LinkSquare01Icon",
  Paperclip: "Attachment01Icon",
  LogOut: "Logout01Icon",
  LogIn: "Login01Icon",

  // Navigation
  ArrowRight: "ArrowRight01Icon",
  ArrowLeft: "ArrowLeft01Icon",
  ArrowUp: "ArrowUp01Icon",
  ArrowDown: "ArrowDown01Icon",

  // UI Elements
  Loader: "Loading01Icon",
  Spinner: "Loading02Icon",
  Loading: "Loading01Icon",

  // File operations
  FileText: "File01Icon",
  FilePlus: "FileAddIcon",
  FileCheck: "FileSecurityIcon",
  FileDown: "FileDownloadIcon",

  // Business/Finance
  DollarSign: "Dollar01Icon",
  CreditCard: "CreditCard01Icon",
  Receipt: "Invoice01Icon",
  ShoppingCart: "ShoppingCart01Icon",
  Package: "Package01Icon",
  Truck: "Truck01Icon",

  // Communication
  MessageSquare: "Message01Icon",
  MessageCircle: "Chat01Icon",
  Send: "Send01Icon",

  // Data
  Database: "Database01Icon",
  Server: "Server01Icon",
  Cloud: "Cloud01Icon",

  // Charts & Analytics
  TrendingUp: "AnalyticsUpIcon",
  TrendingDown: "AnalyticsDownIcon",

  // Media
  Camera: "Camera01Icon",
  Mic: "Microphone01Icon",
  Video: "Video01Icon",

  // Social
  Twitter: "TwitterIcon",
  Facebook: "FacebookIcon",
  Instagram: "InstagramIcon",
  Youtube: "YoutubeIcon",
  Linkedin: "LinkedinIcon",
  Github: "GithubIcon",

  // Additional icons from app-sidebar
  Archive: "Archive01Icon",
  AreaChart: "AnalyticsUpIcon",
  BadgeCheck: "Award01Icon",
  BarChart3: "PresentationBarChart01Icon",
  Bookmark: "Bookmark01Icon",
  BookOpen: "BookOpen01Icon",
  Boxes: "DeliveryBox01Icon",
  Building: "Building01Icon",
  Building2: "Building02Icon",
  CalendarCheck: "CalendarCheckIn01Icon",
  CalendarDays: "Calendar03Icon",
  CalendarRange: "Calendar04Icon",
  Car: "Car01Icon",
  CheckSquare: "TickSquareIcon",
  ChevronsUpDown: "SortingAZ01Icon",
  ChevronsLeft: "ArrowLeftDoubleIcon",
  ChevronsRight: "ArrowRightDoubleIcon",
  CircleDollarSign: "DollarCircleIcon",
  Clipboard: "Clipboard01Icon",
  ClipboardCheck: "Task01Icon",
  ClipboardList: "TaskDaily01Icon",
  Cog: "Settings02Icon",
  Command: "CommandIcon",
  Contrast: "DarkModeIcon",
  Crop: "Crop01Icon",
  FileSpreadsheet: "Csv01Icon",
  FilePlus2: "FileAdd01Icon",
  FileType: "FileFavouriteIcon",
  Flag: "Flag01Icon",
  FlaskConical: "Chemistry01Icon",
  FolderOpen: "FolderOpen01Icon",
  GitBranch: "GitBranchIcon",
  Globe: "Globe01Icon",
  GraduationCap: "Mortarboard01Icon",
  HardDrive: "HardDriveIcon",
  History: "WorkHistoryIcon",
  ImageDown: "ImageDownloadIcon",
  Inbox: "Inbox01Icon",
  KeyRound: "Key01Icon",
  Layers: "Layers01Icon",
  LayoutDashboard: "DashboardSquare01Icon",
  LayoutGrid: "LayoutGridIcon",
  ListChecks: "TaskDone01Icon",
  ListOrdered: "ArrangeIcon",
  Maximize: "Maximize01Icon",
  Megaphone: "Megaphone01Icon",
  Merge: "GitMergeIcon",
  Minimize2: "Minimize01Icon",
  Network: "Structure01Icon",
  PackageCheck: "PackageDeliveredIcon",
  PackageSearch: "PackageSearchIcon",
  PanelLeftIcon: "SidebarLeft01Icon",
  PenLine: "PenTool01Icon",
  PenTool: "PenTool02Icon",
  Scissors: "ScissorIcon",
  ScrollText: "ScrollIcon",
  Share2: "Share01Icon",
  ShieldCheck: "SecurityCheckIcon",
  Shrink: "Minimize02Icon",
  Square: "SquareIcon",
  Stamp: "StampIcon",
  Sun: "Sun01Icon",
  Tag: "Tag01Icon",
  Target: "Target01Icon",
  Ticket: "Ticket01Icon",
  Timer: "Timer01Icon",
  UserCheck: "UserCheck01Icon",
  UserCog: "UserSettings01Icon",
  Wallet: "Wallet01Icon",
  Warehouse: "Home02Icon",
  Wrench: "Settings04Icon",
  Wifi: "Wifi01Icon",
  QrCode: "QrCodeIcon",

  // Add more mappings as needed
  // Format: CommonName: "HugeIconName",
}

/**
 * Reverse mapping: HugeIcons → Common Names
 * Useful for finding the common name for a HugeIcon
 */
export const reverseIconMap: Record<string, string> = Object.entries(iconMap).reduce(
  (acc, [commonName, hugeName]) => {
    acc[hugeName] = commonName
    return acc
  },
  {} as Record<string, string>
)

/**
 * Check if a common name has a mapped HugeIcons equivalent
 */
export function hasMappedIcon(commonIconName: string): boolean {
  return commonIconName in iconMap
}

/**
 * Get the mapped HugeIcons name for a common icon name
 */
export function getMappedIconName(commonIconName: string): string | undefined {
  return iconMap[commonIconName]
}
