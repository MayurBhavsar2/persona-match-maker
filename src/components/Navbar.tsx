import React, { useEffect, useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, FileText, Users, ChevronDown, ChevronRight, User,Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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



const NavbarWithSidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUsersSubmenuOpen, setIsUsersSubmenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string; phone: string } | null>(null);
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleUsersSubmenu = () => {
    setIsUsersSubmenuOpen(!isUsersSubmenuOpen);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U"; // Default initial if name is missing
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
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
      };
      setUser(normalizedUser);
    }
}, []);

const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/login");
  };
  if (!user) {
    return null; // or a loader if you want
  }

  return (
    <>
      {/* Navbar */}
      <header className="bg-background border-b border-gray-400 shadow-2xl h-18 sticky">
        <div className="w-full px-5 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 cursor-pointer rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-7 w-7 text-gray-800" />
            </button>
              <div className="w-15 h-15 flex items-center justify-center">
                <img src={logoImage} alt="Altumind Logo" className="w-16 h-16 object-contain" />
              </div>
              {/* <div>
                <h1 className="text-xl font-bold text-foreground">Altumind Tech</h1>
                <p className="text-sm text-muted-foreground">Intelligent Recruitment Platform</p>
              </div> */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 hover:bg-accent">
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-foreground">{getInitials(user?.name)}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground capitalize">{user ? user.name: "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user ? user.name: "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user ? user.email : "user@example.com"}</p>
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
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
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
        ></div>
      )}

      {/* Sidebar */}
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

          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={()=>{
                    navigate("/dashboard")
                    toggleSidebar()
                }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-slate-700 rounded-lg transition-colors group"
                >
                  <LayoutDashboard className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
                  <span className="font-medium">Dashboard</span>
                </button>
              </li>

              {/* JD */}
              <li>
                <button
                  onClick={()=>{
                    navigate("/jd-upload")
                    toggleSidebar()
                }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-slate-700 rounded-lg transition-colors group"
                >
                  <FileText className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
                  <span className="font-medium">JD</span>
                </button>
              </li>

              {/* Users with Submenu */}
              <li>
                <button
                  onClick={toggleUsersSubmenu}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-slate-700 rounded-lg transition-colors group"
                >
                  <Users className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
                  <span className="font-medium flex-1 text-left">Users</span>
                  {isUsersSubmenuOpen ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {/* Submenu */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isUsersSubmenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className="space-y-1">
                    <li className=''>
                      <button
                       onClick={()=>{
                        navigate("/add-user")
                        toggleSidebar()
                       }}
                        className="block w-full px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Add New User
                      </button>
                    </li>
                    <li>
                      <button
                       onClick={()=>{
                        navigate("/user-list")
                        toggleSidebar()
                       }}
                        className="block w-full px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Users List
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default NavbarWithSidebar;