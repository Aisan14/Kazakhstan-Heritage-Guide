import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageScreen = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setSelectedLanguage(newLanguage);
    };

    // Подписываемся на событие изменения языка
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      // Отписываемся от события изменения языка при размонтировании компонента
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (language) => {
    try {
      console.log('Changing language to:', language);
      await AsyncStorage.setItem('language', language);
      i18n.changeLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  console.log('Selected language:', selectedLanguage);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => changeLanguage('en')} style={[styles.languageButton, selectedLanguage === 'en' && styles.selectedLanguageButton]}>
        <Text style={styles.languageButtonText}>English</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changeLanguage('ru')} style={[styles.languageButton, selectedLanguage === 'ru' && styles.selectedLanguageButton]}>
        <Text style={styles.languageButtonText}>Русский</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changeLanguage('kk')} style={[styles.languageButton, selectedLanguage === 'kk' && styles.selectedLanguageButton]}>
        <Text style={styles.languageButtonText}>Қазақша</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 10,
  },
  selectedLanguageButton: {
    backgroundColor: 'green',
  },
  languageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LanguageScreen;
