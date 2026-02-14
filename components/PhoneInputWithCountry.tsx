import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/theme";

type PhoneInputWithCountryProps = {
  value: string;
  onChangeText: (text: string) => void;
  countryCode: CountryCode;
  callingCode: string;
  onSelectCountry: (country: Country) => void;
  placeholder?: string;
  disabled?: boolean;
};

type CountryFilterRenderProps = TextInputProps & {
  onClose?: () => void;
};

export default function PhoneInputWithCountry({
  value,
  onChangeText,
  countryCode,
  callingCode,
  onSelectCountry,
  placeholder = "Enter your mobile number",
  disabled = false,
}: PhoneInputWithCountryProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.countryButton}
        onPress={() => setPickerVisible(true)}
        disabled={disabled}
      >
        <CountryPicker
          countryCode={countryCode}
          withFilter
          withFlag
          withCallingCode
          withEmoji
          visible={pickerVisible}
          withCloseButton={false}
          modalProps={{
            presentationStyle: "fullScreen",
            statusBarTranslucent: false,
          }}
          renderCountryFilter={(props) => {
            const filterProps = props as CountryFilterRenderProps;
            const { onClose, style, placeholderTextColor, ...inputProps } =
              filterProps;

            return (
              <View style={[styles.modalHeader, { paddingTop: insets.top }]}
              >
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={Theme.colors.text_brown_gray}
                  />
                </TouchableOpacity>
                <View style={styles.modalFilterContainer}>
                  <TextInput
                    {...inputProps}
                    style={[styles.modalFilterInput, style]}
                    placeholderTextColor={
                      placeholderTextColor ?? Theme.colors.text_earth
                    }
                  />
                </View>
              </View>
            );
          }}
          onSelect={(country) => {
            onSelectCountry(country);
            setPickerVisible(false);
          }}
          onClose={() => setPickerVisible(false)}
        />
        <Text style={styles.callingCodeText}>+{callingCode}</Text>
      </TouchableOpacity>
      <Ionicons
        name="phone-portrait-outline"
        size={20}
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        keyboardType="phone-pad"
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={Theme.colors.text_earth}
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.background_beige,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.background_sand,
  },
  modalHeader: {
    backgroundColor: Theme.colors.background_cream,
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  modalCloseButton: {
    padding: 8,
    marginRight: 4,
  },
  modalFilterContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modalFilterInput: {
    width: "100%",
    height: 40,
    color: Theme.colors.text_charcoal,
    fontSize: 16,
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  callingCodeText: {
    color: Theme.colors.text_charcoal,
    fontSize: 16,
    marginLeft: 6,
  },
  inputIcon: {
    marginRight: 10,
    color: Theme.colors.text_brown_gray,
  },
  input: {
    flex: 1,
    height: 50,
    color: Theme.colors.text_charcoal,
    fontSize: 16,
  },
});
