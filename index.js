/* eslint-disable no-unused-vars */
import express from 'express';
import methodOverride from 'method-override';
import { read, add, write } from './jsonFileStorage.mjs';

const app = express();
app.set('view engine', 'ejs');

// Configure Express to parse request body data into request.body
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

const handleIncomingRequest = (request, response) => {
  read('data.json', (err, data) => {
    const { index } = request.params;
    const sighting = data.sightings[index];
    sighting.index = index;
    const ejsData = { sighting };
    response.render('sighting', ejsData);
  });
};

// const handleEditWrite = (err, jsonStrData) => {
//   if (err) {
//     console.log(`error ${err}`);
//   }
//   console.log('success!');
// };

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
    res.render('index', data);
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
  read('data.json', (err, data) => {
    // Replace the data in the object at the given index
    data.sightings[index] = request.body;
    write('data.json', data, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect(`./${index}`);
    });
  });
});

app.get('/sighting', (request, response) => {
  response.render('form');
});

const handleDelete = (request, response) => {
  // Remove element from DB at given index
  const { index } = request.params;
  read('data.json', (err, data) => {
    if (err) {
      console.log(err);
    }
    data.sightings.splice(index, 1);
    write('data.json', data, (err) => {
      response.render('index', data);
    });
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
