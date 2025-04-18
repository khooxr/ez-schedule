import { connectDb } from './utils.js';
import { ObjectId } from 'mongodb';

export async function findUserByEmail(email) {
	const db = await connectDb();
	return await db.collection('users').findOne({ email });
}

export async function findUserById(userId) {
	const db = await connectDb();
	try {
		// console.log("(userDb.js) userId:", userId, "typeof:", typeof userId); //debug
		const resolvedId = typeof userId === 'string' ? ObjectId.createFromHexString(userId) : userId;

		return (
			db
				.collection('users')
				// .findOne({ _id: ObjectId.createFromHexString(userId) });
				.findOne({ _id: resolvedId })
		);
	} catch (error) {
		console.error('Error fetching user:', error);
		return null; // Handle invalid ObjectId errors
	}
}

export async function updateUser(userId, userData) {
	const db = await connectDb();

	const updateFields = {};
	if (userData.email) {
		updateFields.email = userData.email;
	}
	if (userData.password) {
		updateFields.password = userData.password;
	}
	if (userData.username) {
		updateFields.username = userData.username;
	}
	if (userData.profilePicture) {
		updateFields.profilePicture = userData.profilePicture;
	}
	if (userData.bio) {
		updateFields.bio = userData.bio;
	}
	if (userData.contactNumber) {
		updateFields.contactNumber = userData.contactNumber;
	}

	await db
		.collection('users')
		.updateOne({ _id: ObjectId.createFromHexString(userId) }, { $set: updateFields });
}

// Shared function to create a participant/host
export async function createUser({ email, password, username, userType }) {
	const db = await connectDb();

	try {
		let userData;
		if (userType === 'host') {
			userData = {
				email,
				password,
				username,
				userRole: 'host',
				createdAt: new Date(),
			};
		} else {
			userData = {
				email,
				password,
				username,
				userRole: 'participant',
				createdAt: new Date(),
			};
		}
		return await db.collection('users').insertOne(userData);
	} catch (error) {
		console.error('Error creating user:', error);
		return null;
	}
}

export async function getUserByUsername(username) {
	const db = await connectDb();

	try {
		return db.collection('users').findOne({ username });
	} catch (error) {
		console.error('(usersDb.js)Error fetching user:', error);
	}
}
