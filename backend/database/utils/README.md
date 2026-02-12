# Redis Utilities

This folder contains utility functions for working with Redis.

## Usage

### Import utilities in your routes:

```javascript
const { 
  getCallSession, 
  setCallSession,
  getMenuState,
  setMenuState,
  getCachedAlerts,
  setCachedAlerts,
  addLog,
  getActiveCaller,
  setActiveCaller
} = require('../utils/redis-helpers');
```

## Example Helpers (To be created):

- `getCallSession(sessionId)` - Retrieve call session
- `setCallSession(sessionId, data)` - Store call session
- `incrementCallCount(callerId)` - Track call statistics
- `getActiveCallers(location)` - Get callers in location
- `cacheAlertsByLocation(location, alerts)` - Cache alerts
- `getCachedAlerts(location)` - Retrieve cached alerts
- `addLog(type, level, message, details)` - Add system log

These will be implemented as needed.
