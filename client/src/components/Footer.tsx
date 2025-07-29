import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";
import { FaFacebookF, FaLine, FaInstagram } from "react-icons/fa";
import logoPath from "@assets/logo_1753786889875.png";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-16 font-thai">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logoPath} alt="Tourderwang Logo" className="h-8 w-8" />
              <h3 className="text-xl font-bold">Tourderwang</h3>
            </div>
            <p className="text-gray-300 mb-4">
              บริการส่งอาหารในวังสามหมอ อุดรธานี ส่งตรงถึงบ้านคุณ
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-300 hover:text-tourderwang-primary transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-tourderwang-primary transition-colors"
                aria-label="Line"
              >
                <FaLine className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-tourderwang-primary transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">บริการ</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-300 hover:text-tourderwang-primary transition-colors">
                    สั่งอาหาร
                  </a>
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-tourderwang-primary transition-colors"
                >
                  ติดตามออเดอร์
                </a>
              </li>
              <li>
                <Link href="/dashboard">
                  <a className="text-gray-300 hover:text-tourderwang-primary transition-colors">
                    สำหรับร้านอาหาร
                  </a>
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-tourderwang-primary transition-colors"
                >
                  สมัครเป็นไรเดอร์
                </a>
              </li>
            </ul>
          </div>
          
          {/* Help */}
          <div>
            <h4 className="font-semibold mb-4">ช่วยเหลือ</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-tourderwang-primary transition-colors"
                >
                  วิธีการสั่งอาหาร
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-tourderwang-primary transition-colors"
                >
                  การชำระเงิน
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-tourderwang-primary transition-colors"
                >
                  เงื่อนไขการใช้งาน
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-tourderwang-primary transition-colors"
                >
                  นโยบายความเป็นส่วนตัว
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">ติดต่อเรา</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>042-123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>hello@tourderwang.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>วังสามหมอ, อุดรธานี</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            &copy; 2024 Tourderwang. สงวนลิขสิทธิ์ทั้งหมด
          </p>
        </div>
      </div>
    </footer>
  );
}
