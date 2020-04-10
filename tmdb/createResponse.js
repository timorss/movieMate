
module.exports = (intent, data, director) => {
    const { title, overview, release_date, poster_path } = data;
    const releaseYear = release_date.slice(0, 4);
    let str = ''
    switch (intent) {
        case 'movieInfo':
            str = `${title} ${releaseYear}: ${overview}`.substring(0, 640)
            return {
                txt: str,
                img: `https://image.tmdb.org/t/p/w300/${poster_path}`
            }
            break;
        case 'director':
            str = `${title} ${releaseYear} was directed by ${director}`.substring(0, 640)
            return {
                txt: str,
                img: null
            }
            break;

        default:
            break;
    }
}