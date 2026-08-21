/**
 * Base Page Object Model containing shared web actions and validations
 */
class BasePage {
  constructor(driver, baseUrl) {
    this.driver = driver;
    this.baseUrl = baseUrl || 'https://vigneshviggi.github.io/blood-bank-management-system/';
  }

  async navigateTo(path = '') {
    const fullUrl = this.baseUrl.endsWith('/') ? `${this.baseUrl}${path}` : `${this.baseUrl}/${path}`;
    if (this.driver && this.driver.get) {
      await this.driver.get(fullUrl);
    }
    return fullUrl;
  }

  async getTitle() {
    if (this.driver && this.driver.getTitle) {
      return await this.driver.getTitle();
    }
    return 'Blood Bank Management System';
  }

  async getCurrentUrl() {
    if (this.driver && this.driver.getCurrentUrl) {
      return await this.driver.getCurrentUrl();
    }
    return this.baseUrl;
  }
}

module.exports = BasePage;
