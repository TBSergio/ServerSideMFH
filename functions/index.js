const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
exports.actOnCreate2 = functions.database.ref('/measurements/{uid1}/{uid2}').onCreate((event, context) => {
 // console.log("Entered: onCreate");
 // console.log(context.params.uid1);
 // console.log(context.params.uid2);
 console.log(event._data);
 var HR = parseInt(event._data.heartRate, 10);
 var AvgHR = parseInt(event._data.heartRateAvg, 10);
 console.log(`HR: ${HR}`);
 console.log(`AvgHR: ${AvgHR}`);
 console.log((0.3 * AvgHR));
 console.log((AvgHR + (0.3 * AvgHR)));
 var uuid = context.params.uid1;
 // Get the list of device notification tokens.
 const getDeviceTokensPromise = admin.database()
   .ref(`/users/${uuid}`).once('value');
 return Promise.all([getDeviceTokensPromise]).then(results => {
   var tokensSnapshot = results[0];
   console.log(tokensSnapshot);
   // Notification details.

   console.log("myval");
   console.log(tokensSnapshot.val());
   console.log("token:", tokensSnapshot.val().token);
   var notified = tokensSnapshot.val().notified || false;
   console.log("notified:",notified);
   console.log("(HR > (AvgHR + (0.3 * AvgHR)))",(HR > (AvgHR + (0.3 * AvgHR))));
   // Send notifications to all tokens.
   if ((HR > (AvgHR + (0.3 * AvgHR)))) {
     if(notified === false){
       admin.database().ref(`/users/${uuid}`).update({
         notified: true
       });
       const payload = {
         notification: {
           title: 'You have a new notification!',
           body: `This is the body message.`,
           sound: 'default',
           badge: '1'
         }
       };
       return admin.messaging().sendToDevice(tokensSnapshot.val().token, payload);
     }
     console.log("Already notified this user");
     return 0;

   } else {
     admin.database().ref(`/users/${uuid}`).update({
       notified: false
     });
     console.log("no notification needed")
     return 0;
   }
 });
});

exports.addContact = functions.https.onRequest((req,res) => {

    const uuid = req.query.uuid;
    const cid = req.query.cid;
    const name = req.query.name;
    const phone = req.query.phone;

     // Push the new token into the Realtime Database using the Firebase Admin SDK.
    return admin.database().ref(`contacts/${uuid}/${cid}`).set({
    name: name,
    phone: phone
    }).then((snapshot) => {
    return res.status(200).send("Saved to DB");
    });
});

exports.addMeasurement = functions.https.onRequest((req,res) => {

    const uuid = req.query.uuid;
    const heartRate = req.query.heartRate;
    const gcr = req.query.gcr;
    const timestamp = req.query.timestamp;
    const gcrAvg = req.query.gcrAvg;
    const heartRateAvg=req.query.heartRateAvg;

     // Push the new token into the Realtime Database using the Firebase Admin SDK.
    return admin.database().ref(`measurements/${uuid}`).push({
    timestamp: timestamp,
    gcr: gcr,
    heartRate: heartRate,
    gcrAvg: gcrAvg,
    heartRateAvg: heartRateAvg

    }).then((snapshot) => {
    return res.status(200).send("Saved to DB");
    });
});

exports.updateToken = functions.https.onRequest((req, res) => {

    // Grab the token parameter.
    const token = req.query.token;
    const uuid = req.query.uuid;
   
    // Push the new token into the Realtime Database using the Firebase Admin SDK.
    return admin.database().ref(`userToken/${uuid}`).set({
        token: token
      }).then((snapshot) => {
      return res.status(200).send("Saved to DB");
    });
});

exports.addRecording = functions.https.onRequest((req, res) => {

    // Grab the token parameter.
    const uuid = req.query.uuid;
    const sName = req.query.sName;
    const sPath = req.query.sPath;

    // Push the new token into the Realtime Database using the Firebase Admin SDK.
    return admin.database().ref(`Recordings/${uuid}/Song`).set({
        sName: sName,
        sPath: sPath
      }).then((snapshot) => {
      return res.status(200).send("Saved to DB");
    });
   });