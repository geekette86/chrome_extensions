# chrome_extensions
BAsic chrome extension(example)
http://youtu.be/xO6o5oYka9g
import SimpleOpenNI.*;
import java.util.*;
import processing.opengl.*; // opengl
import java.awt.*;
import blobDetection.*; // blobs
import ddf.minim.*;


SimpleOpenNI context;
//--------------------------------------
Minim minim;
AudioPlayer song;

String[] text = {
  "¦", "|", "¦", "|","¦"
}; // sample random text
String[] line = {
  "---", "__", "--", "--","----"
}; // 
String[] Point = {
  "•", "•", "•", "•","•"
}; // 
BlobDetection theBlobDetection;
int time;
int index;
color[][] palettes = {
{color(117,116,116),color(117,116,116),color(117,116,116),color(117,116,116)},
};
PImage cam, blobs;
Particle[] flow = new Particle[10000];
PolygonBlob poly = new PolygonBlob();
int x, y;
 int userCount;

int chosenPalette = 0;
int kinectWidth = 640;
float globalX, globalY;
int kinectHeight = 480;
float reScale,  reScale1;
boolean handTrackFlag = false;
int posx;
int posy;
int c;
color bgColor;
PImage img = createImage(1280, 720, RGB);
int[] userMap = null;
PVector boxCenter = new PVector(0, 0, 600); 
void setup()
{
  size(1380, 720, OPENGL);//window size
   frame.setResizable(true);
   reScale = (float) width / kinectWidth;
  
  context = new SimpleOpenNI(this); // start and enable kinect object 
  context.setMirror(true); // set mirroring object
  context.enableDepth(); // enable depth  camera
  context.enableUser(SimpleOpenNI.SKEL_PROFILE_ALL); // enable skeleton generation for all joints
 context.enableScene(); // enable scene
 context.enableRGB();
 context.enableGesture();
 context.enableHands();

  context.addGesture("RaiseHand");
    blobs = createImage(kinectWidth/3, kinectHeight/3, RGB);
    // initialize blob detection object to the blob image dimensions
    theBlobDetection = new BlobDetection(blobs.width, blobs.height);
    theBlobDetection.setThreshold(0.2);
  setupFlowfield();
  minim = new Minim(this);
  song = minim.loadFile("sound.mp3",512);
  song.play();
  song.loop();
}
 
void draw() {
  //set background to white color
  // update kinect in each frame
  context.update(); 
  
 config();
 function1();
 
}
void cfg(){

}
void config(){
 translate(0, (height-kinectHeight*reScale)/2);
 scale(reScale);
 
 drawFlowfield();
 image(context.rgbImage(), 0, 0);
   userCount = context.getNumberOfUsers(); // get number of user in scene
  if (userCount > 0) { // check if number of user is more than zero
     userMap = context.getUsersPixels(SimpleOpenNI.USERS_ALL); // get user pixles of all the users
   
}
}
void function1(){
 
  loadPixels();
  if(frameCount > 10 && frameCount <400 ){
   for ( y=0; y<context.depthHeight(); y+=5) {
    for ( x=0; x<context.depthWidth(); x+=5) {
      index = x + y * context.depthWidth();
      
      if (userMap != null && userMap[index] > 0) {
       
        textSize(10);
        text(line[int(random(0, 4))], x, y); // put your sample random text
      
             }
     
    }
  }
  }
    if(frameCount > 400 && frameCount <600 ){
   for ( y=0; y<context.depthHeight(); y+=5) {
    for ( x=0; x<context.depthWidth(); x+=5) {
      index = x + y * context.depthWidth();
      
      if (userMap != null && userMap[index] > 0) {

        textSize(10);
        text(Point[int(random(0, 4))], x, y); // put your sample random text
      
             }
     
    }
  }
  }
  if(frameCount > 600 && frameCount <800 ){
   
   for ( y=0; y<context.depthHeight(); y+=1) {
    for ( x=0; x<context.depthWidth(); x+=1) {
      index = x + y * context.depthWidth();
      
      if (userMap != null && userMap[index] > 0) {
fill(random(0, 255), random(0, 255), random(0, 255));
        textSize(10);
        text(text[int(random(0, 4))], x, y); // put your sample random text
      
             }
     
    }
  }
  }
   if(frameCount > 800 && frameCount <2000 ){
   
  for(int i=0; i<userMap.length; i++){
      if(userMap[i] != 0){
        img.pixels[i] = color(#757474);

        
      } else {
        img.pixels[i] = color(0, 0, 0);
      }
    }
  scale(reScale);
     img.resize(1280,720);
     img.updatePixels();
    image(img,0,0);
  }
   if(frameCount >2000 && frameCount <3500){
   
  for(int i=0; i<userMap.length; i++){
      if(userMap[i] != 0){
        img.pixels[i] = color( random(255), random(255), random(255), random(255)); 
        
      } else {
        img.pixels[i] = color(0, 0, 0);
      }
    }
  scale(reScale);
     img.resize(1280,720);
     img.updatePixels();
    image(img,0,0);
  }
 
}

void onNewUser(int userId) {
  println("detected" + userId);
}
void onLostUser(int userId) {
  println("lost: " + userId);
}
void setupFlowfield() {
  strokeWeight(2);
  for (int i=0; i<flow.length; i++) {
    flow[i] = new Particle(i/10000.0);   }
  setColors();
}

void drawFlowfield() {
  globalX = noise(frameCount * 0.01) * width/2 + width/4;
  globalY = noise(frameCount * 0.005 + 5) * height;
  for (Particle p : flow) {
    p.updateAndDisplay();
  }
}

void setColors() {
    color[] colorPalette = palettes[chosenPalette];
    bgColor = colorPalette[0];
    for (int i=0; i<flow.length; i++) {
      flow[i].col = colorPalette[int(random(1, colorPalette.length))];
    }
}
class Particle {
  // unique id, (previous) position, speed
  float id, x, y, xp, yp, s, d;
  color col; // color
  
  Particle(float id) {
    this.id = id;
    s = random(2, 6); // speed
  }
  
  void updateAndDisplay() {
    // let it flow, end with a new x and y position
    id += 0.01;
    d = (noise(id, x/globalY, y/globalY)-0.5)*globalX;
    x += cos(radians(d))*s;
    y += sin(radians(d))*s;
 
    // constrain to boundaries
    if (x<-10) x=xp=kinectWidth+10;
    if (x>kinectWidth+10) x=xp=-10;
    if (y<-10) y=yp=kinectHeight+10;
    if (y>kinectHeight+10) y=yp=-10;
 
    // if there is a polygon (more than 0 points)
    if (poly.npoints > 0) {
      // if this particle is outside the polygon
      if (!poly.contains(x, y)) {
        // while it is outside the polygon
        while(!poly.contains(x, y)) {
          // randomize x and y
          x = random(kinectWidth);
          y = random(kinectHeight);
        }
        // set previous x and y, to this x and y
        xp=x;
        yp=y;
      }
    }
    
    // individual particle color
    stroke(col);
    // line from previous to current position
    line(xp, yp, x, y);
    
    // set previous to current position
    xp=x;
    yp=y;
  }
}
class PolygonBlob extends Polygon {
 
  // took me some time to make this method fully self-sufficient
  // now it works quite well in creating a correct polygon from a person's blob
  // of course many thanks to v3ga, because the library already does a lot of the work
  void createPolygon() {
    // an arrayList... of arrayLists... of PVectors
    // the arrayLists of PVectors are basically the person's contours (almost but not completely in a polygon-correct order)
    ArrayList<ArrayList<PVector>> contours = new ArrayList<ArrayList<PVector>>();
    // helpful variables to keep track of the selected contour and point (start/end point)
    int selectedContour = 0;
    int selectedPoint = 0;
 
    // create contours from blobs
    // go over all the detected blobs
    for (int n=0 ; n<theBlobDetection.getBlobNb(); n++) {
      Blob b = theBlobDetection.getBlob(n);
      // for each substantial blob...
      if (b != null && b.getEdgeNb() > 100) {
        // create a new contour arrayList of PVectors
        ArrayList<PVector> contour = new ArrayList<PVector>();
        // go over all the edges in the blob
        for (int m=0; m<b.getEdgeNb(); m++) {
          // get the edgeVertices of the edge
          EdgeVertex eA = b.getEdgeVertexA(m);
          EdgeVertex eB = b.getEdgeVertexB(m);
          // if both ain't null...
          if (eA != null && eB != null) {
            // get next and previous edgeVertexA
            EdgeVertex fn = b.getEdgeVertexA((m+1) % b.getEdgeNb());
            EdgeVertex fp = b.getEdgeVertexA((max(0, m-1)));
            // calculate distance between vertexA and next and previous edgeVertexA respectively
            // positions are multiplied by kinect dimensions because the blob library returns normalized values
            float dn = dist(eA.x*kinectWidth, eA.y*kinectHeight, fn.x*kinectWidth, fn.y*kinectHeight);
            float dp = dist(eA.x*kinectWidth, eA.y*kinectHeight, fp.x*kinectWidth, fp.y*kinectHeight);
            // if either distance is bigger than 15
            if (dn > 15 || dp > 15) {
              // if the current contour size is bigger than zero
              if (contour.size() > 0) {
                // add final point
                contour.add(new PVector(eB.x*kinectWidth, eB.y*kinectHeight));
                // add current contour to the arrayList
                contours.add(contour);
                // start a new contour arrayList
                contour = new ArrayList<PVector>();
              // if the current contour size is 0 (aka it's a new list)
              } else {
                // add the point to the list
                contour.add(new PVector(eA.x*kinectWidth, eA.y*kinectHeight));
              }
            // if both distance are smaller than 15 (aka the points are close)  
            } else {
              // add the point to the list
              contour.add(new PVector(eA.x*kinectWidth, eA.y*kinectHeight));
            }
          }
        }
      }
    }
    
    // at this point in the code we have a list of contours (aka an arrayList of arrayLists of PVectors)
    // now we need to sort those contours into a correct polygon. To do this we need two things:
    // 1. The correct order of contours
    // 2. The correct direction of each contour
 
    // as long as there are contours left...    
    while (contours.size() > 0) {
      
      // find next contour
      float distance = 999999999;
      // if there are already points in the polygon
      if (npoints > 0) {
        // use the polygon's last point as a starting point
        PVector lastPoint = new PVector(xpoints[npoints-1], ypoints[npoints-1]);
        // go over all contours
        for (int i=0; i<contours.size(); i++) {
          ArrayList<PVector> c = contours.get(i);
          // get the contour's first point
          PVector fp = c.get(0);
          // get the contour's last point
          PVector lp = c.get(c.size()-1);
          // if the distance between the current contour's first point and the polygon's last point is smaller than distance
          if (fp.dist(lastPoint) < distance) {
            // set distance to this distance
            distance = fp.dist(lastPoint);
            // set this as the selected contour
            selectedContour = i;
            // set selectedPoint to 0 (which signals first point)
            selectedPoint = 0;
          }
          // if the distance between the current contour's last point and the polygon's last point is smaller than distance
          if (lp.dist(lastPoint) < distance) {
            // set distance to this distance
            distance = lp.dist(lastPoint);
            // set this as the selected contour
            selectedContour = i;
            // set selectedPoint to 1 (which signals last point)
            selectedPoint = 1;
          }
        }
      // if the polygon is still empty
      } else {
        // use a starting point in the lower-right
        PVector closestPoint = new PVector(width, height);
        // go over all contours
        for (int i=0; i<contours.size(); i++) {
          ArrayList<PVector> c = contours.get(i);
          // get the contour's first point
          PVector fp = c.get(0);
          // get the contour's last point
          PVector lp = c.get(c.size()-1);
          // if the first point is in the lowest 5 pixels of the (kinect) screen and more to the left than the current closestPoint
          if (fp.y > kinectHeight-5 && fp.x < closestPoint.x) {
            // set closestPoint to first point
            closestPoint = fp;
            // set this as the selected contour
            selectedContour = i;
            // set selectedPoint to 0 (which signals first point)
            selectedPoint = 0;
          }
          // if the last point is in the lowest 5 pixels of the (kinect) screen and more to the left than the current closestPoint
          if (lp.y > kinectHeight-5 && lp.x < closestPoint.y) {
            // set closestPoint to last point
            closestPoint = lp;
            // set this as the selected contour
            selectedContour = i;
            // set selectedPoint to 1 (which signals last point)
            selectedPoint = 1;
          }
        }
      }
 
      // add contour to polygon
      ArrayList<PVector> contour = contours.get(selectedContour);
      // if selectedPoint is bigger than zero (aka last point) then reverse the arrayList of points
      if (selectedPoint > 0) { Collections.reverse(contour); }
      // add all the points in the contour to the polygon
      for (PVector p : contour) {
        addPoint(int(p.x), int(p.y));
      }
      // remove this contour from the list of contours
      contours.remove(selectedContour);
      // the while loop above makes all of this code loop until the number of contours is zero
      // at that time all the points in all the contours have been added to the polygon... in the correct order (hopefully)
    }
  }
}
 /********************/
 void function2()
 {
 cam = context.sceneImage().get();
 
  // copy the image into the smaller blob image
  blobs.copy(cam, 0, 0, cam.width, cam.height, 0, 0, blobs.width, blobs.height);
  // blur the blob image
  blobs.filter(BLUR);
  // detect the blobs
  theBlobDetection.computeBlobs(blobs.pixels);
  // clear the polygon (original functionality)
  poly.reset();
  // create the polygon from the blobs (custom functionality, see class)
  poly.createPolygon();
  // draw the skeleton if it's available
  drawFlowfield();
 }
