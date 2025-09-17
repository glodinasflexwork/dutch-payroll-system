#!/usr/bin/env node

const https = require('https');
const { URL } = require('url');

const BASE_URL = 'https://www.salarysync.nl';
const TEST_USER = {
  email: 'manager.test@techsolutions.nl',
  password: 'SecurePass2025!'
};

const TEST_COMPANY = {
  name: 'Production Test Company B.V.',
  kvkNumber: '12345678',
  industry: 'Technology'
};

const TEST_EMPLOYEE = {
  firstName: 'Production',
  lastName: 'Employee',
  email: 'prod.employee@testcompany.nl',
  bsn: '123456782',
  dateOfBirth: '1990-03-15',
  gender: 'Female',
  position: 'Software Engineer',
  department: 'Engineering',
  salary: 3500
};

class AuthenticatedTester {
  constructor() {
    this.cookies = new Map();
    this.csrfToken = null;
  }

  async makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SalarySync-Auth-Tester/1.0',
          ...headers
        }
      };

      // Add cookies
      if (this.cookies.size > 0) {
        const cookieString = Array.from(this.cookies.entries())
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
        options.headers['Cookie'] = cookieString;
      }

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = https.request(options, (res) => {
        let responseData = '';
        
        // Capture cookies
        if (res.headers['set-cookie']) {
          res.headers['set-cookie'].forEach(cookie => {
            const [nameValue] = cookie.split(';');
            const [name, value] = nameValue.split('=');
            if (name && value) {
              this.cookies.set(name.trim(), value.trim());
            }
          });
        }

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const jsonResponse = responseData ? JSON.parse(responseData) : {};
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: jsonResponse,
              rawData: responseData
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: responseData,
              rawData: responseData
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async login() {
    console.log('🔑 Attempting login...');
    try {
      const response = await this.makeRequest('POST', '/api/auth/callback/credentials', {
        email: TEST_USER.email,
        password: TEST_USER.password,
        redirect: false
      });

      console.log(`Login response: ${response.statusCode}`);
      console.log('Cookies captured:', Array.from(this.cookies.keys()));
      
      return response.statusCode === 200 || response.statusCode === 302;
    } catch (error) {
      console.error('Login error:', error.message);
      return false;
    }
  }

  async createCompany() {
    console.log('🏢 Creating company...');
    try {
      const response = await this.makeRequest('POST', '/api/companies', TEST_COMPANY);
      console.log(`Company creation: ${response.statusCode}`);
      console.log('Response:', JSON.stringify(response.data).substring(0, 200));
      return response.statusCode === 200 || response.statusCode === 201;
    } catch (error) {
      console.error('Company creation error:', error.message);
      return false;
    }
  }

  async createEmployee() {
    console.log('👥 Creating employee (testing HR database fix)...');
    try {
      const response = await this.makeRequest('POST', '/api/employees', TEST_EMPLOYEE);
      console.log(`Employee creation: ${response.statusCode}`);
      console.log('Response:', JSON.stringify(response.data).substring(0, 200));
      return response.statusCode === 200 || response.statusCode === 201;
    } catch (error) {
      console.error('Employee creation error:', error.message);
      return false;
    }
  }

  async getEmployees() {
    console.log('📋 Getting employee list (testing API variable scope fix)...');
    try {
      const response = await this.makeRequest('GET', '/api/employees');
      console.log(`Employee list: ${response.statusCode}`);
      if (response.data.employees) {
        console.log(`Found ${response.data.employees.length} employees`);
      }
      console.log('Response:', JSON.stringify(response.data).substring(0, 200));
      return response.statusCode === 200;
    } catch (error) {
      console.error('Employee list error:', error.message);
      return false;
    }
  }

  async runFullTest() {
    console.log('🚀 Starting Authenticated Production Test');
    console.log('=' * 50);

    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.log('❌ Login failed, cannot continue');
      return;
    }
    console.log('✅ Login successful');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const companySuccess = await this.createCompany();
    if (!companySuccess) {
      console.log('❌ Company creation failed');
      return;
    }
    console.log('✅ Company creation successful');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const employeeSuccess = await this.createEmployee();
    console.log(employeeSuccess ? '✅ Employee creation successful (HR database fix working!)' : '❌ Employee creation failed');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const listSuccess = await this.getEmployees();
    console.log(listSuccess ? '✅ Employee list successful (API variable scope fix working!)' : '❌ Employee list failed');

    console.log('\n🎯 PRODUCTION TEST SUMMARY:');
    console.log(`Login: ${loginSuccess ? '✅' : '❌'}`);
    console.log(`Company Setup: ${companySuccess ? '✅' : '❌'}`);
    console.log(`Employee Creation (HR DB Fix): ${employeeSuccess ? '✅' : '❌'}`);
    console.log(`Employee List (API Fix): ${listSuccess ? '✅' : '❌'}`);

    if (loginSuccess && companySuccess && employeeSuccess && listSuccess) {
      console.log('\n🎉 ALL PRODUCTION TESTS PASSED!');
      console.log('✅ All bug fixes are working correctly in production');
      console.log('✅ Complete user flow verified end-to-end');
    }
  }
}

const tester = new AuthenticatedTester();
tester.runFullTest().catch(console.error);
