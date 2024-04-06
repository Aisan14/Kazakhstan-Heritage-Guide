import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, SafeAreaView, ScrollView, Image, TextInput, Button, Linking, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { checkAndCreateCollection, db } from './FirebaseConfig';
import { getAuth, onAuthStateChanged } from '@firebase/auth';

const historicalPlacesData = [
  {
    id: '1',
    name: 'Мавзолей Джучи-хана',
    description: 'Недалеко от Жезказгана находится мавзолей Джучи-хана — один из знаковых объектов памяти народов степной Евразии, по мнению современных ученых. По преданию, здесь покоится старший сын Чингизхана, но, как предполагают некоторые исследователи, это может быть его ближайший потомок. Мавзолей находится на невысоком горном массиве. Это четырехугольная гробница 7х9 м из обожженного красного кирпича, имеет двойной купол.',
    image: require('./assets/image/DzhuchiKhan.jpg'),
    location: 'https://2gis.kz/geo/70030076479615432',
    comments: []
  },
  {
    id: '2',
    name: 'Мавзолей Арыстанбаба',
    description: 'Арыстанбаба известен как проповедник, религиозный мистик, учитель и наставник Ходжи Ахмеда Ясави. Он жил и умер в XII веке. Известно, что в XIV веке по воле Тимура был сооружен мавзолей, в следующие века его не раз разрушали. Но сооружение всегда отстраивали заново, что свидетельствует о его непреходящей духовной ценности. Современный мавзолей Арыстанбаба занимает площадь 35х12 м, имеет два помещения — усыпальницу и поминальную мечеть, 2 минарета. Знаменитая ценность, хранящаяся в мавзолее — каллиграфически выполненный Коран. Мавзолей — мусульманская святыня, место паломничества. Он внесен в перечень памятников, охраняемых государством.',
    image: require('./assets/image/Aristanbab.jpg'),
    location: 'https://2gis.kz/geo/70030076479615432',
    comments: []
  },
 
  // Добавьте больше исторических мест по мере необходимости
];

const windowWidth = Dimensions.get('window').width;

function HomeScreen() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [comments, setComments] = useState([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, [auth]);

  useEffect(() => {
    if (selectedPlace?.id) {
      const unsubscribe = onSnapshot(query(collection(db, `comments_${selectedPlace.id}`), orderBy('timestamp')), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        setComments(data);
      });
  
      return () => unsubscribe();
    }
  }, [selectedPlace]);

  const handleSearch = (text) => {
    setSearchText(text);
    const filteredPlaces = historicalPlacesData.filter(place =>
      place.name.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(filteredPlaces);
  };

  const clearSearchResults = () => {
    setSearchText('');
    setSearchResults([]);
  };

  const handleShowLocation = (location) => {
    Linking.openURL(location);
  };

  const addComment = async () => {
    try {
      const commentCollectionRef = collection(db, `comments_${selectedPlace.id}`);
      const snapshot = await getDocs(commentCollectionRef);
      if (snapshot.empty) {
        await checkAndCreateCollection(`comments_${selectedPlace.id}`);
      }

      const docRef = await addDoc(commentCollectionRef, {
        text: newComment,
        timestamp: new Date().toISOString(),
        username: currentUser.displayName || 'Анонимный пользователь'
      });
      console.log('Comment added with ID: ', docRef.id);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment: ', error);
    }
  };

  const renderListItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedPlace(item)}>
      <View style={styles.listItem}>
        <Text style={styles.placeName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Исторические места</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Поиск"
          onChangeText={handleSearch}
          value={searchText}
        />
        <TouchableOpacity onPress={clearSearchResults} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Очистить</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={searchResults.length > 0 ? searchResults : historicalPlacesData}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
        />
      </View>
      {selectedPlace && (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
            style={styles.keyboardAvoidingContainer}
          >
            <View style={styles.selectedPlaceContainer}>
              {selectedPlace.image && (
                <Image
                  source={selectedPlace.image}
                  style={styles.placeImage}
                />
              )}
              <Text style={styles.selectedPlaceName}>{selectedPlace.name}</Text>
              <Text>{selectedPlace.description}</Text>
              <TouchableOpacity onPress={() => setShowCommentsModal(true)} style={styles.locationButton}>
                <Text style={styles.locationButtonText}>Показать комментарии</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleShowLocation(selectedPlace.location)} style={styles.locationButton}>
                <Text style={styles.locationButtonText}>Показать на карте</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedPlace(null)}>
                <View style={styles.goBackContainer}>
                  <Text style={styles.goBackText}>Назад</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Modal visible={showCommentsModal} animationType="slide" onRequestClose={() => setShowCommentsModal(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.goBackContainer}>
                  <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                    <Text style={styles.goBackText}>Назад</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  <View style={styles.commentsContainer}>
                    <Text style={styles.commentsTitle}>Комментарии</Text>
                    {comments.map((comment, index) => (
                      <View key={index} style={styles.commentItem}>
                      <Text style={styles.commentUsername}>{comment.username}</Text>
                      <Text>{comment.text}</Text>
                      <Text style={styles.commentDate}>{comment.timestamp}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
                style={styles.commentInputContainer}
              >
                <TextInput
                  style={styles.commentInput}
                  placeholder="Напишите комментарий"
                  onChangeText={setNewComment}
                  value={newComment}
                  multiline
                />
                <TouchableOpacity onPress={addComment} style={styles.showCommentsButton}>
                  <Text style={styles.showCommentsButtonText}>Добавить комментарий</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </ScrollView>
    )}
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
},
header: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#3498db',
  padding: 15,
},
headerText: {
  fontSize: 24,
  color: '#fff',
  fontWeight: 'bold',
},
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 15,
  marginTop: 10,
},
clearButton: {
  backgroundColor: '#fff',
  paddingVertical: 5,
  paddingHorizontal: 10,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: '#3498db',
},
clearButtonText: {
  color: '#3498db',
  fontWeight: 'bold',
  fontSize: 16,
  textAlign: 'center',
},
input: {
  flex: 1,
  height: 40,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  paddingHorizontal: 10,
  marginRight: 10,
},
listContainer: {
  flex: 1,
  borderBottomWidth: 1,
  borderColor: '#ccc',
},
listItem: {
  padding: 15,
  borderBottomWidth: 1,
  borderColor: '#ccc',
},
placeName: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
},
placeDescription: {
  fontSize: 16,
  color: '#555',
  marginBottom: 10,
},
locationButton: {
  backgroundColor: '#3498db',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 20,
  marginTop: 10,
},
locationButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center', // Text alignment centered
},
showCommentsButton: {
  backgroundColor: '#3498db',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 20,
  marginTop: 10,
},
showCommentsButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center', // Text alignment centered
},
selectedPlaceContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
selectedPlaceName: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 10,
},
placeImage: {
  width: '100%',
  height: 200,
  marginBottom: 10,
  borderRadius: 10,
},
goBackContainer: {
  marginTop: 10,
  alignSelf: 'flex-start',
  borderRadius: 20,
  overflow: 'hidden',
  backgroundColor: '#3498db',
},
goBackText: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center',
},
commentsContainer: {
  marginTop: 20,
  borderTopWidth: 1,
  borderColor: '#ccc',
  paddingTop: 10,
},
commentsTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 10,
},
commentItem: {
  marginBottom: 10,
  padding: 10,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 5,
  backgroundColor: '#f9f9f9',
},
commentUsername: {
  fontWeight: 'bold',
  marginBottom: 5,
},
commentDate: {
  color: '#999',
  fontSize: 12,
  marginTop: 5,
},
modalContainer: {
  flex: 1,
  backgroundColor: '#fff',
  paddingHorizontal: 20,
  paddingTop: 40,
  marginBottom: 50
},
commentInputContainer: {
  marginTop: 20,
},
commentInput: {
  height: 100,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  paddingHorizontal: 10,
  marginBottom: 10,
},
keyboardAvoidingContainer: {
  flex: 1,
},
});

export default HomeScreen;

