"use client"

import Link from "next/link"
import { Building2, Mail, MapPin, Phone } from "lucide-react"

export function UnifiedFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">SalarySync</span>
            </Link>
            <p className="text-gray-400 max-w-md mb-6">
              Professional Dutch payroll solutions for modern businesses. 
              Streamline your payroll process with confidence and compliance.
            </p>
            <div className="space-y-2 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@salarysync.nl</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+31 20 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Schiphol Boulevard 127, Schiphol 1118 BG, Netherlands</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-400 hover:text-white transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-400 hover:text-white transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Sales
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Resources Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-md font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/documentation" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-gray-400 hover:text-white transition-colors">
                    Payroll Guides
                  </Link>
                </li>
                <li>
                  <Link href="/webinars" className="text-gray-400 hover:text-white transition-colors">
                    Webinars
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/solutions/small-business" className="text-gray-400 hover:text-white transition-colors">
                    Small Business
                  </Link>
                </li>
                <li>
                  <Link href="/solutions/enterprise" className="text-gray-400 hover:text-white transition-colors">
                    Enterprise
                  </Link>
                </li>
                <li>
                  <Link href="/solutions/accountants" className="text-gray-400 hover:text-white transition-colors">
                    Accountants
                  </Link>
                </li>
                <li>
                  <Link href="/solutions/hr-teams" className="text-gray-400 hover:text-white transition-colors">
                    HR Teams
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/gdpr" className="text-gray-400 hover:text-white transition-colors">
                    GDPR Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 SalarySync B.V. All rights reserved. KvK: 12345678
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">🇳🇱 Netherlands</span>
            <span className="text-gray-400 text-sm">🇪🇺 GDPR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

