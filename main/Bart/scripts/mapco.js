var totalPop = 0
bounds = null;

const firebaseConfig = {
  apiKey: "AIzaSyAwBnDl7njkK3Kx6rCPq3qQwhyv4iWk_7U",
  authDomain: "districtsweb-default-rtdb.firebaseapp.com",
  projectId: "districtsweb-default-rtdb",
  storageBucket: "districtsweb-default-rtdb.appspot.com",
  databaseURL: "https://districtsweb-default-rtdb.firebaseio.com",
  messagingSenderId: "925035090492",
  appId: "1:925035090492:web:33983dd9159cf062522939"
};

$("#areaofint").selectpicker({noneSelectedText :""})

firebase.initializeApp(firebaseConfig);
document.querySelector(".map").style.width = window.innerWidth - document.querySelector("#sideBar").offsetWidth +"px";
var map = new maplibregl.Map({
   container: "map",
   style:
       "https://api.maptiler.com/maps/streets/style.json?key=ZW8V50ApYN3vLbcGkLui", // stylesheet location
   center: [-122.51834, 38.01121], // starting position [lng, lat]
   zoom: 9, // starting zoom
});
const scale = new maplibregl.ScaleControl({
    maxWidth: 80,
    unit: 'imperial'
    });
    map.addControl(scale);
map.addControl(new maplibregl.NavigationControl());


const popup = new maplibregl.Popup({
   closeButton: false,
   closeOnClick: false
});


//All settings which can be changed
getpopulation = {};
getpopulation["Latino"] = ["P0020002"];
getpopulation["White"] = ["P0020005"];
getpopulation["Black"] = ["P0020006"];
getpopulation["Native American"] = ["P0020007"];
getpopulation["Asian"] = ["P0020008"];
getpopulation["Hawaiian/Pacific Island"] = ["P0020010","P0020011"];
getpopulation["Others"] = ["P0020009"];
colorcount = 10; 
var customlayercolorArray = ["#55323b","#414790","#6e0a77","#396e76","#805987","#496ba6","#358337","#64644f","#1a8a5e","#68462f","#237805","#a87738","#bf7e8c","#466b50","#196925","#31b34b","#805e83","#0aa192","#0e3356","#46b114","#bc9e23","#a4b29f","#375699","#927800","#564d28","#19a79a","#607c28","#77a939","#396036","#6b2178","#bc7787","#7957aa","#8d0c41","#479123","#2c6b43","#380269","#06ae38","#4d2d11","#9d8952","#3e8598","#05ab44","#3d2f45","#654b1a","#645684","#03be1b","#a3796f","#0da409","#621d7e","#530b79","#017408","#005947","#6cad88","#a77786","#582f68","#6459b3","#0053aa","#3e4632","#021d62","#23393e","#5c431b","#264924","#470c4b","#a47294","#a15993","#958dbe","#08b3b0","#5b713b","#6ba383","#b38665","#20b071","#a30956","#945135","#3d0abd","#8f14ad","#3d2ca4","#a78a5c","#055f10","#9cbf65","#12251a","#bea960","#307756","#47407a","#144b8a","#9e6326","#9e9b75","#6c3c95","#372f95","#0db704","#1e0d32","#403d9f","#ad263e","#1a238b","#4d3d7d","#13953c","#b7113a","#352e10","#440907","#7a1d4d","#38617d","#8c0029"];
dataLayers =  {"Alameda County":{"file":"AlamedaCounty","layer":null},"Contra Costa County":{"file":"ContraCostaCounty","layer":null},"San Francisco County":{"file":"SFCounty","layer":null},"BART District":{"file":"BARTDistrict","layer":null},"BART Line":{"file":"BARTLine","layer":null},"BART Station":{"file":"BARTStation","layer":null}   }
drawingLayer = "layers/county.geojson";
colors1 = ["#E41A1C","#999999","#4DAF4A","#377EB8","#FF7F00","#FFFF33","#984EA3","#004C73","#55FF00","#ffffff"];
colors2 = ["#0099cd","#ffca5d","#00cd99","#99cd00","#cd0099","#aa44ef","#8dd3c7","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#bc80bd","#ccebc5","#ffed6f","#ffed6f","#ffed6f","#ffffb3","#a6cee3","#1f78b4","#b2df8a","#33a02c"];

// 




let hoveredStateId = null;
var geojsonObject;
var processing = false;

communitystart = colors1.length;
communitydata = {};
selectedcommunity = -1;

for (icolors = 0; icolors < colors1.length; icolors++){
     communitydata[icolors+1] = [];
}

var slider = document.getElementById("brushRange");
var output = document.getElementById("brushSize");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

$('#close').click(function(){
  $('#sideBar').addClass('hide')
})
$('#menuIcon').click(function(){
  $('#sideBar').removeClass('hide')
})

elems = document.getElementsByClassName("colors")[0].getElementsByTagName("li");
for (ielem = 0; ielem < elems.length; ielem++){
     elems[ielem].style.backgroundColor = colors1[ielem];
}
scol = -1;
for (ielem = 0; ielem < elems.length; ielem++){
     if (elems[ielem].getAttribute("class").indexOf("selected") > -1){
         scol = ielem;
         break;
     }  
}

textchange = false;

brushstarted = false;

if (scol !=  -1){
    brushstarted = true;
}

clien(scol);

pops = [];

function colorselect(id,event){
   scol = id;
   elems = document.getElementsByClassName("colors")[0].getElementsByTagName("li");
   for (ielem = 0; ielem < elems.length; ielem++){
        classs = elems[ielem].removeAttribute("class");
        if (!classs){
            continue;
        }
        classs = classs.split("selected").join("");
        elems[ielem].setAttribute("class",classs);     
   }
   event.setAttribute("class","selected");
   eraselayeractive = false;
   brushstarted = true;
   $('.map').find("canvas").css('cursor',"grab");
   map.getCanvas().style.cursor = "grab";
   clien(scol);
}

function activateInfoWindow(){
       brushstarted = false;  
}

document.querySelector("#populationByRace").querySelector(".table").innerHTML = "";

dlayers = [];
for (ilayers in dataLayers){
     dlayers.push(ilayers);
}

getdatalayers = true;
datalayersstart = -1;
layertimer = null;
layers = document.querySelector("#DataLayers").querySelectorAll(".form-check");
for (ilayer = 0; ilayer < layers.length; ilayer++){
     document.querySelector("#DataLayers").removeChild(layers[ilayer]);
}

checked = [];
function addCustomLayers(process){
   layertimer = setInterval(function(){
      if (getdatalayers){
          datalayersstart++;
          if (datalayersstart > dlayers.length-1){
              clearInterval(layertimer);
              return;
          }
          getdatalayers = false;
          shp("./layers/"+dataLayers[dlayers[datalayersstart]]["file"]).then(function(geojson){  
              dataLayers[dlayers[datalayersstart]]["layer"] = geojson;
              div = document.createElement("div");        
              div.setAttribute("class","form-check");
              input = document.createElement("input");
              input.setAttribute("class","form-check-input");
              input.setAttribute("type","checkbox");
              input.setAttribute("id","flexCheckDefault");
              input.setAttribute("onclick",'clickedlayer("'+dlayers[datalayersstart]+'",this)');
              input.checked = false;
              if (process == 1){
                  if (checked[datalayersstart] == 0){
                       input.checked = false;
                  }else{
                       input.checked = true;
                  }
              }
              input.setAttribute("rel",datalayersstart);
              if (process == 0){
                  checked.push(0);
              }
              div.append(input);
              label = document.createElement("label");
              label.setAttribute("class","form-check-label");    
              label.setAttribute("for","form-check-flexCheckDefault");  
              label.innerText = dlayers[datalayersstart];
              label.style.color = customlayercolorArray[datalayersstart];
              label.style.fontWeight = "bold";
              div.append(label);   
              br = document.createElement('br')
            
            if(dlayers[datalayersstart] == 'BART District'){
                div.append(br)
                img = document.createElement("img");
                img.src = '../../static/images/dist.png'
                img.width = 80
                div.append(img);
            }else if(dlayers[datalayersstart] == 'Alameda County' || dlayers[datalayersstart] == 'Contra Costa County'  || dlayers[datalayersstart] == 'San Francisco County'){
                div.append(br)
                img = document.createElement("img");
                img.src = '../../static/images/county.png'
                img.width = 20
                div.append(img);
            }
               
              document.querySelector("#DataLayers").append(div);           
              getdatalayers = true;
              if (process == 1){
                  if (checked[datalayersstart] == 1){
                      addlayer(dlayers[datalayersstart],geojson,customlayercolorArray[datalayersstart],checked[datalayersstart])
                  }else{
                      addlayer(dlayers[datalayersstart],geojson,customlayercolorArray[datalayersstart],checked[datalayersstart])
                  }
              }else{
                  if (input.checked){
                      addlayer(dlayers[datalayersstart],geojson,customlayercolorArray[datalayersstart],1);
                  }else{
                      addlayer(dlayers[datalayersstart],geojson,customlayercolorArray[datalayersstart],0);
                  }
              }
          });   
      }  
   },10)
}

uuid = null;

function shareLink(){
   $("#myModalLabel2").text("Share Link");
   $("#save").hide();
   $("#generate").show();
   document.querySelector("#fileSaveconfirm").querySelector(".modal-body").innerHTML = 'Name :<input id = "savefile" style = "width:80%" type = "textbox">';
   $("#shareLinkconfirm").modal('hide');
   $("#fileSaveconfirm").modal('show');
}

function closeModal(){
   $("#shareLinkconfirm").modal('hide');
   $("#fileSaveconfirm").modal('hide');
}


function generateLink(){
  file = $("#savefile").val();
  if (!file){
      return;
  }
  ref = firebase.database().ref('Users/bart/'+file)
  filefound = false;
  ref.once("value", function(snapshot) { 
        checked1 = null;
        if (snapshot.val() && snapshot.val().checked){
            checked1 = snapshot.val().checked; 
        }
        if (checked1 != null && checked1.length > 0){
            filefound = true;
        }else{
           if (checked1 == null){
                filefound = false;
           }else{
                filefound = true; 
           }
       }
       if (filefound){
           alert("Already exists");
           return;
       }
  });
  setTimeout(function(){
     if (!filefound){
         $("#fileSaveconfirm").modal('hide');
         ggeojson = {};
         ggeojson.checked = checked;
         ggeojson.county = "Bart";
         ggeojson.type = "Community";
         feat = {};
         for (ifeat = 0; ifeat < geojsonObject.features.length; ifeat++){
              if (geojsonObject.features[ifeat].properties.color == -1){
                  continue;
              }
              if (!feat[geojsonObject.features[ifeat].properties.id]){
                  feat[geojsonObject.features[ifeat].properties.id] = {};
              }
              feat[geojsonObject.features[ifeat].properties.id]["color"] = geojsonObject.features[ifeat].properties.color; 
              feat[geojsonObject.features[ifeat].properties.id]["text"] = '';
              if (geojsonObject.features[ifeat].properties.communityText){
                  feat[geojsonObject.features[ifeat].properties.id]["text"]  = geojsonObject.features[ifeat].properties.communityText;
              }
              feat[geojsonObject.features[ifeat].properties.id]["counter"]  = geojsonObject.features[ifeat].properties.communitycounter;
              feat[geojsonObject.features[ifeat].properties.id]["ctext"] = '';
              if (geojsonObject.features[ifeat].properties.ctext){
                  feat[geojsonObject.features[ifeat].properties.id]["ctext"]  = geojsonObject.features[ifeat].properties.ctext;
              }
              feat[geojsonObject.features[ifeat].properties.id]["linked"] = -1;
              if (geojsonObject.features[ifeat].linked != -1){
                  feat[geojsonObject.features[ifeat].properties.id]["linked"] = geojsonObject.features[ifeat].linked;
              }
         }
         ggeojson.gjson = feat;
         file = file.split(" ").join("zzttvvwwhh");
         
         loca = window.location.href;
         if (loca.indexOf("?id=") > -1){
             loca = loca.split("?id=")[0];
         }
         ggeojson.url = loca+"?id="+file;
         firebase.database().ref('Users/bart/' + file).set(ggeojson);  
         document.querySelector("#shareLinkconfirm").querySelector(".modal-body").innerHTML = loca+"?id="+file;
         $("#shareLinkconfirm").modal('show');
     }
  },5000);
}


function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
map.loadImage(
    '../../static/images/medical.png',
    (error, image) => {
    if (error) throw error;
     
    // Add the image to the map style.
    map.addImage('cat', image);
 
    })

function addlayer(title,geojson,color,visible){
       map.addSource(title, {
           type: "geojson",
           data: geojson,
       });
        if (title == 'BART District'){
        map.addLayer({
            'id': title,
            'type': 'fill',
            'source': title,
            'layout': {   
              'visibility': visible==1?'visible':'none',
            },
            'paint': {
               "fill-color":[
                "match",
                ["get", "DistrictNo"],
                [1],
                "#E41A1C",
                [2],
                "#999999",
                [3],
                "#4DAF4A",
                [4],
                "#377EB8",
                [5],
                "#FF7F00",
                [6],
                "#FFFF33",
                [7],
                "#984EA3",
                [8],
                "#004C73",
                [9],
                "#55FF00",
                "hsl(0, 88%, 39%)"
              ],
               "fill-opacity":.4,
            },
            'filter': ['==', '$type', 'Polygon']
         });
       }else if (title == "Alameda County"){
        map.addLayer({
            'id': title,
            'type': 'line',
            'source': title,
            'layout': {   
                'visibility': visible==1?'visible':'none',
                'line-join': 'round',
                'line-cap': 'round'
             },
             'paint': {
                'line-color': '#B2B2B2',
                'line-width': 3
             },
            'filter': ['==', '$type', 'Polygon']
         });
         map.addLayer({
            'id': title+'_symbol',
            'type': 'symbol',
            'source': title,
            'layout': {   
              'visibility': visible==1?'visible':'none',
              "text-field": "{NAME}",
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold']
            },
            'filter': ['==', '$type', 'Polygon']
         });
       }
       else if (title == "Contra Costa County"){
        map.addLayer({
            'id': title,
            'type': 'line',
            'source': title,
            'layout': {   
                'visibility': visible==1?'visible':'none',
                'line-join': 'round',
                'line-cap': 'round'
             },
             'paint': {
                'line-color': '#B2B2B2',
                'line-width': 3
             },
            'filter': ['==', '$type', 'Polygon']
         });
         map.addLayer({
            'id': title+'_symbol',
            'type': 'symbol',
            'source': title,
            'layout': {   
              'visibility': visible==1?'visible':'none',
              "text-field": "{NAME}",
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold']
            },
            'filter': ['==', '$type', 'Polygon']
         });
       }
       else if (title == "San Francisco County"){
        map.addLayer({
            'id': title,
            'type': 'line',
            'source': title,
            'layout': {   
                'visibility': visible==1?'visible':'none',
                'line-join': 'round',
                'line-cap': 'round'
             },
             'paint': {
                'line-color': '#B2B2B2',
                'line-width': 3
             },
            'filter': ['==', '$type', 'Polygon']
         });
         map.addLayer({
            'id': title+'_symbol',
            'type': 'symbol',
            'source': title,
            'layout': {   
              'visibility': visible==1?'visible':'none',
              "text-field": "{jurname}",
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold']
            },
            'filter': ['==', '$type', 'Polygon']
         });
       }else{
       map.addLayer({
         'id': title,
         'type': 'fill',
         'source': title,
         'layout': {   
           'visibility': visible==1?'visible':'none',
         },
         'paint': {
            "fill-color":color,
            "fill-opacity":.2,
         },
         'filter': ['==', '$type', 'Polygon']
      });
    }
      map.addLayer({
        'id': title+"_points",
        'type': 'symbol',
        'source': title,
        'layout': {  
            'icon-image': 'cat', // reference the image
'icon-size': 0.05, 
           'visibility': visible==1?'visible':'none',
        },
        
        'filter': ['==', '$type', 'Point']
      });


      map.addLayer({
        'id': title+"_lines",
        'type': 'line',
        'source': title,
        'layout': {   
           'visibility': visible==1?'visible':'none',
           'line-join': 'round',
           'line-cap': 'round'
        },
        'paint': {
           'line-color': '#BF93E4',
           'line-width': 5
        },
        'filter': ['==', '$type', 'LineString']
      });
}


function clickedlayer(id,obj){
   if (obj.checked){
       checked[obj.getAttribute("rel")] = 1;
       map.setLayoutProperty(id, 'visibility', 'visible');
       if (map.getLayer(id+"_points") != undefined){
           map.setLayoutProperty(id+"_points", 'visibility', 'visible');
       }
       if (map.getLayer(id+"_lines") != undefined){
           map.setLayoutProperty(id+"_lines", 'visibility', 'visible');
       }
   }else{
       checked[obj.getAttribute("rel")] = 0;
       map.setLayoutProperty(id, 'visibility', 'none');
       if (map.getLayer(id+"_points") != undefined){
           map.setLayoutProperty(id+"_points", 'visibility', 'none');
       }
       if (map.getLayer(id+"_lines") != undefined){
           map.setLayoutProperty(id+"_lines", 'visibility', 'none');
       }
   }
}

generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
};

link = window.location.href;
nlink = ""
for (ilink = 0; ilink < link.length; ilink++){
     if (link.substr(ilink,1) == " "){
         continue;
     }
     nlink += link.substr(ilink,1);
}
firebase_file_name_ = ''

if (nlink.split("?id=")[1]){
    document.getElementById('loader').className = 'show'
    shp("./layers/bart").then(function(data){  
        uuid = nlink.split("?id=")[1];
        ref = firebase.database().ref('Users/bart/' + uuid);
        firebase_file_name_ = uuid.split("zzttvvwwhh").join(" ");

        onlyonce1 = true;
        onlyonce2 = true;
        ref.on("value", function(snapshot) {
            checked = snapshot.val().checked;
            gjson = snapshot.val().gjson;  
            geojsonObject = data;
            for (i = 0; i < geojsonObject.features.length; i++) {
                 geojsonObject.features[i].properties.id = i;
                 geojsonObject.features[i].properties.color = -1;
                 geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
                 geojsonObject.features[i].properties.linewidth = 3
                 if (gjson && gjson[i] && gjson[i]["color"] != -1){
                     geojsonObject.features[i].properties.color = gjson[i].color;
                     geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                     geojsonObject.features[i].properties.linewidth = .7
                 }
                 if (gjson && gjson[i] && gjson[i]["linked"] != -1){
                     geojsonObject.features[i].linked = gjson[i].linked;
                 }
                 geojsonObject.features[i].properties.communityText = '';
                 if (gjson && gjson[i] && gjson[i].text){
                     geojsonObject.features[i].properties.communityText = gjson[i].text;
                 } 
                 geojsonObject.features[i].properties.ctext = '';
                 if (gjson && gjson[i] && gjson[i].ctext){
                     geojsonObject.features[i].properties.ctext = gjson[i].ctext;
                 } 
                 if (gjson && gjson[i] && gjson[i].counter > -1){
                     geojsonObject.features[i].properties.communitycounter = gjson[i].counter;
                 }
                 totalPop += Math.round(geojsonObject.features[i].properties.P0020001);
            }
            for (i=0;i<geojsonObject.features.length;i++){
                 if ($("#unassignedlayer").is(":checked")){
                     geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
                     geojsonObject.features[i].properties.linewidth = 3
                     if (geojsonObject.features[i].properties.color != -1){
                         geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                         geojsonObject.features[i].properties.linewidth = .7
                     }
                 }else{
                     geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)"
                     geojsonObject.features[i].properties.linewidth = .7
                 }
            }
            if (onlyonce1){
                addCustomLayers(1) ;
                onlyonce1 = false;
            }
            setTimeout(function(){
               if (onlyonce2){
                   onlyonce2 = false;
                   updateLyr();    
               }
            },750)    
        }, function (error) {
           console.log("Error: " + error.code);
        });
        document.getElementById('loader').className = ''
   });
}else{   
    document.getElementById('loader').className = 'show'
    shp("./layers/bart").then(function(data){  

       bounds = new maplibregl.LngLatBounds();
       for (ipoints = 0; ipoints < data.features.length; ipoints++){
            for (ipoints1 = 0; ipoints1 < data.features[ipoints].geometry.coordinates.length; ipoints1++){
                 for (ipoints2 = 0; ipoints2 < data.features[ipoints].geometry.coordinates[ipoints1].length; ipoints2++){
                      for (ipoints3 = 0; ipoints3 < data.features[ipoints].geometry.coordinates[ipoints1][ipoints2].length; ipoints3++){
                           if (typeof data.features[ipoints].geometry.coordinates[ipoints1][ipoints2][ipoints3] == "object"){
                               bounds.extend(data.features[ipoints].geometry.coordinates[ipoints1][ipoints2][ipoints3]);
                           }else{
                               bounds.extend(data.features[ipoints].geometry.coordinates[ipoints1][ipoints2]);
                           }
                      }
                 }
            }
       }
       geojsonObject = data;
       for (i = 0; i < geojsonObject.features.length; i++) {
            geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
            geojsonObject.features[i].properties.linewidth = 3
            geojsonObject.features[i].properties.id = i;
            geojsonObject.features[i].properties.color = -1;
//            geojsonObject.features[i].properties.communitycounter = -1;
            totalPop += Math.round(geojsonObject.features[i].properties.P0020001);
            geojsonObject.features[i].properties.communityText = '';
            geojsonObject.features[i].properties.ctext = '';
       }
       for (i=0;i<geojsonObject.features.length;i++){
            if ($("#unassignedlayer").is(":checked")){
                 geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
                 geojsonObject.features[i].properties.linewidth = 3
                 if (geojsonObject.features[i].properties.color != -1){
                     geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                     geojsonObject.features[i].properties.linewidth = .7
                 }
            }else{
                  geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)"
                  geojsonObject.features[i].properties.linewidth = .7
            }
       }
       if (!map.loaded()){ 
           map.on("load", () => {
              addCustomLayers(0)  
              setTimeout(function(){
                  generateLayers()    
              },750)   
           });
       }
       if (map.loaded()){
          addCustomLayers(0)  
          setTimeout(function(){
              generateLayers()    
          },750)   
       };
       document.getElementById('loader').className = ''
   });
}

function updateData(){
  for (idata = 0; idata < communitydata[selectedcommunity].length; idata++){
       geojsonObject.features[communitydata[selectedcommunity][idata]].properties.communityText = $("#communityText").val();
  }
}

function updateName(){
  if (textchange){
      return;
  }        
  if (selectedcommunity == -1){
      $("#communityName").val("");
      return;
  }
  for (idata = 0; idata < communitydata[selectedcommunity].length; idata++){
       geojsonObject.features[communitydata[selectedcommunity][idata]].properties.ctext = $("#communityName").val();
  }
  cselectedcommunity = $("#areaofint").children(":selected").attr("id");
  optionss = '' 
  $("#areaofint").empty();
  for (icomm = 0; icomm < communitystart; icomm++){
       for (i=0;i<geojsonObject.features.length;i++){
            if (geojsonObject.features[i].properties.communitycounter == icomm+1){  
                if (geojsonObject.features[communitydata[icomm+1][0]].properties.ctext){
                    datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">'+geojsonObject.features[communitydata[icomm+1][0]].properties.ctext + '</span>' ; 
                    if (cselectedcommunity == "comm_"+(icomm+1)){
                        optionss += "<option selected data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[icomm+1][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[icomm+1][0]].properties.ctext+'</option>';
                    }else{
                        optionss += "<option data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[icomm+1][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[icomm+1][0]].properties.ctext+'</option>';
                    }
                }else{
                    datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">Community '+ (icomm+1) + '</span>' ; 
                    if (cselectedcommunity == "comm_"+(icomm+1)){
                        optionss += "<option selected data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                    }else{
                        optionss += "<option data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                    }
                }
                break;
            }
       }
  }
  $("#areaofint").html(optionss);
  $("#areaofint").selectpicker("refresh");
}

$("#areaofint").on("change",function(){
  selectedcommunity = $("#areaofint").children(":selected").attr("id").split("_")[1];
  textchange = true;
  $("#communityName").val($("#areaofint").selectpicker("val"));
  $("#communityText").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.communityText);
  textchange =  false;
})


function updateLyr(){ 
       fetch('layers/boundary.geojson')
        .then((res) => res.json())
        .then((data) => {
           map.addSource('boundary-source', {
               type: "geojson",
               data: data,
           });
           map.addLayer({
             'id': 'boundary',
             'type': 'line',
              'source': 'boundary-source',
              'paint': {
                 'line-width': 3,
                 'line-color': "#000"
              },
           });
       })

       selectedIDS = {};
       hoverFeat = {};
       cstart = 0;
       for (ifeat = 0; ifeat < geojsonObject.features.length; ifeat++){
            if (geojsonObject.features[ifeat].linked){
                if (!hoverFeat[geojsonObject.features[ifeat].linked]){
                    hoverFeat[geojsonObject.features[ifeat].linked] = [];
                }
                hoverFeat[geojsonObject.features[ifeat].linked].push(geojsonObject.features[ifeat]);
            }
            if (geojsonObject.features[ifeat].properties.color > -1){
                selectedIDS[geojsonObject.features[ifeat].properties.id] = true;
                selectedColors[geojsonObject.features[ifeat].properties.id] = geojsonObject.features[ifeat].properties.color;
            }
//            communitystart = geojsonObject.features[ifeat].properties.communitycounter;
//            if (communitystart){
//                if (!communitydata[communitystart]){
//                    communitydata[communitystart] = [];
//                }
//                if (cstart < communitystart){
//                    cstart = communitystart;
//                }
           if (geojsonObject.features[ifeat].properties.communitycounter){  
               communitydata[geojsonObject.features[ifeat].properties.communitycounter].push(geojsonObject.features[ifeat].properties.id);
           }
       }
       optionss = '';
//       communitystart = cstart;
       $("#areaofint").empty();
       firsttime = true;
       for (icomm = 0; icomm < communitystart; icomm++){
            for (i=0;i<geojsonObject.features.length;i++){
                 if (geojsonObject.features[i].properties.communitycounter == icomm+1){  
                     if (firsttime){
                         $("#communityText").val(geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.communityText);
                         $("#communityName").val(geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext.split("_").join(" "));
                         firsttime = false;
                     }
                     if (geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext){
                         datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">'+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + '</span>' ; 
                         optionss += "<option data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext +"'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext+'</option>';
                     }else{
                         datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">Community '+ (icomm+1) + '</span>' ; 
                         optionss += "<option data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                     }
                     break;
                 }
            }
       }

       $("#areaofint").html(optionss);
       $("#areaofint").selectpicker("refresh");
       html = "";

       map.addSource("states", {
           type: "geojson",
           data: geojsonObject,
           generateId: true,
       });


       colortext1 = [];
       colortext1.push("match");
       colortext1.push(["feature-state", "color"]);
       for (icolors = 0; icolors < colors1.length; icolors++){
            colortext1.push(icolors);
            colortext1.push(colors1[icolors]);
       }
       colortext1.push("#aaaaaa");
       colortext2 = [];
       colortext2.push("match");
       colortext2.push(["feature-state", "color"]);
       for (icolors = 0; icolors < colors2.length; icolors++){
            colortext2.push(icolors);
            colortext2.push(colors2[icolors]);
       }
       colortext2.push("rgba(0, 0, 0, 0)");
       map.addLayer({
              id: "state-fills",
              type: "fill",
              source: "states",
              layout: {},
              paint: {
                "fill-color": [
                  "case",
                  ["==", ["feature-state", "useBlendColor"], true],
                  [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    ["feature-state", "blendHoverColor"],
                    ["feature-state", "blendColor"],
                  ],
                  [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    colortext1,
                    colortext2
                  ],
                ],
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], true],
                  0.6,
                  0
                ],
              },
       });

       map.addLayer({
              id: "state-borders",
              type: "line",
              source: "states",
              layout: {},
              paint: {
                'line-color': ["get","linecolor"],
                'line-width': ["get","linewidth"],
              }
       });

       bounds = new maplibregl.LngLatBounds();
       for (ipoints = 0; ipoints < geojsonObject.features.length; ipoints++){
            for (ipoints1 = 0; ipoints1 < geojsonObject.features[ipoints].geometry.coordinates.length; ipoints1++){
                 for (ipoints2 = 0; ipoints2 < geojsonObject.features[ipoints].geometry.coordinates[ipoints1].length; ipoints2++){
                      for (ipoints3 = 0; ipoints3 < geojsonObject.features[ipoints].geometry.coordinates[ipoints1][ipoints2].length; ipoints3++){
                           if (typeof geojsonObject.features[ipoints].geometry.coordinates[ipoints1][ipoints2][ipoints3] == "object"){
                               bounds.extend(geojsonObject.features[ipoints].geometry.coordinates[ipoints1][ipoints2][ipoints3]);
                           }else{
                               bounds.extend(geojsonObject.features[ipoints].geometry.coordinates[ipoints1][ipoints2]);
                           }                     
                      }
                 }
            }
       }

       map.fitBounds(bounds);  

       for (ifeat = 0; ifeat < geojsonObject.features.length; ifeat++){
            if (geojsonObject.features[ifeat].properties.color > -1){                
                map.setFeatureState(
                   { source: "states", id: geojsonObject.features[ifeat].properties.id },
                   { hover: true,color:geojsonObject.features[ifeat].properties.color}
                );
            }
       }
       popSum = [];
       for (icolor = 0; icolor < colorcount; icolor++){
            popSum.push(0);
       }
 
       for (i=0;i<geojsonObject.features.length;i++){
            if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){  
                popSum[geojsonObject.features[i].properties.color] += geojsonObject.features[i].properties.P0020001
            }             
       }
       totPops = 0;
       for (ipop = 0; ipop < popSum.length; ipop++){
            popSum[ipop] = Math.round(popSum[ipop]);
            totPops += popSum[ipop]; 
       }
       unAssigned = totalPop - totPops;
       dperc = Math.round((unAssigned/totalPop)*100);

       pop_eval = {};
       for (ikey in getpopulation){
            vinit = [];
            for (icolor = 0; icolor < colorcount; icolor++){
                 vinit.push(0);
            }
            pinit = [];
            for (icolor = 0; icolor < colorcount; icolor++){
                 pinit.push(0);
            }
            pop_eval[ikey] = {};
            pop_eval[ikey]["value"] = vinit;
            pop_eval[ikey]["perc"] = pinit;
            pop_eval[ikey]["color"] = "";
       }
       for (i=0;i<geojsonObject.features.length;i++){
            if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){        
                for (ikey in getpopulation){                
                     total = 0;
                     for (itkey = 0; itkey < getpopulation[ikey].length; itkey++){
                          total += geojsonObject.features[i].properties[getpopulation[ikey][itkey]]
                     }
                     pop_eval[ikey]["value"][geojsonObject.features[i].properties.color] += total
                }
                pop_eval[ikey]["color"] = colors1[geojsonObject.features[i].properties.color];
            }              
       }
       for (icount = 1; icount < colorcount; icount++){
            total = 0;
            for (ikey in pop_eval){
                 total += pop_eval[ikey]["value"][icount-1];
            }
            for (ikey in pop_eval){
                 if (total != 0 && pop_eval[ikey]["value"][icount-1] != 0){
                     pop_eval[ikey]["perc"][icount-1] = ((pop_eval[ikey]["value"][icount-1])/total)*100;
                     pop_eval[ikey]["perc"][icount-1] = Math.round(pop_eval[ikey]["perc"][icount-1] * 10) / 10;
                 }else{
                     pop_eval[ikey]["perc"][icount-1] = 0;
                 }
            }
       }
       html = "";
       html += "<thead>";
       html += '<tr class="text-center">';
       html += '<th scope="col" width="20px"></th>';
       for (ikey in getpopulation){
            html += '<th scope="col" style = "font-size:8px;">'+ikey+'</th>';
       }     
       html += "</thead>";   
       html += '<tbody>'
       for (icount = 1; icount < colorcount; icount++){
            html += '<tr>';
            html += '<th scope="row">'
            html += '<span class="brushColor" style="background-color:'+colors1[icount-1]+';">'+icount+'</span>';
            html += '</th>'
            for (ikey in  pop_eval){
                 html += '<td class="text-end">'+pop_eval[ikey]["perc"][icount-1]+'%</td>';
            }
            html += '</tr>';
       }
       total_v = {};
       total = 0;
       for (ikey in pop_eval){    
            for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
                 total += pop_eval[ikey]["value"][itkey];
            }
       }
       for (ikey in pop_eval){   
            value = 0;
            for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
                 value += pop_eval[ikey]["value"][itkey];
            } 
            if (value != 0 && total != 0){
                total_v[ikey] = (value/total)*100;
                total_v[ikey] = Math.round(total_v[ikey] * 10) / 10;
            }else{
                total_v[ikey] = 0;
            }
       }
       html += '<tr>';
       html += '<th scope="row">Overall</th>';
       counter = 0;
       for (ikey in total_v){
            if (counter > 2){
                counter = 0;
            }
            if (counter == 0){
                html += '<td class="text-end table-dark">'+total_v[ikey]+"%"+"</td>";
                counter++;
                continue;
            }
            if (counter == 1){
                html += '<td class="text-end table-secondary">'+total_v[ikey]+"%"+"</td>";
                counter++;
                continue;
            }
            if (counter == 2){
                html += '<td class="text-end table-light">'+total_v[ikey]+"%"+"</td>";
                counter++;
                continue;
            }
       }
       html += '</tr>';
       html += '</tbody>'
       document.querySelector("#populationByRace").querySelector(".table").innerHTML = html;
       if ($("#areaofint").children(":selected").attr("id")){
           selectedcommunity = $("#areaofint").children(":selected").attr("id").split("_")[1];
           $("#communityText").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.communityText);
           $("#communityText").prop("disabled",false);
       }
//       communitystart++;
}

function generateLayers(){
        fetch('layers/boundary.geojson')
          .then((res) => res.json())
          .then((data) => {
             map.addSource('boundary-source', {
                 type: "geojson",
                 data: data,
             });
             map.addLayer({
                'id': 'boundary',
                'type': 'line',
                'source': 'boundary-source',
                'paint': {
                   'line-width': 3,
                   'line-color': "#000"
                },
            });
       })
       html = "";

       map.addSource("states", {
           type: "geojson",
           data: geojsonObject,
           generateId: true,
       });


       colortext1 = [];
       colortext1.push("match");
       colortext1.push(["feature-state", "color"]);
       for (icolors = 0; icolors < colors1.length; icolors++){
            colortext1.push(icolors);
            colortext1.push(colors1[icolors]);
       }
       colortext1.push("#aaaaaa");
       colortext2 = [];
       colortext2.push("match");
       colortext2.push(["feature-state", "color"]);
       for (icolors = 0; icolors < colors2.length; icolors++){
            colortext2.push(icolors);
            colortext2.push(colors2[icolors]);
       }
       colortext2.push("rgba(0, 0, 0, 0)");
       map.addLayer({
              id: "state-fills",
              type: "fill",
              source: "states",
              layout: {},
              paint: {
                "fill-color": [
                  "case",
                  ["==", ["feature-state", "useBlendColor"], true],
                  [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    ["feature-state", "blendHoverColor"],
                    ["feature-state", "blendColor"],
                  ],
                  [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    colortext1,
                    colortext2
                  ],
                ],
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], true],
                  0.6,
                  0,
                ],
              },
       });

       map.addLayer({
              id: "state-borders",
              type: "line",
              source: "states",
              layout: {},
              paint: {
                'line-color': ["get","linecolor"],
                'line-width': ["get","linewidth"],
              },
       });

       map.fitBounds(bounds);  
}


selectedIDS = {};
selectedColors = {};
hoveredStateIds = {};
inon = null;
var toaccess = false;
var efeatures = {};
eraselayeractive = false;
function clien(col) {
   linkedstate = null;
   map.on("mousemove","state-fills",(e) =>{
       if (!brushstarted){
           map.getCanvas().style.cursor = 'pointer';
           properties = e.features[0].properties; 
           html = '<div style = "font-weight:bolder;text-decoration: underline;">Population</div>';
           pop_eval = {};
           for (ikey in getpopulation){
                pop_eval[ikey] = 0;
           }
           for (ikey in getpopulation){                
                total = 0;
                for (itkey = 0; itkey < getpopulation[ikey].length; itkey++){
                     total += e.features[0].properties[getpopulation[ikey][itkey]]
                }
                pop_eval[ikey] += total
           }
           for (ikey in pop_eval){
                html += "<div>";
                html += '<div style = "width:80%;float:left;">'+ikey+"</div>";
                html += '<div style = "width:20%;text-align:right;float:right;">'+pop_eval[ikey]+"</div>";
                html += "</div>";
           } 
           html += "</div>";
           popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
           return;
       }
       for (id in selectedIDS){
            if (selectedColors[id] == -1){ 
                map.setFeatureState(
                    { source: 'states', id: id },
                    { hover: false}
                );
            }else{
                map.setFeatureState(
                    { source: 'states', id: id },
                    { hover: true, color:selectedColors[id]}
                );
            }
       }
       if (eraselayeractive){ 
           for (ifeat in efeatures){  
                if (selectedIDS[geojsonObject.features[ifeat].properties.id]){
                    map.setFeatureState(
                      { source: 'states', id: ifeat },
                      { hover: true, color:selectedColors[ifeat]}
                    );
                    efeatures[ifeat] = false;
                }else{
                    map.setFeatureState(
                       { source: 'states', id: ifeat },
                       { hover: false}
                    );
                    efeatures[ifeat] = false;
               }
           }
           if (e.features.length > 0){
               var box = boxAround(e.point, parseFloat(document.querySelector("#brushSize").innerHTML));
               var features = map.queryRenderedFeatures(box, {
                    layers: ["state-fills"],
               });
           }
           efeatures = {};
           if (e.features.length > 0) {
               for (var ifeats = 0; ifeats < features.length; ifeats++){   
                    if (selectedIDS[features[ifeats].properties.id]){
                        efeatures[features[ifeats].properties.id] = true;
                        map.setFeatureState(
                           { source: 'states', id: features[ifeats].properties.id },
                           { hover: true, color:colors1[colors1.length-1] }
                        );
                    }
               }
           }     
           return;       
       }
       if (!document.querySelector("#alreadydrawn").checked){
           if (linkedstate){
               linked = linkedstate;
               if (linked){
                   changed = false;
                   linkedstate = null;
                   for (link in hoverFeat){
                        if (link == linked){
                            for (ifeat = 0; ifeat < hoverFeat[link].length; ifeat++){
                                 map.setFeatureState(
                                    { source: "states", id: hoverFeat[link][ifeat].properties.id },
                                    { hover: true,color:selectedColors[hoverFeat[link][ifeat].properties.id]}
                                 );
                                 changed = true;
                                 geojsonObject.features[hoverFeat[link][ifeat].properties.id].properties.color = selectedColors[hoverFeat[link][ifeat].properties.id];
                            }
                         }
                   }
               }
           }
           linked = null;
           for (ifeat = 0; ifeat < e.features.length; ifeat++){
                if (geojsonObject.features[e.features[ifeat].id] && geojsonObject.features[e.features[ifeat].id].linked){
                    linked = geojsonObject.features[e.features[0].id].linked;
                    break;
                }
           };
           if (linked != undefined && linked != null){
               for (var ifeats in hoveredStateIds){ 
                    for (var ifeatss in selectedIDS){ 
                         if (ifeatss == ifeats){
                             continue;
                         }
                         map.setFeatureState(
                            { source: 'states', id: ifeats },
                            { hover: false }
                         ); 
                    }
               }   
               for (var ifeats in hoveredStateIds){ 
                    if (!selectedIDS[ifeats]){
                        map.setFeatureState(
                          { source: 'states', id: ifeats },
                          { hover: false }
                        ); 
                    }  
               }
               hoveredStateIds = {}; 
               linkedstate = linked;
               changed = false;
               for (link in hoverFeat){
                    if (link == linked){
                        for (ifeat = 0; ifeat < hoverFeat[link].length; ifeat++){
                             if (!selectedIDS[hoverFeat[link][ifeat].properties.id]){
                                 map.setFeatureState(
                                      { source: "states", id: hoverFeat[link][ifeat].properties.id },
                                      { hover: false}
                                 ); 
                                 continue;
                             }
                             changed = true;
                             geojsonObject.features[hoverFeat[link][ifeat].properties.id].properties.color = scol;
                             map.setFeatureState(
                                   { source: "states", id: hoverFeat[link][ifeat].properties.id },
                                   { hover: true,color:selectedColors[hoverFeat[link][ifeat].properties.id]}
                                ); 
                        }
                    }
               }
               if (e.features.length > 0){
                   var box = boxAround(e.point, parseFloat(document.querySelector("#brushSize").innerHTML));
                   var features = map.queryRenderedFeatures(box, {
                       layers: ["state-fills"],
                   });
               }
               if (e.features.length > 0) {
                   for (var ifeats = 0; ifeats < features.length; ifeats++){
                        if (selectedIDS[features[ifeats].id]){
                            map.setFeatureState(
                               { source: 'states', id: features[ifeats].id },
                               { hover: true, color:scol }
                            );
                            if (!hoveredStateIds[features[ifeats].id]){
                                hoveredStateIds[features[ifeats].id] = true;
                            }
                            continue;
                        }
                        map.setFeatureState(
                           { source: 'states', id: features[ifeats].id },
                           { hover: true, color:scol }
                        );
                        if (!hoveredStateIds[features[ifeats].id]){
                            hoveredStateIds[features[ifeats].id] = true;
                        }
                   }
               }
               return;
           }
       }
       if (linkedstate){
           linked = linkedstate;
           if (linked){
               linkedstate = null;
               changed = false;
               for (link in hoverFeat){
                    if (link == linked){
                        for (ifeat = 0; ifeat < hoverFeat[link].length; ifeat++){
                             map.setFeatureState(
                                { source: "states", id: hoverFeat[link][ifeat].properties.id },
                                { hover: true,color:selectedColors[hoverFeat[link][ifeat].properties.id]}
                             );
                        }
                        changed = true;
                        geojsonObject.features[hoverFeat[link][ifeat].properties.id].properties.color = selectedColors[hoverFeat[link][ifeat].properties.id];
                    }
               }
           }
       }
       if (e.features.length > 0){
           var box = boxAround(e.point, parseFloat(document.querySelector("#brushSize").innerHTML));
           var features = map.queryRenderedFeatures(box, {
                layers: ["state-fills"],
           });
       }
       for (var ifeats in hoveredStateIds){
            if (selectedIDS[ifeats]){
                if (eraselayeractive){
                    map.setFeatureState(
                        { source: 'states', id: ifeats },
                        { hover: true, color:scol,"opacity":.2 }
                    );
                }
                continue;
            }
            map.setFeatureState(
                { source: 'states', id: ifeats },
                { hover: false }
            );                    
       } 
       hoveredStateIds = {}; 
       if (e.features.length > 0) {
           for (var ifeats = 0; ifeats < features.length; ifeats++){
                if (selectedIDS[features[ifeats].id]){
                    continue;
                }
                map.setFeatureState(
                    { source: 'states', id: features[ifeats].id },
                    { hover: true, color:scol }
                );
                if (!hoveredStateIds[features[ifeats].id]){
                    hoveredStateIds[features[ifeats].id] = true;
                }
           }
       }
   })   
   map.on('mouseleave', 'state-fills', (e) => {  
       if (!brushstarted){
           map.getCanvas().style.cursor = '';
           popup.remove();
           return;
       }
       if (eraselayeractive){ 
           for (ifeat in efeatures){  
                if (selectedIDS[geojsonObject.features[ifeat].properties.id]){
                    map.setFeatureState(
                      { source: 'states', id: ifeat },
                      { hover: true, color:selectedColors[ifeat]}
                    );
                    efeatures[ifeat] = false;
                }else{
                    map.setFeatureState(
                       { source: 'states', id: geojsonObject.features[ifeat].properties.id },
                       { hover: false}
                    );
                    efeatures[ifeat] = false;
               }
           }
           return;       
       }
//       for (var ifeats in hoveredStateIds){ 
//            for (var ifeatss in selectedIDS){ 
//                 if (ifeatss == ifeats){
//                     continue;
//                 }
//                 map.setFeatureState(
//                     { source: 'states', id: ifeats },
//                     { hover: false }
//                 ); 
//            }
//       }   
       for (var ifeats in hoveredStateIds){ 
            if (!selectedIDS[ifeats]){
                map.setFeatureState(
                  { source: 'states', id: ifeats },
                  { hover: false }
                ); 
            }
       }
       hoveredStateIds = {}; 
       if (!document.querySelector("#alreadydrawn").checked){
           if (linkedstate == null){
               return;
           }
           linked = linkedstate;
           if (linked){
               linkedstate = null;
               for (link in hoverFeat){
                   if (link == linked){
                        for (ifeat = 0; ifeat < hoverFeat[link].length; ifeat++){
                             if (hoverFeat[link][ifeat].properties.color == -1){
                                map.setFeatureState(
                                    { source: "states", id: hoverFeat[link][ifeat].properties.id },
                                    { hover: false}
                                );
                             }else{
                                map.setFeatureState(
                                    { source: "states", id: hoverFeat[link][ifeat].properties.id },
                                    { hover: true,color:selectedColors[hoverFeat[link][ifeat].properties.id]}
                                );
                             }
                         }
                    }
                }
          }
       }else{

       }
   })   
   map.on("click", "state-fills", (e) => {
       if (eraselayeractive){
           eraseLayers(e);
           return;
       }
       if (!brushstarted){
           return;
       }
       if (processing){
           return;
       }
       processing = true;
       if (e.features.length > 0) {
           colorFeat(e, true,scol);
       }
   });
}
hoverFeat = {};

function colorFeat(e, toDo,color=4) {
    if (!brushstarted){
        processing = false;
        return;
    }
    var box = boxAround(e.point, parseFloat(document.querySelector("#brushSize").innerHTML));
    var features = map.queryRenderedFeatures(box, {
        layers: ["state-fills"],
    });
    if (!communitydata[communitystart]){
        communitydata[communitystart] = [];
    }
    relements = [];
    if (!document.querySelector("#alreadydrawn").checked){
        for (ihover in hoveredStateIds){
           if (geojsonObject.features[ihover] && geojsonObject.features[ihover].linked){
               if (selectedColors[ihover] != color){
                   relements.push(ihover);
               }
           }
           if (geojsonObject.features[ihover] && !geojsonObject.features[ihover].linked){
               communitydata[color+1].push(ihover);
           }
       }  
       for (irelement = 0; irelement < relements.length; irelement++){
            gcomm = {};
            for (icon in communitydata){
                 if (icon == communitystart){
                     continue;
                 }

                 if (!gcomm[icon]){
                     gcomm[icon] = [];
                 }
                 for (icon1 = 0; icon1 < communitydata[icon].length; icon1++){
                      if (relements[irelement] == communitydata[icon][icon1]){
                          continue;
                      }
                      duplicate = false;
                      for (igcom = 0; igcom < gcomm[icon].length; igcom++){
                           if (gcomm[icon][igcom] == communitydata[icon][icon1]){
                               duplicate = true;
                               break;
                           }
                      }
                      if (!duplicate){
                          gcomm[icon].push(communitydata[icon][icon1]);
                      }
                 } 
                 communitydata[icon]  = gcomm[icon];
           }
       }
       for (ihover in hoveredStateIds){
           if (geojsonObject.features[ihover] && geojsonObject.features[ihover].linked){
               if (selectedColors[ihover] != color){
                   communitydata[color+1].push(ihover);
               }
           }
       }
       ncommt = {};
       counter = 1;
       for (icomm in communitydata){
            if (communitydata[icomm].length == 0){
//                continue;
            } 
            if (!ncommt[counter]){
                ncommt[counter] = [];
            }
            ncommt[counter] = communitydata[icomm];
            counter = counter + 1;
       }
       communitydata = ncommt; 
//       communitystart = counter-1;
       for (i=0;i<geojsonObject.features.length;i++){
            delete geojsonObject.features[i].properties.communitycounter;
            for (icomm in communitydata){
                 for (icon1 = 0; icon1 < communitydata[icomm].length; icon1++){
                      if (communitydata[icomm][icon1] == geojsonObject.features[i].properties.id){
                          geojsonObject.features[i].properties.communitycounter = icomm;
                      }
                 }
            }
       };
    }
    if (document.querySelector("#alreadydrawn").checked){
        rnd = Math.random();
        features.forEach((element) => {
            if (geojsonObject.features[element.id] && !geojsonObject.features[element.id].linked){
                if (!hoverFeat[rnd]){
                    hoverFeat[rnd] = [];
                }
                hoverFeat[rnd].push(element);
                if (!selectedIDS[element.id]){
                    selectedIDS[element.id] = true;
                }
                geojsonObject.features[element.id].linked = rnd;
                selectedColors[element.id] = color;
                geojsonObject.features[element.id].properties.color = color;
                geojsonObject.features[element.id].properties.communitycounter = color //communitystart;
                communitydata[communitystart].push(element.id);
                map.setFeatureState(
                   { source: "states", id: element.id },
                   { hover: true,color:color}
                );
             }
       })
       popSum = [];
       for (icolor = 0; icolor < colorcount; icolor++){
            popSum.push(0);
       }
       for (i=0;i<geojsonObject.features.length;i++){
            geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
            geojsonObject.features[i].properties.linewidth = 3
            if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){  
                popSum[geojsonObject.features[i].properties.color] += geojsonObject.features[i].properties.P0020001
                geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                geojsonObject.features[i].properties.linewidth = .7
            }             
       }
       totPops = 0;
       for (ipop = 0; ipop < popSum.length; ipop++){
            popSum[ipop] = Math.round(popSum[ipop]);
            totPops += popSum[ipop]; 
       }
       unAssigned = totalPop - totPops;

       dperc = Math.round((unAssigned/totalPop)*100);

       pop_eval = {};
       for (ikey in getpopulation){
            vinit = [];
            for (icolor = 0; icolor < colorcount; icolor++){
                 vinit.push(0);
            }
            pinit = [];
            for (icolor = 0; icolor < colorcount; icolor++){
                 pinit.push(0);
            }
            pop_eval[ikey] = {};
            pop_eval[ikey]["value"] = vinit;
            pop_eval[ikey]["perc"] = pinit;
            pop_eval[ikey]["color"] = ""
       }
       for (i=0;i<geojsonObject.features.length;i++){
            if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){        
                for (ikey in getpopulation){                
                     total = 0;
                     for (itkey = 0; itkey < getpopulation[ikey].length; itkey++){
                          total += geojsonObject.features[i].properties[getpopulation[ikey][itkey]]
                     }
                     pop_eval[ikey]["value"][geojsonObject.features[i].properties.color] += total
                }
                pop_eval[ikey]["color"] = colors1[geojsonObject.features[i].properties.color];
            }              
       }
       for (icount = 1; icount < colorcount; icount++){
            total = 0;
            for (ikey in pop_eval){
                 total += pop_eval[ikey]["value"][icount-1];
            }
            for (ikey in pop_eval){
                 if (total != 0 && pop_eval[ikey]["value"][icount-1] != 0){
                     pop_eval[ikey]["perc"][icount-1] = ((pop_eval[ikey]["value"][icount-1])/total)*100;
                     pop_eval[ikey]["perc"][icount-1] = Math.round(pop_eval[ikey]["perc"][icount-1] * 10) / 10;
                 }else{
                     pop_eval[ikey]["perc"][icount-1] = 0;
                 }
            }
       }
       html = "";
       html += "<thead>";
       html += '<tr class="text-center">';
       html += '<th scope="col" width="20px"></th>';
       for (ikey in getpopulation){
            html += '<th scope="col" style = "font-size:8px;">'+ikey+'</th>';
       }     
       html += "</thead>";   
       html += '<tbody>'
       for (icount = 1; icount < colorcount; icount++){
            html += '<tr>';
            html += '<th scope="row">'
            html += '<span class="brushColor" style="background-color:'+colors1[icount-1]+';">'+icount+'</span>';
            html += '</th>'
            for (ikey in  pop_eval){
                 html += '<td class="text-end">'+pop_eval[ikey]["perc"][icount-1]+'%</td>';
            }
            html += '</tr>';
       }
       total_v = {};
       total = 0;
       for (ikey in pop_eval){    
            for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
                 total += pop_eval[ikey]["value"][itkey];
            }
       }
       for (ikey in pop_eval){   
            value = 0;
            for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
                 value += pop_eval[ikey]["value"][itkey];
            } 
            if (value != 0 && total != 0){
                total_v[ikey] = (value/total)*100;
                total_v[ikey] = Math.round(total_v[ikey] * 10) / 10;
            }else{
                total_v[ikey] = 0;
            }
       }
       html += '<tr>';
       html += '<th scope="row">Overall</th>';
       counter = 0;
       for (ikey in total_v){
            if (counter > 2){
                counter = 0;
            }
            if (counter == 0){
                html += '<td class="text-end table-dark">'+total_v[ikey]+"%"+"</td>";
                counter++;
                continue;
            }
            if (counter == 1){
                html += '<td class="text-end table-secondary">'+total_v[ikey]+"%"+"</td>";
                counter++;
                continue;
            }
            if (counter == 2){
                html += '<td class="text-end table-light">'+total_v[ikey]+"%"+"</td>";
                counter++;
                continue;
            }
       }
       html += '</tr>';
       html += '</tbody>'
       optionss = '' 
       $("#areaofint").empty();
       for (icomm = 0; icomm < communitystart; icomm++){
            for (i=0;i<geojsonObject.features.length;i++){
                 if (geojsonObject.features[i].properties.communitycounter == icomm+1){  
                     if (geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext){
                         datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">'+ geojsonObject.features[communitydata[icomm+1][0]].properties.ctext + '</span>' ; 
                         if ((color+1) == geojsonObject.features[i].properties.communitycounter){
                             $("#communityName").val(geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext.split("_").join(" "));
                             optionss += "<option selected data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext+'</option>';
                         }else{
                             optionss += "<option data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext+'</option>';
                         }
                     }else{
                         datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">Community '+ (icomm+1) + '</span>' ; 
                         if ((color+1) == geojsonObject.features[i].properties.communitycounter){
                             textchange = true;
                             $("#communityName").val("Community "+(icomm+1));
                             optionss += "<option selected data-content = '"  + datacon + "' value = '" + "Communit "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                         }else{
                             optionss += "<option data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                         }
                     }
                     break;
                 }
            }
       }

       $("#areaofint").html(optionss);
       $("#areaofint").selectpicker("refresh");
       document.querySelector("#populationByRace").querySelector(".table").innerHTML = html;
       if ($("#areaofint").selectpicker("val")){
           selectedcommunity = $("#areaofint").children(":selected").attr("id").split("_")[1];
           if (selectedcommunity && communitydata[selectedcommunity][0]){
               $("#communityText").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.communityText); 
               $("#communityText").prop("disabled",false);
               if (geojsonObject.features[communitydata[selectedcommunity][0]].properties.ctext){
                   $("#communityName").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.ctext); 
               }else{
                   $("#communityName").val($("#areaofint").selectpicker("val"));
                   for (icomm = 0; icomm < communitydata[selectedcommunity].length; icomm++){
                        geojsonObject.features[communitydata[selectedcommunity][icomm]].properties.ctext = '';
//                        geojsonObject.features[communitydata[selectedcommunity][icomm]].properties.ctext = $("#areaofint").selectpicker("val")
                   }
               }
           }
       }
//       communitystart++;
       setTimeout(function(){
           processing = false;
       },500)
       for (i=0;i<geojsonObject.features.length;i++){
            if ($("#unassignedlayer").is(":checked")){
                 geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
                 geojsonObject.features[i].properties.linewidth = 3
                 if (geojsonObject.features[i].properties.color != -1){
                     geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                     geojsonObject.features[i].properties.linewidth = .7
                 }
            }else{
                  geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)"
                  geojsonObject.features[i].properties.linewidth = .7
            }
       }
       textchange = false;
       map.getSource("states").setData(geojsonObject);
       return;
    }
    linked = null;
    for (ifeat = 0; ifeat < features.length; ifeat++){
         if (geojsonObject.features[features[ifeat].id]){
             if (!geojsonObject.features[features[ifeat].id].linked){
                 linked = null;
                 break;
             }
             linked =  geojsonObject.features[features[ifeat].id].linked;
         }
    }
    if (linked < 0){
       setTimeout(function(){
           processing = false;
       },500)
       textchange = false;
       return;
    }
    if (hoveredStateIds){
        rnd = Math.random();
        for (ihover in hoveredStateIds){
             if (selectedIDS[ihover]){
                map.setFeatureState(
                    { source: "states", id: ihover },
                    { hover: true,color:color}
                );
                selectedColors[ihover] = color;
                geojsonObject.features[ihover].properties.color = color;
                geojsonObject.features[ihover].properties.communitycounter = color+1 //communitystart;
                continue;
             }
             map.setFeatureState(
                 { source: "states", id: ihover},
                 { hover: true,color:color}
             );
             selectedIDS[ihover] = true;
             if (!hoverFeat[rnd]){
                 hoverFeat[rnd] = [];
             }
             geojsonObject.features[ihover].properties.communitycounter = color+1 //communitystart;
             hoverFeat[rnd].push(geojsonObject.features[ihover]);
             geojsonObject.features[ihover].linked = rnd;
             selectedColors[ihover] = color;
             geojsonObject.features[ihover].properties.color = color;
        }
        hoveredStateIds = {};

        for (xkey in selectedColors){
             geojsonObject.features[xkey].properties.color = selectedColors[xkey];
        }

        popSum = [];
        for (icolor = 0; icolor < colorcount; icolor++){
             popSum.push(0);
        }
        for (i=0;i<geojsonObject.features.length;i++){
             geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
             geojsonObject.features[i].properties.linewidth = 3
             if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){  
                 popSum[geojsonObject.features[i].properties.color] += geojsonObject.features[i].properties.P0020001
                 geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                 geojsonObject.features[i].properties.linewidth = .7
             }             
        }
        totPops = 0;
        for (ipop = 0; ipop < popSum.length; ipop++){
             popSum[ipop] = Math.round(popSum[ipop]);
             totPops += popSum[ipop]; 
        }
        unAssigned = totalPop - totPops;

        dperc = Math.round((unAssigned/totalPop)*100);

        pop_eval = {};
        for (ikey in getpopulation){
             vinit = [];
             for (icolor = 0; icolor < colorcount; icolor++){
                  vinit.push(0);
             }
             pinit = [];
             for (icolor = 0; icolor < colorcount; icolor++){
                  pinit.push(0);
             }
             pop_eval[ikey] = {};
             pop_eval[ikey]["value"] = vinit;
             pop_eval[ikey]["perc"] = pinit;
             pop_eval[ikey]["color"] = ""
        }
        for (i=0;i<geojsonObject.features.length;i++){
             if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){        
                 for (ikey in getpopulation){                
                      total = 0;
                      for (itkey = 0; itkey < getpopulation[ikey].length; itkey++){
                           total += geojsonObject.features[i].properties[getpopulation[ikey][itkey]]
                      }
                      pop_eval[ikey]["value"][geojsonObject.features[i].properties.color] += total
                 }
                 pop_eval[ikey]["color"] = colors1[geojsonObject.features[i].properties.color];
             }              
        }
        for (icount = 1; icount < colorcount; icount++){
             total = 0;
             for (ikey in pop_eval){
                  total += pop_eval[ikey]["value"][icount-1];
             }
             for (ikey in pop_eval){
                  if (total != 0 && pop_eval[ikey]["value"][icount-1] != 0){
                      pop_eval[ikey]["perc"][icount-1] = ((pop_eval[ikey]["value"][icount-1])/total)*100;
                      pop_eval[ikey]["perc"][icount-1] = Math.round(pop_eval[ikey]["perc"][icount-1] * 10) / 10;
                  }else{
                      pop_eval[ikey]["perc"][icount-1] = 0;
                  }
             }
        }
        html = "";
        html += "<thead>";
        html += '<tr class="text-center">';
        html += '<th scope="col" width="20px"></th>';
        for (ikey in getpopulation){
             html += '<th scope="col" style = "font-size:8px;">'+ikey+'</th>';
        }     
        html += "</thead>";   
        html += '<tbody>'
        for (icount = 1; icount < colorcount; icount++){
             html += '<tr>';
             html += '<th scope="row">'
             html += '<span class="brushColor" style="background-color:'+colors1[icount-1]+';">'+icount+'</span>';
             html += '</th>'
             for (ikey in  pop_eval){
                  html += '<td class="text-end">'+pop_eval[ikey]["perc"][icount-1]+'%</td>';
             }
             html += '</tr>';
        }
        total_v = {};
        total = 0;
        for (ikey in pop_eval){    
             for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
                  total += pop_eval[ikey]["value"][itkey];
             }
        }
        for (ikey in pop_eval){   
             value = 0;
             for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
                  value += pop_eval[ikey]["value"][itkey];
             } 
             if (value != 0 && total != 0){
                 total_v[ikey] = (value/total)*100;
                 total_v[ikey] = Math.round(total_v[ikey] * 10) / 10;
             }else{
                 total_v[ikey] = 0;
             }
        }
        html += '<tr>';
        html += '<th scope="row">Overall</th>';
        counter = 0;
        for (ikey in total_v){
             if (counter > 2){
                 counter = 0;
             }
             if (counter == 0){
                 html += '<td class="text-end table-dark">'+total_v[ikey]+"%"+"</td>";
                 counter++;
                 continue;
             }
             if (counter == 1){
                 html += '<td class="text-end table-secondary">'+total_v[ikey]+"%"+"</td>";
                 counter++;
                 continue;
             }
             if (counter == 2){
                 html += '<td class="text-end table-light">'+total_v[ikey]+"%"+"</td>";
                 counter++;
                 continue;
             }
        }
        html += '</tr>';
        html += '</tbody>'
        optionss = '' 
        $("#areaofint").empty();
        for (icomm = 0; icomm < communitystart; icomm++){
             for (i=0;i<geojsonObject.features.length;i++){
                  if (geojsonObject.features[i].properties.communitycounter == icomm+1){  
                      if (geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext){
                          datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">'+ geojsonObject.features[communitydata[icomm+1][0]].properties.ctext + '</span>' ; 
                          if ((color+1) == geojsonObject.features[i].properties.communitycounter){
                              $("#communityName").val(geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext.split("_").join(" "));
                              optionss += "<option selected data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext+'</option>';
                          }else{
                              optionss += "<option data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext.split("_").join(" ")+'</option>';
                          }
                      }else{
                          datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">Community '+ (icomm+1) + '</span>' ; 
                          if ((color+1) == geojsonObject.features[i].properties.communitycounter){
                              textchange = true;
                              $("#communityName").val("Community "+(icomm+1));
                              optionss += "<option selected data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                          }else{
                              optionss += "<option data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                          }
                      }
                      break;
                  }
             }
        }

        $("#areaofint").html(optionss);
        $("#areaofint").selectpicker("refresh");
        document.querySelector("#populationByRace").querySelector(".table").innerHTML = html;
        if ($("#areaofint").selectpicker("val")){
            selectedcommunity = $("#areaofint").children(":selected").attr("id").split("_")[1];
            if (selectedcommunity && communitydata[selectedcommunity][0]){
                $("#communityText").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.communityText); 
                $("#communityText").prop("disabled",false);
                if (geojsonObject.features[communitydata[selectedcommunity][0]].properties.ctext){
                    $("#communityName").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.ctext); 
                }else{
                    $("#communityName").val($("#areaofint").selectpicker("val"));
                    for (icomm = 0; icomm < communitydata[selectedcommunity].length; icomm++){
                        geojsonObject.features[communitydata[selectedcommunity][icomm]].properties.ctext = '';
//                         geojsonObject.features[communitydata[selectedcommunity][icomm]].properties.ctext = $("#areaofint").selectpicker("val");
                    }
                }
            }
        }
//        communitystart++;
        setTimeout(function(){
            processing = false;
        },500)
        for (i=0;i<geojsonObject.features.length;i++){
             if ($("#unassignedlayer").is(":checked")){
                  geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
                  geojsonObject.features[i].properties.linewidth = 3
                  if (geojsonObject.features[i].properties.color != -1){
                      geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                      geojsonObject.features[i].properties.linewidth = .7
                  }
             }else{
                   geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)"
                   geojsonObject.features[i].properties.linewidth = .7
             }
        }
        textchange = false;
        map.getSource("states").setData(geojsonObject);
        return;
    }
    if (linked == null){
        rnd = Math.random();
        features.forEach((element) => {
            if (!selectedIDS[element.id]){
                selectedIDS[element.id] = true;
                if (!hoverFeat[rnd]){
                    hoverFeat[rnd] = [];
                }
                hoverFeat[rnd].push(element);
                geojsonObject.features[element.id].linked = rnd;
                selectedColors[element.id] = color;
                geojsonObject.features[element.id].properties.color = color;
                map.setFeatureState(
                    { source: "states", id: element.id },
                    { hover: true,color:color}
                );
                geojsonObject.features[ihover].properties.communitycounter = color //communitystart;
            }else{
               selectedColors[element.id] = color;
               map.setFeatureState(
                   { source: "states", id: element.id },
                   { hover: true,color:color}
               ); 
            }
        })
        popSum = [];
        for (icolor = 0; icolor < colorcount; icolor++){
             popSum.push(0);
        }
        for (i=0;i<geojsonObject.features.length;i++){
             geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
             geojsonObject.features[i].properties.linewidth = 3
             if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){  
                 popSum[geojsonObject.features[i].properties.color] += geojsonObject.features[i].properties.P0020001
                 geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                 geojsonObject.features[i].properties.linewidth = .7
             }             
        }
        totPops = 0;
        for (ipop = 0; ipop < popSum.length; ipop++){
             popSum[ipop] = Math.round(popSum[ipop]);
             totPops += popSum[ipop]; 
        }
        unAssigned = totalPop - totPops;

        dperc = Math.round((unAssigned/totalPop)*100);

        pop_eval = {};
        for (ikey in getpopulation){
             vinit = [];
             for (icolor = 0; icolor < colorcount; icolor++){
                  vinit.push(0);
             }
             pinit = [];
             for (icolor = 0; icolor < colorcount; icolor++){
                  pinit.push(0);
             }
             pop_eval[ikey] = {};
             pop_eval[ikey]["value"] = vinit;
             pop_eval[ikey]["perc"] = pinit;
             pop_eval[ikey]["color"] = ""
        }
        for (i=0;i<geojsonObject.features.length;i++){
             if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){        
                 for (ikey in getpopulation){                
                      total = 0;
                      for (itkey = 0; itkey < getpopulation[ikey].length; itkey++){
                            total += geojsonObject.features[i].properties[getpopulation[ikey][itkey]]
                      }
                      pop_eval[ikey]["value"][geojsonObject.features[i].properties.color] += total
                 }
                 pop_eval[ikey]["color"] = colors1[geojsonObject.features[i].properties.color];
             }              
        }
        for (icount = 1; icount < colorcount; icount++){
             total = 0;
             for (ikey in pop_eval){
                  total += pop_eval[ikey]["value"][icount-1];
             }
             for (ikey in pop_eval){
                  if (total != 0 && pop_eval[ikey]["value"][icount-1] != 0){
                      pop_eval[ikey]["perc"][icount-1] = ((pop_eval[ikey]["value"][icount-1])/total)*100;
                      pop_eval[ikey]["perc"][icount-1] = Math.round(pop_eval[ikey]["perc"][icount-1] * 10) / 10;
                  }else{
                      pop_eval[ikey]["perc"][icount-1] = 0;
                  }
             }
        }
        html = "";
        html += "<thead>";
        html += '<tr class="text-center">';
        html += '<th scope="col" width="20px"></th>';
        for (ikey in getpopulation){
             html += '<th scope="col" style = "font-size:8px;">'+ikey+'</th>';
        }     
        html += "</thead>";   
        html += '<tbody>'
        for (icount = 1; icount < colorcount; icount++){
             html += '<tr>';
             html += '<th scope="row">'
             html += '<span class="brushColor" style="background-color:'+colors1[icount-1]+';">'+icount+'</span>';
             html += '</th>'
             for (ikey in  pop_eval){
                  html += '<td class="text-end">'+pop_eval[ikey]["perc"][icount-1]+'%</td>';
             }
             html += '</tr>';
        }
        total_v = {};
        total = 0;
        for (ikey in pop_eval){    
             for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
                  total += pop_eval[ikey]["value"][itkey];
             }
        }
        for (ikey in pop_eval){   
             value = 0;
             for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
                  value += pop_eval[ikey]["value"][itkey];
             } 
             if (value != 0 && total != 0){
                 total_v[ikey] = (value/total)*100;
                 total_v[ikey] = Math.round(total_v[ikey] * 10) / 10;
             }else{
                 total_v[ikey] = 0;
             }
        }
        html += '<tr>';
        html += '<th scope="row">Overall</th>';
        counter = 0;
        for (ikey in total_v){
             if (counter > 2){
                 counter = 0;
             }
             if (counter == 0){
                 html += '<td class="text-end table-dark">'+total_v[ikey]+"%"+"</td>";
                 counter++;
                 continue;
             }
             if (counter == 1){
                 html += '<td class="text-end table-secondary">'+total_v[ikey]+"%"+"</td>";
                 counter++;
                 continue;
             }
             if (counter == 2){
                 html += '<td class="text-end table-light">'+total_v[ikey]+"%"+"</td>";
                 counter++;
                 continue;
             }
        }
        html += '</tr>';
        html += '</tbody>'
        optionss = '' 
        $("#areaofint").empty();
        for (icomm = 0; icomm < communitystart; icomm++){
             for (i=0;i<geojsonObject.features.length;i++){
                  if (geojsonObject.features[i].properties.communitycounter == icomm+1){  
                      if (geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext){
                          datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">'+ geojsonObject.features[communitydata[icomm+1][0]].properties.ctext + '</span>' ; 
                          if ((color+1) == geojsonObject.features[i].properties.communitycounter){
                              $("#communityName").val(geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext);
                              optionss += "<option selected data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext+'</option>';
                          }else{
                              optionss += "<option data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext+'</option>';
                          }
                      }else{
                          datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">Community '+ (icomm+1) + '</span>' ; 
                          if ((color+1) == geojsonObject.features[i].properties.communitycounter){
                              textchange = true;
                              $("#communityName").val("Community "+(icomm+1));
                              optionss += "<option selected data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                          }else{
                              optionss += "<option data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                          }
                      }
                      break;
                  }
             }
        }

        $("#areaofint").html(optionss);
        $("#areaofint").selectpicker("refresh");
        document.querySelector("#populationByRace").querySelector(".table").innerHTML = html;
        if ($("#areaofint").selectpicker("val")){
            selectedcommunity = $("#areaofint").children(":selected").attr("id").split("_")[1];
            if (selectedcommunity && communitydata[selectedcommunity][0]){
                if (geojsonObject.features[communitydata[selectedcommunity][0]].properties.ctext){
                    $("#communityName").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.ctext); 
                }else{
                    $("#communityName").val($("#areaofint").selectpicker("val"));
                    for (icomm = 0; icomm < communitydata[selectedcommunity].length; icomm++){
                         geojsonObject.features[communitydata[selectedcommunity][icomm]].properties.ctext = '';
//                         geojsonObject.features[communitydata[selectedcommunity][icomm]].properties.ctext = $("#areaofint").selectpicker("val")
                    }
                }
            }
        }
//        communitystart++;
    }else{
        if (document.querySelector("#alreadydrawn").checked){
            setTimeout(function(){
                processing = false;
            },500)
            textchange = false;
            return;
        }
        rnd = Math.random();
        hoverFeat[linked].forEach((element) => {
           if (!selectedIDS[element.id]){
               if (!hoverFeat[linked]){
                   hoverFeat[linked] = [];
               }
               hoverFeat[linked].push(element);
               if (!selectedIDS[element.id]){
                   selectedIDS[element.id] = true;
               }
               geojsonObject.features[element.id].linked = rnd;
               selectedColors[element.id] = color
               geojsonObject.features[element.id].properties.color = color;
               geojsonObject.features[ihover].properties.communitycounter = color //communitystart;
               map.setFeatureState(
                   { source: "states", id: element.id },
                   { hover: true,color:color}
               ); 
           }else{
               selectedColors[element.id] = color;
               map.setFeatureState(
                   { source: "states", id: element.id },
                   { hover: true,color:color}
               ); 
           }
        })
       popSum = [];
       for (icolor = 0; icolor < colorcount; icolor++){
            popSum.push(0);
       }
       for (i=0;i<geojsonObject.features.length;i++){
            geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
            geojsonObject.features[i].properties.linewidth = 3
            if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){  
                popSum[geojsonObject.features[i].properties.color] += geojsonObject.features[i].properties.P0020001
                geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                geojsonObject.features[i].properties.linewidth = .7
            }             
       }
       totPops = 0;
       for (ipop = 0; ipop < popSum.length; ipop++){
            popSum[ipop] = Math.round(popSum[ipop]);
            totPops += popSum[ipop]; 
       }
       unAssigned = totalPop - totPops;

       dperc = Math.round((unAssigned/totalPop)*100);

       pop_eval = {};
       for (ikey in getpopulation){
            vinit = [];
            for (icolor = 0; icolor < colorcount; icolor++){
                 vinit.push(0);
            }
            pinit = [];
            for (icolor = 0; icolor < colorcount; icolor++){
                 pinit.push(0);
            }
            pop_eval[ikey] = {};
            pop_eval[ikey]["value"] = vinit;
            pop_eval[ikey]["perc"] = pinit;
            pop_eval[ikey]["color"] = ""
       }
       for (i=0;i<geojsonObject.features.length;i++){
            if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){        
                for (ikey in getpopulation){                
                     total = 0;
                     for (itkey = 0; itkey < getpopulation[ikey].length; itkey++){
                          total += geojsonObject.features[i].properties[getpopulation[ikey][itkey]]
                     }
                     pop_eval[ikey]["value"][geojsonObject.features[i].properties.color] += total
                }
                pop_eval[ikey]["color"] = colors1[geojsonObject.features[i].properties.color];
            }              
       }
       for (icount = 1; icount < colorcount; icount++){
            total = 0;
            for (ikey in pop_eval){
                 total += pop_eval[ikey]["value"][icount-1];
            }
            for (ikey in pop_eval){
                 if (total != 0 && pop_eval[ikey]["value"][icount-1] != 0){
                     pop_eval[ikey]["perc"][icount-1] = ((pop_eval[ikey]["value"][icount-1])/total)*100;
                     pop_eval[ikey]["perc"][icount-1] = Math.round(pop_eval[ikey]["perc"][icount-1] * 10) / 10;
                 }else{
                     pop_eval[ikey]["perc"][icount-1] = 0;
                 }
            }
       }
       html = "";
       html += "<thead>";
       html += '<tr class="text-center">';
       html += '<th scope="col" width="20px"></th>';
       for (ikey in getpopulation){
            html += '<th scope="col" style = "font-size:8px;">'+ikey+'</th>';
       }     
       html += "</thead>";   
       html += '<tbody>'
       for (icount = 1; icount < colorcount; icount++){
            html += '<tr>';
            html += '<th scope="row">'
            html += '<span class="brushColor" style="background-color:'+colors1[icount-1]+';">'+icount+'</span>';
            html += '</th>'
            for (ikey in  pop_eval){
                 html += '<td class="text-end">'+pop_eval[ikey]["perc"][icount-1]+'%</td>';
            }
            html += '</tr>';
       }
       total_v = {};
       total = 0;
       for (ikey in pop_eval){    
            for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
                 total += pop_eval[ikey]["value"][itkey];
            }
       }
       for (ikey in pop_eval){   
            value = 0;
            for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
                 value += pop_eval[ikey]["value"][itkey];
            } 
            if (value != 0 && total != 0){
                total_v[ikey] = (value/total)*100;
                total_v[ikey] = Math.round(total_v[ikey] * 10) / 10;
            }else{
                total_v[ikey] = 0;
            }
       }
       html += '<tr>';
       html += '<th scope="row">Overall</th>';
       counter = 0;
       for (ikey in total_v){
            if (counter > 2){
                counter = 0;
            }
            if (counter == 0){
                html += '<td class="text-end table-dark">'+total_v[ikey]+"%"+"</td>";
                counter++;
                continue;
            }
            if (counter == 1){
                html += '<td class="text-end table-secondary">'+total_v[ikey]+"%"+"</td>";
                counter++;
                continue;
            }
            if (counter == 2){
                html += '<td class="text-end table-light">'+total_v[ikey]+"%"+"</td>";
                counter++;
                continue;
            }
       }
       html += '</tr>';
       html += '</tbody>'
       optionss = '' 
       $("#areaofint").empty();
       for (icomm = 0; icomm < communitystart; icomm++){
            for (i=0;i<geojsonObject.features.length;i++){
                 if (geojsonObject.features[i].properties.communitycounter == icomm+1){  
                     if (geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext){
                         datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">'+ geojsonObject.features[communitydata[icomm+1][0]].properties.ctext + '</span>' ; 
                         if ((color+1) == geojsonObject.features[i].properties.communitycounter){
                             $("#communityName").val(geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext.split("_").join(" "));
                             optionss += "<option selected data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext+'</option>';
                         }else{
                             optionss += "<option data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext+'</option>';
                         }
                     }else{
                         datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">Community '+ (icomm+1) + '</span>' ; 
                         if ((color+1) == geojsonObject.features[i].properties.communitycounter){
                             textchange = true;
                             $("#communityName").val("Community "+(icomm+1));
                             optionss += "<option selected data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                         }else{
                             optionss += "<option data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                         }
                     }
                     break;
                 }
            }
       }

       $("#areaofint").html(optionss);
       $("#areaofint").selectpicker("refresh");
       document.querySelector("#populationByRace").querySelector(".table").innerHTML = html;
       if ($("#areaofint").selectpicker("val")){
           selectedcommunity = $("#areaofint").children(":selected").attr("id").split("_")[1];
           if (selectedcommunity && communitydata[selectedcommunity][0]){
               $("#communityText").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.communityText); 
               $("#communityText").prop("disabled",false);
               if (geojsonObject.features[communitydata[selectedcommunity][0]].properties.ctext){
                   $("#communityName").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.ctext); 
               }else{
                   $("#communityName").val($("#areaofint").selectpicker("val"));
                   for (icomm = 0; icomm < communitydata[selectedcommunity].length; icomm++){
                        geojsonObject.features[communitydata[selectedcommunity][icomm]].properties.ctext = '';
//                        geojsonObject.features[communitydata[selectedcommunity][icomm]].properties.ctext = $("#areaofint").selectpicker("val");
                   }
               }
           }
       }
//       communitystart++;
    }
    setTimeout(function(){
       processing = false;
    },500)
    for (i=0;i<geojsonObject.features.length;i++){
         if ($("#unassignedlayer").is(":checked")){
             geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
             geojsonObject.features[i].properties.linewidth = 3
             if (geojsonObject.features[i].properties.color != -1){
                 geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                 geojsonObject.features[i].properties.linewidth = .7
             }
         }else{
             geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)"
             geojsonObject.features[i].properties.linewidth = .7
         }
    }
    textchange = false;
    map.getSource("states").setData(geojsonObject);
}

function boxAround(point, radius) {
  var southwest = [point.x + radius, point.y + radius];
  var northeast = [point.x - radius, point.y - radius];
  return [northeast, southwest];
}

function resize(){
  document.querySelector(".map").style.width = window.innerWidth - document.querySelector("#sideBar").offsetWidth +"px";
  map.resize();
  map.fitBounds(bounds);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function downloadJson() {
  var data = geojsonObject
  var fileName = firebase_file_name_ +'.geojson'
  var fileToSave = new Blob([JSON.stringify(data)], {
     type: 'application/json'
  });
  saveAs(fileToSave, fileName);
}


function eraseLayers(e){
    var box = boxAround(e.point, parseFloat(document.querySelector("#brushSize").innerHTML));
    var features = map.queryRenderedFeatures(box, {
        layers: ["state-fills"],
    });
    features.forEach((element) => {
        if (geojsonObject.features[element.id] && geojsonObject.features[element.id].linked){
            lnk = geojsonObject.features[element.id].linked;
            if (hoverFeat[lnk]){
                tlnk = [];
                for (ihov = 0; ihov < hoverFeat[lnk].length; ihov++){
                     if (element.id == hoverFeat[lnk][ihov].id){
                         continue;
                     }
                     tlnk.push(hoverFeat[lnk][ihov]);
                }
                hoverFeat[lnk] = tlnk;
            }
            hfeet = {};
            for (hkey in hoverFeat){
                 if (hoverFeat[hkey].length == 0){
                     continue;
                 }
                 hfeet[hkey] = hoverFeat[hkey];
            }
            hoverFeat = hfeet;
            if (selectedIDS[element.id]){
                selectedIDS[element.id] = false;
            }

            delete geojsonObject.features[element.id].linked;
            delete geojsonObject.features[element.id].properties.communitycounter;
            delete geojsonObject.features[element.id].properties.communityText
            delete geojsonObject.features[element.id].properties.ctext
            selectedColors[element.id] = -1;
            geojsonObject.features[element.id].properties.color = -1;
            map.setFeatureState(
               { source: "states", id: element.id },
               { hover: false}
            );
         }
   })
   
   for (xkey in selectedColors){
        geojsonObject.features[xkey].properties.color = selectedColors[xkey];
   }
   popSum = [];
   for (icolor = 0; icolor < colorcount; icolor++){
        popSum.push(0);
   }
   ncomm = {};
//   communitystart = 0;
   for (i=0;i<geojsonObject.features.length;i++){
        if (geojsonObject.features[i].properties.communitycounter && !ncomm[geojsonObject.features[i].properties.communitycounter]){
            ncomm[geojsonObject.features[i].properties.communitycounter] = [];
        }
        if (geojsonObject.features[i].properties.communitycounter){
            ncomm[geojsonObject.features[i].properties.communitycounter].push(geojsonObject.features[i].properties.id);
        }
        if (geojsonObject.features[i].properties.communitycounter && geojsonObject.features[i].properties.communitycounter > communitystart){
//            communitystart = geojsonObject.features[i].properties.communitycounter
        }
        if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){  
            popSum[geojsonObject.features[i].properties.color] += geojsonObject.features[i].properties.P0020001
        }             
   }
   communitydata = ncomm;
   ncommt = {};
   counter = 1;
   for (icomm in communitydata){
        if (communitydata[icomm].length == 0){
//            continue;
        } 
        if (!ncommt[counter]){
            ncommt[counter] = [];
        }
        ncommt[counter] = communitydata[icomm];
        counter = counter + 1;
   }
   communitydata = ncommt; 
//   communitystart = counter-1;
   for (i=0;i<geojsonObject.features.length;i++){
        delete geojsonObject.features[i].properties.communitycounter;
        for (icomm in communitydata){
             for (icon1 = 0; icon1 < communitydata[icomm].length; icon1++){
                  if (communitydata[icomm][icon1] == geojsonObject.features[i].properties.id){
                      geojsonObject.features[i].properties.communitycounter = icomm;
                  }
             }
        }
   };
   totPops = 0;
   for (ipop = 0; ipop < popSum.length; ipop++){
        popSum[ipop] = Math.round(popSum[ipop]);
        totPops += popSum[ipop]; 
   }
   unAssigned = totalPop - totPops;

   dperc = Math.round((unAssigned/totalPop)*100);

   pop_eval = {};
   for (ikey in getpopulation){
        vinit = [];
        for (icolor = 0; icolor < colorcount; icolor++){
             vinit.push(0);
        }
        pinit = [];
        for (icolor = 0; icolor < colorcount; icolor++){
             pinit.push(0);
        }
        pop_eval[ikey] = {};
        pop_eval[ikey]["value"] = vinit;
        pop_eval[ikey]["perc"] = pinit;
        pop_eval[ikey]["color"] = ""
   }
   for (i=0;i<geojsonObject.features.length;i++){
        geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
        geojsonObject.features[i].properties.linewidth = 3
        if (geojsonObject.features[i].properties.color  > -1 && geojsonObject.features[i].properties.color < 5){        
            for (ikey in getpopulation){                
                 total = 0;
                 for (itkey = 0; itkey < getpopulation[ikey].length; itkey++){
                      total += geojsonObject.features[i].properties[getpopulation[ikey][itkey]]
                 }
                 pop_eval[ikey]["value"][geojsonObject.features[i].properties.color] += total
            }
            geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
            geojsonObject.features[i].properties.linewidth = .7
            pop_eval[ikey]["color"] = colors1[geojsonObject.features[i].properties.color];
        }              
   }
   for (icount = 1; icount < colorcount; icount++){
        total = 0;
        for (ikey in pop_eval){
             total += pop_eval[ikey]["value"][icount-1];
        }
        for (ikey in pop_eval){
             if (total != 0 && pop_eval[ikey]["value"][icount-1] != 0){
                 pop_eval[ikey]["perc"][icount-1] = ((pop_eval[ikey]["value"][icount-1])/total)*100;
                 pop_eval[ikey]["perc"][icount-1] = Math.round(pop_eval[ikey]["perc"][icount-1] * 10) / 10;
             }else{
                 pop_eval[ikey]["perc"][icount-1] = 0;
             }
        }
   }
   html = "";
   html += "<thead>";
   html += '<tr class="text-center">';
   html += '<th scope="col" width="20px"></th>';
   for (ikey in getpopulation){
        html += '<th scope="col" style = "font-size:8px;">'+ikey+'</th>';
   }     
   html += "</thead>";   
   html += '<tbody>'
   for (icount = 1; icount < colorcount; icount++){
        html += '<tr>';
        html += '<th scope="row">'
        html += '<span class="brushColor" style="background-color:'+colors1[icount-1]+';">'+icount+'</span>';
        html += '</th>'
        for (ikey in  pop_eval){
             html += '<td class="text-end">'+pop_eval[ikey]["perc"][icount-1]+'%</td>';
        }
        html += '</tr>';
   }
   total_v = {};
   total = 0;
   for (ikey in pop_eval){    
        for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
             total += pop_eval[ikey]["value"][itkey];
        }
   }
   for (ikey in pop_eval){   
        value = 0;
        for (itkey = 0; itkey <  pop_eval[ikey]["value"].length; itkey++){            
             value += pop_eval[ikey]["value"][itkey];
        } 
        if (value != 0 && total != 0){
            total_v[ikey] = (value/total)*100;
            total_v[ikey] = Math.round(total_v[ikey] * 10) / 10;
        }else{
            total_v[ikey] = 0;
        }
   }
   html += '<tr>';
   html += '<th scope="row">Overall</th>';
   counter = 0;
   for (ikey in total_v){
        if (counter > 2){
            counter = 0;
        }
        if (counter == 0){
            html += '<td class="text-end table-dark">'+total_v[ikey]+"%"+"</td>";
            counter++;
            continue;
        }
        if (counter == 1){
            html += '<td class="text-end table-secondary">'+total_v[ikey]+"%"+"</td>";
            counter++;
            continue;
        }
        if (counter == 2){
            html += '<td class="text-end table-light">'+total_v[ikey]+"%"+"</td>";
            counter++;
            continue;
        }
   }
   html += '</tr>';
   html += '</tbody>'
   optionss = '';
   $("#communityName").val("")
   $("#areaofint").empty();
   $("#areaofint").selectpicker("refresh");
   for (icomm = 0; icomm < communitystart; icomm++){
        for (i=0;i<geojsonObject.features.length;i++){
             if (geojsonObject.features[i].properties.communitycounter == icomm+1){  
                 if (geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext){
                     datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">'+ geojsonObject.features[communitydata[icomm+1][0]].properties.ctext + '</span>' ; 
                     if ((icomm+1) == geojsonObject.features[i].properties.communitycounter){
                         $("#communityName").val(geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext.split("_").join(" "));
                         optionss += "<option selected data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext+'</option>';
                     }else{
                         optionss += "<option data-content = '"  + datacon + "' value = '" + geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext + "'  id = 'comm_"+(icomm+1)+"'>"+geojsonObject.features[communitydata[geojsonObject.features[i].properties.communitycounter][0]].properties.ctext+'</option>';
                     }
                 }else{
                     datacon = '<div id = "circle" style="bottom:8px;float:left;background-color: '+colors1[geojsonObject.features[i].properties.color]+';"></div><span style = "position:absolute;float:left;padding-left:25px;top:2px;">Community '+ (icomm+1) + '</span>' ; 
                     if ((icomm+1) == geojsonObject.features[i].properties.communitycounter){
                         textchange = true;
                         $("#communityName").val("Community "+(icomm+1));
                         optionss += "<option selected data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                     }else{
                         optionss += "<option data-content = '"  + datacon + "' value = '" + "Community "+(icomm+1) + "'  id = 'comm_"+(icomm+1)+"'>Community "+(icomm+1)+'</option>';
                     }
                 }
                 break;
            }
       }
   } 
   $("#areaofint").html(optionss);
   $("#areaofint").selectpicker("refresh");
   document.querySelector("#populationByRace").querySelector(".table").innerHTML = html;
   if ($("#areaofint").selectpicker("val")){
       selectedcommunity = $("#areaofint").selectpicker("val").split("_")[1];
       if (selectedcommunity && communitydata[selectedcommunity][0]){
           $("#communityText").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.communityText); 
           $("#communityName").val(geojsonObject.features[communitydata[selectedcommunity][0]].properties.ctext.split("_").join(" ")); 
           $("#communityText").prop("disabled",false);
       }
   }
//   communitystart++;
   for (i=0;i<geojsonObject.features.length;i++){
        if ($("#unassignedlayer").is(":checked")){
            geojsonObject.features[i].properties.linecolor = "rgb(240,0,169)";
            geojsonObject.features[i].properties.linewidth = 3
            if (geojsonObject.features[i].properties.color != -1){
                geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)";
                geojsonObject.features[i].properties.linewidth = .7
            }
        }else{
             geojsonObject.features[i].properties.linecolor = "rgb(78,78,78)"
             geojsonObject.features[i].properties.linewidth = .7
        }
   }
   textchange = false;
   map.getSource("states").setData(geojsonObject);
   for (icolors = 0; icolors < colors1.length; icolors++){
        if (!communitydata[icolors+1]){
            communitydata[icolors+1] = [];
        }
   }

}

function eraseLayersactivate(){
    eraselayeractive = true;
    var canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 24;
    //document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.font = "24px FontAwesome";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\uf002", 12, 12);
    var dataURL = canvas.toDataURL('image/png')
    $('.map').find("canvas").css('cursor', 'url('+dataURL+'), auto');
}

function saveCommunities(){
   $("#myModalLabel2").text("Save");
   $("#save").show();
   $("#generate").hide();
   document.querySelector("#fileSaveconfirm").querySelector(".modal-body").innerHTML = 'Name :<input id = "savefile" style = "width:80%" type = "textbox">';
   $("#fileSaveconfirm").modal('show')
}


function checkfileandsave(){
  file = $("#savefile").val();   
  ref = firebase.database().ref('Users/bart/'+file)
  filefound = false;
  ref.once("value", function(snapshot) { 
        checked1 = null;
        if (snapshot.val() && snapshot.val().checked){
            checked1 = snapshot.val().checked; 
        }
        if (checked1 != null && checked1.length > 0){
            filefound = true;
        }else{
           if (checked1 == null){
                filefound = false;
           }else{
                filefound = true; 
           }
       }
       if (filefound){
           alert("Already exists");
           return;
       }
  });
  setTimeout(function(){
     if (!filefound){
         ggeojson = {};
         ggeojson.checked = checked;
         ggeojson.county = "Bart";
         ggeojson.type = "Community";
         feat = {};
         for (ifeat = 0; ifeat < geojsonObject.features.length; ifeat++){
              if (geojsonObject.features[ifeat].properties.color == -1){
                  continue;
              }
              if (!feat[geojsonObject.features[ifeat].properties.id]){
                  feat[geojsonObject.features[ifeat].properties.id] = {};
              }
              feat[geojsonObject.features[ifeat].properties.id]["color"] = geojsonObject.features[ifeat].properties.color; 
              feat[geojsonObject.features[ifeat].properties.id]["text"] = '';
              if (geojsonObject.features[ifeat].properties.communityText){
                  feat[geojsonObject.features[ifeat].properties.id]["text"]  = geojsonObject.features[ifeat].properties.communityText;
              }
              feat[geojsonObject.features[ifeat].properties.id]["ctext"] = '';
              if (geojsonObject.features[ifeat].properties.ctext){
                  feat[geojsonObject.features[ifeat].properties.id]["ctext"]  = geojsonObject.features[ifeat].properties.ctext;
              }
              feat[geojsonObject.features[ifeat].properties.id]["counter"]  = geojsonObject.features[ifeat].properties.communitycounter;
              feat[geojsonObject.features[ifeat].properties.id]["linked"] = -1;
              if (geojsonObject.features[ifeat].linked != -1){
                  feat[geojsonObject.features[ifeat].properties.id]["linked"] = geojsonObject.features[ifeat].linked;
              }
         }
         ggeojson.gjson = feat;
         file = file.split(" ").join("zzttvvwwhh");
         firebase.database().ref('Users/bart/' + file).set(ggeojson); 
         $("#fileSaveconfirm").modal('hide');
     }
  },5000);
}


function unassignedlayer(event){
   for (ifeat = 0; ifeat < geojsonObject.features.length; ifeat++){
        if (selectedIDS[geojsonObject.features[ifeat].properties.id]){
            geojsonObject.features[ifeat].properties.linecolor = "rgb(78,78,78)";
            geojsonObject.features[ifeat].properties.linewidth = .7
            continue;
        } 
        if (document.getElementById("unassignedlayer").checked){
            geojsonObject.features[ifeat].properties.linecolor = "rgb(240,0,169)";
            geojsonObject.features[ifeat].properties.linewidth = 3
        }else{
            geojsonObject.features[ifeat].properties.linecolor = "rgb(78,78,78)";
            geojsonObject.features[ifeat].properties.linewidth = .7
        }
   }   
   map.getSource("states").setData(geojsonObject);
}


function Home(){
   history.back()
}


window.onresize = resize;
