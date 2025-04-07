const generateTransactionId={// Add a function to generate a unique transaction ID
generateTransactionId : () => {
    // Format: TXN-YYYYMMDD-RandomString
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
                   (date.getMonth() + 1).toString().padStart(2, '0') +
                   date.getDate().toString().padStart(2, '0');
    
    // Generate a random 6-character alphanumeric string
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return `TXN-${dateStr}-${randomStr}`;
  }
}
module.exports= generateTransactionId