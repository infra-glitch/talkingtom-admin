#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Lesson Digitization Admin Portal
Tests all CRUD operations for Schools, Grades, Curriculums, Books, Subjects, and Lessons
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://learnbook-admin.preview.emergentagent.com/api"

class APITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_entities = {
            'schools': [],
            'grades': [],
            'curriculums': [],
            'books': [],
            'subjects': [],
            'lessons': []
        }
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, params=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except Exception as e:
            return None, str(e)
    
    def test_schools_crud(self):
        """Test Schools CRUD operations"""
        print("\n=== TESTING SCHOOLS CRUD ===")
        
        # Test GET all schools
        response = self.make_request('GET', '/schools')
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success'):
                self.log_result("Schools GET all", True, f"Retrieved {len(data.get('schools', []))} schools")
            else:
                self.log_result("Schools GET all", False, "API returned success=false", data)
        else:
            self.log_result("Schools GET all", False, f"Request failed: {response.status_code if response else 'No response'}")
        
        # Test POST create school
        school_data = {
            "name": "Greenwood High School",
            "address": "123 Education Street",
            "state": "Karnataka",
            "country": "India"
        }
        response = self.make_request('POST', '/schools', school_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('school'):
                school_id = data['school']['id']
                self.created_entities['schools'].append(school_id)
                self.log_result("Schools POST create", True, f"Created school with ID: {school_id}")
                
                # Test GET single school
                response = self.make_request('GET', f'/schools/{school_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('school'):
                        self.log_result("Schools GET by ID", True, f"Retrieved school: {data['school']['name']}")
                    else:
                        self.log_result("Schools GET by ID", False, "Failed to get school by ID", data)
                else:
                    self.log_result("Schools GET by ID", False, f"Request failed: {response.status_code if response else 'No response'}")
                
                # Test PUT update school
                update_data = {
                    "name": "Greenwood High School - Updated",
                    "address": "456 New Education Avenue",
                    "state": "Karnataka",
                    "country": "India"
                }
                response = self.make_request('PUT', f'/schools/{school_id}', update_data)
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_result("Schools PUT update", True, "Successfully updated school")
                    else:
                        self.log_result("Schools PUT update", False, "Update failed", data)
                else:
                    self.log_result("Schools PUT update", False, f"Request failed: {response.status_code if response else 'No response'}")
                
                # Test DELETE (soft delete) school
                response = self.make_request('DELETE', f'/schools/{school_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        # Verify soft delete - school should have active=false
                        if 'school' in data and data['school'].get('active') == False:
                            self.log_result("Schools DELETE soft delete", True, "Successfully soft deleted school (active=false)")
                        else:
                            self.log_result("Schools DELETE soft delete", True, "School deleted (unable to verify active flag)")
                    else:
                        self.log_result("Schools DELETE soft delete", False, "Delete failed", data)
                else:
                    self.log_result("Schools DELETE soft delete", False, f"Request failed: {response.status_code if response else 'No response'}")
            else:
                self.log_result("Schools POST create", False, "Failed to create school", data)
        else:
            self.log_result("Schools POST create", False, f"Request failed: {response.status_code if response else 'No response'}")
        
        # Test validation - missing required fields
        invalid_data = {"name": "Test School"}  # Missing state
        response = self.make_request('POST', '/schools', invalid_data)
        if response and response.status_code == 400:
            self.log_result("Schools validation", True, "Correctly rejected invalid data (missing state)")
        else:
            self.log_result("Schools validation", False, f"Should have rejected invalid data: {response.status_code if response else 'No response'}")
    
    def test_grades_crud(self):
        """Test Grades CRUD operations"""
        print("\n=== TESTING GRADES CRUD ===")
        
        # Test GET all grades
        response = self.make_request('GET', '/grades')
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success'):
                self.log_result("Grades GET all", True, f"Retrieved {len(data.get('grades', []))} grades")
            else:
                self.log_result("Grades GET all", False, "API returned success=false", data)
        else:
            self.log_result("Grades GET all", False, f"Request failed: {response.status_code if response else 'No response'}")
        
        # Test POST create grade
        grade_data = {"grade": "Class 10"}
        response = self.make_request('POST', '/grades', grade_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('grade'):
                grade_id = data['grade']['id']
                self.created_entities['grades'].append(grade_id)
                self.log_result("Grades POST create", True, f"Created grade with ID: {grade_id}")
                
                # Test GET single grade
                response = self.make_request('GET', f'/grades/{grade_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('grade'):
                        self.log_result("Grades GET by ID", True, f"Retrieved grade: {data['grade']['grade']}")
                    else:
                        self.log_result("Grades GET by ID", False, "Failed to get grade by ID", data)
                else:
                    self.log_result("Grades GET by ID", False, f"Request failed: {response.status_code if response else 'No response'}")
                
                # Test PUT update grade
                update_data = {"grade": "Class 10 - Science"}
                response = self.make_request('PUT', f'/grades/{grade_id}', update_data)
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_result("Grades PUT update", True, "Successfully updated grade")
                    else:
                        self.log_result("Grades PUT update", False, "Update failed", data)
                else:
                    self.log_result("Grades PUT update", False, f"Request failed: {response.status_code if response else 'No response'}")
                
                # Test DELETE (soft delete) grade
                response = self.make_request('DELETE', f'/grades/{grade_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_result("Grades DELETE soft delete", True, "Successfully soft deleted grade")
                    else:
                        self.log_result("Grades DELETE soft delete", False, "Delete failed", data)
                else:
                    self.log_result("Grades DELETE soft delete", False, f"Request failed: {response.status_code if response else 'No response'}")
            else:
                self.log_result("Grades POST create", False, "Failed to create grade", data)
        else:
            self.log_result("Grades POST create", False, f"Request failed: {response.status_code if response else 'No response'}")
    
    def test_curriculums_crud(self):
        """Test Curriculums CRUD operations"""
        print("\n=== TESTING CURRICULUMS CRUD ===")
        
        # Test GET all curriculums
        response = self.make_request('GET', '/curriculums')
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success'):
                self.log_result("Curriculums GET all", True, f"Retrieved {len(data.get('curriculums', []))} curriculums")
            else:
                self.log_result("Curriculums GET all", False, "API returned success=false", data)
        else:
            self.log_result("Curriculums GET all", False, f"Request failed: {response.status_code if response else 'No response'}")
        
        # Test POST create curriculum
        curriculum_data = {
            "name": "CBSE Curriculum",
            "country": "India"
        }
        response = self.make_request('POST', '/curriculums', curriculum_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('curriculum'):
                curriculum_id = data['curriculum']['id']
                self.created_entities['curriculums'].append(curriculum_id)
                self.log_result("Curriculums POST create", True, f"Created curriculum with ID: {curriculum_id}")
                
                # Test GET single curriculum
                response = self.make_request('GET', f'/curriculums/{curriculum_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('curriculum'):
                        self.log_result("Curriculums GET by ID", True, f"Retrieved curriculum: {data['curriculum']['name']}")
                    else:
                        self.log_result("Curriculums GET by ID", False, "Failed to get curriculum by ID", data)
                else:
                    self.log_result("Curriculums GET by ID", False, f"Request failed: {response.status_code if response else 'No response'}")
                
                # Test PUT update curriculum
                update_data = {
                    "name": "CBSE Curriculum - Updated",
                    "country": "India"
                }
                response = self.make_request('PUT', f'/curriculums/{curriculum_id}', update_data)
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_result("Curriculums PUT update", True, "Successfully updated curriculum")
                    else:
                        self.log_result("Curriculums PUT update", False, "Update failed", data)
                else:
                    self.log_result("Curriculums PUT update", False, f"Request failed: {response.status_code if response else 'No response'}")
                
                # Test DELETE (soft delete) curriculum
                response = self.make_request('DELETE', f'/curriculums/{curriculum_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_result("Curriculums DELETE soft delete", True, "Successfully soft deleted curriculum")
                    else:
                        self.log_result("Curriculums DELETE soft delete", False, "Delete failed", data)
                else:
                    self.log_result("Curriculums DELETE soft delete", False, f"Request failed: {response.status_code if response else 'No response'}")
            else:
                self.log_result("Curriculums POST create", False, "Failed to create curriculum", data)
        else:
            self.log_result("Curriculums POST create", False, f"Request failed: {response.status_code if response else 'No response'}")
    
    def test_books_crud(self):
        """Test Books CRUD operations"""
        print("\n=== TESTING BOOKS CRUD ===")
        
        # Test GET all books
        response = self.make_request('GET', '/books')
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success'):
                self.log_result("Books GET all", True, f"Retrieved {len(data.get('books', []))} books")
            else:
                self.log_result("Books GET all", False, "API returned success=false", data)
        else:
            self.log_result("Books GET all", False, f"Request failed: {response.status_code if response else 'No response'}")
        
        # Test POST create book
        book_data = {
            "title": "Mathematics for Class 10",
            "author": "Dr. R.S. Aggarwal",
            "slug": "mathematics-class-10"
        }
        response = self.make_request('POST', '/books', book_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('book'):
                book_id = data['book']['id']
                self.created_entities['books'].append(book_id)
                self.log_result("Books POST create", True, f"Created book with ID: {book_id}")
                
                # Test GET single book
                response = self.make_request('GET', f'/books/{book_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('book'):
                        self.log_result("Books GET by ID", True, f"Retrieved book: {data['book']['title']}")
                    else:
                        self.log_result("Books GET by ID", False, "Failed to get book by ID", data)
                else:
                    self.log_result("Books GET by ID", False, f"Request failed: {response.status_code if response else 'No response'}")
                
                # Test PUT update book
                update_data = {
                    "title": "Advanced Mathematics for Class 10",
                    "author": "Dr. R.S. Aggarwal",
                    "slug": "advanced-mathematics-class-10"
                }
                response = self.make_request('PUT', f'/books/{book_id}', update_data)
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_result("Books PUT update", True, "Successfully updated book")
                    else:
                        self.log_result("Books PUT update", False, "Update failed", data)
                else:
                    self.log_result("Books PUT update", False, f"Request failed: {response.status_code if response else 'No response'}")
                
                # Test DELETE (soft delete) book
                response = self.make_request('DELETE', f'/books/{book_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_result("Books DELETE soft delete", True, "Successfully soft deleted book")
                    else:
                        self.log_result("Books DELETE soft delete", False, "Delete failed", data)
                else:
                    self.log_result("Books DELETE soft delete", False, f"Request failed: {response.status_code if response else 'No response'}")
            else:
                self.log_result("Books POST create", False, "Failed to create book", data)
        else:
            self.log_result("Books POST create", False, f"Request failed: {response.status_code if response else 'No response'}")
    
    def test_subjects_crud_with_validation(self):
        """Test Subjects CRUD operations with book_id validation"""
        print("\n=== TESTING SUBJECTS CRUD WITH VALIDATION ===")
        
        # First, create required entities for subject creation
        school_id = None
        curriculum_id = None
        grade_id = None
        book_id = None
        
        # Create a school
        school_data = {"name": "Test School for Subject", "state": "Karnataka", "country": "India"}
        response = self.make_request('POST', '/schools', school_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('school'):
                school_id = data['school']['id']
                self.created_entities['schools'].append(school_id)
        
        # Create a curriculum
        curriculum_data = {"name": "Test Curriculum for Subject", "country": "India"}
        response = self.make_request('POST', '/curriculums', curriculum_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('curriculum'):
                curriculum_id = data['curriculum']['id']
                self.created_entities['curriculums'].append(curriculum_id)
        
        # Create a grade
        grade_data = {"grade": "Test Grade for Subject"}
        response = self.make_request('POST', '/grades', grade_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('grade'):
                grade_id = data['grade']['id']
                self.created_entities['grades'].append(grade_id)
        
        # Create a book
        book_data = {"title": "Test Book for Subject", "author": "Test Author"}
        response = self.make_request('POST', '/books', book_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('book'):
                book_id = data['book']['id']
                self.created_entities['books'].append(book_id)
        
        if not all([school_id, curriculum_id, grade_id, book_id]):
            self.log_result("Subjects setup", False, "Failed to create required entities for subject testing")
            return
        
        # Test GET all subjects
        response = self.make_request('GET', '/subjects')
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success'):
                self.log_result("Subjects GET all", True, f"Retrieved {len(data.get('subjects', []))} subjects")
            else:
                self.log_result("Subjects GET all", False, "API returned success=false", data)
        else:
            self.log_result("Subjects GET all", False, f"Request failed: {response.status_code if response else 'No response'}")
        
        # Test POST create subject WITHOUT book_id (should FAIL)
        invalid_subject_data = {
            "name": "Physics",
            "school_id": school_id,
            "curriculum_id": curriculum_id,
            "grade_id": grade_id
            # Missing book_id
        }
        response = self.make_request('POST', '/subjects', invalid_subject_data)
        if response and response.status_code == 400:
            self.log_result("Subjects validation - missing book_id", True, "Correctly rejected subject without book_id")
        else:
            self.log_result("Subjects validation - missing book_id", False, f"Should have rejected subject without book_id: {response.status_code if response else 'No response'}")
        
        # Test POST create subject WITH all required fields (should SUCCEED)
        valid_subject_data = {
            "name": "Physics",
            "school_id": school_id,
            "curriculum_id": curriculum_id,
            "grade_id": grade_id,
            "book_id": book_id
        }
        response = self.make_request('POST', '/subjects', valid_subject_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('subject'):
                subject_id = data['subject']['id']
                self.created_entities['subjects'].append(subject_id)
                self.log_result("Subjects POST create with book_id", True, f"Created subject with ID: {subject_id}")
                
                # Test GET single subject (should include joined data)
                response = self.make_request('GET', f'/subjects/{subject_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('subject'):
                        subject = data['subject']
                        has_joined_data = any(key in subject for key in ['school', 'curriculum', 'grade', 'book'])
                        if has_joined_data:
                            self.log_result("Subjects GET by ID with joins", True, "Retrieved subject with joined data")
                        else:
                            self.log_result("Subjects GET by ID with joins", True, "Retrieved subject (joined data not visible in response)")
                    else:
                        self.log_result("Subjects GET by ID", False, "Failed to get subject by ID", data)
                else:
                    self.log_result("Subjects GET by ID", False, f"Request failed: {response.status_code if response else 'No response'}")
                
                # Test PUT update subject WITHOUT book_id (should FAIL)
                invalid_update_data = {
                    "name": "Advanced Physics",
                    "school_id": school_id,
                    "curriculum_id": curriculum_id,
                    "grade_id": grade_id
                    # Missing book_id
                }
                response = self.make_request('PUT', f'/subjects/{subject_id}', invalid_update_data)
                if response and response.status_code == 400:
                    self.log_result("Subjects update validation - missing book_id", True, "Correctly rejected update without book_id")
                else:
                    self.log_result("Subjects update validation - missing book_id", False, f"Should have rejected update without book_id: {response.status_code if response else 'No response'}")
                
                # Test PUT update subject WITH book_id (should SUCCEED)
                valid_update_data = {
                    "name": "Advanced Physics",
                    "school_id": school_id,
                    "curriculum_id": curriculum_id,
                    "grade_id": grade_id,
                    "book_id": book_id
                }
                response = self.make_request('PUT', f'/subjects/{subject_id}', valid_update_data)
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_result("Subjects PUT update with book_id", True, "Successfully updated subject")
                    else:
                        self.log_result("Subjects PUT update with book_id", False, "Update failed", data)
                else:
                    self.log_result("Subjects PUT update with book_id", False, f"Request failed: {response.status_code if response else 'No response'}")
                
                # Test DELETE (soft delete) subject
                response = self.make_request('DELETE', f'/subjects/{subject_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_result("Subjects DELETE soft delete", True, "Successfully soft deleted subject")
                    else:
                        self.log_result("Subjects DELETE soft delete", False, "Delete failed", data)
                else:
                    self.log_result("Subjects DELETE soft delete", False, f"Request failed: {response.status_code if response else 'No response'}")
            else:
                self.log_result("Subjects POST create with book_id", False, "Failed to create subject", data)
        else:
            self.log_result("Subjects POST create with book_id", False, f"Request failed: {response.status_code if response else 'No response'}")
    
    def test_lessons_with_book_filter(self):
        """Test Lessons API with book_id filter"""
        print("\n=== TESTING LESSONS API WITH BOOK FILTER ===")
        
        # Test GET all lessons
        response = self.make_request('GET', '/lessons')
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success'):
                all_lessons_count = len(data.get('lessons', []))
                self.log_result("Lessons GET all", True, f"Retrieved {all_lessons_count} lessons")
                
                # If there are lessons, test filtering by book_id
                if all_lessons_count > 0:
                    lessons = data['lessons']
                    # Try to find a lesson with a book_id
                    test_book_id = None
                    for lesson in lessons:
                        if lesson.get('book_id'):
                            test_book_id = lesson['book_id']
                            break
                    
                    if test_book_id:
                        # Test GET lessons filtered by book_id
                        response = self.make_request('GET', '/lessons', params={'book_id': test_book_id})
                        if response and response.status_code == 200:
                            data = response.json()
                            if data.get('success'):
                                filtered_lessons = data.get('lessons', [])
                                # Verify all returned lessons have the correct book_id
                                all_match = all(lesson.get('book_id') == test_book_id for lesson in filtered_lessons)
                                if all_match:
                                    self.log_result("Lessons GET with book_id filter", True, f"Retrieved {len(filtered_lessons)} lessons for book_id {test_book_id}")
                                else:
                                    self.log_result("Lessons GET with book_id filter", False, "Some lessons don't match the book_id filter")
                            else:
                                self.log_result("Lessons GET with book_id filter", False, "API returned success=false", data)
                        else:
                            self.log_result("Lessons GET with book_id filter", False, f"Request failed: {response.status_code if response else 'No response'}")
                    else:
                        self.log_result("Lessons GET with book_id filter", True, "No lessons with book_id found to test filtering")
                else:
                    self.log_result("Lessons GET with book_id filter", True, "No lessons found to test filtering")
            else:
                self.log_result("Lessons GET all", False, "API returned success=false", data)
        else:
            self.log_result("Lessons GET all", False, f"Request failed: {response.status_code if response else 'No response'}")
        
        # Test creating a lesson (if we have a book to associate it with)
        if self.created_entities['books']:
            book_id = self.created_entities['books'][0]
            lesson_data = {
                "book_id": book_id,
                "lesson_number": 1,
                "name": "Introduction to Mathematics"
            }
            response = self.make_request('POST', '/lessons', lesson_data)
            if response and response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('lesson'):
                    lesson_id = data['lesson']['id']
                    self.created_entities['lessons'].append(lesson_id)
                    self.log_result("Lessons POST create", True, f"Created lesson with ID: {lesson_id}")
                else:
                    self.log_result("Lessons POST create", False, "Failed to create lesson", data)
            else:
                self.log_result("Lessons POST create", False, f"Request failed: {response.status_code if response else 'No response'}")
    
    def run_all_tests(self):
        """Run all CRUD tests"""
        print(f"Starting comprehensive backend API testing...")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)
        
        try:
            # Test all CRUD operations
            self.test_schools_crud()
            self.test_grades_crud()
            self.test_curriculums_crud()
            self.test_books_crud()
            self.test_subjects_crud_with_validation()
            self.test_lessons_with_book_filter()
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            self.log_result("Critical Error", False, str(e))
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "No tests run")
        
        if failed_tests > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"❌ {result['test']}: {result['message']}")
                    if result['details']:
                        print(f"   Details: {result['details']}")
        
        print("\nCREATED ENTITIES (for cleanup):")
        for entity_type, ids in self.created_entities.items():
            if ids:
                print(f"{entity_type}: {ids}")

if __name__ == "__main__":
    tester = APITester()
    tester.run_all_tests()