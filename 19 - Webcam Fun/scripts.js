//small one is video element on the top 
const video = document.querySelector('.player');
//white big is canvas 
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

// we take frames from video element and paint it every 16 milliseconds on canvas
function getVideo(){
    //the way to get someone's video is using navigator
    //navigator.mediaDevices.getUserMedia({ video: true, audio: false}) this will return a promise
    navigator.mediaDevices.getUserMedia({ video: true, audio: false})
        .then(localMediaStream =>{
            //we need to set the src to be localMediaStream. But localMediaStream is an Object.
            //in order to a video to work, localMediaStream needs to be converted into some sort of URL
            video.srcObject = localMediaStream;
            video.play();

        })
        .catch(err => {
            console.error(`Oh NOOOO!!!`, err);
        });

}

//Now we need to take a frame from this video, and to paint it into the actual canvas
function paintToCanvas(){

    const width = video.videoWidth;
    const height = video.videoHeight;
    //we need to set canvas width and height same as video width and height
    canvas.width = width;
    canvas.height = height;

    //we want to paint in every 16 milliseconds, return is to stop this ctx from painting. 
    return setInterval(() => {
        //ctx.drawImage we pass a image or video and it will start from top left thats y 0, 0 with width and height
        ctx.drawImage(video, 0, 0, width, height);

        //filters works we take out the pixels, mess with the rgb values and put them back 
        //take the pixel out
        let pixels = ctx.getImageData(0, 0, width, height);

        //mess with them
        //pixels = redEffect(pixels);
        pixels = rgbSplit(pixels);

        ctx.globalAlpha = 0.8;
        //pixels = greenScreen(pixels);
        //put them back
        ctx.putImageData(pixels, 0, 0);
    }, 16);
}

function takePhoto() {
    // played the sound
    snap.currentTime = 0;
    snap.play();

    //take the data out of the canvas
    const data = canvas.toDataURL('image/jpeg'); //this will give image in text based form
    //we can create a link and an image to actually put it into our strip.
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'handsome'); //handsome means it will allow to download the image in users harddrive
    //link.textContent = 'Download Image';
    link.innerHTML = `<img src="${data}" alt="Beautiful"/>`;
    strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
    for(let i = 0; i < pixels.data.length; i+= 4) {
        pixels.data[i + 0] = pixels.data[i + 0] + 100; //RED
        pixels.data[i + 1] = pixels.data[i + 1] - 50; //GREEN
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //BLUE
    }
    return pixels;
}

function rgbSplit(pixels) {
    for(let i = 0; i < pixels.data.length; i+= 4) {
        pixels.data[i - 150] = pixels.data[i + 0]; //RED
        pixels.data[i + 500] = pixels.data[i + 1]; //GREEN
        pixels.data[i - 550] = pixels.data[i + 2]; //BLUE
    }
    return pixels;
}

function greenScreen(pixels) {
    const levels = {};
  
    document.querySelectorAll('.rgb input').forEach((input) => {
      levels[input.name] = input.value;
    });
  
    for (i = 0; i < pixels.data.length; i = i + 4) {
      red = pixels.data[i + 0];
      green = pixels.data[i + 1];
      blue = pixels.data[i + 2];
      alpha = pixels.data[i + 3];
  
      if (red >= levels.rmin
        && green >= levels.gmin
        && blue >= levels.bmin
        && red <= levels.rmax
        && green <= levels.gmax
        && blue <= levels.bmax) {
        // take it out!
        pixels.data[i + 3] = 0;
      }
    }
  
    return pixels;
  }

getVideo();

//listen event on video element calld "canplay"
video.addEventListener('canplay', paintToCanvas);
