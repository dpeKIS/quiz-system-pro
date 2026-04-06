#!/usr/bin/env python3
"""
Quiz System Seed Data Script
Populates the database with sample quizzes and questions for testing
"""

import json
import random
import string
from datetime import datetime

# Sample data
SAMPLE_QUIZZES = [
    {
        "title": "General Knowledge Quiz",
        "description": "Test your knowledge on various topics"
    },
    {
        "title": "Science Quiz",
        "description": "Questions about physics, chemistry, and biology"
    },
    {
        "title": "History Quiz",
        "description": "Historical events and figures"
    }
]

SAMPLE_QUESTIONS = [
    {
        "quiz_id": 1,
        "question": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "correct": "Paris"
    },
    {
        "quiz_id": 1,
        "question": "Which planet is closest to the Sun?",
        "options": ["Venus", "Mercury", "Earth", "Mars"],
        "correct": "Mercury"
    },
    {
        "quiz_id": 1,
        "question": "What is the largest ocean on Earth?",
        "options": ["Atlantic", "Indian", "Arctic", "Pacific"],
        "correct": "Pacific"
    },
    {
        "quiz_id": 2,
        "question": "What is the chemical symbol for Gold?",
        "options": ["Go", "Gd", "Au", "Ag"],
        "correct": "Au"
    },
    {
        "quiz_id": 2,
        "question": "What is the speed of light?",
        "options": ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
        "correct": "300,000 km/s"
    },
    {
        "quiz_id": 3,
        "question": "In what year did World War II end?",
        "options": ["1943", "1944", "1945", "1946"],
        "correct": "1945"
    },
]

def generate_qr_code(prefix, id):
    """Generate a QR code string"""
    return f"{prefix}_{id:04d}"

def create_seed_data():
    """Create seed data JSON"""
    data = {
        "quizzes": SAMPLE_QUIZZES,
        "questions": []
    }
    
    # Create questions with QR codes
    for idx, q in enumerate(SAMPLE_QUESTIONS, 1):
        question_data = {
            "quiz_id": q["quiz_id"],
            "qr_code": generate_qr_code("CARD", idx),
            "question_text": q["question"],
            "option_a": q["options"][0],
            "option_b": q["options"][1],
            "option_c": q["options"][2],
            "option_d": q["options"][3],
            "correct_answer": chr(65 + q["options"].index(q["correct"]))  # A, B, C, or D
        }
        data["questions"].append(question_data)
    
    return data

def main():
    """Main function"""
    print("Generating seed data...")
    
    data = create_seed_data()
    
    # Save to JSON file
    with open("seed_data.json", "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"✓ Generated {len(data['quizzes'])} quizzes")
    print(f"✓ Generated {len(data['questions'])} questions")
    print("✓ Saved to seed_data.json")
    
    # Print sample QR codes
    print("\nSample QR Codes:")
    print(f"  User QR: USER_0001")
    for i in range(1, 4):
        print(f"  Card QR: CARD_{i:04d}")

if __name__ == "__main__":
    main()
