class UserPreferences {
  
  constructor({ userId, theme, fontSize, language, dateFormat, timeZone }) {
    this.userId = userId || 0;
    this.theme = theme || 'light';
    this.fontSize = fontSize || 'medium';
    this.language = language || 'en';
    this.dateFormat = dateFormat || 'MM/DD/YYYY';
    this.timeZone = timeZone || 'UTC';
  }

  validate() {
    const errorMessages = {};
    let isValid = true;

    // Validate userId
    if (!this.userId || !Number.isInteger(this.userId) || this.userId <= 0) {
      errorMessages.userId = "User ID is required and must be a positive integer";
      isValid = false;
    }

    // Validate theme
    const validThemes = ['light', 'dark', 'system'];
    if (this.theme && !validThemes.includes(this.theme)) {
      errorMessages.theme = `Theme must be one of: ${validThemes.join(', ')}`;
      isValid = false;
    }
    if (this.theme && this.theme.length > 20) {
      errorMessages.theme = "Theme must be 20 characters or less";
      isValid = false;
    }

    // Validate fontSize
    const validFontSizes = ['small', 'medium', 'large'];
    if (this.fontSize && !validFontSizes.includes(this.fontSize)) {
      errorMessages.fontSize = `Font size must be one of: ${validFontSizes.join(', ')}`;
      isValid = false;
    }
    if (this.fontSize && this.fontSize.length > 10) {
      errorMessages.fontSize = "Font size must be 10 characters or less";
      isValid = false;
    }

    // Validate language
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'];
    if (this.language && !validLanguages.includes(this.language)) {
      errorMessages.language = `Language must be one of: ${validLanguages.join(', ')}`;
      isValid = false;
    }
    if (this.language && this.language.length > 10) {
      errorMessages.language = "Language must be 10 characters or less";
      isValid = false;
    }

    // Validate dateFormat
    const validDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'];
    if (this.dateFormat && !validDateFormats.includes(this.dateFormat)) {
      errorMessages.dateFormat = `Date format must be one of: ${validDateFormats.join(', ')}`;
      isValid = false;
    }
    if (this.dateFormat && this.dateFormat.length > 20) {
      errorMessages.dateFormat = "Date format must be 20 characters or less";
      isValid = false;
    }

    // Validate timeZone
    if (this.timeZone && this.timeZone.length > 50) {
      errorMessages.timeZone = "Time zone must be 50 characters or less";
      isValid = false;
    }
    
    // Basic timezone validation (you could expand this with a comprehensive list)
    const commonTimeZones = [
      'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
      'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Australia/Sydney'
    ];
    
    if (this.timeZone && !commonTimeZones.includes(this.timeZone)) {
      // Don't make this a hard error since there are many valid timezones
      // Just log a warning or allow it through
      console.warn(`Uncommon timezone specified: ${this.timeZone}`);
    }

    return [isValid, errorMessages];
  }

}

module.exports = UserPreferences;