const ActivityLog = require('../models/ActivityLog');

/**
 * Middleware to log user activity
 * @param {String} action - The action taking place (e.g., 'CREATE', 'UPDATE', 'DELETE')
 */
const logActivity = (action) => {
  return async (req, res, next) => {
    // Intercept the response to check if it was successful
    const originalSend = res.send;
    
    res.send = function(data) {
      // Restore original send
      res.send = originalSend;
      
      // Determine status from status code
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      
      // Create log asynchronously (don't block the response)
      try {
        let details = `${req.method} ${req.originalUrl}`;
        
        // Add more context based on the action
        if (req.params.id) {
          details += ` - Target ID: ${req.params.id}`;
        }
        
        const logEntry = new ActivityLog({
          user: req.user ? req.user._id : null,
          action: action || req.method,
          details: details,
          ipAddress: req.ip || req.connection.remoteAddress,
          endpoint: req.originalUrl,
          status: isSuccess ? 'SUCCESS' : 'FAILED'
        });
        
        logEntry.save().catch(err => console.error('Error saving activity log:', err));
      } catch (err) {
        console.error('Activity logger error:', err);
      }
      
      // Continue sending response
      return res.send(data);
    };
    
    next();
  };
};

module.exports = { logActivity };
