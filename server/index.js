var express = require('express');
var app = express();
var server = require('http').createServer(app);
var PrimusServer = require('primus');
// const store = require('../src/js/store/store').default;
const createNewStore = require('../src/js/store/store').createStore;
const joinMeeting = require('../src/js/actions').joinMeeting;
const addParticipant = require('../src/js/actions').addParticipant;
const removeParticipant = require('../src/js/actions').removeParticipant;
const _ = require('lodash');


app.use('/', express.static('assets'));

var primus = new PrimusServer(server, {
  transformer: 'engine.io',
});

const rooms = {};

primus.on('disconnection', function(spark){
  const roomForUser = _.find(rooms, room => room.store.getState().participants.find(p => p.id === spark.id));
  if(roomForUser){
    roomForUser.store.dispatch(removeParticipant(spark.id));
    roomForUser.sparks.forEach(thisSpark => thisSpark.write(removeParticipant(spark.id)));
  }
});

primus.on('connection', function (spark) {
  if(spark.query.meetings){
    spark.write({type: 'SET_MEETINGS', meetings: [{
      name: 'Bold Planning',
      participants: 100
    }]});
    return;
  }
  if(spark.query.room){
    const roomName = spark.query.room;
    const participant = {
      name: spark.id,
      id: spark.id,
      host: false
    };
    if(!rooms[roomName]){
      const room = {
        participants: [participant],
        topics: [],
        phase: 'submit',
        roomName,
        timer: 38000,
        locked: false,
        newHosts: true,
      };
      participant.host = true;
      rooms[roomName] = {sparks: [spark], store: createNewStore(room)};
      rooms[roomName].store.dispatch(joinMeeting(room));
    } else {
      const currentRoom = rooms[roomName];
      currentRoom.sparks = [...currentRoom.sparks, spark];
      currentRoom.store.dispatch(addParticipant(participant));
    }

    const currentStore = rooms[roomName].store;
    spark.write(joinMeeting(currentStore.getState()));
    // Join meeting
    // spark.write('JOIN_MEETING')
    spark.on('data', action => {
      currentStore.dispatch(action);
      rooms[roomName].sparks.forEach(thisSpark => thisSpark.write(action));
    });
  }
});


app.get(/^(?!primus).+/, (req, res) => res.sendFile(`${process.cwd()}/assets/index.html`));

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});