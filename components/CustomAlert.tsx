import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface AlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const CustomAlert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  showCancel = false,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: Theme.colors.success };
      case 'error':
        return { name: 'close-circle', color: Theme.colors.error };
      case 'warning':
        return { name: 'warning', color: Theme.colors.warning };
      default:
        return { name: 'information-circle', color: Theme.colors.info };
    }
  };

  const iconConfig = getIconConfig();

  const handleConfirm = () => {
    onClose?.();
    onConfirm?.();
  };

  const handleCancel = () => {
    onClose?.();
    onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.header}>
            <Ionicons
              name={iconConfig.name as any}
              size={32}
              color={iconConfig.color}
            />
            <Text style={styles.title}>{title}</Text>
          </View>
          
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: Theme.colors.background_alien,
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text_Secondary,
    marginLeft: 12,
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: Theme.colors.text_Secondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Theme.colors.background_deep,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  confirmButton: {
    backgroundColor: Theme.colors.gold,
  },
  cancelButtonText: {
    color: Theme.colors.text_Secondary,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: Theme.colors.background_alien,
    fontWeight: 'bold',
  },
});