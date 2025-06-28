import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FocusableButton } from '../components/common/FocusableButton';
import { theme } from '../constants/theme';
import { useDirection } from '../contexts/DirectionContext';
import { RootStackParamList } from '../types';
import { useTVRemote } from '../hooks/useTVRemote';

type ProfileSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  type: 'button' | 'switch' | 'info';
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export const ProfileSettingsScreen: React.FC = () => {
  const navigation = useNavigation<ProfileSettingsScreenNavigationProp>();
  const { isRTL, direction, toggleDirection } = useDirection();
  const [notifications, setNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);

  // TV Remote Control Handler
  useTVRemote({
    onBackPress: () => {
      navigation.goBack();
      return true;
    },
  });

  const handleDirectionToggle = () => {
    toggleDirection();
    Alert.alert(
      'Layout Direction Changed',
      `Layout is now ${isRTL ? 'Left-to-Right (LTR)' : 'Right-to-Left (RTL)'}`,
      [{ text: 'OK' }]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            // In a real app, you would clear auth tokens and navigate to login
            Alert.alert('Signed Out', 'You have been signed out successfully.');
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data including downloaded content and preferences.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Cache Cleared', 'All cached data has been cleared.');
          }
        }
      ]
    );
  };

  const profileSettings: SettingItem[] = [
    {
      id: 'profile-info',
      title: 'Profile Information',
      description: 'Manage your account details',
      type: 'button',
      onPress: () => Alert.alert('Profile Info', 'Navigate to profile information screen')
    },
    {
      id: 'subscription',
      title: 'Subscription',
      description: 'Premium Plan - Active',
      type: 'button',
      onPress: () => Alert.alert('Subscription', 'Navigate to subscription management')
    },
    {
      id: 'my-list',
      title: 'My List',
      description: 'Manage your saved content',
      type: 'button',
      onPress: () => Alert.alert('My List', 'Navigate to my list management')
    },
  ];

  const appSettings: SettingItem[] = [
    {
      id: 'direction',
      title: 'Layout Direction',
      description: `Current: ${isRTL ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}`,
      type: 'button',
      onPress: handleDirectionToggle
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Receive updates about new content',
      type: 'switch',
      value: notifications,
      onToggle: setNotifications
    },
    {
      id: 'autoplay',
      title: 'Autoplay Next Episode',
      description: 'Automatically play the next episode',
      type: 'switch',
      value: autoplay,
      onToggle: setAutoplay
    },
    {
      id: 'quality',
      title: 'Video Quality',
      description: 'Auto (Based on connection)',
      type: 'button',
      onPress: () => Alert.alert('Video Quality', 'Navigate to quality settings')
    },
    {
      id: 'language',
      title: 'App Language',
      description: 'English',
      type: 'button',
      onPress: () => Alert.alert('Language', 'Navigate to language settings')
    },
  ];

  const systemSettings: SettingItem[] = [
    {
      id: 'storage',
      title: 'Storage & Downloads',
      description: 'Manage downloaded content',
      type: 'button',
      onPress: () => Alert.alert('Storage', 'Navigate to storage management')
    },
    {
      id: 'clear-cache',
      title: 'Clear Cache',
      description: 'Free up storage space',
      type: 'button',
      onPress: handleClearCache
    },
    {
      id: 'about',
      title: 'About',
      description: 'Version 1.0.0',
      type: 'info'
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    switch (item.type) {
      case 'switch':
        return (
          <View key={item.id} style={[styles.settingItem, isRTL && styles.settingItemRTL]}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, isRTL && styles.settingTitleRTL]}>
                {item.title}
              </Text>
              {item.description && (
                <Text style={[styles.settingDescription, isRTL && styles.settingDescriptionRTL]}>
                  {item.description}
                </Text>
              )}
            </View>
            <Switch
              value={item.value as boolean}
              onValueChange={item.onToggle}
              trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
              thumbColor={item.value ? theme.colors.accent : theme.colors.textSecondary}
            />
          </View>
        );

             case 'button':
         return (
           <TouchableOpacity
             key={item.id}
             style={[styles.settingItem, isRTL && styles.settingItemRTL]}
             onPress={item.onPress}
             activeOpacity={0.8}
           >
             <View style={styles.settingContent}>
               <Text style={[styles.settingTitle, isRTL && styles.settingTitleRTL]}>
                 {item.title}
               </Text>
               {item.description && (
                 <Text style={[styles.settingDescription, isRTL && styles.settingDescriptionRTL]}>
                   {item.description}
                 </Text>
               )}
             </View>
             <Text style={[styles.settingArrow, isRTL && styles.settingArrowRTL]}>
               {isRTL ? '‹' : '›'}
             </Text>
           </TouchableOpacity>
         );

      case 'info':
        return (
          <View key={item.id} style={[styles.settingItem, isRTL && styles.settingItemRTL]}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, isRTL && styles.settingTitleRTL]}>
                {item.title}
              </Text>
              {item.description && (
                <Text style={[styles.settingDescription, isRTL && styles.settingDescriptionRTL]}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderSection = (title: string, items: SettingItem[]) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
        {title}
      </Text>
      <View style={styles.sectionContent}>
        {items.map(renderSettingItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isRTL && styles.containerRTL]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <FocusableButton
          title="← Back"
          variant="secondary"
          size="small"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={[styles.headerTitle, isRTL && styles.headerTitleRTL]}>
          Profile & Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>JD</Text>
          </View>
          <View style={[styles.profileInfo, isRTL && styles.profileInfoRTL]}>
            <Text style={[styles.profileName, isRTL && styles.profileNameRTL]}>
              John Doe
            </Text>
            <Text style={[styles.profileEmail, isRTL && styles.profileEmailRTL]}>
              john.doe@example.com
            </Text>
          </View>
        </View>

        {/* Settings Sections */}
        {renderSection('Profile', profileSettings)}
        {renderSection('App Settings', appSettings)}
        {renderSection('System', systemSettings)}

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <FocusableButton
            title="Sign Out"
            variant="outline"
            size="large"
            onPress={handleSignOut}
            style={styles.signOutButton}
            textStyle={styles.signOutButtonText}
          />
        </View>

        {/* Direction Test Area */}
        <View style={[styles.directionTestArea, isRTL && styles.directionTestAreaRTL]}>
          <Text style={[styles.directionTestTitle, isRTL && styles.directionTestTitleRTL]}>
            Layout Direction Test
          </Text>
          <Text style={[styles.directionTestText, isRTL && styles.directionTestTextRTL]}>
            Current direction: {isRTL ? 'RTL (العربية)' : 'LTR (English)'}
          </Text>
          <View style={[styles.directionTestBoxes, isRTL && styles.directionTestBoxesRTL]}>
            <View style={[styles.directionTestBox, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.directionTestBoxText}>1</Text>
            </View>
            <View style={[styles.directionTestBox, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.directionTestBoxText}>2</Text>
            </View>
            <View style={[styles.directionTestBox, { backgroundColor: theme.colors.secondary }]}>
              <Text style={styles.directionTestBoxText}>3</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  containerRTL: {
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.typography.heading.fontSize,
    fontWeight: theme.typography.heading.fontWeight as any,
    color: theme.colors.text,
    textAlign: 'center',
  },
  headerTitleRTL: {
    textAlign: 'center',
  },
  headerSpacer: {
    width: 80, // Same width as back button to center title
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  profileInfo: {
    flex: 1,
  },
  profileInfoRTL: {
    alignItems: 'flex-end',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileNameRTL: {
    textAlign: 'right',
  },
  profileEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  profileEmailRTL: {
    textAlign: 'right',
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitleRTL: {
    textAlign: 'right',
  },
  sectionContent: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingItemRTL: {
    flexDirection: 'row-reverse',
  },

  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingTitleRTL: {
    textAlign: 'right',
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  settingDescriptionRTL: {
    textAlign: 'right',
  },
  settingArrow: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
  },
  settingArrowRTL: {
    marginLeft: 0,
    marginRight: theme.spacing.md,
  },
  signOutSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  signOutButton: {
    borderColor: theme.colors.error,
  },
  signOutButtonText: {
    color: theme.colors.error,
  },
  directionTestArea: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  directionTestAreaRTL: {
    alignItems: 'flex-end',
  },
  directionTestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  directionTestTitleRTL: {
    textAlign: 'right',
  },
  directionTestText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  directionTestTextRTL: {
    textAlign: 'right',
  },
  directionTestBoxes: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  directionTestBoxesRTL: {
    flexDirection: 'row-reverse',
  },
  directionTestBox: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  directionTestBoxText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 