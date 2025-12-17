
export interface Country {
  cca2: string;
  callingCode: string[];
  name: string;
  flag: string;
}

export interface PhoneInputProps {
  onPhoneNumberChange: (fullNumber: string, isValid: boolean) => void;
  initialCountryCode?: string;
}

export interface PhoneNumberState {
  countryCode: string;
  countryFlag: string;
  countryCca2: string;
  phoneNumber: string;
  showPicker: boolean;
}