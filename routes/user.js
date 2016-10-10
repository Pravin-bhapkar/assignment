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
