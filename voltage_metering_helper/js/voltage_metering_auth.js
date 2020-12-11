$(document).ready(function(){
    $(".container").fadeIn(1000);
    $(".s2class").css({"color":"#EE9BA3"});
    $(".s1class").css({"color":"#748194"}); 
    $("#left").removeClass("left_hover");
    $("#right").addClass("right_hover");
    $("#left").click();
    $(".signin").css({"display":""});
 });

 $("#left").click(function(){
    $(".s1class").css({"color":"#EE9BA3"});
    $(".s2class").css({"color":"#748194"}); 
    $("#right").removeClass("right_hover");
    $("#left").addClass("left_hover");
    $(".signup").css({"display":"none"});
    $(".signin").css({"display":""});
 });

 