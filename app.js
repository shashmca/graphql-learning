const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require("./models/event");
const app = express();

const events = [];

app.use(bodyParser.json());

// app.get('/', (req, res, next) => {
//   res.send('Hello World!');
// });

app.use('/graphql', graphqlHttp({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
        events: [Event!]!
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event
    }
    schema {
      query: RootQuery,
      mutation:RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event.find().then(events => {
        return events.map(event => {
          return { ...event._doc, _id: event.id }
        })
      }).catch(err => {
        console.log(err);
      })
      // return events;
    },
    createEvent: (args) => {
      // const event = {
      //   _id: Math.random().toString(),
      //   title: args.eventInput.title,
      //   description: args.eventInput.description,
      //   price: +args.eventInput.price,
      //   date: new Date().toISOString()

      // }

      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date)
      });
      // events.push(event);
      return event.save().then(result => {
        console.log(result);
        return { ...result._doc, _id: event.id }
      }).catch(err => {
        console.log(err);
        throw err;
      });
      return event;
    }
  },
  graphiql: true
}));

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-jeg94.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`)
  .then(() => {
    app.listen(3200);
  }
  ).catch(err => {
    console.log(err);
  });

