// Call the dataTables jQuery plugin
var markers = {};
function getDifferenceDays(date1,date2){
  if(date2==null  || date2=="" ){
    return "-"
  }else{
    var a = moment(date1,'DD/MM/YYYY');
    var b = moment(date2,'DD/MM/YYYY');
    var diffDays = b.diff(a, 'days');
    if(diffDays>0){
      return diffDays

    }
  }
 
}


var table = $('#dataTable').DataTable( {
  "rowCallback": async function( row, data ,index) {
    if (data[4].startsWith("Active")) {
      $('td:eq(4)', row).html("<div style='background-color:#77e330;border-radius:20px;color:white;width:100px'>"+data[4]+"</div>");
    }else if(data[4].startsWith("Inactive")){
      $('td:eq(4)', row).html("<div style='background-color:red;border-radius:20px;color:white;width:120px'>"+data[4]+"</div>");
    }
    $('td:eq(0)', row).html("<a href='/voltage_metering_data?id="+data[3]+"'>"+data[0]+"</a>");
    
    if (data[9].startsWith("Excellent")) {
      $('td:eq(9)', row).html("<div style='background-color:#77e330;border-radius:20px;color:white;width:100px'>"+data[9]+"</div>");
    }else if(data[9].startsWith("Good")){
      $('td:eq(9)', row).html("<div style='background-color:#bfbd47;border-radius:20px;color:black;width:120px'>"+data[9]+"</div>");
    }else if(data[9].startsWith("OK")){
      $('td:eq(9)', row).html("<div style='background-color:#e07422;border-radius:20px;color:white;width:120px'>"+data[9]+"</div>");
    }else if(data[9].startsWith("Marginal")){
      $('td:eq(9)', row).html("<div style='background-color:red;border-radius:20px;color:white;width:120px'>"+data[9]+"</div>");
    }


    $(row).find('td:eq(6)').css({'background-color':'white','border-radius':'10px'});
    var flag=false;
    var timer;
    if(data[7]<25 && data[7]>8){
      clearInterval(timer);
      timer = setInterval(function(){ 
        if(flag){
          $(row).find('td:eq(7)').css({'background-color':'orange','color':'white'});
          flag=false;
        }else{
          $(row).find('td:eq(7)').css({'background-color':'white','color':'black'});
          flag=true;
        }
       }, 1000);

    }else if(data[7]<8 && data[7]>0){
      clearInterval(timer);
      timer = setInterval(function(){ 
        if(flag){
          $(row).find('td:eq(7)').css({'background-color':'red','color':'white'});
          flag=false;
        }else{
          $(row).find('td:eq(7)').css({'background-color':'white','color':'black'});
          flag=true;
        }
       }, 1000);

    }else if(data[7]==0){
          $(row).find('td:eq(7)').css({'background-color':'red','color':'white'});     
    }
  }
} );
var mymap = L.map('mapid').setView([22.0679196, 79.2871025], 5);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHVsa2l0MTIzNDU2IiwiYSI6ImNrZXRyNm5paDA3amUyeW1lNTkxZGJ5NnIifQ.fnpT-xTSv-k34FGWN8vJUA', {
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicHVsa2l0MTIzNDU2IiwiYSI6ImNrZXRyNm5paDA3amUyeW1lNTkxZGJ5NnIifQ.fnpT-xTSv-k34FGWN8vJUA'
}).addTo(mymap);

var greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


var legend = L.control({ position: "topright" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += '<i style="background: #2AAD27"></i><span>Active</span><br>';
  div.innerHTML += '<i style="background: #e80e0e"></i><span>Inactive</span><br>';

  return div;
};

legend.addTo(mymap);


var selected_db =new URL(window.location.href).searchParams.get('id');

var app = angular.module('voltage_app', []);


Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};


var global_data;

function fetchdata(){
  return new Promise(function(resolve,reject){

    var data={ type:"others"};
    var temp;
               $.ajax({
                    type: "POST",         
                    async: false,         
                    url: "/voltage_metering_vars",
                    data: data,
                    success: function(result) {
                      temp= result;
                     } 
                      
              });
             resolve(temp)
    }) 
}

function inactive_since(){
  return new Promise(function(resolve,reject){

    var temp;
               $.ajax({
                    type: "POST",         
                    async: false,         
                    url: "/dashboard",
                    success: function(result) {
                      temp= result;
                     } 
                      
              });
             resolve(temp)
    }) 
}

async function fill_table(){
  var last_active_since= await inactive_since();
  var total = await fetchdata();
  table.rows().remove().draw();

  for (var i=0;i<total.length;i++){

    var days_left=getDifferenceDays(moment().format('DD/MM/YYYY'),total[i]["end_date"]);

    if(days_left<41 && days_left>25){
      $("#alerts_div").append(" <div class='alert alert-info alert-dismissible fade show mt-4 text-center' role='alert'>\
      <h4 class='alert-heading'>Expiry Of Subscription</h4>\
      <p><u class='h5'>"+total[i]["Username"]+"</u>: <br><strong>"+days_left+" Days Left <br></strong> Expires on : <strong>"+total[i]["end_date"]+"</strong></p\
      <p class='mb-0'>Contact Your Admin for the Renewal of Subscription</p>\
      <hr>\
      <p class='mb-0'>Dismiss if already renewed.</p>\
      <button type='button' class='close' data-dismiss='alert' aria-label='Close'>\
        <span aria-hidden='true'>&times;</span>\
      </button>\
    </div>");

    }else if(days_left<26 && days_left>7){
      $("#alerts_div").append(" <div class='alert alert-warning alert-dismissible fade show mt-4 text-center' role='alert'>\
      <h4 class='alert-heading'>Expiry Of Subscription</h4>\
      <p><u class='h5'>"+total[i]["Username"]+"</u>: <br><strong>"+days_left+" Days Left <br></strong> Expires on : <strong>"+total[i]["end_date"]+"</strong></p\
      <p class='mb-0'>Contact Your Admin for the Renewal of Subscription</p>\
      <hr>\
      <p class='mb-0'>Dismiss if already renewed.</p>\
      <button type='button' class='close' data-dismiss='alert' aria-label='Close'>\
        <span aria-hidden='true'>&times;</span>\
      </button>\
    </div>");

    }else if(days_left<8 && days_left>0){
      $("#alerts_div").append(" <div class='alert alert-danger alert-dismissible fade show mt-4 text-center' role='alert'>\
      <h4 class='alert-heading'>Expiry Of Subscription</h4>\
      <p><u class='h5'>"+total[i]["Username"]+"</u>: <br><strong>"+days_left+" Days Left <br></strong> Expires on : <strong>"+total[i]["end_date"]+"</strong></p\
      <p class='mb-0'>Contact Your Admin for the Renewal of Subscription</p>\
      <hr>\
    </div>");
    }else if(days_left==0){
      $("#alerts_div").append(" <div class='alert alert-danger alert-dismissible fade show mt-4 text-center' role='alert'>\
      <h4 class='alert-heading'>Expiry Of Subscription</h4>\
      <p><u class='h5'>"+total[i]["Username"]+"</u> <br><strong>"+days_left+" Days Left <br></strong> Expires on : <strong>"+total[i]["end_date"]+"</strong></p\
      <p class='mb-0'>Contact Your Admin for the Renewal of Subscription</p>\
      <hr>\
    </div>")
      }else if(days_left<0){
      $("#alerts_div").append(" <div class='alert alert-danger alert-dismissible fade show mt-4 text-center' role='alert'>\
      <h4 class='alert-heading'>Expiry Of Subscription</h4>\
      <p><u class='h5'>"+total[i]["Username"]+"</u>: <br><strong>This Device has been stopped due to expiration of Subscription<br></strong> Expired on : <strong>"+total[i]["end_date"]+"</strong></p\
      <p class='mb-0'>Contact Your Admin for the Renewal of Subscription</p>\
      <hr>\
    </div>");
    }


    table.row.add([
      total[i]["Username"],total[i]["site_name"],total[i]["location"],
      total[i]["site_id"],total[i]["status"]=="Inactive" ? total[i]["status"]+" Since: "+last_active_since[total[i]["site_id"]] : total[i]["status"],total[i]["init_date"],total[i]["end_date"]
      ,getDifferenceDays(moment().format('DD/MM/YYYY'),total[i]["end_date"]) <0 ? 0 : getDifferenceDays(moment().format('DD/MM/YYYY'),total[i]["end_date"]),total[i]["mac"]==null ? "-"  :  total[i]["mac"] , total[i]["qos"]==null ? "-"  :  total[i]["qos"]
    ]).draw( false );

    if(total[i]["status"]=="Active"){
      markers[total[i]["Username"]]=L.marker([parseFloat(total[i]["lat"]), parseFloat(total[i]["longitude"])], {icon: greenIcon}).addTo(mymap).bindPopup(total[i]["Username"]+"</b><br>"+total[i]["site_name"]+","+total[i]["location"]);
    }else{
      markers[total[i]["Username"]]=L.marker([parseFloat(total[i]["lat"]), parseFloat(total[i]["longitude"])], {icon: redIcon}).addTo(mymap).bindPopup(total[i]["Username"]+"</b><br>"+total[i]["site_name"]+","+total[i]["location"]);
    }
  }
  table.draw(false);
  

}

setTimeout(function () { 
  fill_table();
} , 1000);

app.controller('total_devices', function($scope, $http,$interval) {
  $http.put("/dashboard")
    .then(function(response) {
    $scope.email=response.data;
    if($scope.email.length==0){
      $("#alerts_div").append(" <div class='alert alert-danger alert-dismissible fade show mt-4 text-center' role='alert'>\
            <h4 class='alert-heading'>Email for this account is not set up.</h4>\
            <p class='mb-0'>Click<a href='/edit_devices'> here </a> to setup your email to get alerts in the future.</p>\
          </div>");
                  
    }
  });
  $http.post("/dashboard")
    .then(function(response) {
    $scope.last_active_since=response.data;
    
});

});

app.controller('image_controller', function($scope, $http) {

  $http.post("/get_image")
  .then(function(response) {
    $scope.image=response.data;
  });
});



app.controller('active_devices', function($scope, $http,$interval) {
  $interval(function () {
    $http.post("/voltage_metering_vars",{type: "active"})
    .then(function(response) {
        $scope.actives=response.data;
    });
},1000);




});

app.controller('inactive_devices', function($scope, $http,$interval) {
  $interval(function () {
    $http.post("/voltage_metering_vars",{type: "inactive"})
    .then(function(response) {
        $scope.inactives=response.data;
    });
  },1000);

  
});

app.controller('myCtrl', function($scope, $http,$interval) {
  $interval(function () {
    $http.put("/voltage_metering_data",{site_id:new URL(window.location.href).searchParams.get('id')})
    .then(function(response) {
      if(response.data[0].status=="Active"){
        $("#status_card").removeClass("bg-danger");
        $("#status_card").addClass("bg-success");
        $scope.status="Active";
      }else{
        $("#status_card").removeClass("bg-success");
        $("#status_card").addClass("bg-danger");
        $scope.status="Inactive";
        
      }
      $scope.title = response.data[0].site_name + "," +  response.data[0].location;
      global_data=JSON.parse(response.data[0].vars);
    });
  }, 1000);
  $http.put("/voltage_metering_vars",{site_id:new URL(window.location.href).searchParams.get('id')})
  .then(function(response) {
    $scope.vars=response.data;
  });
});

   