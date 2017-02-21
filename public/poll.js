var pollNumber ;
var numberOfButtons = 0 ;
//var Chart = require('chart.js')
var forLoopFinished = false;
var isFirstChart = true;
var ctx;
 var myChart;
var labels = [];
var bgColor2 =[];
var bgColor =[
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ];
var borderColors2 = [];
var borderColors = [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ];
var numberOfVotes = [];
                
var user;
$( document ).ready(function() {
    console.log( "poll page loaded" );
  pollNumber =parseInt( $.urlParam('id') );
  
 // loadChart();
 refreshData();
 var milliseconds = 10000;
  setInterval(refreshData, milliseconds);
    console.log("pollNumber:" + pollNumber);
});

function refreshData(){
    $.get( "/pollData", function(data ) {
        $("#pollTitle").text(data.pollTitle.toString());
        user = data.user;
        console.log("user:" + user);
         labels = [];
         bgColor2 =[];
         numberOfVotes = [];
         borderColors2 = [];
        for(var i=0;i<data.polls.length;i++){
              bgColor2.push(bgColor[i]);
              borderColors2.push(borderColors[i]);
              labels.push(data.polls[i].text);
              numberOfVotes.push(data.polls[i].votes);
              numberOfButtons++;
              if(!forLoopFinished){
                $("#pollAnswers").append(`<Button id="${i}" onclick="vote(this.id)" class="btn btn-primary btn-block" >
                ${data.polls[i].text}</Button><br>`);
              }
                  
        }
        
      forLoopFinished= true;
      console.log("labels:" + labels);
      console.log("numberOfVotes:" + numberOfVotes);
      loadChart();
    });
}

function vote(btnId){
    console.log("sent poll vote:" + btnId + " pollNumber:" + pollNumber + " user:" + user);
    $.post( "/vote", { btnId:btnId, pollNumber:pollNumber, user:user }, function( data ) {
       console.log("vote successful");
       refreshData();
       destroyButtons();
    });
}

function destroyButtons(){
    for(var i=0;i<numberOfButtons;i++){
        $(`#${i}`).remove();
    }
    numberOfButtons = 0;
    $("#pollAnswers").append("<h2>Thanks for voting!</h2>");
}

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

function loadChart(){
    var ctx ;
  
     if(isFirstChart){
         isFirstChart = false;
       ctx = document.getElementById("myChart");
     }else{
   //$("#myChart").remove();
    $('#myChart').replaceWith('<canvas id="myChart" width="400" height="400"></canvas>');
   ctx = document.getElementById("myChart");
// myChart.update();
 console.log("chart updated");
   myChart.destroy();
}
        myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Votes',
                data: numberOfVotes,
                backgroundColor: bgColor2,
                borderColor: borderColors2,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            animation : false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
       

    
   
}


