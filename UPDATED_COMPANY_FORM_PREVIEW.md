# Updated Company Legal Information Form

## 🎯 **UPDATED LEGAL INFORMATION SECTION**

### **Before (Old Form):**
```
Legal Information
├── KvK Number: [81805810]
├── Tax Number: [123456789B01]     ❌ REMOVED
└── VAT Number: [NL123456789B01]
```

### **After (Updated Form):**
```
Legal Information
├── KvK Number: [81805810]
├── Loonheffingennummer: [123456789L01]  ✅ ADDED
└── VAT Number: [NL123456789B01]
```

---

## 📋 **FORM FIELD DETAILS**

### **KvK Number**
- **Label:** "KvK Number"
- **Placeholder:** "12345678"
- **Purpose:** Chamber of Commerce registration
- **Status:** ✅ Unchanged

### **Loonheffingennummer** (NEW)
- **Label:** "Loonheffingennummer"
- **Placeholder:** "123456789L01"
- **Purpose:** Payroll tax identification (appears on payslips)
- **Status:** ✅ Added (replaces Tax Number)

### **VAT Number**
- **Label:** "VAT Number"
- **Placeholder:** "NL123456789B01"
- **Purpose:** VAT identification for EU trade
- **Status:** ✅ Unchanged

---

## 🎯 **KEY IMPROVEMENTS**

### **✅ Benefits of This Change:**
1. **Payroll-focused** - Only fields needed for payroll operations
2. **Reduced confusion** - No more similar tax numbers
3. **Legal compliance** - Loonheffingennummer is what appears on payslips
4. **Cleaner form** - Same number of fields, better purpose
5. **Professional focus** - Aligned with payroll system purpose

### **🔧 Technical Updates Made:**
1. **Updated TypeScript interface** - Replaced `taxNumber` with `loonheffingennummer`
2. **Updated form field** - New label, placeholder, and validation
3. **Updated profile completion** - Calculation now includes loonheffingennummer
4. **Maintained form structure** - Same 3-column grid layout

---

## 📊 **FORM LAYOUT**

```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Column 1: KvK Number */}
  <div>
    <label>KvK Number</label>
    <input placeholder="12345678" />
  </div>
  
  {/* Column 2: Loonheffingennummer (NEW) */}
  <div>
    <label>Loonheffingennummer</label>
    <input placeholder="123456789L01" />
  </div>
  
  {/* Column 3: VAT Number */}
  <div>
    <label>VAT Number</label>
    <input placeholder="NL123456789B01" />
  </div>
</div>
```

---

## 🚀 **NEXT STEPS**

### **Database Schema Update Needed:**
```sql
-- Update Company table
ALTER TABLE Company DROP COLUMN taxNumber;
ALTER TABLE Company ADD COLUMN loonheffingennummer VARCHAR(20);
```

### **API Endpoint Updates:**
- Update company API to handle `loonheffingennummer` field
- Remove `taxNumber` from validation schemas
- Update any existing company records

### **Payslip Integration:**
- Use `company.loonheffingennummer` in payslip generation
- Display on professional payslip template
- Ensure legal compliance

---

## ✅ **FORM IS READY**

The updated company legal information form is now:
- **Payroll-focused** with relevant fields only
- **Legally compliant** for Dutch payroll requirements
- **User-friendly** with clear field purposes
- **Professional** and streamlined

**The form will display the Loonheffingennummer field instead of Tax Number, making it perfect for payroll compliance!**

