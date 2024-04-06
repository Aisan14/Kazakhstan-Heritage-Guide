import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged, signOut, updateProfile } from '@firebase/auth';

function ProfileScreen({ navigation }) {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [customUsername, setCustomUsername] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setFullName(user.displayName || '');
        setEmail(user.email || '');
        // Допустим, что эти данные хранятся в профиле пользователя или базе данных
        setBirthDate('01.01.1980');
        setCountry('Соединенные Штаты');
        setCity('Нью-Йорк');
      } else {
        setUser(null);
        setFullName('');
        setEmail('');
        setBirthDate('');
        setCountry('');
        setCity('');
      }
    });

    return unsubscribe;
  }, [auth]);

  const handleSaveProfile = async () => {
    try {
      // Обновляем данные профиля пользователя
      await updateProfile(auth.currentUser, { displayName: fullName });
      // Дополнительно можно добавить сохранение других данных профиля
      alert('Профиль успешно сохранен');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Ошибка при сохранении профиля');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View>
          <Text style={styles.label}>Пользовательское имя:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Введите ваше пользовательское имя"
              placeholderTextColor="#999"
            />
          </View>
          
          <Text style={styles.label}>Email:</Text>
          <Text>{email}</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
            <Text style={styles.buttonText}>Сохранить профиль</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>Вы не вошли в систему.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
    height: 40, // Фиксированная высота поля ввода
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: '100%', // Поле ввода занимает 100% высоты родительского контейнера
    width: '100%',
    color: '#333', // Text color
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProfileScreen;
