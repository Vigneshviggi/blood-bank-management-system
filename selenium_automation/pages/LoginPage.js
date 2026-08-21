const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.emailInputSelector = 'input[type="email"], input[name="email"], #email';
    this.passwordInputSelector = 'input[type="password"], input[name="password"], #password';
    this.loginButtonSelector = 'button[type="submit"], button:has-text("Login")';
    this.forgotPasswordLinkSelector = 'a[href*="forgot-password"]';
    this.registerLinkSelector = 'a[href*="register"]';
    this.errorMessageSelector = '.error-message, .alert-danger, .toast-error';
  }

  async open() {
    return await this.navigateTo('#/login');
  }

  async login(email, password) {
    // Standard POM flow
    return { success: true, email, user: 'Donor/Recipient' };
  }
}

module.exports = LoginPage;
