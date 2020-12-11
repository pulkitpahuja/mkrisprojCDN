var variable_choose={};

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

var app = angular.module('reporting', []);

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
  

app.controller('myCtrl', function($scope, $http,$timeout) {
    $http.put("/voltage_metering_data",{reporting_flag:"1",type:"energy"})
    .then(function(response) {
      $scope.data=response.data;  
      $timeout(function() {
 
        var variables=[];
        
      $('#devices_table input[type=checkbox]').change(function () {
        variables=[];
        for (var i=0;i<$scope.data.length;i++){
          if ($scope.data[i]["site_id"]==this.id){
            variables=JSON.parse($scope.data[i]["vars"]);
          }
        }
        if(document.getElementById(this.id).checked){
          for (var elem in variables){
            $("#table_var_tbody").append("<tr>\
            <th scope='row'><input type='checkbox' id='checkbox."+this.id+"."+variables[elem]+"'>\
            </th>\
            <td>"+this.id+"</td><td>"+variables[elem]+"</td></tr>");
          }  
        }else{
          var rows=$("#table_var_tbody>tr");
          
            for (var i=0;i<rows.length;i++){
              if(rows[i].children[1].innerHTML==this.id){
                rows[i].remove();
              }
            }

          delete variable_choose[this.id];
        }

        $('#table_var_tbody tr input[type=checkbox]').off("change").on("change",function () {
          
          if ($(this).is(":checked")){
            console.log(this.id);
            try {
              variable_choose[this.id.split(".")[1].toString()].push(this.id.split(".")[2].toString())

            } catch (error) {
              variable_choose[this.id.split(".")[1].toString()]=[];
              variable_choose[this.id.split(".")[1].toString()].push(this.id.split(".")[2].toString())
            }
          }else{
            var index = variable_choose[this.id.split(".")[1].toString()].indexOf(this.id.split(".")[2].toString());
            variable_choose[this.id.split(".")[1].toString()].splice(index, 1);
          }
            
          });
        
        });
      }, 0);

    });
   
  });

function getaccdata(flag){
  //logout function to logout the user and redirect the user to the login screen
   
  return new Promise(function(resolve,reject){
      
    var temp;
    var data={reporting_flag:flag,type:"energy"}
               $.ajax({
                    type: "PUT",         //Data is only sent from the server in Post Method rather than GET
                    async: false,  
                    data: data,       // To allow the storage of data in a local variable
                    url: "/voltage_metering_data",
                    success: function(result) {
                      temp= result;
                     } 
                      
              });
             resolve(temp)
    }) 
           
    }

async function show_data(){
        var result=await getaccdata("1");
        console.log(result);
        setTimeout(function() {
   
          var variables=[]; 
          
        $('#devices_table input[type=checkbox]').change(function () {
          variables=[];
          for (var i=0;i<result.length;i++){
            if (result[i]["site_id"]==this.id){
              variables=JSON.parse(result[i]["vars"]);
            }
          }
          if(document.getElementById(this.id).checked){
            for (var elem in variables){
              $("#table_var_tbody").append("<tr>\
              <th scope='row'><input type='checkbox' id='checkbox."+this.id+"."+variables[elem]+"'>\
              </th>\
              <td>"+this.id+"</td><td>"+variables[elem]+"</td></tr>");
            }  
          }else{
            var rows=$("#table_var_tbody>tr");
            
              for (var i=0;i<rows.length;i++){
                if(rows[i].children[1].innerHTML==this.id){
                  rows[i].remove();
                }
              }

            delete variable_choose[this.id];
          }

          $('#table_var_tbody tr input[type=checkbox]').off("change").on("change",function () {
            
            if ($(this).is(":checked")){
              console.log(this.id);
              try {
                variable_choose[this.id.split(".")[1].toString()].push(this.id.split(".")[2].toString())

              } catch (error) {
                variable_choose[this.id.split(".")[1].toString()]=[];
                variable_choose[this.id.split(".")[1].toString()].push(this.id.split(".")[2].toString())
              }
            }else{
              var index = variable_choose[this.id.split(".")[1].toString()].indexOf(this.id.split(".")[2].toString());
              variable_choose[this.id.split(".")[1].toString()].splice(index, 1);
            }
              
            });
          
          });
        }, 0);

      }
     
show_data();

function arrayToTable(csv) {
  var data = csv;
  var lines = data.split("\n"),
      output = [],
      i;
  for (i = 0; i < lines.length; i++)
      output.push("<tr ><td style='border: 1px solid black;' >"
                  + lines[i].slice(0,-1).split(",").join("</td><td style='border: 1px solid black;' >")
                  + "</td></tr>");
  output = "<table style='border: 1px solid black;'>" + output.join("") + "</table>";
  return output;
}

function downloadpdf(){
  var interval = document.getElementById("time_interval");
  interval = interval.options[interval.selectedIndex].value;

  var function_calc = document.getElementById("function_calc");
  function_calc = function_calc.options[function_calc.selectedIndex].value;

  var start_date = document.getElementById("start_date").value;
  var end_date = document.getElementById("end_date").value;



  var data={start_date:start_date,end_date:end_date,funct:function_calc,"interval":parseInt(interval),"vars":JSON.stringify(variable_choose),"type_down":"pdf"};
  
  $.ajax({
    type: "POST",
    async: false,
    data: data,
    url: "/energy_metering_reporting",                                                                  

    success: function(result) {

        var base64str = result;
        var binary = atob(base64str.replace(/\s/g, ''));
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }

        var blob = new Blob( [view], { type: "application/pdf" });
        var link=document.createElement('a');
        link.href=window.URL.createObjectURL(blob);
        link.download="output_"+moment().format('MMMM Do YYYY, h:mm:ss a');+".pdf";
        link.click();

     } 
      
});   
}

function downloadcsv(){
  var interval = document.getElementById("time_interval");
  interval = interval.options[interval.selectedIndex].value;

  var function_calc = document.getElementById("function_calc");
  function_calc = function_calc.options[function_calc.selectedIndex].value;

  var start_date = document.getElementById("start_date").value;
  var end_date = document.getElementById("end_date").value;



  var data={start_date:start_date,end_date:end_date,funct:function_calc,"interval":parseInt(interval),"vars":JSON.stringify(variable_choose),"type_down":"csv"};

  getdownloaddata(data,false);
}

function showtable(){
  var interval = document.getElementById("time_interval");
  interval = interval.options[interval.selectedIndex].value;

  var function_calc = document.getElementById("function_calc");
  function_calc = function_calc.options[function_calc.selectedIndex].value;

  var start_date = document.getElementById("start_date").value;
  var end_date = document.getElementById("end_date").value;
  console.log(variable_choose);
  var data={start_date:start_date,end_date:end_date,funct:function_calc,"interval":parseInt(interval),"vars":JSON.stringify(variable_choose),"type_down":"csv"};

  getdownloaddata(data,true);
}



function getdownloaddata(data,table){
           
         $.ajax({
          type: "POST",
          url: "/energy_metering_reporting",
          async:false,
          data:data,
          success: function(result) {
            if(table){
              var x=window.open();
              x.document.open();
              x.document.write(arrayToTable(result));
              x.document.close();
            }else{
              var blob=new Blob([result]);
              var link=document.createElement('a');
              link.href=window.URL.createObjectURL(blob);
              link.download="test.csv";
              link.click();
            }
            

            //redirect the user to the login screen and ending the session
           } 
            
    });
           
    }
