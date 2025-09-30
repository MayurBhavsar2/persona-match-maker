# Backend API Integration Guide

This document outlines all the locations in your project where you need to integrate your backend APIs. Replace the placeholder URLs with your actual API endpoints.

## 🔑 Authentication APIs

### 1. User Registration (`src/pages/Register.tsx`)
**Location:** Line 46
**Endpoint to Replace:** `YOUR_API_ENDPOINT_FOR_REGISTRATION`
**Method:** POST
**Request Body:**
```json
{
  "fullName": "string",
  "email": "string", 
  "role": "string",
  "password": "string"
}
```
**Expected Response:** User data + success message

### 2. User Login (`src/pages/Login.tsx`) 
**Location:** Line 25
**Endpoint to Replace:** `YOUR_API_ENDPOINT_FOR_LOGIN`
**Method:** POST
**Request Body:**
```json
{
  "role": "string",
  "email": "string",
  "password": "string"
}
```
**Expected Response:** User data + authentication token

## 📄 Job Description Processing APIs

### 3. File Upload Processing (`src/pages/JDUpload.tsx`)
**Location:** Line 95
**Endpoint to Replace:** `YOUR_API_ENDPOINT_FOR_FILE_UPLOAD`
**Method:** POST
**Content-Type:** multipart/form-data
**Form Data:**
- `file`: File (PDF/DOC/DOCX/TXT)
- `role`: string
- `instructions`: string

**Expected Response:**
```json
{
  "extractedText": "string",
  "processedContent": "string",
  "analysisData": {}
}
```

### 4. Text Processing (`src/pages/JDUpload.tsx`)
**Location:** Line 124
**Endpoint to Replace:** `YOUR_API_ENDPOINT_FOR_TEXT_PROCESSING`
**Method:** POST
**Request Body:**
```json
{
  "role": "string",
  "jobDescription": "string",
  "instructions": "string"
}
```
**Expected Response:**
```json
{
  "processedContent": "string",
  "analysisData": {},
  "aiEnhancements": "string"
}
```

### 5. JD Version Selection (`src/pages/JDComparison.tsx`)
**Location:** Line 76
**Endpoint to Replace:** `YOUR_API_ENDPOINT_FOR_JD_SELECTION`
**Method:** POST
**Request Body:**
```json
{
  "selectedVersion": "original" | "ai",
  "jobDescription": "string",
  "timestamp": number
}
```
**Expected Response:**
```json
{
  "processedJD": "string",
  "personaRecommendations": {}
}
```

## 👥 Candidate Evaluation APIs

### 6. Candidate CV Evaluation (`src/pages/CandidateUpload.tsx`)
**Location:** Line 105
**Endpoint to Replace:** `YOUR_API_ENDPOINT_FOR_CANDIDATE_EVALUATION`
**Method:** POST
**Content-Type:** multipart/form-data
**Form Data:**
- `candidateCV`: File (PDF/DOC/DOCX)
- `jobDescriptionData`: string (JSON)
- `personaData`: string (JSON)

**Expected Response:**
```json
{
  "candidateName": "string",
  "overallScore": number,
  "fitCategory": "perfect" | "moderate" | "low",
  "technicalSkills": number,
  "experience": number,
  "communication": number,
  "certifications": number,
  "detailedEvaluation": {
    "categories": [],
    "subAttributes": [],
    "recommendations": []
  }
}
```

## 🔧 Implementation Steps

### Step 1: Replace API Endpoints
1. Search for `YOUR_API_ENDPOINT_FOR_` in the codebase
2. Replace each placeholder with your actual backend URL
3. Ensure endpoints match your backend route structure

### Step 2: Add Authentication Headers
If your APIs require authentication, uncomment and configure these lines in each file:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_API_KEY', // Uncomment and add your auth
}
```

### Step 3: API Key Management
- For public/client-side API keys: Add directly to the code
- For private API keys: Use environment variables or secure storage
- Consider using Lovable Cloud for secure backend integration

### Step 4: Error Handling
The code includes fallback mechanisms that store data locally if API calls fail. You can modify the error handling in each function as needed.

### Step 5: Response Processing
Ensure your backend APIs return data in the expected format, or modify the response processing code to match your API structure.

## 📋 API Endpoint Summary

| Feature | File | Line | Endpoint Variable |
|---------|------|------|------------------|
| Registration | `Register.tsx` | 46 | `YOUR_API_ENDPOINT_FOR_REGISTRATION` |
| Login | `Login.tsx` | 25 | `YOUR_API_ENDPOINT_FOR_LOGIN` |
| File Upload | `JDUpload.tsx` | 95 | `YOUR_API_ENDPOINT_FOR_FILE_UPLOAD` |
| Text Processing | `JDUpload.tsx` | 124 | `YOUR_API_ENDPOINT_FOR_TEXT_PROCESSING` |
| JD Selection | `JDComparison.tsx` | 76 | `YOUR_API_ENDPOINT_FOR_JD_SELECTION` |
| CV Evaluation | `CandidateUpload.tsx` | 105 | `YOUR_API_ENDPOINT_FOR_CANDIDATE_EVALUATION` |

## 🚀 Quick Start
1. Find all `YOUR_API_ENDPOINT_FOR_` occurrences
2. Replace with your backend URLs (e.g., `https://your-domain.com/api/v1/...`)
3. Add authentication headers if needed
4. Test each integration point
5. Monitor console logs for API call debugging

## 📞 Support
All API calls include detailed console logging and error handling to help with debugging and integration testing.