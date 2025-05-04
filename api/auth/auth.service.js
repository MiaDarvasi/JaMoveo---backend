import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234')

export const authService = {
	signup,
	login,
	getLoginToken,
	validateToken,
}

async function login(fullname, password) {
	logger.debug(`auth.service - login with full name: ${fullname}`)

	const user = await userService.getByFullname(fullname)
	if (!user) return Promise.reject('Invalid full name or password')

	// TODO: un-comment for real login
	const match = await bcrypt.compare(password, user.password)
	if (!match) return Promise.reject('Invalid full name or password')

	delete user.password
	user._id = user._id.toString()
	return user
}

async function signup({ fullname, instrument, username, password, isAdmin }) {
	const saltRounds = 10

	logger.debug(`auth.service - signup with full name: ${fullname}, fullname: ${fullname}`)
	if (!instrument || !password || !fullname || !username) return Promise.reject('Missing required signup information')

	const userExist = await userService.getByFullname(fullname)
	if (userExist) return Promise.reject('full name already taken')

	const hash = await bcrypt.hash(password, saltRounds)
	return userService.add({ instrument, password: hash, fullname, username, isAdmin })
}

function getLoginToken(user) {
	const userInfo = { 
        _id: user._id, 
        fullname: user.fullname, 
        isAdmin: user.isAdmin,
    }
	return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
	try {
		const json = cryptr.decrypt(loginToken)
		const loggedinUser = JSON.parse(json)
		return loggedinUser
	} catch (err) {
		console.log('Invalid login token')
	}
	return null
}




// import { userService } from '../user/user.service.js'
// import bcrypt from 'bcrypt'

// export const authService = {
//     login,
//     signup,
// }

// async function login(username, password) {
//     const user = await userService.getByUsername(username)
//     if (!user) return null

//     const match = await bcrypt.compare(password, user.password)
//     if (!match) return null

//     delete user.password
//     return user
// }
// async function signup(userData) {
//     const { username, fullname, password, instrument } = userData
// 	console.log(userData)

//     if (!username || !fullname || !password || !instrument) {
//         throw new Error('Missing required signup info')
//     }

//     const saltRounds = 10
//     const hashedPassword = await bcrypt.hash(password, saltRounds)

//     const newUser = await userService.add({
//         username,
//         fullname,
//         instrument,
//         password: hashedPassword,
//         isAdmin: false
//     })

//     if (newUser.password) delete newUser.password

//     return newUser
// }

