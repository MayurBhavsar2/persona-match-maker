# Design Document

## Overview

This design transforms the current linear recruitment workflow into a flexible, modular system. The solution maintains existing components and API integrations while adding new navigation structure and list management capabilities. Users can access any section independently through sidebar navigation and reuse screens for both creation and editing.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/TypeScript)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Navigation    │  │   List Views    │  │ Form Views   │ │
│  │   - Sidebar     │  │   - JD List     │  │ - JD Form    │ │
│  │   - Routing     │  │   - Persona List│  │ - Persona    │ │
│  │                 │  │   - Candidate   │  │ - Candidate  │ │
│  │                 │  │   - Evaluation  │  │ - Evaluation │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    State Management                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  React Query    │  │  Local Storage  │  │ Context API  │ │
│  │  - API Caching  │  │  - User Session │  │ - App State  │ │
│  │  - Mutations    │  │  - Temp Data    │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Backend Integration                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Auth APIs     │  │   CRUD APIs     │  │  AI APIs     │ │
│  │   - Login       │  │   - JD          │  │  - JD Refine │ │
│  │   - Token       │  │   - Persona     │  │  - Persona   │ │
│  │                 │  │   - Candidate   │  │  - Scoring   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Reusability Strategy

The design leverages existing components by adding mode parameters:

- **JDUpload** → **JDForm** (create/edit modes)
- **PersonaConfig** → **PersonaForm** (create/edit modes)  
- **CandidateUpload** → **CandidateForm** (upload/manage modes)
- **Results** → **EvaluationView** (enhanced with selection)

## Components and Interfaces

### 1. Enhanced Navigation Component

**File**: `src/components/EnhancedNavbar.tsx`

```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path: string;
  subItems?: NavigationItem[];
}

interface EnhancedNavbarProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}
```

**Features**:
- Expandable sidebar with main sections
- Active section highlighting
- User profile dropdown (existing)
- Responsive design

### 2. List Management Components

#### JD List Component
**File**: `src/components/lists/JDList.tsx`

```typescript
interface JDListItem {
  id: string;
  title: string;
  role_name: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'archived';
  persona_count: number;
  evaluation_count: number;
}

interface JDListProps {
  onEdit: (jdId: string) => void;
  onCreate: () => void;
  onDelete: (jdId: string) => void;
}
```

#### Persona List Component
**File**: `src/components/lists/PersonaList.tsx`

```typescript
interface PersonaListItem {
  id: string;
  name: string;
  jd_id: string;
  jd_title: string;
  role_name: string;
  created_at: string;
  evaluation_count: number;
  status: 'draft' | 'active';
}

interface PersonaListProps {
  onEdit: (personaId: string) => void;
  onCreate: () => void;
  onDelete: (personaId: string) => void;
}
```

#### Candidate List Component
**File**: `src/components/lists/CandidateList.tsx`

```typescript
interface CandidateListItem {
  id: string;
  name: string;
  file_name: string;
  uploaded_at: string;
  evaluation_count: number;
  latest_score?: number;
  status: 'uploaded' | 'processed' | 'evaluated';
}

interface CandidateListProps {
  onView: (candidateId: string) => void;
  onUpload: () => void;
  onDelete: (candidateId: string) => void;
}
```

#### Evaluation List Component
**File**: `src/components/lists/EvaluationList.tsx`

```typescript
interface EvaluationListItem {
  id: string;
  jd_title: string;
  persona_name: string;
  candidate_count: number;
  created_at: string;
  average_score: number;
  status: 'completed' | 'in_progress';
}

interface EvaluationListProps {
  onView: (evaluationId: string) => void;
  onCreate: () => void;
  onDelete: (evaluationId: string) => void;
}
```

### 3. Enhanced Form Components

#### Mode-Aware JD Form
**File**: `src/components/forms/JDForm.tsx`

```typescript
interface JDFormProps {
  mode: 'create' | 'edit';
  jdId?: string;
  onSave: (data: JDData) => void;
  onCancel: () => void;
}
```

**Enhancements**:
- Pre-populate fields in edit mode
- Save/Update API calls based on mode
- Validation for both modes

#### Mode-Aware Persona Form
**File**: `src/components/forms/PersonaForm.tsx`

```typescript
interface PersonaFormProps {
  mode: 'create' | 'edit';
  personaId?: string;
  jdId?: string; // Required for create mode
  onSave: (data: PersonaData) => void;
  onCancel: () => void;
}
```

### 4. Evaluation Selection Component

**File**: `src/components/EvaluationSelector.tsx`

```typescript
interface EvaluationSelectorProps {
  onEvaluate: (params: EvaluationParams) => void;
}

interface EvaluationParams {
  jdId: string;
  personaId: string;
  candidateIds: string[];
}
```

**Features**:
- JD selection dropdown
- Persona selection (filtered by JD)
- Multi-select candidate list
- Validation before evaluation

## Data Models

### Enhanced Data Structures

```typescript
// JD Data Model
interface JDData {
  id: string;
  title: string;
  role_id: string;
  role_name: string;
  original_text: string;
  refined_text?: string;
  notes?: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  personas?: PersonaData[];
}

// Persona Data Model
interface PersonaData {
  id: string;
  name: string;
  jd_id: string;
  categories: CategoryData[];
  status: 'draft' | 'active';
  created_at: string;
  updated_at: string;
  evaluations?: EvaluationData[];
}

// Candidate Data Model
interface CandidateData {
  id: string;
  name?: string;
  file_name: string;
  file_hash: string;
  s3_url: string;
  cv_text: string;
  status: 'uploaded' | 'processed';
  uploaded_at: string;
  evaluations?: EvaluationData[];
}

// Evaluation Data Model
interface EvaluationData {
  id: string;
  jd_id: string;
  persona_id: string;
  candidate_id: string;
  final_score: number;
  match_status: string;
  created_at: string;
  detailed_scores?: CategoryScore[];
}
```

### API Integration Patterns

```typescript
// Generic API Hook Pattern
interface UseApiListOptions<T> {
  endpoint: string;
  queryKey: string[];
  transform?: (data: any) => T[];
}

function useApiList<T>(options: UseApiListOptions<T>) {
  return useQuery({
    queryKey: options.queryKey,
    queryFn: async () => {
      const response = await fetch(`${API_URL}${options.endpoint}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await response.json();
      return options.transform ? options.transform(data) : data;
    }
  });
}

// Usage Examples
const useJDList = () => useApiList<JDData>({
  endpoint: '/api/v1/jd/',
  queryKey: ['jds'],
  transform: (data) => data.job_descriptions || data
});

const usePersonaList = () => useApiList<PersonaData>({
  endpoint: '/api/v1/persona/',
  queryKey: ['personas']
});
```

## Error Handling

### Comprehensive Error Strategy

```typescript
// Error Types
interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Error Handling Hook
function useErrorHandler() {
  const { toast } = useToast();
  
  return {
    handleApiError: (error: any, context: string) => {
      console.error(`${context}:`, error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    },
    
    handleValidationError: (errors: Record<string, string>) => {
      Object.entries(errors).forEach(([field, message]) => {
        toast({
          title: `Validation Error: ${field}`,
          description: message,
          variant: "destructive"
        });
      });
    }
  };
}
```

### Dependency Management

```typescript
// Dependency Checker
interface DependencyCheck {
  canDelete: boolean;
  dependencies: {
    type: 'persona' | 'evaluation';
    count: number;
    items: Array<{ id: string; name: string }>;
  }[];
  warnings: string[];
}

async function checkJDDependencies(jdId: string): Promise<DependencyCheck> {
  // Check personas and evaluations
  const [personas, evaluations] = await Promise.all([
    fetchPersonasByJD(jdId),
    fetchEvaluationsByJD(jdId)
  ]);
  
  return {
    canDelete: personas.length === 0 && evaluations.length === 0,
    dependencies: [
      { type: 'persona', count: personas.length, items: personas },
      { type: 'evaluation', count: evaluations.length, items: evaluations }
    ],
    warnings: personas.length > 0 ? ['Deleting this JD will also delete associated personas'] : []
  };
}
```

## Testing Strategy

### Component Testing Approach

```typescript
// Test Structure for List Components
describe('JDList Component', () => {
  it('should display JDs with correct information', () => {
    // Test data rendering
  });
  
  it('should handle edit action', () => {
    // Test edit callback
  });
  
  it('should handle delete with dependencies', () => {
    // Test dependency checking
  });
  
  it('should show loading and error states', () => {
    // Test loading/error handling
  });
});

// Test Structure for Form Components
describe('JDForm Component', () => {
  describe('Create Mode', () => {
    it('should render empty form', () => {});
    it('should validate required fields', () => {});
    it('should call create API on submit', () => {});
  });
  
  describe('Edit Mode', () => {
    it('should pre-populate form with existing data', () => {});
    it('should call update API on submit', () => {});
    it('should handle not found scenarios', () => {});
  });
});
```

### Integration Testing

```typescript
// End-to-End Flow Testing
describe('Recruitment Flow Integration', () => {
  it('should complete full sequential workflow', async () => {
    // Test: JD Creation → Persona Creation → Candidate Upload → Evaluation
  });
  
  it('should support independent section access', async () => {
    // Test: Direct navigation to any section
  });
  
  it('should maintain data relationships', async () => {
    // Test: JD-Persona-Evaluation relationships
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **List Virtualization**: For large candidate/evaluation lists
2. **Pagination**: Server-side pagination for all list views
3. **Caching**: React Query for API response caching
4. **Lazy Loading**: Code splitting for different sections
5. **Debounced Search**: For filtering large lists

### Caching Strategy

```typescript
// React Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Invalidation Patterns
const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateJDs: () => queryClient.invalidateQueries(['jds']),
    invalidatePersonas: () => queryClient.invalidateQueries(['personas']),
    invalidateEvaluations: () => queryClient.invalidateQueries(['evaluations']),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
};
```

## Security Considerations

### Authentication & Authorization

```typescript
// Enhanced Auth Hook
function useAuth() {
  const navigate = useNavigate();
  
  return {
    isAuthenticated: () => !!localStorage.getItem('token'),
    getToken: () => localStorage.getItem('token'),
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    },
    checkPermission: (action: string, resource: string) => {
      // Implement role-based permissions
      return true; // Placeholder
    }
  };
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

### Data Validation

```typescript
// Validation Schemas using Zod
const jdSchema = z.object({
  title: z.string().min(1, "Title is required"),
  role_id: z.string().min(1, "Role is required"),
  original_text: z.string().min(10, "JD content too short"),
  notes: z.string().optional(),
});

const personaSchema = z.object({
  name: z.string().min(1, "Persona name is required"),
  jd_id: z.string().min(1, "JD selection is required"),
  categories: z.array(categorySchema).min(1, "At least one category required"),
});
```

This design maintains backward compatibility while providing the flexibility requested. The modular approach allows users to work independently on different aspects of their recruitment pipeline while preserving data relationships and workflow integrity.