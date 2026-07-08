export class Logger {
  private static formatMessage(level: string, context: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${context}]: ${message}`;
  }

  static info(context: string, message: string) {
    console.log(this.formatMessage('INFO', context, message));
  }

  static warn(context: string, message: string) {
    console.warn(this.formatMessage('WARN', context, message));
  }

  static error(context: string, message: string, error?: any) {
    let errStr = '';
    if (error) {
      errStr = ` - Details: ${error.message || JSON.stringify(error)}`;
      if (error.stack) {
        errStr += `\nStack: ${error.stack}`;
      }
    }
    console.error(this.formatMessage('ERROR', context, message + errStr));
  }

  static request(method: string, url: string, ip?: string) {
    this.info('HTTP-REQUEST', `${method} ${url} - IP: ${ip || 'unknown'}`);
  }

  static response(method: string, url: string, statusCode: number, durationMs: number) {
    this.info('HTTP-RESPONSE', `${method} ${url} - Status: ${statusCode} - Time: ${durationMs}ms`);
  }

  static aiCall(model: string, action: string, details: string) {
    this.info('AI-CALL', `Model: ${model} - Action: ${action} - Details: ${details}`);
  }

  static firebaseCall(operation: string, path: string, success: boolean) {
    this.info('FIREBASE', `Operation: ${operation} - Path: ${path} - Success: ${success}`);
  }

  static authEvent(event: string, email: string, success: boolean) {
    this.info('AUTH', `Event: ${event} - Email: ${email} - Success: ${success}`);
  }
}
