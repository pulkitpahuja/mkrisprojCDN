var global_date_to;
var global_date_from;
var selected_db =new URL(window.location.href).searchParams.get('id');

var app = angular.module('voltage_app', []);


Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};


var line_voltage_chart = echarts.init(document.getElementById('chart'));
var neutral_chart=echarts.init(document.getElementById('chart1'));


var global_data;

app.controller('active_devices', function($scope, $http,$interval) {
  

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
      global_data=JSON.parse(response.data[0].vars);          //variables list
    });
  }, 1000);
  $http.put("/voltage_metering_vars",{site_id:new URL(window.location.href).searchParams.get('id')})
  .then(function(response) {
    $scope.vars=response.data;          //to-create number of tiles
  });
});

app.controller('image_controller', function($scope, $http) {

  $http.post("/get_image")
  .then(function(response) {
    $scope.image=response.data;
  });
});



function getspecDate() {
  var now     = new Date(); 
  var year    = now.getFullYear();
  var month   = now.getMonth()+1; 
  var day     = now.getDate();
  var hour    = now.getHours();
  var minute  = now.getMinutes();
  var second  = now.getSeconds(); 
  if(month.toString().length == 1) {
       month = '0'+month;
  }
  if(day.toString().length == 1) {
       day = '0'+day;
  }   
  var datetime = year+'-'+month+'-'+day;   
   return datetime;
}

function getspecTime() {
  var now     = new Date(); 
  var year    = now.getFullYear();
  var month   = now.getMonth()+1; 
  var day     = now.getDate();
  var hour    = now.getHours();
  var minute  = now.getMinutes();
  var second  = now.getSeconds(); 
 
  if(hour.toString().length == 1) {
       hour = '0'+hour;
  }
  if(minute.toString().length == 1) {
       minute = '0'+minute;
  }
  if(second.toString().length == 1) {
       second = '0'+second;
  }   
  var datetime = hour+':'+minute+':'+second;   
   return datetime;
}

         
  var start = moment();
  var end = moment();

  function cb(start, end) {
      
      global_date_from=start.format('YYYY-MM-DD');
      global_date_to=end.format('YYYY-MM-DD');
      $('#reportrange span').html(start.format('MMMM DD, YYYY') + ' - ' + end.format('MMMM DD, YYYY'));
      
  }

  $('#reportrange').daterangepicker({
      startDate: start,
      endDate: end,
      ranges: {
         'Today': [moment(), moment()],
         'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
         'Last 7 Days': [moment().subtract(6, 'days'), moment()],
         'Last 30 Days': [moment().subtract(29, 'days'), moment()],
         'This Month': [moment().startOf('month'), moment().endOf('month')],
         'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
  }, cb);

  cb(start, end);

  
        // specify chart configuration item and data
        var option_line_voltages = {
          color:['#c91649','#3f1bab','#9667c7','#7329e3','#750941','#e09baf'],

          tooltip: {
              trigger: 'axis',
              axisPointer: {
                  type: 'cross',
                  label: {
                      backgroundColor: '#6a7985'
                  }
              }
          },
          legend: {
              left: 0,
              data: []
          },
          toolbox: {
              feature: {
                saveAsImage: {title: 'Save', show: true},
                  magicType: {
                    type: ['line', 'bar', 'stack', 'tiled'],
                    title:{'line':"Line","bar":"Bar","stack":"Stack","tiles":"Tiles"},
                    dataZoom:{  
                      show:true,
                      title:{  
                         zoom:"Zoom",
                         back:"Restore Zoom"
                      }
                   }
                }
              }
          },
          grid: {
           
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
          },
          xAxis: [
              {
                  type: 'category',
                  boundaryGap: false,
                  data: ['Date/Time', 'Date/Time', 'Date/Time', 'Date/Time', 'Date/Time', 'Date/Time', 'Date/Time']
              }
          ],
          yAxis: [
              {
              
                  type: 'value'
              }
          ],
          series: [
             
          ]
      };

      var option_neutral_voltages = {
        color:['#73d976'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        legend: {
            left: 0,
            data: [{name:'Neutral Ground (Volts)'}],
        },
        toolbox: {
            feature: {
                saveAsImage: {title: 'Save', show: true},
                magicType: {
                  type: ['line', 'bar', 'stack', 'tiles'],
                  title:{'line':"Line","bar":"Bar","stack":"Stack","tiles":"Tiles"},
              }
            }
        },
        grid: {
         
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                mode:'time',
                boundaryGap: false,
                data: ['Date/Time', 'Date/Time', 'Date/Time', 'Date/Time', 'Date/Time', 'Date/Time', 'Date/Time']
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
      
                 
        ]
    };

        // use configuration item and data specified to show chart
        line_voltage_chart.setOption(option_line_voltages);
        neutral_chart.setOption(option_neutral_voltages);



function fetchdata(type,datefrom,dateto){
    return new Promise(function(resolve,reject){
  
  var data={ type:type,date_from: datefrom , date_to: dateto,site_id:new URL(window.location.href).searchParams.get('id')};
  var temp;
             $.ajax({
                  type: "POST",         
                  async: false,         
                  url: "/voltage_metering_data",
                  data: data,
                  success: function(result) {
                    temp= result;
                   } 
                    
            });
           resolve(temp)
  }) 
  
}

app.controller('data_controller', function($scope, $http) {
  
});

async function getdata(){
  if(global_date_from==getspecDate() && global_date_to==getspecDate()){
    var result = await fetchdata("today",global_date_from,global_date_to);        //row wise data
    var temp_data={};
    var neutral_list=[];
    var voltage_time_list=[];
    var neutral_time_list=[];
    var y_axis_voltage=[];
    var y_axis_neutral=[];
    var voltage_legend=[];
    var neutral_legend=[];
    
    for (var i=0;i<global_data.length;i++){
      if(i!=global_data.length-1){
        voltage_legend.push(global_data[i]);
        y_axis_voltage.push({
          name: global_data[i],
          type: 'line',
          areaStyle: {},
          data: [0, 0, 0, 0]
      });
      }else{
        neutral_legend.push(global_data[i]);
        y_axis_neutral.push({
          name: global_data[i],
          type: 'line',
          areaStyle: {},
          data: [0, 0, 0, 0]
      });
      }
      temp_data[global_data[i]]=[];
    }

    option_line_voltages.legend.data=voltage_legend;
    option_line_voltages.series=y_axis_voltage;
    option_neutral_voltages.legend.data=neutral_legend;
    option_neutral_voltages.series=y_axis_neutral;

    if(Object.size(result)>0){
      for (var j=0;j<result.length;j++){
        var voltage_flag=false;
        var neutral_flag=false;
        for (var i=0;i<global_data.length;i++){
          if(i==global_data.length-1){
            if(result[j][global_data[i]]){
              neutral_list.push(result[j][global_data[i]]);
              neutral_flag=true;
            }else{
              neutral_flag=false;
            }

          }else{
            if(result[j][global_data[i]]){
              temp_data[global_data[i]].push(result[j][global_data[i]]);
              voltage_flag=true;
            }else{
              voltage_flag=false;

            }

          }
        }
        if(voltage_flag){
          voltage_time_list.push(result[j]["time"].substring(0,5));
        }
        if(neutral_flag){
          neutral_time_list.push(result[j]["time"].substring(0,5));
        }

    }
    
    for (var i=0;i<global_data.length;i++){
      document.getElementById("last_updated").innerHTML="Last Updated : " + result[Object.size(result)-1]["date"] +" "+ result[Object.size(result)-1]["time"];
      if(result[Object.size(result)-1][global_data[i]]){
        document.getElementById(global_data[i]).innerHTML=result[Object.size(result)-1][global_data[i]] ;     //update latest data into tiles
      }
    }


    for (var i=0;i<global_data.length-1;i++){
      option_line_voltages["series"][i]["data"]=temp_data[global_data[i]];  
      }
    option_line_voltages["xAxis"][0]["data"]=voltage_time_list;
    line_voltage_chart.setOption(option_line_voltages);


    option_neutral_voltages["series"][0]["data"]=neutral_list;
    option_neutral_voltages["xAxis"][0]["data"]=neutral_time_list;
    neutral_chart.setOption(option_neutral_voltages);
    

  }else{
    for (var i=0;i<global_data.length;i++){
      
      document.getElementById(global_data[i]).innerHTML="0.00";
    }
    }
 
  }else if(global_date_from==Date.parse("yesterday").toString("yyyy-MM-dd") && global_date_to==Date.parse("yesterday").toString("yyyy-MM-dd")){
    var result = await fetchdata("yesterday",global_date_from,global_date_to);
    var temp_data={
    };
    var neutral_list=[];
    var voltage_time_list=[];
    var neutral_time_list=[];
    
    for (var i=0;i<global_data.length;i++){
      temp_data[global_data[i]]=[];
    }
    if(Object.size(result)>0){
    
      for (var i=0;i<global_data.length;i++){
        document.getElementById(global_data[i]).innerHTML=result["AVG"][global_data[i]];
      }
      for (var j=0;j<result["Overall"].length;j++){
        var voltage_flag=false;
        var neutral_flag=false;
        for (var i=0;i<global_data.length;i++){
          if(i==global_data.length-1){
            if(result["Overall"][j][global_data[i]]){
              neutral_list.push(result["Overall"][j][global_data[i]]);
              neutral_flag=true;
            }else{
              neutral_flag=false;
            }

          }else{
            if(result["Overall"][j][global_data[i]]){
              temp_data[global_data[i]].push(result["Overall"][j][global_data[i]]);
              voltage_flag=true;
            }else{
              voltage_flag=false;
            }

          }
        }
        if(voltage_flag){
          voltage_time_list.push(result["Overall"][j]["time"].substring(0,5));

        }
        if(neutral_flag){
          neutral_time_list.push(result["Overall"][j]["time"].substring(0,5));

        }
    }
    for (var i=0;i<global_data.length-1;i++){
      option_line_voltages["series"][i]["data"]=temp_data[global_data[i]];   
     }
    
    option_line_voltages["xAxis"][0]["data"]=voltage_time_list;
    line_voltage_chart.setOption(option_line_voltages);


    option_neutral_voltages["series"][0]["data"]=neutral_list;
    option_neutral_voltages["xAxis"][0]["data"]=neutral_time_list;
    neutral_chart.setOption(option_neutral_voltages);
    
    }else{
      for (var i=0;i<global_data.length;i++){
        document.getElementById(global_data[i]).innerHTML="0.00";
      }
      }
  }else{
    var result = await fetchdata("others",global_date_from,global_date_to);
    var temp_data={};
    var neutral_list=[];
    var timelist=[];
    for (var i=0;i<global_data.length;i++){
      temp_data[global_data[i]]=[];
    }
    if(Object.size(result)>0){

      for (var i=0;i<global_data.length;i++){
        document.getElementById(global_data[i]).innerHTML=result["AVG"][global_data[i]];
      }

      for (var j=0;j<result["date_avg"].length;j++){
        for (var i=0;i<global_data.length;i++){
          if(i==global_data.length-1){
            neutral_list.push((result["date_avg"][j]["AVG("+global_data[i]+")"]).toFixed(2));

          }else{
            temp_data[global_data[i]].push((result["date_avg"][j]["AVG("+global_data[i]+")"]).toFixed(2));
          }
         
        }
        timelist.push(result["date_avg"][j]["date"]);
    }

    for (var i=0;i<global_data.length-1;i++){
      option_line_voltages["series"][i]["data"]=temp_data[global_data[i]];  
      }
      option_line_voltages["xAxis"][0]["data"]=timelist;
      line_voltage_chart.setOption(option_line_voltages);

      option_neutral_voltages["series"][0]["data"]=neutral_list;
      option_neutral_voltages["xAxis"][0]["data"]=timelist;
      neutral_chart.setOption(option_neutral_voltages);
      
    }else{
      for (var i=0;i<global_data.length;i++){
        document.getElementById(global_data[i]).innerHTML="0.00";
      }
      }
  }

}

setInterval(function(){ 

  getdata(); 
},1000);


  function logout(){
    //logout function to logout the user and redirect the user to the login screen
     
               $.ajax({
                    type: "GET",
                    url: "/voltage_metering_logout",
                    cache: false,
                    success: function(result) {
                      window.location=result;       //redirect the user to the login screen and ending the session
                     } 
                      
              });
             
      }

   