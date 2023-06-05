// ErrorHandler subclass inherits attributes and methods from Error (superclass)
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        // ErrorHandler inherits message from Error
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler