const BasePage = require('./BasePage');

class RegisterPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.nameInput = 'input[name="name"]';
    this.emailInput = 'input[name="email"]';
    this.passwordInput = 'input[name="password"]';
    this.roleSelect = 'select[name="role"]';
    this.bloodGroupSelect = 'select[name="bloodGroup"]';
    this.submitBtn = 'button[type="submit"]';
  }
  async open() { return await this.navigateTo('#/register'); }
}

class DashboardPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.statsCards = '.stat-card, .metric-card';
    this.quickActions = '.quick-actions';
    this.recentActivity = '.recent-activity';
  }
  async open() { return await this.navigateTo('#/dashboard'); }
}

class DonorsPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.searchInput = 'input[placeholder*="Search"]';
    this.bloodGroupFilter = 'select[name="bloodGroupFilter"]';
    this.cityFilter = 'select[name="cityFilter"]';
    this.donorList = '.donor-grid, .donor-card';
  }
  async open() { return await this.navigateTo('#/donors'); }
}

class RequestsPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.createRequestBtn = 'button:has-text("Create Request")';
    this.requestTable = '.request-table';
    this.urgentBadge = '.urgent-badge';
  }
  async open() { return await this.navigateTo('#/requests'); }
}

class CampsPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.campList = '.camp-card';
    this.createCampBtn = 'button:has-text("Create Camp")';
    this.registerAttendeeBtn = 'button:has-text("Register")';
  }
  async open() { return await this.navigateTo('#/camps'); }
}

class InventoryPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.inventoryGrid = '.inventory-grid';
    this.bloodUnitsTable = '.units-table';
    this.addStockBtn = 'button:has-text("Add Stock")';
  }
  async open() { return await this.navigateTo('#/inventory'); }
}

class ProfilePage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.editProfileBtn = 'button:has-text("Edit Profile")';
    this.avatarUpload = 'input[type="file"]';
    this.saveBtn = 'button:has-text("Save Changes")';
  }
  async open() { return await this.navigateTo('#/profile'); }
}

class AdminPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.userManagementTab = '#users-tab';
    this.hospitalManagementTab = '#hospitals-tab';
    this.analyticsTab = '#analytics-tab';
  }
  async open() { return await this.navigateTo('#/admin'); }
}

class SettingsPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.themeToggle = '#theme-toggle';
    this.notificationToggle = '#notification-toggle';
    this.languageSelect = '#language-select';
  }
  async open() { return await this.navigateTo('#/settings'); }
}

module.exports = {
  RegisterPage,
  DashboardPage,
  DonorsPage,
  RequestsPage,
  CampsPage,
  InventoryPage,
  ProfilePage,
  AdminPage,
  SettingsPage
};
