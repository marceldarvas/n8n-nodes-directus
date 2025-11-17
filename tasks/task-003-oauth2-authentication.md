# Task 003: Add OAuth2 Authentication Support

## Priority: MEDIUM
**Effort**: 6-8 hours
**Developer**: Any (Foundation work)
**Phase**: 1 - Foundation & Bug Fixes

## Status
- [ ] Not Started
- [ ] In Progress
- [ ] Code Review
- [ ] Testing
- [ ] Completed

## Prerequisites
- ✅ Task 001: Fix Syntax Errors (MUST BE COMPLETED FIRST)

## Description
Add OAuth2 authentication support to complement the existing static token authentication. This enables users to authenticate using Directus SSO providers (Google, GitHub, Azure AD, etc.) and obtain dynamic access/refresh token pairs.

## Current Implementation
Existing authentication in `DirectusApi.credentials.ts`:
- Static Token (API Key) authentication
- Email/Password authentication
- No OAuth2 support

## OAuth2 Flow Overview
1. User initiates OAuth2 flow in n8n
2. Redirect to Directus SSO provider
3. User authorizes access
4. Receive authorization code
5. Exchange code for access + refresh tokens
6. Store tokens securely
7. Refresh tokens before expiration

## Implementation Steps

### 1. Create OAuth2 Credential File (2 hours)
- [ ] Create `credentials/DirectusOAuth2Api.credentials.ts`
- [ ] Implement ICredentialType interface
- [ ] Add OAuth2 properties (clientId, clientSecret, authUrl, tokenUrl)
- [ ] Configure grant type (authorization_code)
- [ ] Add scope configuration
- [ ] Set up redirect URI handling

```typescript
import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class DirectusOAuth2Api implements ICredentialType {
  name = 'directusOAuth2Api';
  extends = ['oAuth2Api'];
  displayName = 'Directus OAuth2 API';
  documentationUrl = 'directus';
  properties: INodeProperties[] = [
    // OAuth2 configuration
  ];
}
```

### 2. Configure OAuth2 Parameters (1.5 hours)
- [ ] Add Directus instance URL field
- [ ] Configure authorization endpoint (`/auth/oauth`)
- [ ] Configure token endpoint (`/auth/token`)
- [ ] Add supported provider selection (Google, GitHub, Azure AD, etc.)
- [ ] Configure default scopes
- [ ] Add custom scope override option

### 3. Implement Token Management (2 hours)
- [ ] Add access token storage
- [ ] Add refresh token storage
- [ ] Implement token expiration detection
- [ ] Create refresh token logic
- [ ] Handle token refresh errors gracefully
- [ ] Add token validation endpoint check

```typescript
// Token refresh logic
async function refreshAccessToken(
  credentials: ICredentialDataDecryptedObject,
): Promise<ICredentialDataDecryptedObject> {
  // Implement refresh logic
}
```

### 4. Update GenericFunctions (1.5 hours)
- [ ] Modify `directusApiRequest` to handle OAuth2 credentials
- [ ] Add OAuth2 token to Authorization header
- [ ] Detect token expiration (401 errors)
- [ ] Automatically refresh tokens when expired
- [ ] Fallback to credential refresh if token invalid

```typescript
// Check credential type and apply appropriate auth
if (credentials.authenticationType === 'oauth2') {
  options.headers.Authorization = `Bearer ${credentials.accessToken}`;
} else if (credentials.authenticationType === 'staticToken') {
  options.headers.Authorization = `Bearer ${credentials.token}`;
}
```

### 5. Add Credential Testing (1 hour)
- [ ] Implement credential test function
- [ ] Test OAuth2 connection with `/users/me` endpoint
- [ ] Validate token and refresh if needed
- [ ] Provide clear error messages for auth failures
- [ ] Add connection status indicator

### 6. Update Node Credential Options (30 min)
- [ ] Update `Directus.node.ts` credentials array
- [ ] Add directusOAuth2Api as option
- [ ] Ensure backward compatibility with existing auth methods
- [ ] Update credential selection UI

```typescript
credentials: [
  {
    name: 'directusApi',
    required: true,
    displayOptions: {
      show: {
        authentication: ['staticToken', 'emailPassword'],
      },
    },
  },
  {
    name: 'directusOAuth2Api',
    required: true,
    displayOptions: {
      show: {
        authentication: ['oauth2'],
      },
    },
  },
],
```

## Testing Criteria

### Manual Testing
1. **Google OAuth2 Flow**
   - [ ] Configure Google SSO in Directus
   - [ ] Set up OAuth2 credentials in n8n
   - [ ] Complete authorization flow
   - [ ] Verify access token works
   - [ ] Test token refresh after expiration

2. **GitHub OAuth2 Flow**
   - [ ] Configure GitHub SSO in Directus
   - [ ] Complete authorization flow
   - [ ] Verify access works

3. **Token Refresh**
   - [ ] Wait for token expiration
   - [ ] Trigger request that needs refresh
   - [ ] Verify automatic refresh
   - [ ] Confirm new tokens stored

### Integration Tests
```typescript
// Test OAuth2 credential validation
it('should authenticate with OAuth2 and fetch user', async () => {
  // Mock OAuth2 flow
  // Verify access token received
  // Test API request with token
});

// Test token refresh
it('should refresh expired access token', async () => {
  // Mock expired token
  // Trigger refresh
  // Verify new token used
});
```

### Error Scenarios
- [ ] Invalid client credentials
- [ ] Expired refresh token
- [ ] Revoked authorization
- [ ] Network failure during token exchange
- [ ] Invalid authorization code

## Expected Outcomes
- ✅ New DirectusOAuth2Api credential type
- ✅ Support for Google, GitHub, Azure AD SSO providers
- ✅ Automatic token refresh before expiration
- ✅ Graceful handling of token refresh failures
- ✅ Backward compatibility with existing auth methods
- ✅ Clear setup documentation for each provider
- ✅ Credential test function validates OAuth2 connection

## Files Modified
- New file: `credentials/DirectusOAuth2Api.credentials.ts`
- `nodes/Directus/GenericFunctions.ts` (OAuth2 token handling)
- `nodes/Directus/Directus.node.ts` (credential options)
- `package.json` (update exports if needed)

## OAuth2 Provider Configurations

### Google OAuth2
```typescript
{
  provider: 'google',
  authUrl: 'https://your-directus.com/auth/login/google',
  tokenUrl: 'https://your-directus.com/auth/token',
  scope: 'openid email profile',
}
```

### GitHub OAuth2
```typescript
{
  provider: 'github',
  authUrl: 'https://your-directus.com/auth/login/github',
  tokenUrl: 'https://your-directus.com/auth/token',
  scope: 'user:email',
}
```

### Azure AD OAuth2
```typescript
{
  provider: 'azure',
  authUrl: 'https://your-directus.com/auth/login/azure',
  tokenUrl: 'https://your-directus.com/auth/token',
  scope: 'openid email profile',
}
```

## Dependencies
**Blocks**: None (nice-to-have feature)

**Blocked By**:
- Task 001 (Syntax errors must be fixed first)

**Can Run in Parallel With**:
- Task 002 (Error handling)
- Task 008-010 (User management - different files)
- Task 011-014 (Filter presets - different files)

## Notes
- OAuth2 is optional - existing token auth should continue working
- Focus on common SSO providers first (Google, GitHub)
- Document provider-specific setup steps clearly
- Consider adding provider-specific icons in credential UI
- Test with both Directus Cloud and self-hosted instances
- Ensure tokens are stored securely in n8n credential storage

## Concurrency
✅ **Can be developed in parallel with Tasks 002, 008-010, 011-014** (different files/features)

## Related Documentation
- Directus OAuth2: https://docs.directus.io/api/authentication#oauth-20
- n8n OAuth2 Credentials: https://docs.n8n.io/integrations/creating-nodes/build/reference/credential-types/#oauth2
- Directus SSO Configuration: https://docs.directus.io/configuration/sso

## Security Considerations
- [ ] Never log access or refresh tokens
- [ ] Use secure credential storage (n8n built-in)
- [ ] Validate redirect URIs to prevent hijacking
- [ ] Implement PKCE (Proof Key for Code Exchange) if supported
- [ ] Clear tokens on credential deletion
- [ ] Warn users before token refresh failures

## Definition of Done
- [ ] DirectusOAuth2Api credential type implemented
- [ ] OAuth2 flow tested with Google and GitHub
- [ ] Automatic token refresh working
- [ ] Backward compatibility verified with existing auth
- [ ] Unit tests passing for OAuth2 logic
- [ ] Integration tests passing with live Directus SSO
- [ ] Documentation added for each provider setup
- [ ] Security review completed
- [ ] Git commit with message: "feat: add OAuth2 authentication support for SSO providers"
