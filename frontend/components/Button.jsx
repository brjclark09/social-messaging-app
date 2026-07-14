import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', // primary, secondary, danger, outline
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon = null,
  fullWidth = false,
  style,
  textStyle,
}) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];
    
    if (fullWidth) baseStyle.push(styles.fullWidth);
    if (disabled) baseStyle.push(styles.disabled);
    
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.buttonSecondary);
        break;
      case 'danger':
        baseStyle.push(styles.buttonDanger);
        break;
      case 'outline':
        baseStyle.push(styles.buttonOutline);
        break;
      default:
        baseStyle.push(styles.buttonPrimary);
    }
    
    if (style) baseStyle.push(style);
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];
    
    if (variant === 'outline') {
      baseStyle.push(styles.textOutline);
    }
    
    if (disabled) baseStyle.push(styles.textDisabled);
    if (textStyle) baseStyle.push(textStyle);
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? colors.primary : colors.white} 
        />
      ) : (
        <>
          {icon && icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.buttonPadding,
  },
  button_small: {
    height: 36,
    paddingHorizontal: spacing.md,
  },
  button_medium: {
    height: spacing.buttonHeight,
  },
  button_large: {
    height: 56,
    paddingHorizontal: spacing.xl,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.gray100,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: typography.fontWeightSemibold,
  },
  text_small: {
    fontSize: typography.fontSizeSm,
  },
  text_medium: {
    fontSize: typography.fontSizeBase,
  },
  text_large: {
    fontSize: typography.fontSizeLg,
  },
  textOutline: {
    color: colors.primary,
  },
  textDisabled: {
    color: colors.disabledText,
  },
});