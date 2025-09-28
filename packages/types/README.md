# @cerium/types

Shared TypeScript types for the Cerium monorepo.

## Installation

This package is automatically available in your workspace. Add it to your dependencies:

```json
{
  "dependencies": {
    "@cerium/types": "workspace:*"
  }
}
```

## Usage

### Database Types

Import database types derived from your Drizzle schema:

```typescript
import { 
  User, 
  NewUser, 
  Organization, 
  NewOrganization,
  UserWithOrganizations 
} from '@cerium/types';

// Type-safe function parameters
async function createUser(userData: NewUser): Promise<User> {
  // Implementation
}

// Type-safe with complex relations
async function getUserWithOrgs(id: string): Promise<UserWithOrganizations | null> {
  // Implementation
}
```

### Authentication Types

```typescript
import { AuthSession, SignInCredentials } from '@cerium/types';

async function signIn(credentials: SignInCredentials): Promise<AuthSession> {
  // Implementation
}
```

### API Types

```typescript
import { ApiResponse, PaginatedResponse } from '@cerium/types';

async function getUsers(): Promise<ApiResponse<PaginatedResponse<User>>> {
  // Implementation
}
```

## Available Types

### Database Types
- `User`, `NewUser`, `UserUpdate`, `PublicUser`
- `Session`, `NewSession`
- `Account`, `NewAccount`
- `Organization`, `NewOrganization`, `OrganizationUpdate`
- `Member`, `NewMember`, `MemberRole`
- `Invitation`, `NewInvitation`, `InvitationStatus`

### Complex Relation Types
- `UserWithOrganizations`
- `OrganizationWithMembers`
- `MemberWithUser`
- `MemberWithOrganization`
- `InvitationWithDetails`

### Auth Types
- `AuthSession`
- `SignInCredentials`
- `SignUpCredentials`
- `InvitationAcceptance`
- `AuthProvider`
- `AuthError`

### API Types
- `ApiResponse<T>`
- `PaginatedResponse<T>`
- `PaginationParams`
- `SortParams`
- `FilterParams`
- `SearchParams`

## Development

This package uses TypeScript source files directly - no compilation needed!

```bash
# Types are consumed directly from source
# No build step required
```
