#!/bin/bash

echo "========================================"
echo "ECO4 Survey Management System Setup"
echo "========================================"
echo

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Make sure to install version 14.0.0 or higher."
    exit 1
fi

echo "Node.js found. Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    exit 1
fi

echo
echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo
echo "Starting the server..."
echo "The application will be available at: http://localhost:3000"
echo
echo "Press Ctrl+C to stop the server"
echo

npm start
