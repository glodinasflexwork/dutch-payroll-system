"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Download,
  Mail
} from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
}

interface EmployeeActionsDropdownProps {
  employee: Employee
  onView: (employeeId: string) => void
  onEdit: (employeeId: string) => void
  onDelete: (employee: Employee) => void
  onToggleStatus?: (employeeId: string) => void
  onSendEmail?: (email: string) => void
  onExportData?: (employeeId: string) => void
}

export default function EmployeeActionsDropdown({
  employee,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onSendEmail,
  onExportData
}: EmployeeActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
        title="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {/* View Employee */}
          <button
            onClick={() => handleAction(() => onView(employee.id))}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 mr-3 text-gray-400" />
            View Details
          </button>

          {/* Edit Employee */}
          <button
            onClick={() => handleAction(() => onEdit(employee.id))}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4 mr-3 text-gray-400" />
            Edit Employee
          </button>

          {/* Send Email */}
          {onSendEmail && employee.email && (
            <button
              onClick={() => handleAction(() => onSendEmail!(employee.email))}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-4 h-4 mr-3 text-gray-400" />
              Send Email
            </button>
          )}

          {/* Export Data */}
          {onExportData && (
            <button
              onClick={() => handleAction(() => onExportData!(employee.id))}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-3 text-gray-400" />
              Export Data
            </button>
          )}

          {/* Toggle Status */}
          {onToggleStatus && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => handleAction(() => onToggleStatus!(employee.id))}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {employee.isActive ? (
                  <>
                    <UserX className="w-4 h-4 mr-3 text-orange-400" />
                    Deactivate Employee
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-3 text-green-400" />
                    Activate Employee
                  </>
                )}
              </button>
            </>
          )}

          {/* Delete Employee */}
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => handleAction(() => onDelete(employee))}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-3" />
            Delete Employee
          </button>
        </div>
      )}
    </div>
  )
}

