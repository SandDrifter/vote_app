$( document ).ready(function() {
    console.log( "JQuery works!" );
    
});

///////////////
//adding polls
///////////////
var polls = []; // create an empty array
var Id = 0;
function addPoll(){
    var newPollText = $('#newPollText').val();
    $('#pollPlace').append(`<Button id="${Id}" onclick="deleteButtonAndBreak(this.id)" class="btn btn-danger btn-block">${newPollText}</Button><br id="br${Id}">`);
    polls.push({
        key:   Id,
        text: newPollText,
        votes: 0
});
    Id++;
}

function deleteButtonAndBreak(Id){
    console.log("in deleteButtonAndBreak function");
    $("#br"+Id).remove();
    $("#"+Id).remove();
    removePoll(polls, Id);
}

function removePoll(polls, key){
    var isPollRemoved = false;
    for(var i=0;i < polls.length;i++){
        console.log("key:"+key+" poll key:"+polls[i].key);
        if(polls[i].key.toString() === key.toString()){
            polls.splice(i, 1);
            console.log("poll removed");
            isPollRemoved = true;
            break;
        }
    }
    if(!isPollRemoved){
            console.log("poll doesn't exist wut?");
        }
}

///////////////
//Posting JSON
///////////////
function postPolls(){
    console.log("inside postPolls");
    var pollTitle = $("#pollTitle").val().toString();
    console.log("pollTitle:" + pollTitle);
    $.ajax({
        url: '/createPoll', 
        type: 'POST', 
        contentType: 'application/json', 
        success: function(){
            console.log("Post request successful!");
            getPollId();
        },
        data: JSON.stringify({pollTitle:pollTitle ,polls:polls})}
)
}

var pollNumber;

function getPollId(){
    console.log("getting pol id");
    $.get( "/pollNumber", function( data ) {
        pollNumber = data.toString();
        console.log("got pollNumber:"+ data);
       // window.location =  "/poll?id=" + pollNumber;//change sites page
        console.log("post link:" + location.host + "/poll?id=" + pollNumber)
      // $("#postLink").attr('href',location.host + "/poll?id=" + pollNumber);
        var fullLink = location.host + "/poll?id=" + pollNumber;
        var link = "/poll?id=" + pollNumber;
        var s = `<a href="${link}">${fullLink}</a>`;
        $('#postLink').append(`${s}`);
        console.log("link created");
});
    
}