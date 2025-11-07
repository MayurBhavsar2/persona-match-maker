import React, { useEffect, useState } from 'react';
import { 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  User, 
  Phone,
  UserCheck,
  Upload,
  BarChart3,
  Plus,
  List
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "@/assets/logo.png";
import { toast } from "@/components/ui/use-toast";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  subItems?: NavigationItem[];
}

interface EnhancedNavbarProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

const EnhancedNavbar: React.FC<EnhancedNavbarProps> = ({ 
  currentSection, 
  onSectionChange 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; role: string; phone: string; isAdmin: boolean } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation structure based on requirements
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      id: 'users',
      label: 'Users',
      icon: User,
      subItems: [
        {
          id: 'add-user',
          label: 'Add User',
          icon: Plus,
          path: '/users/create'
        },
        {
          id: 'users-list',
          label: 'Users List',
          icon: List,
          path: '/users/list'
        }
      ]
    },
    {
      id: 'job-descriptions',
      label: 'Job Descriptions',
      icon: FileText,
      subItems: [
        {
          id: 'create-jd',
          label: 'Create New JD',
          icon: Plus,
          path: '/jd/create'
        },
        {
          id: 'jd-list',
          label: 'View JD List',
          icon: List,
          path: '/jd/list'
        }
      ]
    },
    {
      id: 'persona-management',
      label: 'Persona Management',
      icon: UserCheck,
      subItems: [
        {
          id: 'create-persona',
          label: 'Create Persona',
          icon: Plus,
          path: '/persona/create'
        },
        {
          id: 'persona-list',
          label: 'View Persona List',
          icon: List,
          path: '/persona/list'
        }
      ]
    },
    {
      id: 'candidate-processing',
      label: 'Candidate Processing',
      icon: Users,
      subItems: [
        {
          id: 'upload-resumes',
          label: 'Upload Resumes',
          icon: Upload,
          path: '/candidate/upload'
        },
        {
          id: 'candidate-list',
          label: 'View Candidates',
          icon: List,
          path: '/candidate/list'
        }
      ]
    },
    {
      id: 'evaluation',
      label: 'Evaluation',
      icon: BarChart3,
      subItems: [
        {
          id: 'start-evaluation',
          label: 'Start Evaluation',
          icon: Plus,
          path: '/evaluation/start'
        },
        {
          id: 'evaluation-results',
          label: 'View Results',
          icon: List,
          path: '/evaluation/results'
        }
      ]
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const isActiveSection = (item: NavigationItem): boolean => {
    if (item.path && location.pathname === item.path) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => 
        subItem.path && location.pathname.startsWith(subItem.path.split('/')[1] + '/')
      );
    }
    return false;
  };

  const isActiveSubItem = (subItem: NavigationItem): boolean => {
    return subItem.path ? location.pathname === subItem.path : false;
  };

  const handleNavigation = (path: string, sectionId?: string) => {
    navigate(path);
    setIsSidebarOpen(false);
    if (sectionId && onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const normalizedUser = {
        name: `${parsed.first_name || ""} ${parsed.last_name || ""}`.trim(),
        email: parsed.email || "",
        role: parsed.role_name || "N/A",
        phone: parsed.phone || "N/A",
        isAdmin: parsed.role_name === "Admin",
      };
      setUser(normalizedUser);
    }
  }, []);

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => {
    // Show Users menu only for Admin users
    if (item.id === 'users') {
      return user?.isAdmin === true;
    }
    // Show all other menu items for all users
    return true;
  });

  // Auto-expand active sections
  useEffect(() => {
    filteredNavigationItems.forEach(item => {
      if (item.subItems && isActiveSection(item)) {
        if (!expandedSections.includes(item.id)) {
          setExpandedSections(prev => [...prev, item.id]);
        }
      }
    });
  }, [location.pathname, filteredNavigationItems]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Navbar */}
      <header className="bg-background border-b border-gray-400 shadow-xl h-18 sticky top-0 z-40">
        <div className="w-full px-5 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSidebar}
                className="p-2 cursor-pointer rounded-lg transition-colors hover:bg-accent"
                aria-label="Toggle menu"
              >
                <Menu className="h-7 w-7 text-gray-800" />
              </button>
              <div className="w-15 h-15 flex items-center justify-center">
                <img src={logoImage} alt="Altumind Logo" className="w-16 h-16 object-contain" />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 hover:bg-accent">
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-foreground">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {user ? user.name : "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user ? user.name : "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user ? user.email : "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="cursor-default">
                  <User className="mr-2 h-4 w-4" />
                  <span>Role: {user ? user.role : "N/A"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-default">
                  <Phone className="mr-2 h-4 w-4" />
                  <span>Phone: {user ? user.phone : "N/A"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[50] transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold text-white">Altumind</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-gray-300" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {filteredNavigationItems.map((item) => {
                const isActive = isActiveSection(item);
                const isExpanded = expandedSections.includes(item.id);
                const IconComponent = item.icon;

                return (
                  <li key={item.id}>
                    {item.subItems ? (
                      // Section with submenu
                      <>
                        <button
                          onClick={() => toggleSection(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                            isActive 
                              ? 'bg-slate-700 text-white' 
                              : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <IconComponent className={`h-5 w-5 ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                          }`} />
                          <span className="font-medium flex-1 text-left">{item.label}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        
                        {/* Submenu */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <ul className="space-y-1 mt-1">
                            {item.subItems.map((subItem) => {
                              const isSubActive = isActiveSubItem(subItem);
                              const SubIconComponent = subItem.icon;
                              
                              return (
                                <li key={subItem.id}>
                                  <button
                                    onClick={() => subItem.path && handleNavigation(subItem.path, item.id)}
                                    className={`w-full flex items-center gap-3 px-6 py-2 text-sm rounded-lg transition-colors ${
                                      isSubActive
                                        ? 'bg-slate-600 text-white'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700'
                                    }`}
                                  >
                                    <SubIconComponent className="h-4 w-4" />
                                    <span>{subItem.label}</span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </>
                    ) : (
                      // Direct navigation item
                      <button
                        onClick={() => item.path && handleNavigation(item.path, item.id)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                          isActive 
                            ? 'bg-slate-700 text-white' 
                            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                        }`} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default EnhancedNavbar;