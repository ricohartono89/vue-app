import firebase from 'firebase';
import 'firebase/firestore';

const config = {
	apiKey: "AIzaSyAo-3rKMgQdp-Slb4fXx-oAocR11FXCJqc",
	authDomain: "",
	databaseURL: "",
	projectId: "vue-app-project-2a9f8",
	storageBucket: "",
	messagingSenderId: ""
};
firebase.initializeApp(config);

const db = firebase.firestore();
const auth = firebase.auth();
const currentUser = auth.currentUser;

// const settings = {
// 	timestampsInSnapshots: true
// };
// db.settings(settings);

const usersCollection = db.collection('users');
const postsCollection = db.collection('posts');
const commentsCollection = db.collection('comments');
const likesCollection = db.collection('likes');

export {
	db,
	auth,
	currentUser,
	usersCollection,
	postsCollection,
	commentsCollection,
	likesCollection
};
