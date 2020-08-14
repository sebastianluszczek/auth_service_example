const getAppCookies = (req) => {
    // We extract the raw cookies from the request headers
    console.log(req.headers.cookie)
    const rawCookies = req.headers.cookie.split('; ');
    // rawCookies = ['myapp=secretcookie, 'analytics_cookie=beacon;']
    console.log(rawCookies);

    const parsedCookies = {};
    rawCookies.forEach(rawCookie => {
        const parsedCookie = rawCookie.split('=');
        // parsedCookie = ['myapp', 'secretcookie'], ['analytics_cookie', 'beacon']
        parsedCookies[parsedCookie[0]] = parsedCookie[1];
    });
    console.log(parsedCookies)
    return parsedCookies;
};

module.exports = getAppCookies;