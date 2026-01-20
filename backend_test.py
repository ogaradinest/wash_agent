#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class WindowWashingAPITester:
    def __init__(self, base_url="https://wash-agent.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_contact_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    self.log_test(name, True)
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:200]}...")
                    self.log_test(name, True)
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f" - {error_data}"
                except:
                    error_msg += f" - {response.text[:100]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   Error: {error_msg}")
            self.log_test(name, False, error_msg)
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_create_contact(self):
        """Test contact creation"""
        test_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test{datetime.now().strftime('%H%M%S')}@example.com",
            "phone": "(555) 123-4567"
        }
        
        success, response = self.run_test(
            "Create Contact",
            "POST",
            "contacts",
            200,
            data=test_data
        )
        
        if success and 'id' in response:
            self.created_contact_id = response['id']
            print(f"   Created contact ID: {self.created_contact_id}")
        
        return success, response

    def test_get_contacts(self):
        """Test getting all contacts"""
        return self.run_test("Get All Contacts", "GET", "contacts", 200)

    def test_get_contact_by_id(self):
        """Test getting specific contact"""
        if not self.created_contact_id:
            self.log_test("Get Contact by ID", False, "No contact ID available")
            return False, {}
        
        return self.run_test(
            "Get Contact by ID",
            "GET",
            f"contacts/{self.created_contact_id}",
            200
        )

    def test_initiate_call(self):
        """Test AI call initiation"""
        if not self.created_contact_id:
            self.log_test("Initiate AI Call", False, "No contact ID available")
            return False, {}
        
        call_data = {"contact_id": self.created_contact_id}
        
        return self.run_test(
            "Initiate AI Call",
            "POST",
            "calls/initiate",
            200,
            data=call_data
        )

    def test_get_call_logs(self):
        """Test getting call logs"""
        return self.run_test("Get Call Logs", "GET", "calls", 200)

    def test_get_schedule(self):
        """Test getting scheduled events"""
        return self.run_test("Get Schedule", "GET", "schedule", 200)

    def test_get_stats(self):
        """Test getting dashboard stats"""
        success, response = self.run_test("Get Dashboard Stats", "GET", "stats", 200)
        
        if success:
            expected_fields = ['total_contacts', 'total_calls', 'pending_contacts', 'scheduled_followups', 'conversion_rate']
            missing_fields = [field for field in expected_fields if field not in response]
            if missing_fields:
                self.log_test("Stats Fields Validation", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Stats Fields Validation", True)
        
        return success, response

    def test_google_sheets_mock(self):
        """Test Google Sheets mock endpoint"""
        test_data = {
            "contact_name": "Test User",
            "phone": "(555) 123-4567",
            "status": "called"
        }
        
        return self.run_test(
            "Google Sheets Mock",
            "POST",
            "sheets/log",
            200,
            data=test_data
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Window Washing AI Agent API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

        # Test sequence
        tests = [
            self.test_root_endpoint,
            self.test_create_contact,
            self.test_get_contacts,
            self.test_get_contact_by_id,
            self.test_initiate_call,
            self.test_get_call_logs,
            self.test_get_schedule,
            self.test_get_stats,
            self.test_google_sheets_mock
        ]

        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test {test.__name__} crashed: {str(e)}")
                self.log_test(test.__name__, False, f"Test crashed: {str(e)}")

        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = WindowWashingAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())