const request = require('request')
const TMDB = require('../config').TMDB
const createResponse = require('./createResponse')

module.exports = nlpData => {
    console.log('nlpData', nlpData);

    const MAX_CONFIDENCE = 0.8;
    const extractEntity = (nlp, entity) => {
        let obj = nlp[entity] && nlp[entity][0];
        if (obj && obj.confidence > MAX_CONFIDENCE) {
            return obj.value;
        } else {
            return null;
        }
    }
    console.log('TMDB', TMDB);

    const getMovieData = (movie, releaseYear = null) => {

        let qs = {
            api_key: TMDB,
            query: movie
        }
        if (releaseYear) {
            qs.year = Number(releaseYear)
        }
        return new Promise((resolve, reject) => {
            request({
                uri: `https://api.themoviedb.org/3/search/movie`,
                qs
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    let data = JSON.parse(body)
                    resolve(data.results[0])
                } else {
                    reject(error)
                }
            })
        })
    }

    const getDirector = (movieId) => {
        return new Promise((resolve, reject) => {
            request({
                uri: `https://api.themoviedb.org/3/movie/${movieId}/credits`,
                qs: {
                    api_key: TMDB,
                }
            }, (error, response, body) => {

                if (!error && response.statusCode === 200) {
                    let result = JSON.parse(body).crew
                    let directors = result.filter(item => item.job === 'Director').map(item => item.name).join(', ')
                    resolve(directors)
                } else {
                    reject(error)
                }
            })
        })
    }

    return new Promise(async (resolve, reject) => {
        let intent = extractEntity(nlpData, 'intent');
        if (intent === 'greeting') {
            resolve({
                txt: `Hey :)`,
                img: null
            })
        }
        if (intent) {
            let movie = extractEntity(nlpData, 'movie')
            let releaseYear = extractEntity(nlpData, 'releaseYear')

            try {
                let movieData = await getMovieData(movie, releaseYear);
                let director = await getDirector(movieData.id);
                let response = createResponse(intent, movieData, director)
                resolve(response)
            } catch (error) {
                reject(error)
            }
        } else {
            resolve({
                txt: `i'm not sure i understand you!`,
                img: null
            })
        }
    })
}