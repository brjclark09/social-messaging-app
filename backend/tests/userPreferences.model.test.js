const UserPreferences = require('../src/userpreferences/userpreferences.model');

describe('UserPreferences Model', () => {
  
  describe('Constructor', () => {
    test('should create UserPreferences with valid data', () => {
      const preferencesData = {
        userId: 1,
        theme: 'dark',
        fontSize: 'large',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Europe/Madrid'
      };

      const preferences = new UserPreferences(preferencesData);

      expect(preferences.userId).toBe(1);
      expect(preferences.theme).toBe('dark');
      expect(preferences.fontSize).toBe('large');
      expect(preferences.language).toBe('es');
      expect(preferences.dateFormat).toBe('DD/MM/YYYY');
      expect(preferences.timeZone).toBe('Europe/Madrid');
    });

    test('should use default values when no data provided', () => {
      const preferences = new UserPreferences({});

      expect(preferences.userId).toBe(0);
      expect(preferences.theme).toBe('light');
      expect(preferences.fontSize).toBe('medium');
      expect(preferences.language).toBe('en');
      expect(preferences.dateFormat).toBe('MM/DD/YYYY');
      expect(preferences.timeZone).toBe('UTC');
    });

    test('should use default values for missing properties', () => {
      const preferences = new UserPreferences({ userId: 5 });

      expect(preferences.userId).toBe(5);
      expect(preferences.theme).toBe('light');
      expect(preferences.fontSize).toBe('medium');
      expect(preferences.language).toBe('en');
      expect(preferences.dateFormat).toBe('MM/DD/YYYY');
      expect(preferences.timeZone).toBe('UTC');
    });
  });

  describe('Validation', () => {
    test('should validate successfully with valid data', () => {
      const preferences = new UserPreferences({
        userId: 1,
        theme: 'dark',
        fontSize: 'small',
        language: 'fr',
        dateFormat: 'YYYY-MM-DD',
        timeZone: 'Europe/Paris'
      });

      const [isValid, errors] = preferences.validate();

      expect(isValid).toBe(true);
      expect(errors).toEqual({});
    });

    describe('UserId validation', () => {
      test('should fail validation when userId is missing', () => {
        const preferences = new UserPreferences({ userId: 0 });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.userId).toBe('User ID is required and must be a positive integer');
      });

      test('should fail validation when userId is not a number', () => {
        const preferences = new UserPreferences({ userId: 'invalid' });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.userId).toBe('User ID is required and must be a positive integer');
      });

      test('should fail validation when userId is negative', () => {
        const preferences = new UserPreferences({ userId: -1 });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.userId).toBe('User ID is required and must be a positive integer');
      });
    });

    describe('Theme validation', () => {
      test('should pass validation with valid themes', () => {
        const validThemes = ['light', 'dark', 'system'];
        
        validThemes.forEach(theme => {
          const preferences = new UserPreferences({ userId: 1, theme });
          const [isValid, errors] = preferences.validate();
          
          expect(isValid).toBe(true);
          expect(errors.theme).toBeUndefined();
        });
      });

      test('should fail validation with invalid theme', () => {
        const preferences = new UserPreferences({ userId: 1, theme: 'invalid-theme' });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.theme).toBe('Theme must be one of: light, dark, system');
      });

      test('should fail validation when theme is too long', () => {
        const preferences = new UserPreferences({ userId: 1, theme: 'a'.repeat(21) });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.theme).toBe('Theme must be 20 characters or less');
      });
    });

    describe('FontSize validation', () => {
      test('should pass validation with valid font sizes', () => {
        const validSizes = ['small', 'medium', 'large'];
        
        validSizes.forEach(fontSize => {
          const preferences = new UserPreferences({ userId: 1, fontSize });
          const [isValid, errors] = preferences.validate();
          
          expect(isValid).toBe(true);
          expect(errors.fontSize).toBeUndefined();
        });
      });

      test('should fail validation with invalid font size', () => {
        const preferences = new UserPreferences({ userId: 1, fontSize: 'huge' });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.fontSize).toBe('Font size must be one of: small, medium, large');
      });

      test('should fail validation when font size is too long', () => {
        const preferences = new UserPreferences({ userId: 1, fontSize: 'a'.repeat(11) });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.fontSize).toBe('Font size must be 10 characters or less');
      });
    });

    describe('Language validation', () => {
      test('should pass validation with valid languages', () => {
        const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'];
        
        validLanguages.forEach(language => {
          const preferences = new UserPreferences({ userId: 1, language });
          const [isValid, errors] = preferences.validate();
          
          expect(isValid).toBe(true);
          expect(errors.language).toBeUndefined();
        });
      });

      test('should fail validation with invalid language', () => {
        const preferences = new UserPreferences({ userId: 1, language: 'invalid' });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.language).toBe('Language must be one of: en, es, fr, de, it, pt, zh, ja, ko');
      });

      test('should fail validation when language is too long', () => {
        const preferences = new UserPreferences({ userId: 1, language: 'a'.repeat(11) });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.language).toBe('Language must be 10 characters or less');
      });
    });

    describe('DateFormat validation', () => {
      test('should pass validation with valid date formats', () => {
        const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'];
        
        validFormats.forEach(dateFormat => {
          const preferences = new UserPreferences({ userId: 1, dateFormat });
          const [isValid, errors] = preferences.validate();
          
          expect(isValid).toBe(true);
          expect(errors.dateFormat).toBeUndefined();
        });
      });

      test('should fail validation with invalid date format', () => {
        const preferences = new UserPreferences({ userId: 1, dateFormat: 'INVALID/FORMAT' });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.dateFormat).toBe('Date format must be one of: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, MM-DD-YYYY');
      });

      test('should fail validation when date format is too long', () => {
        const preferences = new UserPreferences({ userId: 1, dateFormat: 'a'.repeat(21) });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.dateFormat).toBe('Date format must be 20 characters or less');
      });
    });

    describe('TimeZone validation', () => {
      test('should pass validation with valid time zones', () => {
        const validTimeZones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
        
        validTimeZones.forEach(timeZone => {
          const preferences = new UserPreferences({ userId: 1, timeZone });
          const [isValid, errors] = preferences.validate();
          
          expect(isValid).toBe(true);
          expect(errors.timeZone).toBeUndefined();
        });
      });

      test('should fail validation when time zone is too long', () => {
        const preferences = new UserPreferences({ userId: 1, timeZone: 'a'.repeat(51) });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(false);
        expect(errors.timeZone).toBe('Time zone must be 50 characters or less');
      });

      test('should pass validation with uncommon but valid time zone', () => {
        // Should not fail validation, just log a warning
        const preferences = new UserPreferences({ userId: 1, timeZone: 'America/Anchorage' });
        const [isValid, errors] = preferences.validate();

        expect(isValid).toBe(true);
        expect(errors.timeZone).toBeUndefined();
      });
    });

    test('should accumulate multiple validation errors', () => {
      const preferences = new UserPreferences({
        userId: 'invalid',
        theme: 'invalid-theme',
        fontSize: 'huge',
        language: 'invalid-lang',
        dateFormat: 'INVALID',
        timeZone: 'a'.repeat(51)
      });

      const [isValid, errors] = preferences.validate();

      expect(isValid).toBe(false);
      expect(Object.keys(errors)).toHaveLength(6);
      expect(errors.userId).toBeDefined();
      expect(errors.theme).toBeDefined();
      expect(errors.fontSize).toBeDefined();
      expect(errors.language).toBeDefined();
      expect(errors.dateFormat).toBeDefined();
      expect(errors.timeZone).toBeDefined();
    });
  });
});