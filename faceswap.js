
/**
 * @file faceswap.js
 * @author David Landeros (dh.landeros08@gmail.com)
 * @date 8/Jan/2018
 */

/** @class ImageManipulator 
  * @desc encapsulates the drag and drop component
  */
function ImageManipulator(id, canvas, ctx, onloadCallback)
{
	this.canvas = canvas;
	this.ctx = ctx;
	this.onloadCallback = onloadCallback;
	this.img = new Image();
	var self = this;
	var c = $("#" + id);
	c.on('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    c.on('drop', function (e) {
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
        var reader = new FileReader();
        reader.onload = function(data){
            self.img.src = data.target.result;
            self.img.onload = function(){
            	//self.canvas.width = self.img.width;
            	self.ctx = self.canvas.getContext("2d");
            	self.ctx.clearRect(0,0,1000,1000);
                self.ctx.drawImage(self.img, 0, 0);
                self.canvas.style.opacity = 1.0;
                self.onloadCallback();
            };
        };
        reader.readAsDataURL(files[0]);
    });
}

/** @method getImage
  * @desc returns the user loaded image
  */
ImageManipulator.prototype.getImage = function(){
	return this.img;
};

/** @method searchFaces
  * @desc searches faces in the user image
  */
ImageManipulator.prototype.searchFaces = function(readyCallback){
	var self = this;
	$(this.img).faceDetection({
        complete: function (faces) {
            if(faces) {
            	self.faces = faces;
                readyCallback(faces);
            }
        }
    });
}

/** @method getFaces
  * @desc returns the found faces
  */
ImageManipulator.prototype.getFaces = function(){
	return this.faces;
}

/** @function print
  * @desc prints a message in the console log
  */
function print(str)
{
	document.querySelector(".console").innerHTML += str + "<br>";
}

/** Entry point of the program
  */
var canvas1 = document.querySelector("#pic1");
var canvas2 = document.querySelector("#pic2");
var img1 = new Image();
var img2 = new Image();
var ctx1 = canvas1.getContext("2d");
var ctx2 = canvas2.getContext("2d");

var face1 = false;
var face2 = false;

print("[+] waiting for images to be loaded ... ");

var imgManip = new ImageManipulator("pic1", canvas1, ctx1, function(){
    print("[+] Iimage 1 loaded");
    imgManip.searchFaces(function(faces){
    	print("[+] " + faces.length + " faces detected");
    	if(faces.length > 0)
    	    face1 = true;
    	ctx1.strokeStyle = "red";
    	ctx1.lineWidth = 4;
    	//ctx1.strokeRect(faces[0].x, faces[0].y, faces[0].width, faces[0].height);
    	swap();
    });
});

var imgManip2 = new ImageManipulator("pic2", canvas2, ctx2, function(){
    print("[+] Iimage 2 loaded");
    imgManip2.searchFaces(function(faces){
    	print("[+] " + faces.length + " faces detected");
    	if(faces.length > 0)
    	    face2 = true;
    	ctx2.strokeStyle = "red";
    	ctx2.lineWidth = 4;
    	//ctx2.strokeRect(faces[0].x, faces[0].y, faces[0].width, faces[0].height);
    	swap();
    });
});


function swap()
{
    ctx1 = canvas1.getContext("2d");
    ctx2 = canvas2.getContext("2d");
    if(face1 && face2)
    {
        var imgface1 = imgManip.getImage();
        var imgface2 = imgManip2.getImage();
        var slot1 = imgManip.getFaces()[0];
        var slot2 = imgManip2.getFaces()[0];

        createTexture(ctx1, imgface2, slot2.x, slot2.y, slot2.width, slot2.height, function(pattern){
          ctx1.fillStyle = pattern;
          var scale = slot1.width / slot2.width;
          ctx1.beginPath();
          ctx1.arc((slot1.x + (slot1.width>>1)) , (slot1.y + (slot1.height>>1)), (slot1.width/2), 0, Math.PI * 2);
          ctx1.clip();
          ctx1.globalAlpha = 0.7;
          ctx1.drawImage(imgface2, slot2.x, slot2.y, slot2.width, slot2.height,  slot1.x, slot1.y, slot1.width, slot1.height);
          ctx1.globalAlpha = 1.0;
        });

        createTexture(ctx2, imgface1, slot1.x, slot1.y, slot1.width, slot1.height, function(pattern){
          ctx2.fillStyle = pattern;
          var scale = slot2.width / slot1.width;
          ctx2.beginPath();
          ctx2.arc((slot2.x + (slot2.width>>1)) , (slot2.y + (slot2.height>>1)), (slot2.width/2), 0, Math.PI * 2);
          ctx2.clip();
          ctx2.globalAlpha = 0.7;
          ctx2.drawImage(imgface1, slot1.x, slot1.y, slot1.width, slot1.height,  slot2.x, slot2.y, slot2.width, slot2.height);
          ctx2.globalAlpha = 1.0;
        });

        //ctx1.drawImage(imgface2, slot2.x, slot2.y, slot2.width, slot2.height,  slot1.x, slot1.y, slot1.width, slot1.height);
        //ctx2.drawImage(imgface1, slot1.x, slot1.y, slot1.width, slot1.height,  slot2.x, slot2.y, slot2.width, slot2.height);
    }
}

function createTexture(ctx, img, x,y,w,h, readyCallback)
{
	var c = document.createElement("canvas");
	c.width = w;
	c.height = h;
	var _ctx = c.getContext("2d");
	_ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
	var newImage = new Image();
	newImage.src = c.toDataURL();
	newImage.onload = function(){
	    readyCallback(ctx.createPattern(newImage, "repeat"));
	}
}