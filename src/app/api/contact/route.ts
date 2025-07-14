import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, company, phone, message } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Prepare email content
    const emailContent = {
      from: {
        email: process.env.EMAIL_FROM || 'hello@salarysync.online',
        name: process.env.EMAIL_FROM_NAME || 'SalarySync'
      },
      to: [
        {
          email: 'info@salarysync.nl',
          name: 'SalarySync Support'
        }
      ],
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Contact Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Name:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Email:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${email}</td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Company:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${company}</td>
              </tr>
              ` : ''}
              ${phone ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Phone:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${phone}</td>
              </tr>
              ` : ''}
            </table>
            
            <h3 style="color: #1e293b; margin-top: 30px; margin-bottom: 15px;">Message:</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; color: #1e293b; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #1e40af; font-weight: bold;">Action Required:</p>
              <p style="margin: 5px 0 0 0; color: #1e40af;">Please respond to this inquiry within 48 hours to maintain our service standards.</p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #1e293b; color: #94a3b8;">
            <p style="margin: 0; font-size: 14px;">This email was sent from the SalarySync contact form</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">SalarySync - Professional Dutch Payroll Solutions</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${firstName} ${lastName}
Email: ${email}
${company ? `Company: ${company}` : ''}
${phone ? `Phone: ${phone}` : ''}

Message:
${message}

Please respond within 48 hours.
      `
    }

    // Send email via Mailtrap
    const response = await fetch(process.env.MAILTRAP_API_URL || 'https://send.api.mailtrap.io/api/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILTRAP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent)
    })

    if (!response.ok) {
      console.error('Mailtrap API error:', await response.text())
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We have received your inquiry and will respond within 48 hours.'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

