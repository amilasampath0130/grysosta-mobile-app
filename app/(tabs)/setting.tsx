// app/(Profile)/Settings.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/theme";
import { Images } from "@/assets/images/images";

type Props = {
  navigation?: any; // replace with typed navigation prop if you use TS navigation types
};

const Settings: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const avatarSize = Math.min(72, Math.floor(width * 0.16));

  // local state — replace with context or persisted store as needed
  const [isDark, setIsDark] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const onClearCache = () => {
    // implement actual cache clearing logic
    Alert.alert("Clear cache", "Cache cleared successfully.");
  };

  const onContactSupport = () => {
    // Example: navigation to a support screen or open mailto
    // navigation?.navigate("Support");
    Alert.alert("Contact", "Open support screen or mail client.");
  };

  const onAbout = () => {
    // navigate to your About screen (update route name as needed)
    navigation?.navigate?.("AboutApp");
  };

  const onRate = () => {
    // open store link
    Alert.alert("Rate", "Open app store link to rate.");
  };

  const onLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => {/* perform logout */} },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile */}
        <View style={styles.cardRow}>
          <View style={[styles.avatarWrapper, { width: avatarSize, height: avatarSize }]}>
            <Image
            //   source={Images.profile ?? Images.logo}
              style={[styles.avatar, { width: avatarSize, height: avatarSize }]}
              resizeMode="cover"
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Amila Sampath</Text>
            <Text style={styles.subText}>Free player • Member</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => Alert.alert("Edit profile", "Open edit profile screen")}
            >
              <Ionicons name="create-outline" size={16} color={Theme.colors.background_alien} />
              <Text style={styles.editText}> Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>

          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Theme</Text>
              <Text style={styles.rowSubtitle}>Light / Dark</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(v) => setIsDark(v)}
              trackColor={{ true: Theme.colors.gold, false: Theme.colors.background_deep }}
            />
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Notifications</Text>
              <Text style={styles.rowSubtitle}>Enable push & email</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(v) => setNotificationsEnabled(v)}
            />
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Sound</Text>
              <Text style={styles.rowSubtitle}>Game audio effects</Text>
            </View>
            <Switch value={soundEnabled} onValueChange={(v) => setSoundEnabled(v)} />
          </View>
        </View>

        {/* App controls */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>App</Text>

          <TouchableOpacity style={styles.actionRow} onPress={onClearCache}>
            <View style={styles.actionLeft}>
              <Ionicons name="trash-outline" size={18} color={Theme.colors.text_Secondary} />
              <Text style={styles.actionText}> Clear cache</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.text_Secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={onContactSupport}>
            <View style={styles.actionLeft}>
              <Ionicons name="chatbox-ellipses-outline" size={18} color={Theme.colors.text_Secondary} />
              <Text style={styles.actionText}> Contact support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.text_Secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={onAbout}>
            <View style={styles.actionLeft}>
              <Ionicons name="information-circle-outline" size={18} color={Theme.colors.text_Secondary} />
              <Text style={styles.actionText}> About the app</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.text_Secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={onRate}>
            <View style={styles.actionLeft}>
              <Ionicons name="star-outline" size={18} color={Theme.colors.text_Secondary} />
              <Text style={styles.actionText}> Rate us</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.text_Secondary} />
          </TouchableOpacity>
        </View>

        {/* Footer card */}
        <View style={styles.card}>
          <Text style={styles.cardBody}>Version 1.0.0</Text>

          <TouchableOpacity style={[styles.ctaButton, { marginTop: 12 }]} onPress={onLogout}>
            <Text style={styles.ctaText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_deep,
  },
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  /* Profile row */
  cardRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarWrapper: {
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: Theme.colors.background_alien,
  },
  avatar: {
    borderRadius: 999,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: "white",
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
  },
  subText: {
    color: Theme.colors.text_Secondary,
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    marginTop: 4,
  },
  editBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  editText: {
    color: Theme.colors.background_alien,
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
  },

  /* Card */
  card: {
    width: "100%",
    backgroundColor: Theme.colors.background_alien,
    borderRadius: 8,
    overflow: "hidden",
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    color: "white",
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    marginBottom: 8,
  },

  /* Rows */
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.background_deep,
  },
  rowTitle: {
    color: "white",
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
  },
  rowSubtitle: {
    color: Theme.colors.text_Secondary,
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },

  /* Action rows */
  actionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.background_deep,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: Theme.colors.text_Secondary,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    marginLeft: 8,
  },

  /* Footer / CTA */
  cardBody: {
    color: Theme.colors.text_Secondary,
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
  },
  ctaButton: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    backgroundColor: Theme.colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: Theme.colors.background_alien,
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
  },
});
