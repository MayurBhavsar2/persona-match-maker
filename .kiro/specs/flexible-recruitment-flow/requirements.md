# Requirements Document

## Introduction

This feature transforms the current linear recruitment workflow into a flexible, modular system that allows recruiters to navigate between different stages independently. Instead of being forced through a sequential flow (JD → Persona → Candidate Upload → Evaluation), users can access any section at any time through sidebar navigation, edit existing items, and reuse screens for both creation and editing purposes.

## Requirements

### Requirement 1

**User Story:** As a recruiter, I want to access any section of the recruitment process through sidebar navigation, so that I can work on different aspects of my recruitment pipeline independently.

#### Acceptance Criteria

1. WHEN I am logged into the system THEN I SHALL see sidebar navigation with sections for JDs, Personas, Candidates, and Evaluations
2. WHEN I click on any sidebar section THEN I SHALL be navigated to that section regardless of my current workflow state
3. WHEN I access a section THEN I SHALL see a list of existing items (JDs, Personas, etc.) that I can select to edit or view
4. IF I have no existing items in a section THEN I SHALL see an option to create a new item
5. WHEN I navigate between sections THEN my progress in other sections SHALL be preserved

### Requirement 2

**User Story:** As a recruiter, I want to create and manage multiple JDs independently, so that I can work on different roles simultaneously without losing progress.

#### Acceptance Criteria

1. WHEN I access the JD section THEN I SHALL see a list of all my existing JDs with their status and creation date
2. WHEN I click "Create New JD" THEN I SHALL be taken to the JD upload screen in creation mode
3. WHEN I click on an existing JD THEN I SHALL be taken to the JD screen in edit mode with all fields pre-populated
4. WHEN I save changes to a JD THEN the updated JD SHALL be stored and available for persona creation
5. WHEN I delete a JD THEN I SHALL be warned about dependent personas and candidates
6. WHEN I view a JD list THEN I SHALL see indicators showing which JDs have associated personas and candidates

### Requirement 3

**User Story:** As a recruiter, I want to create and manage multiple personas for each JD independently, so that I can configure different evaluation criteria for the same role.

#### Acceptance Criteria

1. WHEN I access the Persona Management section THEN I SHALL see a list of all existing personas with their associated JD names
2. WHEN I click "Create Persona" THEN I SHALL be prompted to select a JD from my available JDs
3. WHEN I select a JD for persona creation THEN I SHALL be taken to the persona configuration screen with AI-generated suggestions
4. WHEN I click on an existing persona THEN I SHALL be taken to the persona screen in edit mode with all weightages and criteria pre-populated
5. WHEN I save a persona THEN it SHALL be associated with the selected JD and multiple personas SHALL be allowed per JD
6. WHEN I view the persona list THEN I SHALL see which personas have been used for candidate evaluations and can edit any persona

### Requirement 4

**User Story:** As a recruiter, I want to upload and manage candidates through bulk or individual upload, so that I can build my candidate pool and update candidate information as needed.

#### Acceptance Criteria

1. WHEN I access the Candidate Processing section THEN I SHALL see options for "Upload Resumes" and "View Candidates"
2. WHEN I click "Upload Resumes" THEN I SHALL see options for bulk upload interface and individual upload
3. WHEN I upload resumes THEN the system SHALL parse and extract information to create candidate profiles automatically
4. WHEN I access "View Candidates" THEN I SHALL see all candidates with ability to update their information
5. WHEN I view candidate details THEN I SHALL see which evaluations have been performed against different JD-persona combinations
6. WHEN I delete a candidate THEN I SHALL be warned about existing evaluations that will be affected

### Requirement 5

**User Story:** As a recruiter, I want to evaluate candidates against multiple JD-persona combinations and manage the evaluation process, so that I can find the best matches and shortlist candidates effectively.

#### Acceptance Criteria

1. WHEN I access the Evaluation section THEN I SHALL see options to "Select Job/Persona" and view previous evaluation results
2. WHEN I select a JD-persona combination THEN I SHALL be able to run AI matching against available candidates
3. WHEN AI matching completes THEN I SHALL be able to review results, sort by score, and shortlist candidates
4. WHEN I evaluate a candidate THEN they SHALL be able to be evaluated against multiple different JD-persona combinations
5. WHEN I view evaluation history THEN I SHALL see all combinations of JD-persona-candidate evaluations with filtering options
6. WHEN I shortlist candidates THEN the shortlist status SHALL be saved and accessible for future reference

### Requirement 6

**User Story:** As a recruiter, I want the system to maintain data relationships and dependencies between JDs, multiple personas, and evaluations, so that I can understand how my recruitment pipeline is connected.

#### Acceptance Criteria

1. WHEN I view any JD THEN I SHALL see how many personas are associated with it (supporting multiple personas per JD)
2. WHEN I view any persona THEN I SHALL see which JD it belongs to and how many evaluations have used it
3. WHEN I attempt to delete a JD with multiple dependent personas THEN I SHALL be warned and given options to handle all dependencies
4. WHEN I attempt to delete a persona with dependent evaluations THEN I SHALL be warned about the impact on existing evaluations
5. WHEN I view candidates THEN I SHALL see evaluation history showing all JD-persona combinations they've been evaluated against

### Requirement 7

**User Story:** As a recruiter, I want to continue using the sequential workflow when preferred, so that I can still follow the guided process for new roles when desired.

#### Acceptance Criteria

1. WHEN I access the Dashboard THEN I SHALL see an option to "Start New Role" that begins the sequential workflow
2. WHEN I use the sequential workflow THEN I SHALL be guided through JD → Persona → Candidate Upload → Evaluation as before
3. WHEN I'm in sequential mode THEN I SHALL still have access to sidebar navigation to jump to other sections if needed
4. WHEN I complete the sequential workflow THEN all created items SHALL be available in their respective sections for future editing
5. WHEN I exit sequential mode mid-flow THEN my progress SHALL be saved and I SHALL be able to resume later

### Requirement 8

**User Story:** As a recruiter, I want a structured sidebar navigation that organizes all recruitment functions into logical sections, so that I can efficiently access any part of the recruitment process.

#### Acceptance Criteria

1. WHEN I am logged in THEN I SHALL see a sidebar with main sections: Job Descriptions, Persona Management, Candidate Processing, and Evaluation
2. WHEN I click "Job Descriptions" THEN I SHALL access JD management with options for Create New JD and View JD List
3. WHEN I click "Persona Management" THEN I SHALL access persona functions with Create Persona and View Persona List options
4. WHEN I click "Candidate Processing" THEN I SHALL access candidate functions with Upload Resumes and View Candidates options
5. WHEN I click "Evaluation" THEN I SHALL access evaluation functions with job/persona selection and results management
6. WHEN I navigate to any section THEN the current section SHALL be highlighted in the sidebar

### Requirement 9

**User Story:** As a developer, I want to reuse existing components and integrate with current backend APIs, so that the new flexible system builds upon the existing codebase efficiently.

#### Acceptance Criteria

1. WHEN implementing the new navigation THEN existing components (JDUpload, PersonaConfig, CandidateUpload, etc.) SHALL be reused with mode parameters (create/edit)
2. WHEN making API calls THEN existing backend endpoints SHALL be used as documented in the current codebase
3. WHEN displaying data THEN existing UI components and styling patterns SHALL be maintained for consistency
4. WHEN handling authentication THEN the current token-based authentication system SHALL be preserved
5. WHEN managing state THEN existing patterns (localStorage, React Query) SHALL be extended rather than replaced

### Requirement 10

**User Story:** As a recruiter, I want clear visual indicators of item status and relationships, so that I can quickly understand the state of my recruitment pipeline.

#### Acceptance Criteria

1. WHEN I view any list (JDs, Personas, Candidates, Evaluations) THEN I SHALL see status indicators (Draft, Active, Completed, etc.)
2. WHEN I view JDs THEN I SHALL see badges indicating associated persona count and evaluation count
3. WHEN I view personas THEN I SHALL see the associated JD name and evaluation count
4. WHEN I view candidates THEN I SHALL see evaluation status and score summaries
5. WHEN I view evaluations THEN I SHALL see all related items (JD, persona, candidates) clearly labeled