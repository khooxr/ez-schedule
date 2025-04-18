import express from 'express';
import { hash, compare } from 'bcrypt';
import multer from 'multer';

import { findUserByEmail, findUserById, updateUser } from '../database/userDb.js';

const router = express.Router();

// Configure multer for handling file uploads
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Not an image! Please upload an image.'), false);
		}
	},
});

// GET /api/users/:userId - View user profile
router.get('/:userId', async (req, res) => {
	const userId = req.params.userId;
	const user = await findUserById(userId);

	if (user) {
		res.json(user);
	} else {
		res.status(404).json({ error: 'User not found' });
	}
});

// POST /api/users/:userId/profile-picture - Upload profile picture
router.post('/:userId/profile-picture', upload.single('profilePicture'), async (req, res) => {
	try {
		const userId = req.params.userId;
		const file = req.file;

		if (!file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		// Convert the file buffer to base64
		const base64Image = file.buffer.toString('base64');
		const dataUrl = `data:${file.mimetype};base64,${base64Image}`;

		// Update user with the new profile picture
		await updateUser(userId, { profilePicture: dataUrl });

		res.json({ profilePicture: dataUrl });
	} catch (error) {
		console.error('Error uploading profile picture:', error);
		res.status(500).json({ error: 'Failed to upload profile picture' });
	}
});

// PATCH /api/users/:userId - Update/Edit user profile
router.patch('/:userId', async (req, res) => {
	const userId = req.params.userId;
	// const user = await findUserById(userId);
	const userData = req.body;
	try {
		await updateUser(userId, userData);
		res.status(200).json({ message: 'User profile updated.' });
	} catch (error) {
		console.error('Update user error:', error);
		res.status(500).json({ error: 'Failed to update user profile.' });
	}
});

// PATCH /api/users/:userId/password - Reset password (for logged in users)
router.patch('/:userId/password', async (req, res) => {
	// const userId = req.user.userId;
	const userId = req.params.userId;
	const { password: newPassword } = req.body;

	// Validate newPassword
	if (!newPassword || newPassword.trim() === '') {
		return res.status(400).json({ error: 'Password cannot be empty.' });
	}

	try {
		const hashedNewPassword = await hash(newPassword, 10);
		await updateUser(userId, { password: hashedNewPassword });

		res.status(200).json({ message: 'Password reset successful.' });
		// console.log("New password:", newPassword); //debug
	} catch (error) {
		console.error('Error resetting password:', error);
		res.status(500).json({ error: 'Internal server error.' });
	}
});

// GET /api/users/hosts - Fetch all hosts
router.get('/hosts', async (req, res) => {
	try {
		const hosts = await getAllHosts();
		res.json(hosts);
	} catch (error) {
		console.error('Error fetching hosts:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /api/users/participants - Fetch all participants
router.get('/participants', async (req, res) => {
	try {
		const participants = await getAllParticipants();
		res.json(participants);
	} catch (error) {
		console.error('Error fetching participants:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /api/users/username/:username - Fetch user by username
router.get('/username/:username', async (req, res) => {
	const username = req.params.username;
	try {
		const user = await getUserByUsername(username);
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ error: 'User not found' });
		}
	} catch (error) {
		console.error('Error fetching user by username:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
