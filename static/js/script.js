const camera=document.getElementById("camera");

const confidence=document.getElementById("confidence");

const fps=document.getElementById("fps");

const object=document.getElementById("object");

const start=document.getElementById("start");

const stop=document.getElementById("stop");


start.onclick=()=>{

    fetch("/start_camera")
    .then(()=>{

        camera.src="/video";

    });

};


stop.onclick=()=>{

    fetch("/stop_camera")
    .then(()=>{

        camera.src="";

    });

};


setInterval(()=>{

    fetch("/status")

    .then(res=>res.json())

    .then(data=>{

        confidence.innerHTML=data.confidence+" %";

        fps.innerHTML=data.fps;

        object.innerHTML=data.object;

    });

},300);