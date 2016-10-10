var express = require('express');
var router = express.Router();
var log4js = require('log4js');
var log = log4js.getLogger();


var mongoose = require('mongoose');
var conn = mongoose.connection;
var deviceReport=conn.collection("deviceInfo");
/* GET users listing. */
router.post('/sendMessage', function(req, res) {
	log.trace("[users] >> sendMessage >>  ");
	log.debug("[users] >> sendMessage >> request >> ",req.body);
	var data=req.body;
	if(data){
		paseData(data[0],function(err,success){
			if(err){
				log.error("[users[ >> sendMessage() >> Error while processing data : ",err);
				res.send(err);
			}else{
				data[0]["GPS"]=success;
				saveResponseInDB(data[0],function(err, resp){
					if(err){
						log.error("[users] >> saveResponseInDB() >> Error while saving record in database ",err);
						res.send({"success" : false,"error" : err});
					}else{
						res.send({"success" : "true","msg" : "record saved successfully...!!!"});
					}
				});
				
			}
		});
		
	}else{
		res.send("No request data found");
	}
	
  	//res.send('respond with a resource');
});

router.post('/events', function(req, res) {
	log.trace("[users] >> eventsevents >>  ");
	log.debug("[users] >> sendMessage >> event send by device >> ",req.body);

	var nodemailer = require('nodemailer');

	var config = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "mymail@gmail.com",  //Use your configuration email address
        pass: "my password"  //Use your password
    }
};
 
// create reusable transporter object using the default SMTP transport 
var transporter = nodemailer.createTransport(config);
 
// setup e-mail data with unicode symbols 
var mailOptions = {
    from: '"Pravin Bhapkar" <pravinlogicap@gmail.com>', // sender address 
    to: 'pravinlogicap@gmail.com', // list of receivers 
    subject: 'Event genrated for device', // Subject line 
    text: 'Hello There,  IOT event genrated for you', // plaintext body 
    html: '<b>Hello there, Here is the event </b>' // html body 
};
 
// send mail with defined transport object 
transporter.sendMail(mailOptions, function(error, info){
    if(error){
         log.error("Error while sending event  "+error);
         res.send({"success" : false,"error" : error});

    }else{
    	log.trace('Message sent: ' + info.response);

    	//Along with this we can store events in file as well.
    	res.send({"success" : true,"msg" : "mail sent"});
    }
    	
});


});	

function saveResponseInDB(data,callback){
	log.trace("start");
	deviceReport.save(data,function(err,save){
		if(err){
			log.error("Error");
			callback(err,null);
		}else{
			log.trace("save done");
			callback(null,"done");
		}
	});
}

//For parsing request data and get lat long value for GPS.
function paseData(data,callback){
	log.trace("[usres] >> parseData() >> ");
	log.debug(" Data is : ",data);

	if(data.hasOwnProperty("G")){
		var GPS=[];
		var str=data.G;
		var latlang=str.split("N,");
		//Now parse the  string
		var latValue=latlang[0].trim();

		var latValuePartOne=latValue.substring(0,2);

		var latValuePartSecond=latValue.substring(2,latValue.length);

		log.debug("[users] >> parseData() >> lat is divide into 2 parts  : Part 1 >> "+latValuePartOne+ "  & Part 2 >>  "+latValuePartSecond);
		
		var processedSecondPart=latValuePartSecond/60;

		log.trace("Addition of lat   "+processedSecondPart);
		
		var additionOfLat=latValuePartOne + processedSecondPart;

		GPS.push(additionOfLat);

		var long=latlang[1].split("E");
		var longValue=long[0].trim();
		

		var longValuePartOne=longValue.substring(0,2);

		var longValuePartSecond=longValue.substring(2,longValue.length);
		
		log.debug("[users] >> parseData() >> long is divide into 2 parts  : Part 1 >> "+longValuePartOne+ "  & Part 2 >>  "+longValuePartSecond);
		 processedSecondPart=longValuePartSecond/60;

		log.trace("Addition of long   "+processedSecondPart);
		
		var additionOfLong=longValuePartOne + processedSecondPart;
		GPS.push(additionOfLong);


		log.trace("Here is GPS value >> "+GPS);
		callback(null,GPS);

	}else{
		log.error("[users] >> [parseData] >> there is no key provoided for lat lang ");
		callback("Key Not Found",null);
		//Send email to user
	}
}
module.exports = router;
