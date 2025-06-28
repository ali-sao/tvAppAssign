import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../constants/theme';
import { useDirection } from '../../contexts/DirectionContext';

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  format: string;
  url: string;
}

interface SubtitleSelectorProps {
  visible: boolean;
  subtitleTracks: SubtitleTrack[];
  selectedSubtitleTrack: number; // -1 means no subtitles
  onSelectTrack: (trackIndex: number) => void;
  onClose: () => void;
}

export const SubtitleSelector: React.FC<SubtitleSelectorProps> = ({
  visible,
  subtitleTracks,
  selectedSubtitleTrack,
  onSelectTrack,
  onClose,
}) => {
  const { isRTL } = useDirection();

  if (!visible) return null;

  const handleSelectTrack = (trackIndex: number) => {
    onSelectTrack(trackIndex);
    onClose();
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <Text style={[styles.modalTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {isRTL ? 'اختر الترجمة' : 'Select Subtitles'}
        </Text>
        
        {/* No Subtitles Option */}
        <TouchableOpacity
          style={[
            styles.option,
            selectedSubtitleTrack === -1 && styles.optionSelected
          ]}
          onPress={() => handleSelectTrack(-1)}
        >
          <Text style={styles.optionText}>
            {isRTL ? 'بدون ترجمة' : 'No Subtitles'}
          </Text>
          {selectedSubtitleTrack === -1 && (
            <Icon name="checkmark" size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>

        {/* Subtitle Track Options */}
        {subtitleTracks.map((track, index) => (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.option,
              selectedSubtitleTrack === index && styles.optionSelected
            ]}
            onPress={() => handleSelectTrack(index)}
          >
            <Text style={styles.optionText}>
              {track.label} ({track.language})
            </Text>
            {selectedSubtitleTrack === index && (
              <Icon name="checkmark" size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>
            {isRTL ? 'إغلاق' : 'Close'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 