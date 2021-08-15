/* eslint-disable no-unused-vars */
import express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import {
  read, add, write, edit, deleteFunc,
} from './jsonFileStorage.mjs';

const app = express();
app.set('view engine', 'ejs');
app.use(cookieParser());

let visits = 0;

// Configure Express to parse request body data into request.body
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

// function validateCookie(req, res, next) {
//   const { cookies } = req;
//   console.log(cookies);
//   if (req.cookies.visits) {
//     visits = Number(req.cookies.visits); // get the value from the request
//     console.log(`${visits} visits`);
//   }
//   else {
//     res.cookie('visits', 1);
//   }
//   next();
// }

const handleIncomingRequest = (request, response) => {
  read('data.json', (err, data) => {
    const { index } = request.params;
    const sighting = data.sightings[index];
    sighting.index = index;
    const ejsData = { sighting };
    response.render('sighting', ejsData);
  });
};

const handleEditRequest = (request, response) => {
  read('data.json', (err, data) => {
    if (err) {
      console.log(err);
    }
    const { index } = request.params;
    const sighting = data.sightings[index];
    sighting.index = index;
    const ejsData = { sighting };
    response.render('edit', ejsData);
  });
};
const handleIndex = (req, res) => {
  read('data.json', (err, data) => {
    const { sightings } = data;
    sightings.forEach((sight, i) => {
      sight.index = i;
    });
    console.log(err);
    if (req.cookies.visits) {
      visits = Number(req.cookies.visits); // get the value from the request
    }
    visits += 1;
    res.cookie('visits', visits);
    console.log(`Current cookie key and value: visits: ${visits}`);
    res.render('index', { data, visits });
  });
};

app.post('/sighting', (request, response) => {
  add('data.json', 'sightings', request.body, (err) => {
    if (err) {
      response.status(500).send('DB write error.');
      return;
    }
    console.log(request.body);
    read('data.json', (err, data) => {
      if (err) {
        console.log(err);
      }
      const { sightings } = data;
      const lastIndex = sightings.length - 1;
      response.redirect(`./sighting/${lastIndex}`);
    // res.render('form', yearObj);
    });
  });
});

app.put('/sighting/:index', (request, response) => {
  const { index } = request.params;
  edit('data.json', (err, data) => {
    if (err) {
      console.log(err);
    }
    data.sightings[index] = request.body; },
  (err, data) => {
    if (err) {
      console.log(err);
    }
    response.redirect(`./${index}`);
  });
});

app.get('/sighting', (request, response) => {
  response.render('form');
});

const handleDelete = (request, response) => {
  // Remove element from DB at given index
  deleteFunc('data.json', request, 'sightings', (err) => {
    if (err) {
      console.log(err);
    }
    response.redirect('/');
  });
};

const handleShapeRequest = (request, response) => {
  read('data.json', (err, data) => {
    const { sightings } = data;
    const shapeSet = new Set();
    sightings.forEach((sight) => {
      const { shape } = sight;
      shapeSet.add(shape);
    });
    const shapeArray = [...shapeSet];
    const shapeObj = { shapes: shapeArray };
    response.render('shapes', shapeObj);
  });
};

const handleOneShapeRequest = (request, response) => {
  const shapeReportCollection = [];
  read('data.json', (err, data) => {
    const { sightings } = data;
    for (let i = 0; i < sightings.length; i += 1) {
      const refSightings = sightings[i];
      const shapeRequest = request.params.shape.toString();
      if (refSightings.shape.toLowerCase() === shapeRequest) {
        shapeReportCollection.push(i);
      }
    }
    const shapeReportObj = { shape: shapeReportCollection, name: request.params.shape };
    console.log(shapeReportObj);
    response.render('shapeIndex', shapeReportObj);
  });
};

app.get('/nav', (req, res) => {
  res.render('navbar');
});

app.get('/sighting/:index', handleIncomingRequest);
app.get('/sighting/:index/edit', handleEditRequest);
app.get('/', handleIndex);
app.get('/index', handleIndex);
app.delete('/sighting/:index', handleDelete);
app.get('/shapes', handleShapeRequest);
app.get('/shapes/:shape', handleOneShapeRequest);
app.listen(3004);
