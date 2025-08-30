# Authentication Lost Interface

This document explains the authentication lost functionality that provides a smooth user experience when authentication is lost or expires.

## Overview

The authentication lost interface consists of several components that work together to detect and handle authentication failures gracefully:

1. **AuthLostModal** - The UI modal that appears when authentication is lost
2. **useAuthLost** - Hook that manages authentication state and detects failures
3. **AuthLostProvider** - Context provider that wraps the app
4. **Auth Error Handler** - Utility functions for handling API errors

## Components

### AuthLostModal

A modal component that displays when authentication is lost with:
- Warning icon and clear messaging
- "Log In Again" button that redirects to login page
- Optional close button for dismissible modals
- Automatic cleanup of stored authentication data

**Usage:**
```tsx
import AuthLostModal from '@/components/common/AuthLostModal';

<AuthLostModal 
  isOpen={isAuthLost} 
  onClose={hideAuthLost}
  message="Your session has expired. Please log in again to continue."
/>
```

### useAuthLost Hook

A custom hook that:
- Monitors JWT token expiration
- Provides functions to show/hide the auth lost modal
- Automatically logs out users when authentication is lost
- Checks token expiration every minute

**Usage:**
```tsx
import { useAuthLost } from '@/hooks/useAuthLost';

const { isAuthLost, authLostMessage, showAuthLost, hideAuthLost, handleAuthLost } = useAuthLost();
```

### AuthLostProvider

A context provider that:
- Wraps the entire application
- Provides auth lost functionality to all child components
- Automatically shows the modal when authentication is lost

**Usage:**
```tsx
import { AuthLostProvider } from '@/components/common/AuthLostProvider';

function App() {
  return (
    <AuthLostProvider>
      {/* Your app components */}
    </AuthLostProvider>
  );
}
```

### Auth Error Handler

Utility functions for handling API errors:
- Detects 401/403 authentication errors
- Automatically triggers auth lost modal
- Can be used in API calls throughout the app

**Usage:**
```tsx
import { useAuthErrorHandler } from '@/utils/authErrorHandler';

const { handleAuthError } = useAuthErrorHandler();

// In your API call
try {
  const data = await api.get('/some-endpoint');
} catch (error) {
  if (handleAuthError(error)) {
    // Auth error was handled, don't show other error messages
    return;
  }
  // Handle other errors
}
```

## Features

### Automatic Detection
- **Token Expiration**: Monitors JWT token expiration and shows warning 5 minutes before expiry
- **API Errors**: Automatically detects 401/403 errors from API calls
- **Malformed Tokens**: Handles invalid or corrupted JWT tokens

### User Experience
- **Smooth Transition**: Modal appears with animation and backdrop blur
- **Clear Messaging**: User-friendly messages explaining what happened
- **One-Click Login**: Direct navigation to login page with "Log In Again" button
- **Data Cleanup**: Automatically clears stored authentication data

### Customization
- **Custom Messages**: Can pass custom error messages
- **Dismissible**: Optional close button for non-critical warnings
- **Styling**: Fully customizable with Tailwind CSS classes
- **Dark Mode**: Supports both light and dark themes

## Implementation

### 1. App Setup

The `AuthLostProvider` is already integrated into the main App component:

```tsx
// App.tsx
import { AuthLostProvider } from '@/components/common/AuthLostProvider';

function App() {
  return (
    <SettingsProvider>
      <DesignProvider>
        <ThemeProvider>
          <AuthLostProvider>
            <RouterProvider router={router} />
            <ToastContainer />
          </AuthLostProvider>
        </ThemeProvider>
      </DesignProvider>
    </SettingsProvider>
  );
}
```

### 2. Using in Components

To use the auth lost functionality in any component:

```tsx
import { useAuthLostContext } from '@/components/common/AuthLostProvider';

function MyComponent() {
  const { showAuthLost, handleAuthLost } = useAuthLostContext();
  
  const handleApiCall = async () => {
    try {
      const data = await api.get('/some-endpoint');
    } catch (error) {
      if (error.response?.status === 401) {
        showAuthLost('Your session has expired. Please log in again.');
      }
    }
  };
  
  return (
    <button onClick={handleApiCall}>
      Make API Call
    </button>
  );
}
```

### 3. Testing

A test button has been added to the admin dashboard to demonstrate the functionality:

- **Location**: Admin dashboard sidebar (bottom)
- **Button**: "Test Auth Lost" with warning icon
- **Function**: Shows the auth lost modal with a test message

## Automatic Triggers

The authentication lost modal will automatically appear when:

1. **JWT Token Expires**: 5 minutes before expiration
2. **API Returns 401/403**: Any API call returns authentication error
3. **Invalid Token**: JWT token is malformed or corrupted
4. **Manual Trigger**: Called programmatically via `showAuthLost()`

## Error Handling

The system handles various authentication error scenarios:

- **401 Unauthorized**: Invalid or missing authentication
- **403 Forbidden**: Valid token but insufficient permissions
- **Token Expiration**: JWT token has expired
- **Network Errors**: Connection issues that might affect authentication

## Security Features

- **Automatic Logout**: Clears all stored authentication data
- **Token Validation**: Validates JWT token structure and expiration
- **Secure Redirect**: Uses `replace: true` to prevent back navigation
- **Data Cleanup**: Removes tokens from localStorage and sessionStorage

## Customization Options

### Custom Messages
```tsx
showAuthLost('Custom authentication error message');
```

### Dismissible Modal
```tsx
<AuthLostModal 
  isOpen={isAuthLost} 
  onClose={hideAuthLost} // Makes modal dismissible
  message="Custom message"
/>
```

### Styling
The modal uses Tailwind CSS classes and can be customized by modifying the `AuthLostModal.tsx` component.

## Best Practices

1. **Always handle API errors**: Use the auth error handler in API calls
2. **Test the functionality**: Use the test button to verify it works
3. **Customize messages**: Provide clear, user-friendly error messages
4. **Monitor token expiration**: The system automatically handles this
5. **Clean up on logout**: The system automatically clears stored data

## Troubleshooting

### Modal Not Appearing
- Check if `AuthLostProvider` is wrapping your app
- Verify the component is using `useAuthLostContext`
- Check browser console for errors

### Token Not Detected
- Ensure JWT token is stored in localStorage as 'authToken'
- Verify token format is valid JWT
- Check token expiration time

### API Errors Not Handled
- Use the `useAuthErrorHandler` hook in API calls
- Check if error response has correct status codes (401/403)
- Verify error handling is in try-catch blocks








