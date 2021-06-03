// A simple rate limiter
// It slows requests after it's specified quota is reached
// Adapted from https://github.com/nfriedly/express-slow-down/

const DEFAULT_OPTIONS = {
	// Delay in milliseconds
	delay: 200,
	// Maximum delay
	maxDelay: 1000,
	// How many permitted requests before delaying 
	delayThreshold: 100,

	// How long to keep records, in milliseconds
	timeout: 60 * 1000 // One minute
}

/**
 * The one function everyone has written tons of times...
 * @param {number} timeout A timeout in milliseconds
 * @returns {Promise}
 */
const wait = async timeout => new Promise(resolve => {
	setTimeout(resolve, timeout)
})

/**
 * A small in memory store to handle request data
 * @param {number} timeout The timeout in milliseconds to wait to clear the store
 */
const memoryStore = timeout => {
	let hits = {}

	const add = key => {
		if(hits[key]) hits[key]++;
		else {
			hits[key] = 1
		}

		return hits[key]
	}

	const dec = key => {
		hits[key] && hits[key]--;
	}

	const reset = () => {
		hits = {}
	}

	setInterval(reset, timeout)

	return { add, dec, reset }
}

const generateKey = req => req.socket.remoteAddress || req.connection.remoteAddress

/**
 * A basic slow-down style rate limiter
 * @param {typeof DEFAULT_OPTIONS} options The options of the rate limiter
 */
const limiter = (options) => {
	const { 
		delay, 
		delayThreshold,
		maxDelay,
		timeout, 
	} = { ...DEFAULT_OPTIONS, ...options }
	const store = memoryStore(timeout)

	const slow = async (req, res) => {
		const key = generateKey(req)

		const current = store.add(key)
		let actualDelay = 0

		if(current > delayThreshold) {
			const theoreticalDelay = (current - delayThreshold) * delay
			actualDelay = Math.min(theoreticalDelay, maxDelay)
		}

		res.setHeader('X-SlowDown-Limit', delayThreshold)
		res.setHeader('X-SlowDown-Remaining', Math.max(delayThreshold - current, 0))

		if(actualDelay !== 0) {
			return await wait(actualDelay)
		}
	}

	return slow
}

module.exports = limiter
