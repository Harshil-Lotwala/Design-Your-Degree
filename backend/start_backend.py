#!/usr/bin/env python3
"""
Robust backend startup script for the Degree Planner application.
Handles port conflicts and provides better error handling.
"""

import os
import sys
import time
import signal
import subprocess

def kill_processes_on_port(port):
    """Kill any processes running on the specified port."""
    print(f"🧹 Cleaning up processes on port {port}...")
    try:
        result = subprocess.run(['lsof', '-ti', f':{port}'], 
                              capture_output=True, text=True)
        if result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                if pid.strip():
                    try:
                        os.kill(int(pid), signal.SIGTERM)
                        print(f"✅ Killed process {pid}")
                        time.sleep(0.5)
                    except (ProcessLookupError, ValueError):
                        pass
    except subprocess.SubprocessError:
        pass

def test_imports():
    """Test all required imports."""
    print("🔍 Testing imports...")
    try:
        from flask import Flask, request, jsonify
        import mysql.connector
        from backend.db_config import db_config
        from flask_cors import CORS
        import bcrypt
        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_database():
    """Test database connection."""
    print("🔍 Testing database connection...")
    try:
        import mysql.connector
        from backend.db_config import db_config
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def main():
    """Main startup function."""
    print("🚀 Starting Degree Planner Backend...")
    
    # Test imports
    if not test_imports():
        sys.exit(1)
    
    # Test database
    if not test_database():
        sys.exit(1)
    
    # Clean up port 5000
    kill_processes_on_port(5000)
    
    # Start the backend
    try:
        print("🎯 Starting Flask server...")
        os.chdir('backend')
        
        # Use subprocess to run the Flask app
        process = subprocess.Popen([
            sys.executable, 'app.py'
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        print("✅ Backend started successfully!")
        print("🌐 Server running at http://127.0.0.1:5000")
        print("📋 Available endpoints:")
        print("   GET  /                    - Home")
        print("   GET  /subjects            - Get all subjects")
        print("   GET  /terms               - Get all terms")
        print("   POST /api/check-prerequisites - Check prerequisites")
        print("   POST /api/add-course      - Add course")
        print("   GET  /api/user-courses/<id> - Get user courses")
        print("\nPress Ctrl+C to stop the server")
        
        # Stream output
        for line in process.stdout:
            print(line.strip())
            
    except KeyboardInterrupt:
        print("\n👋 Stopping backend...")
        try:
            process.terminate()
            process.wait(timeout=5)
        except:
            process.kill()
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
