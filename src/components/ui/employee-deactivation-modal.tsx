"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserX, UserCheck, AlertTriangle, Calendar } from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  isActive: boolean
  position?: string
  department?: string
}

interface EmployeeDeactivationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { reason: string; effectiveDate: string; customReason?: string }) => void
  employee: Employee | null
  isLoading: boolean
}

const DEACTIVATION_REASONS = [
  { value: "resignation", label: "Employee Resignation" },
  { value: "termination", label: "Employment Termination" },
  { value: "contract_end", label: "Contract End Date" },
  { value: "retirement", label: "Retirement" },
  { value: "leave_of_absence", label: "Extended Leave of Absence" },
  { value: "transfer", label: "Transfer to Another Company" },
  { value: "other", label: "Other (specify below)" }
]

const REACTIVATION_REASONS = [
  { value: "return_from_leave", label: "Return from Leave" },
  { value: "contract_renewal", label: "Contract Renewal" },
  { value: "rehire", label: "Rehire" },
  { value: "error_correction", label: "Correction of Error" },
  { value: "other", label: "Other (specify below)" }
]

export default function EmployeeDeactivationModal({
  isOpen,
  onClose,
  onConfirm,
  employee,
  isLoading
}: EmployeeDeactivationModalProps) {
  const [reason, setReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split('T')[0] // Today's date
  )

  const isDeactivation = employee?.isActive === true
  const reasons = isDeactivation ? DEACTIVATION_REASONS : REACTIVATION_REASONS
  const action = isDeactivation ? "deactivate" : "reactivate"
  const actionPast = isDeactivation ? "deactivated" : "reactivated"

  const handleSubmit = () => {
    if (!reason) return
    
    onConfirm({
      reason: reason === "other" ? customReason : reasons.find(r => r.value === reason)?.label || reason,
      effectiveDate,
      customReason: reason === "other" ? customReason : undefined
    })
  }

  const handleClose = () => {
    setReason("")
    setCustomReason("")
    setEffectiveDate(new Date().toISOString().split('T')[0])
    onClose()
  }

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDeactivation ? (
              <UserX className="w-5 h-5 text-orange-500" />
            ) : (
              <UserCheck className="w-5 h-5 text-green-500" />
            )}
            {isDeactivation ? "Deactivate" : "Reactivate"} Employee
          </DialogTitle>
          <DialogDescription>
            {isDeactivation ? (
              <>
                You are about to deactivate <strong>{employee.firstName} {employee.lastName}</strong>.
                This will end their employment and restrict their access to company systems.
              </>
            ) : (
              <>
                You are about to reactivate <strong>{employee.firstName} {employee.lastName}</strong>.
                This will restore their employment status and system access.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="font-medium">{employee.firstName} {employee.lastName}</p>
            {employee.position && <p className="text-sm text-gray-600">{employee.position}</p>}
            {employee.department && <p className="text-sm text-gray-600">{employee.department}</p>}
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for {action}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder={`Select reason for ${action}`} />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason */}
          {reason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Please specify</Label>
              <Textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder={`Enter the specific reason for ${action}...`}
                rows={3}
              />
            </div>
          )}

          {/* Effective Date */}
          <div className="space-y-2">
            <Label htmlFor="effectiveDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Effective Date
            </Label>
            <Input
              id="effectiveDate"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500">
              {isDeactivation 
                ? "The date when the employee's access will be terminated"
                : "The date when the employee's access will be restored"
              }
            </p>
          </div>

          {/* Warning */}
          {isDeactivation && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-700">
                <p className="font-medium">Important:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Employee portal access will be revoked</li>
                  <li>• Payroll processing will be affected</li>
                  <li>• Employee data will be retained for compliance</li>
                  <li>• This action can be reversed if needed</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || (reason === "other" && !customReason.trim()) || isLoading}
            variant={isDeactivation ? "destructive" : "default"}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {isDeactivation ? "Deactivating..." : "Reactivating..."}
              </>
            ) : (
              `${isDeactivation ? "Deactivate" : "Reactivate"} Employee`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

