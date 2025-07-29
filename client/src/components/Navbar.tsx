import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, ShoppingCart, Menu, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/logo_1753786889875.png";

interface NavbarProps {
  onCartClick: () => void;
}

export default function Navbar({ onCartClick }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 font-thai">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer">
              <img src={logoPath} alt="Tourderwang Logo" className="h-10 w-10" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-tourderwang-primary">Tourderwang</h1>
                <p className="text-xs text-gray-500">Wang Sam Mo</p>
              </div>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="ค้นหาร้านอาหาร หรือเมนู..."
                className="w-full pl-10 pr-4 py-2 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 text-gray-600 hover:text-tourderwang-primary transition-colors"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-6 w-6" />
              <Badge className="absolute -top-1 -right-1 bg-tourderwang-warning text-white text-xs h-5 w-5 flex items-center justify-center p-0">
                0
              </Badge>
            </Button>
            
            <div className="hidden md:flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || ""} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {user?.firstName || "ผู้ใช้"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      แดชบอร์ดร้านอาหาร
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer"
                    onClick={() => window.location.href = "/api/logout"}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              <Link href="/dashboard">
                <Button variant="ghost" className="justify-start w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  แดชบอร์ดร้านอาหาร
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="justify-start w-full"
                onClick={() => window.location.href = "/api/logout"}
              >
                <LogOut className="h-4 w-4 mr-2" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
