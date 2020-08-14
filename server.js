const app = require('./src/app');
const connectDb = require('./src/utils/db_connect')

// Constants
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Auth service running on http://${HOST}:${PORT}`);
});

connectDb().then(() => {
    console.log("Auth MongoDB connected (auth_db)");
});