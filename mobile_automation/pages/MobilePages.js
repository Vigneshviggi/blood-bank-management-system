/**
 * Page Object Models for Android React Native Blood Bank Application
 */

class BaseScreen {
  constructor(driver) {
    this.driver = driver;
  }
  async findByAccessibilityId(id) { return { elementId: id }; }
  async click(id) { return true; }
  async sendKeys(id, text) { return true; }
  async getText(id) { return 'Sample Text'; }
}

class LoginScreen extends BaseScreen {
  constructor(driver) {
    super(driver);
    this.emailInput = '~email-input';
    this.passwordInput = '~password-input';
    this.loginBtn = '~login-button';
    this.googleSignInBtn = '~google-signin-button';
    this.registerLink = '~register-nav-link';
    this.forgotPasswordLink = '~forgot-password-link';
  }
}

class RegisterScreen extends BaseScreen {
  constructor(driver) {
    super(driver);
    this.nameInput = '~name-input';
    this.emailInput = '~email-input';
    this.phoneInput = '~phone-input';
    this.passwordInput = '~password-input';
    this.bloodGroupPicker = '~blood-group-picker';
    this.rolePicker = '~role-picker';
    this.submitBtn = '~register-submit-button';
  }
}

class HomeScreen extends BaseScreen {
  constructor(driver) {
    super(driver);
    this.sosEmergencyBtn = '~sos-emergency-button';
    this.requestBloodCard = '~request-blood-card';
    this.findDonorsCard = '~find-donors-card';
    this.bloodCampsCard = '~blood-camps-card';
    this.notificationsBadge = '~notifications-badge';
  }
}

class BloodRequestScreen extends BaseScreen {
  constructor(driver) {
    super(driver);
    this.patientNameInput = '~patient-name-input';
    this.bloodGroupSelect = '~blood-group-select';
    this.unitsRequiredInput = '~units-required-input';
    this.hospitalPicker = '~hospital-picker';
    this.urgencyToggle = '~urgency-toggle';
    this.submitRequestBtn = '~submit-request-button';
  }
}

class DonorsScreen extends BaseScreen {
  constructor(driver) {
    super(driver);
    this.searchBar = '~donor-search-bar';
    this.filterBloodGroup = '~filter-blood-group';
    this.filterDistance = '~filter-distance-slider';
    this.donorCardList = '~donor-card-list';
    this.contactDonorBtn = '~contact-donor-button';
  }
}

class CampsScreen extends BaseScreen {
  constructor(driver) {
    super(driver);
    this.campList = '~camp-list-view';
    this.createCampBtn = '~create-camp-button';
    this.rsvpBtn = '~rsvp-camp-button';
    this.mapToggle = '~camps-map-toggle';
  }
}

class ProfileScreen extends BaseScreen {
  constructor(driver) {
    super(driver);
    this.editProfileBtn = '~edit-profile-btn';
    this.donorCertificateBtn = '~donor-certificate-btn';
    this.donationHistoryList = '~donation-history-list';
    this.emergencyContactBtn = '~emergency-contact-btn';
  }
}

class NotificationScreen extends BaseScreen {
  constructor(driver) {
    super(driver);
    this.notificationList = '~notification-list';
    this.markAllAsReadBtn = '~mark-all-read-btn';
    this.pushNotificationToggle = '~push-notification-toggle';
  }
}

class SettingsScreen extends BaseScreen {
  constructor(driver) {
    super(driver);
    this.darkModeSwitch = '~dark-mode-switch';
    this.biometricAuthSwitch = '~biometric-auth-switch';
    this.languageDropdown = '~language-dropdown';
    this.logoutBtn = '~logout-button';
  }
}

module.exports = {
  BaseScreen,
  LoginScreen,
  RegisterScreen,
  HomeScreen,
  BloodRequestScreen,
  DonorsScreen,
  CampsScreen,
  ProfileScreen,
  NotificationScreen,
  SettingsScreen
};
