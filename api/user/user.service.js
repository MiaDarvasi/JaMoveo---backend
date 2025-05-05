import {dbService} from '../../services/db.service.js'
import {logger} from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
	add,
	getById,
	update,
	remove,
	query,
	getByFullname,
    getByUsername
}

async function query() {
    try {
        const collection = await dbService.getCollection('users')
        const users = await collection.find().toArray() // No filters applied
        users.forEach(user => {
            delete user.password
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}


async function getById(userId) {
    try {
        var criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('users')
        const user = await collection.findOne(criteria)
        delete user.password

        criteria = { byUserId: userId }
        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByFullname(fullname) {
	try {
		const collection = await dbService.getCollection('users')
		const user = await collection.findOne({ fullname })
		return user
	} catch (err) {
		logger.error(`while finding user by full name: ${fullname}`, err)
		throw err
	}
}

async function remove(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('users')
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable properties
        const userToSave = {
            _id: ObjectId.createFromHexString(user._id), // needed for the returnd obj
            fullname: user.fullname,
        }
        const collection = await dbService.getCollection('users')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    console.log(user)
	try {
		const userToAdd = {
			fullname: user.fullname,
			instrument: user.instrument,
			username: user.username,
			password: user.password,
			isAdmin: user.isAdmin,
		}
		const collection = await dbService.getCollection('users')
		const result = await collection.insertOne(userToAdd)

		// Include the generated _id in the returned user object
		userToAdd._id = result.insertedId

		return userToAdd
	} catch (err) {
		logger.error('cannot add user', err)
		throw err
	}
}


async function getByUsername(username) {
    // console.log(username)
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
	const criteria = {}
	if (filterBy.txt) {
		const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
		criteria.$or = [
			{
				instrument: txtCriteria,
			},
			{
				fullname: txtCriteria,
			},
		]
	}
	return criteria
}