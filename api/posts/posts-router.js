/*
	The requirements for the rest API are not 1-to-1 with their associated
	helper functions

	GET  () 				=> []								find() 						=> []
	GET  (id) 			=> post							find(id) 					=> post
	POST (post) 		=> post		******		insert(post) 			=> id
	PUT (id, post)  => post		******		update(id, post) 	=> numPostsChanged
	DELETE (id) 		=> post		******		remove(id) 				=> numPostsDeleted

	extra calls will need to be made for ******
*/

// implement your posts router here
const express = require('express')
const api = require('./posts-model')

function verifyPost(body) {
	return (Object.hasOwnProperty.call(body, 'title')
		&& Object.hasOwnProperty.call(body, 'contents'))
}

function makePost(body) {
	return { title: body.title, contents: body.contents }
}

const NOT_FOUND_RESPONSE = { message: "The post with the specified ID does not exist" }

const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const result = await api.find()
		res.status(200).json(result)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.get('/:id', async (req, res) => {
	try {
		const result = await api.findById(req.params.id)
		if (result)
			res.status(200).json(result)
		else
			res.status(404).json(NOT_FOUND_RESPONSE)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.post('/', async (req, res) => {
	if (!verifyPost(req.body)) {
		res.status(400).json({ message: "Please provide title and contents for the post" })
		return;
	}

	const post = makePost(req.body)

	try {
		const result = await api.insert(post)
		const { id } = result
		const newPost = await api.findById(id)
		res.status(201).json(newPost)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.put('/:id', async (req, res) => {
	if (!verifyPost(req.body)) {
		res.status(400).json({ message: "Please provide title and contents for the post" })
		return;
	}

	const post = makePost(req.body)

	try {
		const result = await api.update(req.params.id, post)

		if (!result) {
			res.status(404).json(NOT_FOUND_RESPONSE)
			return
		}

		const updPost = await api.findById(req.params.id)
		res.status(201).json(updPost)

	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const post = await api.findById(req.params.id)

		if (!post) {
			res.status(404).json(NOT_FOUND_RESPONSE)
			return
		}

		const result = await api.remove(req.params.id)

		if (result)
			res.status(200).json(post)
		else
			res.status(400).json({ message: "uh, it was there a second ago" });

	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

module.exports = router;
