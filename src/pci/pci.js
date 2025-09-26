let pci = document.getElementById("pci")
let ball = document.getElementById("ball")
let ballShadow = document.getElementById("ballShadow")


let moving = false
let image = null

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

let time1
let time2
let strike = false

pci.addEventListener("mousedown", function () {
  let pciBox = pci.getBoundingClientRect()
  let ballBox = ball.getBoundingClientRect()
    if (!(pciBox.right < ballBox.left || pciBox.left > ballBox.right || pciBox.bottom < ballBox.top || pciBox.top > ballBox.bottom)) {
      time2 = performance.now() % 1000
      
      if ((time2 - time1) < 0) {
        time1 = Math.abs(time1 - 1000)
      }
      console.log(time1, time2)
      console.log("hit in " + (time2 - time1) % 1000)
    }
    else {
      console.log("miss")
      
    }
}) 

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener("keydown", async function (e) {
    if (e.code === "Space") {
        let top = getRandomInt(20, 80)
        let left = getRandomInt(20, 80)
        ballShadow.style.display = 'inline'
        ball.style.display = 'none'
        ballShadow.style.top = `${top}%`
        ballShadow.style.left = `${left}%`
        await sleep(1000)
        ball.style.display = 'inline'
        ballShadow.style.display = 'none'
        ball.style.top = `${top}%`
        ball.style.left = `${left}%`
        time1 = performance.now() % 1000
        await sleep(200)
        ball.style.display = 'none'

        if (top <= 70 && top >= 30 && left <= 70 && left >= 30) {
            strike = true
        }
        else {
            strike = false
        }
    }

})

function move(e) {
  document.body.style.cursor = "none";

  let newX = e.clientX - 10;
  let newY = e.clientY - 10;

  image.style.left = newX + "px";
  image.style.top = newY + "px";
}

function initialClick(e) {

  moving = true;
  image = this;

  document.addEventListener("mousemove", move, false);
}

pci.addEventListener("mousedown", initialClick, false);