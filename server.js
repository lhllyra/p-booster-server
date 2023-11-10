const express = require('express');
const session = require('express-session');
const axios = require('axios');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GitHubStrategy = require('passport-github').Strategy;

const app = express();

// Configure session and passport
app.use(session({ secret: 'ff1bc92c52ec5149d842c53692c5403c4a0c1525', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth configuration
passport.use(new GitHubStrategy({
    clientID: '8aa5cbfbcc7a72cdffb1',
    clientSecret: 'ff1bc92c52ec5149d842c53692c5403c4a0c1525',
    callbackURL: 'http://localhost:3001/auth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Authentication routes
app.get('/auth/github', passport.authenticate('github'));

function generateToken(userData) {
  const token = jwt.sign({ data: userData }, 'ff1bc92c52ec5149d842c53692c5403c4a0c1525', { expiresIn: '1h' });
  return token;
}

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/github' }),
  (req, res) => {
    const token = generateToken(); 
    req.session.token = token; 
    res.redirect('http://localhost:3000/');
  }
);

app.get('/api/repositories', (req, res) => {
    const { query } = req.query;
    const apiUrl = `https://api.github.com/search/repositories?q=${query}`;
    axios.get(apiUrl)
      .then(response => {
        res.json(response.data.items);
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  });

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});