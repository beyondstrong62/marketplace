class apiError extends Error {
    constructor(statusCode, message = "Something went wrong", error = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        //this.message = message; above super already does the same in parent class
        this.success = false;//tells if apiError is successful or not

        //error array is used to store multiple errors in single array only...
        //error is used to check for more than one error statements in the code at once
        //also holds the detailed information of the error
        this.error = error;
        
        //stack basically hold the sequentual way of storing errors,
        //it is step by step trace guide about how a certain error occured in the code
        if(stack) this.stack = stack;

        else Error.captureStackTrace(this, this.constructor);
    }
};

export { apiError };