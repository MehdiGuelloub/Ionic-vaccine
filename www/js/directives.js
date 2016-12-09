app.directive('mgZoomOut', ['$rootScope', function($rootScope){
  return {
    restrict: 'A',
    link: function($scope, iElm, iAttrs, controller) {
     iElm.bind('click', function(e) {
        $rootScope.$broadcast('zoomMoin');
      });
    }
  };
}]);

app.directive('mgZoomIn', ['$rootScope', function($rootScope){
  return {
    restrict: 'A',
    link: function($scope, iElm, iAttrs, controller) {
      iElm.bind('click', function(e) {
        $rootScope.$broadcast('zoomPlus');
      });
    }
  };
}]);

app.directive('mgDraw', [function(){
  return {
    scope: {
      informations: '='
    },
    link: function($scope, iElm, iAttrs, controller) {
          $scope.topoColors = ['BlueViolet','LightSlateGray','CornflowerBlue','SeaGreen','DarkGoldenRod','DarkOliveGreen','MidnightBlue'];
          $scope.$watch('informations', function(newValue, oldValue) {
              if ((newValue !== oldValue)) {
                    var canvas = document.getElementById("canvas");
                    var ctx = canvas.getContext("2d");
                    var PI = Math.PI;
                    var rotation = -90;
                    var arcs = [];                   

                    //To Put Dynamically
                    var nbsouche = newValue.length;
                    var nbcellules = ((nbsouche - 1) > 0) ? newValue[1].colors.length : 0;
                     
                    var angle = 360/nbcellules;
                    var offset = 0;

                    for (j = nbsouche;j > 1 ; j--) {
                        for (i=1;i <= nbcellules; i++)
                        {
                          var celcolor = (newValue[j-1].colors[i-1]) ? newValue[j-1].colors[i-1] : {couleur: "grey"};
                          arcs.push({cx: 203,cy: 203,radius: ((((nbsouche- j) + 2) * 35) - offset) ,startAngle: ((i-1)*angle)+1,endAngle: i * angle,color: celcolor.couleur});
                        }
                        offset += 12;
                    };
                    if (nbsouche > 1) {
                      var compteur = 0;
                      var x=0;
                      angular.forEach(newValue[0], function(topo, key){
                        x++;
                        arcs.push({cx: 203,cy: 203,radius: ((nbsouche +1) *30) , startAngle: compteur * 360, endAngle: (compteur + (topo.nbr/ nbcellules)) * 360 ,color: $scope.topoColors[x-1], ctxw: 10});
                        compteur = (compteur + (topo.nbr/ nbcellules));
                      });
                    }

                    function drawTextAlongArc(context, str, centerX, centerY, radius, angle) {
                        var len = str.length, s, letterAngle;

                        context.save();
                        context.textAlign = 'left';
                        context.translate(centerX, centerY);
                        context.rotate(angle + Math.PI / 2);

                        for (var n = 0; n < len; n++) {
                            s = str[n];
                            letterAngle = 0.5*(context.measureText(s).width / radius);

                            context.rotate(letterAngle);
                            context.save();
                            context.font = '9px "Open Sans"';
                            context.textBaseline = 'middle';
                            context.translate(0, -radius);
                            context.fillText(s, 0, 0);
                            context.restore();

                            context.rotate(letterAngle);
                        }
                        context.restore();
                    }

                    function drawAll() {
                      var c=0, Label;
                       ctx.clearRect(0,0,canvas.width,canvas.height);
                       for (var i = 0; i < arcs.length; i++) {
                        if (arcs[i].ctxw) {
                          Label = ((newValue[0])[c].name === 'O Eastern Africa') ? 'O E.Af' : (newValue[0])[c].name
                          ctx.lineWidth = 10;
                          var radius = arcs[i].radius + 10;
                          var x = arcs[i].startAngle* Math.PI / 180- Math.PI / 2;
                          var y = arcs[i].endAngle* Math.PI / 180- Math.PI / 2;
                          var angle = ((x+y)/2)-0.2;
                          drawTextAlongArc(ctx, Label , 203, 203, radius, angle);
                          c++;
                        } else{
                          ctx.lineWidth = 20;
                        }
                         draw(arcs[i]);
                       }
                       if (arcs.length > 0) {
                        //Souches
                        var j = 0
                          ctx.font = 'bold 13px "Open Sans"';
                          for (var i = 1; i < newValue.length; i++) {
                            ctx.fillText(newValue[i].name, 168, 185 + j);
                            ctx.beginPath();
                            ctx.moveTo(175 + ctx.measureText(newValue[i].name).width, 181 + j);
                            ctx.lineTo(270 + ((newValue.length - 1 - i) * 25.5) , 181 + j);
                            ctx.lineWidth = 2;
                            ctx.stroke();
                            j += 15;
                          }
                       };
                    }

                    function draw(a) {
                       ctx.save();
                       ctx.translate(a.cx, a.cy);
                       ctx.rotate(rotation * PI / 180);
                       ctx.beginPath();
                       ctx.arc(0, 0, a.radius, a.startAngle * PI / 180, a.endAngle * PI / 180);
                       ctx.strokeStyle = a.color;
                       ctx.stroke();
                       ctx.restore();
                    }
                    
                    drawAll();
              }
          }, true);
      }
    }
}]);

app.directive('leaflet', [function(){
  return {
     restrict: 'E',
        replace: true,
        template: '<div style="height:700px;background:#fff"></div>',
        link: function(scope, element, attrs) {
            var southWest = L.latLng(-60,-179.64843750000003),
            northEast = L.latLng(60,178.24218750000003),
            bounds = L.latLngBounds(southWest, northEast);

            var map = L.map(attrs.id, {
                center: [0, 55],
                zoom: 3,
                attributionControl:false,
                zoomControl:false,
                preferCanvas: true,
                maxBounds: bounds
            });

            map.setMaxBounds(new L.latLngBounds(
              map.unproject([1, 4095], 4),
              map.unproject([4095, 1], 4)
            ));

            L.tileLayer('img/map_tiles/{z}/{x}/{y}.png', {
                minZoom: 2,
                maxZoom: 4,
                bounds:bounds,
                noWrap: true
            }).addTo(map);

            var oind = L.divIcon({html: "<p>o ind-2001</p>", iconSize: null ,className: 'icon o-icon'});
            var opanasia2 = L.divIcon({html: "<p>o panasia-2</p>", iconSize: null ,className: 'icon o-icon'});
            var oindpanasia2 = L.divIcon({html: "<p>o ind-2001</p><p>o panasia-2</p>", iconSize: null ,className: 'icon o-icon'});
            var opmi = L.divIcon({html: "<p>o panasia-2</p><p>o mya-98</p><p>o ind-2001</p>", iconSize: null ,className: 'icon o-icon'});
            var opm = L.divIcon({html: "<p>o panasia-2</p><p>o mya-98</p>", iconSize: null ,className: 'icon o-icon'});
            var opanasia = L.divIcon({html: "<p>o panasia</p>", iconSize: null ,className: 'icon o-icon'});
            var oeastafrica = L.divIcon({html: "<p>o east africa</p>", iconSize: null ,className: 'icon o-icon'});
            var owestafrica = L.divIcon({html: "<p>o west africa</p>", iconSize: null ,className: 'icon o-icon'});
            var oeastwestafrica = L.divIcon({html: "<p>o west africa</p><p>o east africa</p>", iconSize: null ,className: 'icon o-icon'});
            var owestafrica = L.divIcon({html: "<p>o west africa</p>", iconSize: null ,className: 'icon o-icon'});
            var omya98 = L.divIcon({html: "<p>o mya-98</p>", iconSize: null ,className: 'icon o-icon'});
            var ocathay = L.divIcon({html: "<p>o cathay</p>", iconSize: null ,className: 'icon o-icon'});
            
            var aafrica = L.divIcon({html: "<p>a africa</p>", iconSize: null ,className: 'icon a-icon'});
            var aafricairan05 = L.divIcon({html: "<p>a iran-05</p><p>a africa</p>", iconSize: null ,className: 'icon a-icon'});
            var airan05 = L.divIcon({html: "<p>a iran-05</p>", iconSize: null ,className: 'icon a-icon'});
            var agvii = L.divIcon({html: "<p>a g-vii</p>", iconSize: null ,className: 'icon a-icon'});
            var agiran = L.divIcon({html: "<p>a g-vii</p><p>a iran-05</p>", iconSize: null ,className: 'icon a-icon'});
            var asea97 = L.divIcon({html: "<p>as ea 97</p>", iconSize: null ,className: 'icon a-icon'});
            
            var sat1inwz = L.divIcon({html: "<p>sat1 I-nwz</p>", iconSize: null ,className: 'icon sat1-icon'});
            var sat1 = L.divIcon({html: "<p>sat1 III-nwz</p><p>sat1 II-(sez)</p>", iconSize: null ,className: 'icon sat1-icon'});
            var sat2v2 = L.divIcon({html: "<p>sat2 VII</p>", iconSize: null ,className: 'icon sat2-icon'});
            var sat2v2x3 = L.divIcon({html: "<p>sat2 VII</p><p>sat2 xiii</p>", iconSize: null ,className: 'icon sat2-icon'});
            var sat2123 = L.divIcon({html: "<p>sat2 i</p><p>sat2 ii</p><p>sat2 iii</p>", iconSize: null ,className: 'icon sat2-icon'});
            var sat3wz = L.divIcon({html: "<p>sat3-II wz</p>", iconSize: null ,className: 'icon sat3-icon'});
            var asiasind = L.divIcon({html: "<p>asia 1 sindh-08</p>", iconSize: null ,className: 'icon asia-icon'});

            var seroO = L.icon({iconUrl: 'img/map_icons/O.png',iconSize: [45, 45]});

            var seroA = L.icon({iconUrl: 'img/map_icons/A.png',iconSize: [45, 45]});

            var seroSAT1 = L.icon({iconUrl: 'img/map_icons/SAT1.png',iconSize: [45, 45]});

            var seroSAT2 = L.icon({iconUrl: 'img/map_icons/SAT2.png',iconSize: [45, 45]});

            var seroSAT3 = L.icon({iconUrl: 'img/map_icons/SAT3.png',iconSize: [45, 45]});

            var seroASIA = L.icon({iconUrl: 'img/map_icons/ASIA.png',iconSize: [45, 45]});

            var markers = [
                {
                  type: 'O',
                  pool: 'Zone 3',
                  coords: [7.536764322084078, -16.259765625000004],
                  icon: seroO,
                  msg: "O/ME-SA/Ind-2001/d<br>2015: Morocco",
                  popupCls: "popup_o",
                  label: {coords: [7.536764322084078, -22.759765625000004], icon: oind}
                },{
                  type: 'O',
                  pool: 'Zone 3',
                  coords: [6.839169626342808,-7.119140625],
                  icon: seroO,
                  msg: "O/ME-SA/Ind-2001/d<br>2014: Algeria",
                  popupCls: "popup_o",
                  label: {coords: [4.839169626342808,-9.119140625], icon: oind}
                },{
                  type: 'O',
                  pool: 'Zone 3',
                  coords: [9.882275493429953,-0.703125],
                  icon: seroO,
                  msg: "O/ME-SA/Ind-2001/d<br>2014: Tunisia",
                  popupCls: "popup_o",
                  label: {coords: [12.882275493429953,-2.703125], icon: oind}
                },{
                  type: 'O',
                  pool: 'Zone 5',
                  coords: [-11.60919340793894, -8.701171875000002],
                  icon: seroO,
                  msg: "O/WA<br>2014: Nigeria",
                  popupCls: "popup_o",
                  label: {coords: [-10.141931686131018, -6.185546875000001], icon: oeastwestafrica}
                },{
                  type: 'O',
                  pool: 'Zone 3',
                  coords: [-1.0546279422758742,14.150390625000002],
                  icon: seroO,
                  msg: "O/EA-3<br>2014: Egypt ",
                  popupCls: "popup_o",
                  label: {coords: [2.0546279422758742,10.150390625000002], icon: oeastafrica}
                },{
                  type: 'O',
                  pool: 'Zone 4',
                  coords: [-19.228176737766248,26.982421875000004],
                  icon: seroO,
                  msg: "O/EA-2<br>2014: Tanzania<br><br>O/EA-3<br>2014: Ethiopa<br>2015: Ethiopa<br><br>O/EA-4                                          <br>2016: Ethiopa                                          ",
                  popupCls: "popup_o",
                  label: {coords: [-16.228176737766248,24.982421875000004], icon: oeastafrica}
                },{
                  type: 'O',
                  pool: 'Zone 3',
                  coords: [13.068776734357694,20.390625000000004],
                  icon: seroO,
                  msg: "O/ME-SA/PanAsia-2//FAR-09<br>2014: Turkey, Israel <br>2015: Turkey <br><br>O/ME-SA/PanAsia<br>2015: Israel, Palestinian AT",
                  popupCls: "popup_o",
                  label: {coords: [11.068776734357694,18.390625000000004], icon: opanasia2}
                },{
                  type: 'O',
                  pool: 'Zone 3',
                  coords: [-1.5818302639606454,35.15625000000001],
                  icon: seroO,
                  msg: "O/ME-SA/Ind-2001/d<br>2014: Saudi Arabia, United Arab Emirates, <br>2015 : Saudi Arabia, Bahrain, United Arab Emirates<br>2016 : Saudi Arabia<br><br>O/ME-SA/PanAsia-2//ANT-10<br>2014: Bahrain<br><br>O/ME-SA/PanAsia-2//BAL-09<br>2016: Kuwait",
                  popupCls: "popup_o",
                  label: {coords: [3,33.15625000000001], icon: oindpanasia2}
                },{
                  type: 'O',
                  pool: 'Zone 3',
                  coords: [3.5134210456400448,56.1953125000001],
                  icon: seroO,
                  msg: "O/ME-SA/PanAsia-2//ANT-10<br>2014: Pakistan, Afghanistan<br>2015: Pakistan<br><br>O/ME-SA/PanAsia-2//BAL-09<br>2015: Pakistan<br><br>O/ME-SA/PanAsia-2//PAK-98<br>2015: Pakistan",
                  popupCls: "popup_o",
                  label: {coords: [1.5134210456400448,51.01953125000001], icon: opanasia2}
                },{
                  type: 'O',
                  pool: 'Zone 3',
                  coords: [10.882275493429953, 46.494140625],
                  icon: seroO,
                  msg: "O/ME-SA/PanAsia-2//ANT-10 <br>2015: Iran<br>O/ME-SA/PanAsia-2//BAL-09<br>2015: Iran<br>O/ME-SA/PanAsia-2//FAR-09<br>2015: Iran",
                  popupCls: "popup_o",
                  label: {coords: [14.353349393643416,43], icon: opanasia2}
                },{
                  type: 'O',
                  pool: 'Zone 1',
                  coords: [2.28455066023697, 78.92578125000001],
                  icon: seroO,
                  msg: "O/ME-SA/PanAsia-2/KAT-15<br>2015 : Nepal <br><br>O/ME-SA/Ind-2001/d<br>2014 : Nepal<br>2015 : Nepal",
                  popupCls: "popup_o",
                  label: {coords: [3.8113711933311403, 81.65039062500001], icon: oindpanasia2}
                },{
                  type: 'O',
                  pool: 'Zone 1',
                  coords: [-6.751896464843375,90.17578125000001],
                  icon: seroO,
                  msg: "O/ME-SA/PanAsia<br>2014 : Vietnam<br>2015 : Thailand, Cambodia, <br><br>O/SEA/Mya-98 :<br>2014 : Thailand, vietnam, Malaysia<br>2015 : Thailand, Myanmar, Mongolia, Vietnam<br>2016 : Thailand, Laos <br><br>O/ME-SA/Ind-2001/d: <br>2015 : Laos ",
                  popupCls: "popup_o",
                  label: {coords: [-1,88.17578125000001], icon: opmi}
                },{
                  type: 'O',
                  pool: 'Zone 1',
                  coords: [29.22889003019423,86.66015625000001],
                  icon: seroO,
                  msg: "O/SEA/Mya-98<br>2014: Russian Federation<br><br>O/ME-SA/PanAsia<br>2014: Russian Federation <br>2014: Mongolia ",
                  popupCls: "popup_o",
                  label: {coords: [27.22889003019423,84.66015625000001], icon: opm}
                },{
                  type: 'O',
                  pool: 'Zone 1',
                  coords: [11.695272733029402,117.42187500000001],
                  icon: seroO,
                  msg: "O/SEA/Mya-98<br>2014 : South Korea",
                  popupCls: "popup_o",
                  label: {coords: [9.695272733029402,115.42187500000001], icon: omya98}
                },{
                  type: 'O',
                  pool: 'Zone 1',
                  coords: [-2.460181181020993,109.830078125],
                  icon: seroO,
                  msg: "O/CATHAY<br>2014 : Hong Kong <br>2015 : Hong Kong",
                  popupCls: "popup_o",
                  label: {coords: [0.460181181020993,107.830078125], icon: ocathay}
                },{
                  type: 'A',
                  pool: 'Zone 5',
                  coords: [-15.001416841159385, -10.957059860229494],
                  icon: seroA,
                  msg: "A/AFRICA/G-IV:<br>2009: Nigeria",
                  popupCls: "popup_a",
                  label: {coords: [-17.476432197195518,-12.986328125000002], icon: aafrica}
                },{
                  type: 'A',
                  pool: 'Zone 3',
                  coords: [2.0210651187669897,18.017578125000004],
                  icon: seroA,
                  msg: "A/Asia/Iran-05//BAR-08<br>2014: Egypt",
                  popupCls: "popup_a",
                  label: {coords: [3.7210651187669897,20.017578125000004], icon: aafricairan05}
                },{
                  type: 'A',
                  pool: 'Zone 3',
                  coords: [19.31,23.73046875],
                  icon: seroA,
                  msg: "A/Asia/Iran-05//SIS-10<br>2014: Turkey<br>2015: Turkey",
                  popupCls: "popup_a",
                  label: {coords: [23.81,21.73046875], icon: agiran}
                },{
                  type: 'A',
                  pool: 'Zone 4',
                  coords: [-21.12549763660628,31.552734375000004],
                  icon: seroA,
                  msg: "A/AFRICA/G-IV<br>2015: Ethiopa",
                  popupCls: "popup_a",
                  label: {coords: [-20.12549763660628,33.552734375000004], icon: aafrica}
                },{
                  type: 'A',
                  pool: 'Zone 3',
                  coords: [-7.798078531355303,33.75000000000001],
                  icon: seroA,
                  msg: "A/Asia/G-VII (aka G-18)<br>2015: Saudi Arabia <br><br>A/Asia/G-VII<br>2015 : Saudi Arabia",
                  popupCls: "popup_a",
                  label: {coords: [-9.398078531355303,32.75000000000001], icon: agvii}
                },{
                  type: 'A',
                  pool: 'Zone 3',
                  coords: [6.315298538330033,46.40625000000001],
                  icon: seroA,
                  msg: "A/Asia/Iran-05//FAR-11<br>2014: Iran<br><br>A/Asia/G-VII<br>2015: Iran<br><br>A/Asia/Iran-05//FAR-09<br>2015: Iran<br><br>A/Asia/Iran-05//SIS-10<br>2014: Iran<br>2015: Iran",
                  popupCls: "popup_a",
                  label: {coords: [4.415298538330033,44.40625000000001], icon: agiran}
                },{
                  type: 'A',
                  pool: 'Zone 3',
                  coords: [4.425691524418062, 60.29296875000001],
                  icon: seroA,
                  msg: "A/Asia/Iran-05//FAR-09<br>2014 : Pakistan<br>2015 : Pakistan<br><br>A/Asia/Iran-05//FAR-11<br>2014 : Pakistan<br>2015 : Pakistan",
                  popupCls: "popup_a",
                  label: {coords: [5.528510525692801, 62.66601562500001], icon: airan05}
                },{
                  type: 'A',
                  pool: 'Zone 1',
                  coords: [-13.081702590543715,92.4609375],
                  icon: seroA,
                  msg: "A/ASIA/Sea-97 :<br>2014: Thailand, Vietnam, Laos<br>2015: Thailand, Laos, Cambodia, Myanmar, Vietnam<br>2016: Thailand",
                  popupCls: "popup_a",
                  label: {coords: [-10.081702590543715,90.4609375], icon: asea97}
                },{
                  type: 'A',
                  pool: 'Zone 1',
                  coords: [31.052933985705163,92.28515625000001],
                  icon: seroA,
                  msg: "A/ASIA/Sea-97<br>2014: Russian Federation",
                  popupCls: "popup_a",
                  label: {coords: [32.052933985705163,94.28515625000001], icon: asea97}
                },{
                  type: 'SAT2',
                  pool: 'Zone 5',
                  coords: [-11.350796722383672, -15.205078125000002],
                  icon: seroSAT2,
                  msg: "SAT2/VII<br>2014: Mauritania",
                  popupCls: "popup_sat2",
                  label: {coords: [-13.154376055418515,-16.173828125000002], icon: sat2v2}
                },{
                  type: 'SAT2',
                  pool: 'Zone 3',
                  coords: [-3.601142320158722,19.599609375000004],
                  icon: seroSAT2,
                  msg: "SAT2/VII/Alx-12<br>2014: Sudan, Egypt",
                  popupCls: "popup_sat2",
                  label: {coords: [-2.601142320158722,21.599609375000004], icon: sat2v2}
                },{
                  type: 'SAT2',
                  pool: 'Zone 4',
                  coords: [-21.53484700204879,21.005859375000004],
                  icon: seroSAT2,
                  msg: "SAT2/VII/Alx-12<br>2014: Ethiopa <br>2015: Ethiopa",
                  popupCls: "popup_sat2",
                  label: {coords: [-20.53484700204879,15.7], icon: sat2v2x3}
                },{
                  type: 'SAT2',
                  pool: 'Zone 6',
                  coords: [-34.74651225991851,15.128906250000002],
                  icon: seroSAT2,
                  msg: "SAT2/I<br>2014: Zimbabwe, Mozambique<br>2015: Mozambique<br><br>SAT2/II<br>2014: Zimbabwe<br>2015: Zimbabwe<br><br>SAT2/III<br>2014: Namibia<br>2015: Botswana, Namibia",
                  popupCls: "popup_sat2",
                  label: {coords: [-32.74651225991851,9.528906250000002], icon: sat2123}
                },{
                  type: 'SAT2',
                  pool: 'Zone 3',
                  coords: [-6.140554782450295,39.28710937500001],
                  icon: seroSAT2,
                  msg: "SAT2/VII/Alx-12<br>2015: Oman",
                  popupCls: "popup_sat2",
                  label: {coords: [-5.140554782450295,41.28710937500001], icon: sat2v2}
                },{
                  type: 'SAT1',
                  pool: 'Zone 4',
                  coords: [-28.988527147308625,22.718750000000004],
                  icon: seroSAT1,
                  msg: "SAT1/I-NWZ<br>2014: Tanzania",
                  popupCls: "popup_sat1",
                  label: {coords: [-30.9,20.218750000000004], icon: sat1inwz}
                },{
                  type: 'SAT1',
                  pool: 'Zone 6',
                  coords: [-39.34706035607122,10.267578125000001],
                  icon: seroSAT1,
                  msg: "SAT1/II(SEZ)<br>2015: Zimbabwe<br><br>SAT1/III-NWZ<br>2014: Bostwana<br>2015: Bostwana, Namibia",
                  popupCls: "popup_sat1",
                  label: {coords: [-41,7.267578125000001], icon: sat1}
                },{
                  type: 'SAT3',
                  pool: 'Zone 6',
                  coords: [-39.04443758460857,18.281250000000004],
                  icon: seroSAT3,
                  msg: "SAT3/II-WZ<br>2015: Zambia",
                  popupCls: "popup_sat3",
                  label: {coords: [-40.64443758460857,16.5], icon: sat3wz}
                },{
                  type: 'ASIA',
                  pool: 'Zone 3',
                  coords: [12.983147716796578,26.279296875000004],
                  icon: seroASIA,
                  msg: "Asia1/ASIA<br>2014: Turkey <br><br>Asia1/ASIA/Sindh-08<br>2015: Turkey<br>2015: Turkey",
                  popupCls: "popup_asia",
                  label: {coords: [13.983147716796578,28.279296875000004], icon: asiasind}
                },{
                  type: 'ASIA',
                  pool: 'Zone 3',
                  coords: [8.146242825034385,50.537109375],
                  icon: seroASIA,
                  msg: "Asia1/ASIA/Sindh-08<br>2015: Iran",
                  popupCls: "popup_asia",
                  label: {coords: [9.146242825034385,52.537109375], icon: asiasind}
                },{
                  type: 'ASIA',
                  pool: 'Zone 3',
                  coords: [0.4394488164139768, 58.97460937500001],
                  icon: seroASIA,
                  msg: "Asia1/ASIA/Sindh-08<br>2014: Pakistan, Afghanistan<br>2015: Pakistan",
                  popupCls: "popup_asia",
                  label: {coords: [1.142502403706165, 61.17187500000001], icon: asiasind}
                }
            ];

            var markerGrp = [];
            var labelGrp = [];

            function centerOnclick(e) {
              map.setView([(e.target.getLatLng().lat + 8), e.target.getLatLng().lng],4);
            }

            scope.$watchGroup(['_selectedSerotype', '_selectedPool'], function(newValues, oldValues){
                if (markerGrp.length > 0) {
                  for (var i = 0; i < markerGrp.length; i++) {
                    map.removeLayer(markerGrp[i]);
                  };
                  markerGrp = [];
                }
                if (labelGrp.length > 0) {
                  for (var i = 0; i < labelGrp.length; i++) {
                    map.removeLayer(labelGrp[i]);
                  };
                  labelGrp = [];
                }
                /*Add all to the map*/
                angular.forEach(markers, function(marker, key){
                  if ((marker.type === scope._selectedSerotype || scope._selectedSerotype === "All") && (marker.pool === scope._selectedPool || scope._selectedPool === "All")) {
                    var singleMarker = L.marker(marker.coords, {icon: marker.icon}).bindPopup(L.popup({className:marker.popupCls}).setContent(marker.msg)).on('click', centerOnclick);
                    markerGrp.push(singleMarker);
                    var singleLabel = L.marker(marker.label.coords, {icon: marker.label.icon});
                    labelGrp.push(singleLabel);
                  }
                });

                for (var i = 0; i < markerGrp.length; i++) {
                  map.addLayer(markerGrp[i]);
                };

                if (map.getZoom() === 4) {
                  for (var i = 0; i < labelGrp.length; i++) {
                      map.addLayer(labelGrp[i]);
                    };
                }
            });

            map.on('zoomend', function() {
              if (map.getZoom() === 4) {
                for (var i = 0; i < labelGrp.length; i++) {
                    map.addLayer(labelGrp[i]);
                  };
              } else{
                for (var i = 0; i < labelGrp.length; i++) {
                    map.removeLayer(labelGrp[i]);
                  };
              };
            });

            map.on('click', function (e) {
              console.log(e.latlng.lat + ", " + e.latlng.lng)
            });

            scope.$on('zoomPlus', function(){
                map.zoomIn(1);
            });
            scope.$on('zoomMoin', function(){
                map.zoomOut(1);
            });
    }
  };
}]);