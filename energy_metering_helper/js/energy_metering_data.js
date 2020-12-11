(function ($) {
  'use strict';
  $(function () {
    
    
    function returntime(seconds){
      var seconds = parseInt(seconds, 10);
      var days = Math.floor(seconds / (3600*24));
      seconds  -= days*3600*24;
      var hrs   = Math.floor(seconds / 3600);
      seconds  -= hrs*3600;
      var mnts = Math.floor(seconds / 60);
      seconds  -= mnts*60;
      return (days+" days, "+hrs+" Hrs, "+mnts+" Minutes, "+seconds+" Seconds")
    }
    var selected_db =new URL(window.location.href).searchParams.get('id');
    var linecharts={};
   
    function fetchdata(type,datefrom,dateto){
      if(selected_db){
        return new Promise(function(resolve,reject){
  
          var data={ type:type,date_from: datefrom , date_to: dateto,site_id:selected_db};
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
}
function graphdata(type,variable){
  if(selected_db){
    return new Promise(function(resolve,reject){

      var data={type:type,site_id:selected_db,start_date:graph_date_from,end_date:graph_date_to,year:document.getElementById("year").value,
    variable: variable};
      var temp;
                 $.ajax({
                      type: "POST",         
                      async: false,         
                      url: "/energy_metering_data",
                      data: data,
                      success: function(result) {
                        temp= result;
                       } 
                        
                });
               resolve(temp)
      }) 
  }
}
function getvardata(){
  if(selected_db){
    return new Promise(function(resolve,reject){

      var data={site_id:selected_db};
      var temp;
                 $.ajax({
                      type: "PUT",         
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
}

var global_date_to;
var global_date_from;
   var graph_date_to;
   var graph_date_from;

            
  var start = moment();
  var end = moment();
  var start_date =moment().startOf('month');
  var   end_date = moment().endOf('month');
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

  
  function cb_change_date(start_date, end_date) {
      
    graph_date_from=start_date.format('YYYY-MM-DD');
    graph_date_to=end_date.format('YYYY-MM-DD');
    $('#dayrange span').html(start_date.format('MMMM,DD,YYYY') + '-' + end_date.format('MMMM,DD,YYYY'));
    
}

$('#dayrange').daterangepicker({
   "maxSpan": {
        "days": 30
    },
    startDate: start_date,
    endDate: end_date,
    "locale": {
      "separator": " - ",
      "applyLabel": "Apply",
      "cancelLabel": "Cancel",
      "fromLabel": "From",
      "toLabel": "To",
      "customRangeLabel": "Custom",
      "weekLabel": "W",
      },

    ranges: {
       'This Month': [moment().startOf('month'), moment().endOf('month')],
       'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
}, cb_change_date);

cb(start, end);
cb_change_date(start_date,end_date);


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

    var lineStatsOptions = {
      scales: {
        yAxes: [{
          display: true
        }],
        xAxes: [{
          display: false
        }]
      },
      legend: {
        display: false
      },
      elements: {
        point: {
          radius: 0
        },
        line: {
          tension: 0
        }
      },
      stepsize: 100
    }



    var app = angular.module('energy_app', []);

    

    app.controller('profile_controller', function($scope, $http) {

      $http.get("/get_profile_info")
      .then(function(response) {
        $scope.image=response.data[0]["image"];
        $scope.username=response.data[0]["Username"];
        $scope.role=response.data[0]["role"];
        $scope.email=response.data[0]["email"]
      });
    });
    app.controller('id_status', function($scope, $http,$interval) {
      $interval(function(){
      $http.put("/voltage_metering_data",{reporting_flag:"0",site_id:selected_db})
      .then(function(response) {
        $scope.site_name=response.data[0]["site_name"];
        if(response.data[0]["status"]=="Active"){
          $scope.status="bg-success";
        }else{
          $scope.status="bg-danger";
        }
        $scope.location=response.data[0]["location"];
        $scope.site_id=selected_db;
      });
    },2000);
    });

    app.controller('active_controller', function($scope, $http,$interval) {

      $interval(function(){
        $http.post("/active_inactive",{type:"active"})
        .then(function(response) {
        $scope.actives=response.data;
        
        });
      },5000);
     
    });
    app.controller('inactive_controller', function($scope, $http,$interval) {
      $interval(function(){
        $http.post("/active_inactive",{type:"inactive"})
      .then(function(response) {
        $scope.inactives=response.data;
      });
      },1000);
      
    });

    app.controller('vars_controller', function($scope, $http,$interval) {
      $scope.data;
      $http.put("/voltage_metering_vars",{site_id:selected_db})
      .then(function(response) {
        $scope.vars=response.data;
        init_charts();
      });
    });



    async function init_charts(){
      var vardata= await getvardata();
      for (var i=0;i<vardata.length;i++){
        linecharts[vardata[i]["var_name"]]=null;
          var lineChartCanvas = $("#chart_"+vardata[i]["var_name"]).get(0).getContext("2d");
          var gradientStrokeFill_1 = lineChartCanvas.createLinearGradient(0, 0, 0, 50);
          gradientStrokeFill_1.addColorStop(0, 'rgba(255, 1, 255, 0.5)');
          gradientStrokeFill_1.addColorStop(1, '#fff');
          var lineChart = new Chart(lineChartCanvas, {
            type: 'line',
            data: {
              labels: [],
              datasets: [{
                label: vardata[i]["var_name"],
                data: [],
                borderColor: '#6087eb',
                backgroundColor: gradientStrokeFill_1,
                borderWidth: 3,
                fill: true
              }]
            },
            options: lineStatsOptions
          });
          linecharts[vardata[i]["var_name"]]=lineChart;
      }
    }

    async function set_graph_data(){
      if(selected_db){
      var result_month = await graphdata("month","KWH"); 
      var result_year = await graphdata("year","KWH");    
        
      var today=moment().format("YYYY-MM-DD");   
      var today_val;
      var yesterday_val;
      var month_val;
      var prev_month_val;
     
      var yesterday=moment().subtract(1, 'days').format("YYYY-MM-DD");
      var thismonth=moment().format("MMMM").substring(0,3);
      var prevmonth=moment().subtract(1, 'month').format("MMMM").substring(0,3);
      monthbarChart.data.datasets[0].data=[];
      yearbarChart.data.datasets[0].data=[];
      monthbarChart.data.labels=[];
      yearbarChart.data.labels=[];
      for(var i=0;i<result_month.length;i++){
        monthbarChart.data.labels.push(result_month[i]["date"].substring(0,10));
        if(result_month[i]["date"].substring(0,10)==today){
          document.getElementById("today_value").textContent=result_month[i]["diff"] + "  kWh";
          today_val=parseFloat(result_month[i]["diff"]);
        }else if(result_month[i]["date"].substring(0,10)==yesterday){
          yesterday_val=parseFloat(result_month[i]["diff"]);
        }
        monthbarChart.data.datasets[0].data.push(result_month[i]["diff"]);
      }
      for(var i=result_year.length-1;i>=0;i--){
        yearbarChart.data.labels.push(result_year[i]["month_name"].substring(0,3));
        if(result_year[i]["month_name"].substring(0,3)==thismonth){
          document.getElementById("month_value").textContent=result_year[i]["diff"] + "  kWh";
          month_val=parseFloat(result_year[i]["diff"]);
        }else if(result_year[i]["month_name"].substring(0,3)==prevmonth){
          prev_month_val=parseFloat(result_year[i]["diff"]);
        }
        yearbarChart.data.datasets[0].data.push(result_year[i]["diff"]);
      }
      var temp=(((today_val-yesterday_val)/yesterday_val)*100).toFixed(2);
      var temp1=(((month_val-prev_month_val)/prev_month_val)*100).toFixed(2);
      document.getElementById("today_percent").textContent= temp>0 ? "+"+temp+"%" : temp+"%";
      document.getElementById("month_percent").textContent= temp1>0 ? "+"+temp1+"%" : temp1+"%";

      
      monthbarChart.update();
      yearbarChart.update();
    }
    }

    async function set_grid_data(){
      var result_month_grid = await graphdata("month","grid_day"); 
      var result_year_grid= await graphdata("year","grid_day");  
      var today_val_grid;
      var yesterday_val_grid;
      var month_val_grid;
      var prev_month_val_grid;
      var today=moment().format("YYYY-MM-DD");   
      var yesterday=moment().subtract(1, 'days').format("YYYY-MM-DD");
      var thismonth=moment().format("MMMM").substring(0,3);
      var prevmonth=moment().subtract(1, 'month').format("MMMM").substring(0,3);
      for(var i=0;i<result_month_grid.length;i++){
        if(result_month_grid[i]["date"].substring(0,10)==today){
          document.getElementById("today_grid_value").textContent=returntime(result_month_grid[i]["diff"]);
          today_val_grid=parseFloat(result_month_grid[i]["diff"]);
        }else if(result_month_grid[i]["date"].substring(0,10)==yesterday){
          yesterday_val_grid=parseFloat(result_month_grid[i]["diff"]);
        }
      }
      for(var i=result_year_grid.length-1;i>=0;i--){
        if(result_year_grid[i]["month_name"].substring(0,3)==thismonth){
          document.getElementById("month_grid_value").textContent=returntime(result_year_grid[i]["diff"]);
          month_val_grid=parseFloat(result_year_grid[i]["diff"]);
        }else if(result_year_grid[i]["month_name"].substring(0,3)==prevmonth){
          prev_month_val_grid=parseFloat(result_year_grid[i]["diff"]);
        }
      }
      var temp=(((today_val_grid-yesterday_val_grid)/yesterday_val_grid)*100).toFixed(2);
      var temp1=(((month_val_grid-prev_month_val_grid)/prev_month_val_grid)*100).toFixed(2);
      document.getElementById("today_grid_percent").textContent= temp>0 ? "+"+temp+"%" : temp+"%";
      document.getElementById("month_grid_percent").textContent= temp1>0 ? "+"+temp1+"%" : temp1+"%";
    }

    async function fetch_update_data(){
      if(selected_db){
        var vardata=await getvardata();
        var data={};
        var labels={};
        if(global_date_from==getspecDate() && global_date_to==getspecDate()){
          var result = await fetchdata("today",global_date_from,global_date_to);        //row wise data
          for (var i=0;i<vardata.length;i++){
            data[vardata[i]["var_name"]] =[];
            labels[vardata[i]["var_name"]] =[];
          }
          active_power_chart.data.datasets[0].data=[];
            for (var jjj=0;jjj<result.length;jjj++){
              for (var i=0;i<vardata.length;i++){
                if(result[jjj][vardata[i]["var_name"]]!=null){
                  data[vardata[i]["var_name"]].push(parseFloat(result[jjj][vardata[i]["var_name"]])) ;
                  labels[vardata[i]["var_name"]].push(result[jjj]["time"].substring(0,5));
                  document.getElementById("data_"+vardata[i]["var_name"]).textContent=result[jjj][vardata[i]["var_name"]];
                }
              }
              if(result[jjj]["KW"] !=null){

                document.getElementById("active_power_data").textContent=result[jjj]["KW"]+" kW";
              }
              if(result[jjj]["I1"]!=null){
                document.getElementById("chart_text_i1").textContent=result[jjj]["I1"]+" A";
              }
              if(result[jjj]["I2"]!=null){
                document.getElementById("chart_text_i2").textContent=result[jjj]["I2"]+" A";
              }
              if(result[jjj]["I3"]!=null){
                document.getElementById("chart_text_i3").textContent=result[jjj]["I3"]+" A";
              }
            }
            if(result.length==0){
              for (var i=0;i<vardata.length;i++){
                  document.getElementById("data_"+vardata[i]["var_name"]).textContent="-";
              }
                document.getElementById("active_power_data").textContent="-";
                document.getElementById("chart_text_i1").textContent="-";
                document.getElementById("chart_text_i2").textContent="-";
                document.getElementById("chart_text_i3").textContent="-";
        }
        }else if(global_date_from==Date.parse("yesterday").toString("yyyy-MM-dd") && global_date_to==Date.parse("yesterday").toString("yyyy-MM-dd")){
          var result = await fetchdata("yesterday",global_date_from,global_date_to);      
          for (var i=0;i<vardata.length;i++){
            data[vardata[i]["var_name"]] =[];
            labels[vardata[i]["var_name"]] =[];
          }
          active_power_chart.data.datasets[0].data=[];
            for (var jjj=0;jjj<result["Overall"].length;jjj++){
              for (var i=0;i<vardata.length;i++){
                if(result["Overall"][jjj][vardata[i]["var_name"]]!=null){
                  data[vardata[i]["var_name"]].push(parseFloat(result["Overall"][jjj][vardata[i]["var_name"]])) ;
                  labels[vardata[i]["var_name"]].push(result["Overall"][jjj]["time"].substring(0,5));
                  document.getElementById("data_"+vardata[i]["var_name"]).textContent=result["AVG"][vardata[i]["var_name"]];
                }
              }
              if(result["AVG"]["KW"]!=null){
                document.getElementById("active_power_data").textContent=result["AVG"]["KW"]+" kW";
              }
              if(result["AVG"]["I1"]!=null){
                document.getElementById("chart_text_i1").textContent=result["AVG"]["I1"]+" A";
              }
              if(result["AVG"]["I2"]!=null){
                document.getElementById("chart_text_i2").textContent=result["AVG"]["I2"]+" A";
              }
              if(result["AVG"]["I3"]!=null){
                document.getElementById("chart_text_i3").textContent=result["AVG"]["I3"]+" A";
              }
            }
            if(result.length==0){
              for (var i=0;i<vardata.length;i++){
                  document.getElementById("data_"+vardata[i]["var_name"]).textContent="-";
              }
              document.getElementById("active_power_data").textContent="-";
              document.getElementById("chart_text_i1").textContent="-";
              document.getElementById("chart_text_i2").textContent="-";
              document.getElementById("chart_text_i3").textContent="-";
        }
        }
        else{
          var result = await fetchdata("others",global_date_from,global_date_to);
          for (var i=0;i<vardata.length;i++){
            data[vardata[i]["var_name"]] =[];
            labels[vardata[i]["var_name"]] =[];
          }
          active_power_chart.data.datasets[0].data=[];
            for (var jjj=0;jjj<result["date_avg"].length;jjj++){
              for (var i=0;i<vardata.length;i++){
                if(result["date_avg"][jjj]["AVG("+vardata[i]["var_name"]+")"]!=null){
                  data[vardata[i]["var_name"]].push(parseFloat(result["date_avg"][jjj]["AVG("+vardata[i]["var_name"]+")"]).toFixed(2)) ;
                  labels[vardata[i]["var_name"]].push(result["date_avg"][jjj]["date"].substring(0,10));
                  document.getElementById("data_"+vardata[i]["var_name"]).textContent=parseFloat(result["AVG"][vardata[i]["var_name"]])   .toFixed(2);
                }
              }
              if(result["AVG"]["KW"]!=null){
                document.getElementById("active_power_data").textContent=result["AVG"]["KW"]+" kW";
              }
              if(result["AVG"]["I1"]!=null){
                document.getElementById("chart_text_i1").textContent=result["AVG"]["I1"]+" A";
              }
              if(result["AVG"]["I2"]!=null){
                document.getElementById("chart_text_i2").textContent=result["AVG"]["I2"]+" A";
              }
              if(result["AVG"]["I3"]!=null){
                document.getElementById("chart_text_i3").textContent=result["AVG"]["I3"]+" A";
              }
  
            }
            if(result.length==0){
              for (var i=0;i<vardata.length;i++){
                  document.getElementById("data_"+vardata[i]["var_name"]).textContent="-";
              }
              document.getElementById("active_power_data").textContent="-";
              document.getElementById("chart_text_i1").textContent="-";
              document.getElementById("chart_text_i2").textContent="-";
              document.getElementById("chart_text_i3").textContent="-";
        }
  
        }
        for (var i=0;i<vardata.length;i++){
          linecharts[vardata[i]["var_name"]].data.datasets[0].data=data[vardata[i]["var_name"]];
          linecharts[vardata[i]["var_name"]].data.labels=labels[vardata[i]["var_name"]];
          linecharts[vardata[i]["var_name"]].update();
        }
        active_power_chart.data.datasets[0].data=data["KW"];
        active_power_chart.data.labels=labels["KW"];
        currentChart.data.datasets[0].data=data["I1"];
        currentChart.data.datasets[1].data=data["I2"];
        currentChart.data.datasets[2].data=data["I3"];
        currentChart.data.labels=labels["I1"];
        active_power_chart.update();
        currentChart.update();
  
      }
   
    }



    setInterval(function (){
      fetch_update_data();
      set_graph_data();
      set_grid_data();
    },4000);

    
    
    if ($('#active-power-overview').length) {
      var active_power = $("#active-power-overview").get(0).getContext("2d");
      var gradientStrokeFill_1 = active_power.createLinearGradient(0, 0, 0, 450);
      gradientStrokeFill_1.addColorStop(1, 'rgba(255,255,255, 0.0)');
      gradientStrokeFill_1.addColorStop(0, 'rgba(102,78,235, 0.2)');

     
      var areaData = {
        labels: [],
        datasets: [{
          label: 'Active Power',
          data: [],
          borderColor: infoColor,
          backgroundColor: gradientStrokeFill_1,
          borderWidth: 2
        }]
      };
      var areaOptions = {
        responsive: true,
        animation: {
          animateScale: true,
          animateRotate: true
        },
        elements: {
          point: {
            radius: 3,
            backgroundColor: "#fff"
          },
          line: {
            tension: 0
          }
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }
        },
        legend: false,
        legendCallback: function (chart) {
          var text = [];
          text.push('<div class="chartjs-legend"><ul>');
          for (var i = 0; i < chart.data.datasets.length; i++) {
            text.push('<li>');
            text.push('<span style="background-color:' + chart.data.datasets[i].borderColor + '">' + '</span>');
            text.push(chart.data.datasets[i].label);
            text.push('</li>');
          }
          text.push('</ul></div>');
          return text.join("");
        },
        scales: {
          xAxes: [{
            display: true,
            ticks: {
              display: true,
              beginAtZero: false
            },
            gridLines: {
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: {
              max: 200,
              min: 0,
              stepSize: 50,
              fontColor: "#858585",
              beginAtZero: false
            },
            gridLines: {
              color: '#e2e6ec',
              display: true,
              drawBorder: false
            }
          }]
        }
      }
      var active_power_chart = new Chart(active_power, {
        type: 'line',
        data: areaData,
        options: areaOptions
      });
      document.getElementById('active-power-legend').innerHTML = active_power_chart.generateLegend();

      if ($('#current-overview').length) {
        var currentChartCanvas = $("#current-overview").get(0).getContext("2d");
        var gradientStrokeFill_1 = currentChartCanvas.createLinearGradient(0, 0, 0, 450);
        gradientStrokeFill_1.addColorStop(1, 'rgba(255,255,255, 0.0)');
        gradientStrokeFill_1.addColorStop(0, 'rgba(102,78,235, 0.2)');
        var gradientStrokeFill_2 = currentChartCanvas.createLinearGradient(0, 0, 0, 400);
        gradientStrokeFill_2.addColorStop(1, 'rgba(255, 255, 255, 0.01)');
        gradientStrokeFill_2.addColorStop(0, '#14c671');
        var gradientStrokeFill_3 = currentChartCanvas.createLinearGradient(0, 0, 0, 350);
        gradientStrokeFill_3.addColorStop(1, 'rgba(255, 43, 255, 0.06)');
        gradientStrokeFill_3.addColorStop(0, '#17cd71');
      
        var areaData = {
          labels: [],
          datasets: [{
            label: 'I1',
            data: [],
            borderColor: infoColor,
            backgroundColor: gradientStrokeFill_1,
            borderWidth: 2
          }, {
            label: 'I2',
            data: [],
            borderColor: successColor,
            backgroundColor: gradientStrokeFill_2,
            borderWidth: 2
          },{
            label: 'I3',
            data: [],
            borderColor: dangerColor,
            backgroundColor: gradientStrokeFill_3,
            borderWidth: 2
          }]
        };
        var areaOptions = {
          responsive: true,
          animation: {
            animateScale: true,
            animateRotate: true
          },
          elements: {
            point: {
              radius: 3,
              backgroundColor: "#fff"
            },
            line: {
              tension: 0
            }
          },
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }
          },
          legend: false,
          legendCallback: function (chart) {
            var text = [];
            text.push('<div class="chartjs-legend"><ul>');
            for (var i = 0; i < chart.data.datasets.length; i++) {
              text.push('<li>');
              text.push('<span style="background-color:' + chart.data.datasets[i].borderColor + '">' + '</span>');
              text.push(chart.data.datasets[i].label);
              text.push('</li>');
            }
            text.push('</ul></div>');
            return text.join("");
          },
          scales: {
            xAxes: [{
              display: true,
              ticks: {
                display: true,
                beginAtZero: false
              },
              gridLines: {
                drawBorder: false
              }
            }],
            yAxes: [{
              stacked: true,
              ticks: {
                max: 200,
                min: 0,
                stepSize: 50,
                fontColor: "#858585",
                beginAtZero: false
              },
              gridLines: {
                color: '#e2e6ec',
                display: true,
                drawBorder: false
              }
            }]
          }
        }
      }
        var currentChart = new Chart(currentChartCanvas, {
          type: 'line',
          data: areaData,
          options: areaOptions
        });
        document.getElementById('current-chart-legend').innerHTML = currentChart.generateLegend();
      }

    if ($("#month_barChart").length) {
      var barChartCanvas = $("#month_barChart").get(0).getContext("2d");
      var monthbarChart = new Chart(barChartCanvas, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Power',
            data: [],
            backgroundColor: ChartColor[2],
            borderColor: ChartColor[2],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }
          },
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Dates',
                fontSize: 12,
                lineHeight: 2
              },
              ticks: {
                fontColor: "#000000",               
                autoSkip: true,
                autoSkipPadding: 15,
                maxRotation: 0,
              },
              gridLines: {
                display: false,
                drawBorder: false,
                color: 'transparent',
                zeroLineColor: '#eeeeee'
              }
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Month\'s Consumption',
                fontSize: 12,
                lineHeight: 2
              },
              ticks: {
                display: true,
                autoSkip: false,
                maxRotation: 0,
                fontColor: '#000000',
               
              },
              gridLines: {
                drawBorder: false
              }
            }]
          },
          legend: {
            display: false
          },
          legendCallback: function (chart) {
            var text = [];
            text.push('<div class="chartjs-legend"><ul>');
            for (var i = 0; i < chart.data.datasets.length; i++) {
              text.push('<li>');
              text.push('<span style="background-color:' + chart.data.datasets[i].backgroundColor + '">' + '</span>');
              text.push(chart.data.datasets[i].label);
              text.push('</li>');
            }
            text.push('</ul></div>');
            return text.join("");
          },
          elements: {
            point: {
              radius: 1
            }
          }
        }
      });
    }
    if ($("#year_barChart").length) {
      var barChartCanvas = $("#year_barChart").get(0).getContext("2d");
      var yearbarChart = new Chart(barChartCanvas, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Power',
            data: [],
            backgroundColor: ChartColor[2],
            borderColor: ChartColor[2],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }
          },
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Months',
                fontSize: 12,
                lineHeight: 2
              },
              ticks: {
                fontColor: "#000000",               
                autoSkip: true,
                autoSkipPadding: 15,
                maxRotation: 0,
              },
              gridLines: {
                display: false,
                drawBorder: false,
                color: 'transparent',
                zeroLineColor: '#eeeeee'
              }
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Year\'s Consumption',
                fontSize: 12,
                lineHeight: 2
              },
              ticks: {
                display: true,
                autoSkip: false,
                maxRotation: 0,
                fontColor: '#000000',
               
              },
              gridLines: {
                drawBorder: false
              }
            }]
          },
          legend: {
            display: false
          },
          elements: {
            point: {
              radius: 1
            }
          }
        }
      });
    }
       
  });
})(jQuery);