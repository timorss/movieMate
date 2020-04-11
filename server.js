'use strict';
// create an API server
const Restify = require('restify');
const server = Restify.createServer({
	name: 'MovieMate'
});
const tmdb = require('./tmdb')

const PORT = process.env.PORT || 3000;

server.use(Restify.jsonp());

// Tokens
const config = require('./config');

// FBeamer
const FBeamer = require('./fbeamer');
const f = new FBeamer(config.FB);

// Register the webhooks
server.get('/', (req, res, next) => {
	f.registerHook(req, res);
	return next();
});

// Receive all incoming messages
server.post('/',
	(req, res, next) => f.verifySignature(req, res, next),
	Restify.bodyParser(),
	(req, res, next) => {
		f.incoming(req, res, msg => {
			// Process messages
			const {
				message,
				sender
			} = msg;

			if (message.text && message.nlp) {
				// If a text message is received, use f.txt or f.img to send text/image back.
				console.log('message.nlp.entities', message.nlp.entities);

				tmdb(message.nlp.entities)
					.then(res => {
					

						f.txt(sender, res.txt)
						if (res.img) {
							f.txt(sender, res.img)
						}
					})
					.catch(err => {
						console.log(err);
						f.txt(sender, 'My servers are acting up. Do check back later...')
					})
			}
		});
		return next();
	});

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`MovieMate running on port ${PORT}`));