const express = require("express");

const dotenv = require('dotenv');
dotenv.config({ path: process.cwd() + '\\sendgrid.env' });

var cors = require('cors')
const PORT = process.env.PORT || 3001;

const path = require('path');

const app = express();
app.use(cors())


app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
    
  });


app.post("/test", (req, res) => {
    res.json({ message: "Hello from server!" });
    
});

const bodyParser = require('body-parser');

app.use(bodyParser.json());
  app.post("/form", (req, res) => {

    // console.log(req.body);

    // console.log(req.body.emotion)
    

    // TODO: maybe add res to fronted so that message is sure.
    
  
    
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const subject = "[" + req.body.emotion +"] Form response from physioloop.io"

  const text = 'Please view in html';
  const html = 'receved from: ' + req.body.name + ' <br> email: ' + req.body.email + '<br>' +
            'message: ' + req.body.message;

  // const html = 'Hello there!,<br>' +
  //     'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
  //     'Welcome and thanks for joining.\n\n' +
  //     '</br>Your details we have are\n\n' +
  //     '</br> Name: ' + user + '\n\n' + '</br> Telephone number: ' + number + '</br> email: ' + email + '</br>'
  //     };

  const msg = {
    to: 'physioloop.io@gmail.com', // Change to your recipient
    from: 'physioloop.io@gmail.com', // Change to your verified sender
    subject: subject,
    text: text,
    html: html,
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent at: ' + new Date())
      res.end()
    })
    .catch((error) => {
       console.error(error)
    })
  });

// app.get("/", (req, res) => {
//   res.render("index.html");
// });

// app.get('/', (req, res) =>{
//   const location =  path.join(__dirname, "..", "client", "public");
//     res.sendFile('index.html', { root: location} );
// });



app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);

});