import express from 'express';
import helmet from 'helmet';

const app = express();

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      reportOnly: true, // Don't enforce CSP, just report violations
    },
  }),
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
