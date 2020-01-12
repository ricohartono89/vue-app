import Vue from 'vue';
import Vuex from 'vuex';
import createPlugin from 'logrocket-vuex';
import LogRocket from 'logrocket';

const logrocketPlugin = createPlugin(LogRocket);
const fb = require ('./firebaseConfig');

LogRocket.init('waziaq/vue-app');
LogRocket.identify('RICO',{
	name: 'rico',
	email: 'rico1589@gmail.com'
});
Vue.use(Vuex);

fb.auth.onAuthStateChanged(user => {
	if (user != null) {
		store.commit('setCurrentUser', user);
		store.dispatch('fetchUserProfile');
		fb.usersCollection.doc(user.uid).onSnapshot(doc => {
            store.commit('setUserProfile', doc.data());
		});

		if (store.currentUser != null && store.currentUser.uid == true) {
			console.log("uid value is true");
			store.commit('setCurrentUser',user);
			// store.currentUser.uid = user.uid;
		}

		fb.postsCollection.orderBy('createdOn','desc').onSnapshot(querySnapshot => {
			let createdByCurrentUser;
			if (querySnapshot.docs.length) {
				createdByCurrentUser = store.state.currentUser.uid = querySnapshot.docChanges()[0].doc.data().userId ? true : false;
			}

			if (querySnapshot.docChanges().length !== querySnapshot.docs.length &&
				querySnapshot.docChanges()[0].type == 'added' && !createdByCurrentUser) {
					let post = querySnapshot.docChanges()[0].doc.data();
					post.id = querySnapshot.docChanges()[0].doc.id;

					store.commit('setHiddenPosts', post);
			} else {
					let postsArray = [];

					querySnapshot.forEach(doc => {
						let post = doc.data();
						post.id = doc.id;
						postsArray.push(post);
					});

					store.commit('setPosts', postsArray);
			}
		});
	}
});

export const store = new Vuex.Store({
	state : {
		currentUser: null,
		userProfile: {},
		posts: [],
		hiddenPosts: []
	},
	actions : {
		clearData({commit }) {
			commit('setCurrentUser',null);
			commit('setUserProfile',null);
			commit('setPosts', null);
			commit('setHiddenPosts',null);
		},
		fetchUserProfile({ commit, state }) {
			fb.usersCollection.doc(state.currentUser.uid).get().then(res => {
				commit('setUserProfile', res.data());
			}).catch(err => {
				console.log(err);
			});
		},
		updateProfile({commit, state}, data) {
			let name = data.name;
			let title = data.title;

			fb.usersCollection.doc(state.currentUser.uid).update({name,title}).then(user => {
				fb.postsCollection.where('userId', '==', state.currentUser.uid).get().then(docs => {
					docs.forEach(doc => {
						fb.postsCollection.doc(doc.id).update({
							userName : name
						});
					});
				});

				fb.commentsCollection.where('userId', '==', state.currentUser.uid).get().then(docs => {
					docs.forEach(doc => {
						fb.commentsCollection.doc(doc.id).update({
							userName : name
						});
					});
				});
			}).catch(err => {
				console.log(err);
			});
		}
	},
	mutations : {
		setCurrentUser(state, val) {
			state.currentUser = val;
		},
		setUserProfile(state, val) {
			state.userProfile = val;
		},
		setPosts(state, val) {
			state.posts = val;
		},
		setHiddenPosts(state, val) {
			if (val) {
				if (!state.hiddenPosts.some(x => x.id === val.id)) {
					state.hiddenPosts.unshift(val);
				}
			} else {
				state.hiddenPosts = [];
			}
		}
	},
	plugins:[logrocketPlugin]

});
