#!/usr/bin/env node
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const prisma = new PrismaClient()

async function diagnose() {
  console.log("🔍 DATABASE DIAGNOSTICS")
  console.log("======================")
  
  try {
    await prisma.$connect()
    console.log("✅ Database connected")
    
    const user = await prisma.user.findUnique({
      where: { email: "cihatkaya@glodinas.nl" },
      include: { companies: { include: { company: true } } }
    })
    
    if (user) {
      console.log("✅ User found:", user.email)
      console.log("- Password exists:", !!user.password)
      console.log("- Password length:", user.password?.length || 0)
      console.log("- Companies:", user.companies.length)
      
      if (user.password) {
        const valid = await bcrypt.compare("Geheim@12", user.password)
        console.log("- Password valid:", valid ? "✅ YES" : "❌ NO")
        console.log("- Hash format:", user.password.startsWith("$2") ? "✅ Bcrypt" : "❌ Invalid")
      }
      
      user.companies.forEach((uc, i) => {
        console.log(`- Company ${i+1}: ${uc.company.name} (${uc.role})`)
      })
    } else {
      console.log("❌ User not found!")
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

diagnose()
