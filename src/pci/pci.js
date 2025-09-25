$(document).ready(function() {
    $(document).mousemove(function(e) {
        $('img').css('left',e.pageX+"px")
        $('img').css('top',e.pageY+"px")
    })
})