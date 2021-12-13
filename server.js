const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index.html');
});

app.listen(PORT, () => {
  console.log(`Server up and running on port ${PORT}`);
});
