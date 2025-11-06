# Implementation Plan

- [x] 1. Set up enhanced navigation structure and routing





  - Create enhanced sidebar navigation component with new menu structure
  - Update routing configuration to support list views and form modes
  - Implement active section highlighting and responsive navigation
  - _Requirements: 1.1, 8.1, 8.2, 8.6_

- [x] 2. Create reusable list management components





  - [x] 2.1 Implement JD List component with CRUD operations


    - Create JDList component with table/card view of all JDs
    - Add status indicators, persona count, and evaluation count badges
    - Implement edit, delete, and create new JD actions
    - Add search and filtering capabilities for JD list
    - _Requirements: 2.1, 2.2, 2.6, 10.2_

  - [x] 2.2 Implement Persona List component with JD associations

    - Create PersonaList component showing personas with associated JD names
    - Add edit and delete actions with dependency checking
    - Implement filtering by JD and status
    - Show evaluation count for each persona
    - _Requirements: 3.1, 3.4, 3.6, 6.2_

  - [x] 2.3 Implement Candidate List component with evaluation history

    - Create CandidateList component showing all uploaded candidates
    - Display evaluation history and scores for each candidate
    - Add candidate information update functionality
    - Implement bulk and individual candidate management
    - _Requirements: 4.1, 4.4, 4.6, 6.5_

  - [x] 2.4 Implement Evaluation List component with filtering

    - Create EvaluationList component showing all completed evaluations
    - Add filtering by JD, persona, candidate, and date range
    - Display evaluation results with sorting capabilities
    - Implement evaluation history management
    - _Requirements: 5.1, 5.5, 5.6_

- [x] 3. Enhance existing form components with mode support





  - [x] 3.1 Convert JDUpload to mode-aware JDForm component


    - Add mode parameter (create/edit) to existing JDUpload component
    - Implement data pre-population for edit mode
    - Update API calls to handle both create and update operations
    - Add proper validation and error handling for both modes
    - _Requirements: 2.2, 2.3, 9.1, 9.3_

  - [x] 3.2 Convert PersonaConfig to mode-aware PersonaForm component


    - Add mode parameter and JD selection for create mode
    - Implement persona data loading for edit mode
    - Update save functionality to handle create vs update
    - Maintain existing AI-generated suggestions and weightage functionality
    - _Requirements: 3.2, 3.3, 3.4, 9.1_

  - [x] 3.3 Enhance CandidateUpload with management capabilities


    - Add view mode for managing existing candidates
    - Implement candidate information update functionality
    - Maintain existing bulk upload and individual upload features
    - Add candidate profile editing capabilities
    - _Requirements: 4.2, 4.3, 4.4, 9.1_

- [-] 4. Implement flexible evaluation system



  - [x] 4.1 Create EvaluationSelector component


    - Build JD selection dropdown with available JDs
    - Implement persona selection filtered by selected JD
    - Add multi-select candidate list with search functionality
    - Include validation before starting evaluation process
    - _Requirements: 5.1, 5.2, 5.4_

  - [-] 4.2 Enhance Results component for multiple evaluations




    - Update Results component to handle multiple JD-persona combinations
    - Add evaluation parameter selection and filtering
    - Implement shortlisting and candidate management features
    - Maintain existing detailed scoring and analysis views
    - _Requirements: 5.2, 5.3, 5.6_

- [ ] 5. Implement data relationship management
  - [ ] 5.1 Create dependency checking system
    - Implement functions to check JD dependencies (personas, evaluations)
    - Add persona dependency checking for evaluations
    - Create warning dialogs for delete operations with dependencies
    - Implement cascade delete options with user confirmation
    - _Requirements: 6.1, 6.3, 6.4_

  - [ ] 5.2 Add relationship indicators and badges
    - Implement count badges for JDs showing associated personas and evaluations
    - Add relationship indicators in persona lists showing JD and evaluation counts
    - Create candidate evaluation history display
    - Add visual indicators for item status and relationships
    - _Requirements: 6.1, 6.2, 6.5, 10.1, 10.2, 10.3_

- [ ] 6. Implement API integration and state management
  - [ ] 6.1 Create generic API hooks for list operations
    - Implement useApiList hook for fetching and caching list data
    - Create CRUD hooks for JDs, personas, candidates, and evaluations
    - Add proper error handling and loading states
    - Implement React Query integration for caching and synchronization
    - _Requirements: 9.2, 9.4_

  - [ ] 6.2 Implement data fetching for relationships
    - Create hooks for fetching JD-persona relationships
    - Implement candidate-evaluation history fetching
    - Add persona-evaluation count queries
    - Create dependency checking API calls
    - _Requirements: 6.1, 6.2, 6.5_

- [ ] 7. Add search and filtering capabilities
  - Create search functionality for all list components
  - Implement filtering by status, date, and relationships
  - Add sorting capabilities for all list views
  - Create advanced filtering options for evaluations
  - _Requirements: 2.6, 3.6, 4.4, 5.5_

- [ ] 8. Implement sequential workflow preservation
  - [ ] 8.1 Add "Start New Role" workflow option
    - Create dashboard option to begin sequential workflow
    - Implement guided flow through JD → Persona → Candidate → Evaluation
    - Maintain existing Layout component with progress indicators
    - Allow users to exit and resume sequential workflow
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [ ] 8.2 Integrate sequential and independent workflows
    - Ensure sequential workflow saves data to independent sections
    - Allow navigation between sequential and independent modes
    - Maintain progress and state when switching between modes
    - Update navigation to support both workflow types
    - _Requirements: 7.3, 7.4, 7.5_

- [ ] 9. Add comprehensive error handling and validation
  - Implement form validation for all create/edit operations
  - Add API error handling with user-friendly messages
  - Create dependency validation before delete operations
  - Implement data consistency checks and warnings
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 10. Implement authentication and security measures
  - Ensure all new components use existing authentication system
  - Add proper authorization checks for CRUD operations
  - Implement secure API calls with token management
  - Add input sanitization and validation
  - _Requirements: 9.2, 9.4_

- [ ] 11. Add performance optimizations
  - Implement pagination for large lists
  - Add virtualization for candidate and evaluation lists
  - Optimize API calls with proper caching strategies
  - Implement debounced search and filtering
  - _Requirements: 9.1, 9.3_

- [ ] 12. Create comprehensive testing suite
  - Write unit tests for all new list components
  - Create integration tests for form mode switching
  - Add end-to-end tests for complete workflows
  - Test data relationship management and dependency checking
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 13. Update routing and navigation integration
  - Update App.tsx with new routes for list views and form modes
  - Integrate enhanced navigation with existing Layout component
  - Ensure proper route protection and authentication
  - Add breadcrumb navigation for complex workflows
  - _Requirements: 1.1, 1.2, 8.1, 8.6_

- [ ] 14. Final integration and testing
  - Integrate all components into cohesive application
  - Test complete user workflows (both sequential and independent)
  - Verify data consistency and relationship management
  - Perform user acceptance testing and bug fixes
  - _Requirements: 1.5, 7.4, 9.1, 10.5_