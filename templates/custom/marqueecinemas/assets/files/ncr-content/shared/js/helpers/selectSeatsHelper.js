
define(['sharedlibs/openlayer/OpenLayers.mobile'], function () {

    var helper = {
        initialize: function () {
        },

        drawSeats: function (that, arg, options) {
            options = options || {};

            var pLayout = options.pLayout != undefined ? options.pLayout : null;
            var showZoneColors = options.showZoneColors != undefined ? options.showZoneColors : true;
            var showSeatNumber = options.showSeatNumber != undefined ? options.showSeatNumber : true;

            var dimensions = that.getSeatSizes(pLayout);
            var seatWidth = dimensions.seatWidth;
            var seatHeight = dimensions.seatHeight;
            var cinemaHeight = dimensions.cinemaHeight;

            var performanceLayout = pLayout || window.performanceLayout;

            var seatsRows = new Object();

            var features = [];
            var rowStrings = [];
            var unique = {};

            var zoneColors = that.getBrandStylesheet();
            var zoneOpacity = that.getZoneStyle(zoneColors, '.unselected', 'opacity');
            var defaultColor = that.getZoneStyle(zoneColors, '.default', 'backgroundColor');
            var unavailableColor = that.getZoneStyle(zoneColors, '.unavailable', 'backgroundColor');
            var specialColor = that.getZoneStyle(zoneColors, '.special', 'backgroundColor');

            for (var i = 0; i < performanceLayout.models.length; i++) {
                var seat = performanceLayout.models[i];
                var zone = performanceLayout.zones.get(seat.get('zoneId'));
                var type = seat.get('type');

                if (typeof seat.get('type') == 'object') {
                    type = seat.get('type').type;
                }

                var rowString = { name: (showSeatNumber ? seat.get('name').replace(/[0-9]/g, ' ') : ''), row: (showSeatNumber ? seat.get('row') : ' ') };
                if (!unique[rowString.row]) {
                    rowStrings.push(rowString);
                    unique[rowString.row] = rowString;
                }

                if (!seat || type == 'NotSeat') continue;

                var zoneColor = '';

                if (type == 'Reserved' || type == 'LoveSeatLeft' || type == 'LoveSeatRight') {
                    zoneColor = defaultColor;
                }

                if (zone && showZoneColors) {
                    var zoneStyle = that.getZoneStyle(zoneColors, '.zone-' + performanceLayout.zones.indexOf(zone), 'backgroundColor');
                    if (zoneStyle)
                        zoneColor = zoneStyle;
                } else {
                    that.showRegular = true;
                }

                if (type == 'Wheelchair') {
                    that.showWheelChair = true;
                    zoneColor = specialColor;
                } else if (type == 'Companion') {
                    that.showCompanion = true;
                    zoneColor = specialColor;
                } else if (type == 'GeneralAdmission' || type == 'Sold' || type == 'Blocked') {
                    zoneColor = unavailableColor;
                }

                var col = seat.get('column') * seatWidth - (performanceLayout.totalColumnCount / 2) * seatWidth - seatWidth;
                var row = -seat.get('row') * seatHeight + cinemaHeight / 2;

                var hSpace = seatWidth / 5;
                var vSpace = seatHeight / 5;

                var hSpaceRL = hSpace;
                var hSpaceLL = hSpace;

                var loveSeatFix = 0;

                var seatWidthRL = seatWidth;
                var seatWidthLL = seatWidth;

                var pointList = [];

                var strokeWidth = hSpace * 0.7;

                if (type == 'LoveSeatLeft') {
                    hSpaceLL = 0;
                    seatWidthLL = 0;
                    if (seatHeight < 100)
                        loveSeatFix = Math.floor(seatHeight / 12);
                    else
                        loveSeatFix = Math.floor(seatHeight / 100) * 10;

                    that.showLoveSeat = true;
                }

                if (type == 'LoveSeatRight') {
                    hSpaceRL = 0;
                    seatWidthRL = 0;
                    if (seatHeight < 100)
                        loveSeatFix = Math.floor(seatHeight / 12);
                    else
                        loveSeatFix = Math.floor(seatHeight / 100) * 10;
                }

                pointList.push(new OpenLayers.Geometry.Point(col + hSpaceRL, row + hSpace));
                pointList.push(new OpenLayers.Geometry.Point(col + hSpaceRL, row + seatHeight - loveSeatFix - vSpace));
                if (type != 'LoveSeatRight') { pointList.push(new OpenLayers.Geometry.Point(col + hSpace, row + seatHeight - vSpace)); }
                if (type != 'LoveSeatRight') { pointList.push(new OpenLayers.Geometry.Point(col + seatWidthRL / 4, row + seatHeight - vSpace)); }
                pointList.push(new OpenLayers.Geometry.Point(col + seatWidthRL / 4 + 2, row + seatHeight - seatHeight / 14 - vSpace));
                pointList.push(new OpenLayers.Geometry.Point(col + seatWidthLL / 2 - 2 + seatWidth / 4, row + seatHeight - seatHeight / 14 - vSpace));
                if (type != 'LoveSeatLeft') { pointList.push(new OpenLayers.Geometry.Point(col + seatWidth / 2 + seatWidth / 4, row + seatHeight - vSpace)); }
                if (type != 'LoveSeatLeft') { pointList.push(new OpenLayers.Geometry.Point(col + seatWidth - hSpace, row + seatHeight - vSpace)); }
                pointList.push(new OpenLayers.Geometry.Point(col + seatWidth - hSpaceLL, row + seatHeight - loveSeatFix - vSpace));
                pointList.push(new OpenLayers.Geometry.Point(col + seatWidth - hSpaceLL, row + hSpace));

                var linearRing = new OpenLayers.Geometry.LinearRing(pointList);

                var feature = new OpenLayers.Feature.Vector(
                	new OpenLayers.Geometry.Polygon([linearRing])
                );

                var seatLabel = type == 'Companion' || type == 'Wheelchair' || !showSeatNumber ? ' ' : seat.get('name');

                var fontWeight = '';

                if (type == 'GeneralAdmission' || type == 'Sold' || type == 'Blocked') {
                    seatLabel = 'X';
                    fontWeight = 'bold';
                }


                feature.style = {
                    fillColor: zoneColor, fillOpacity: zoneOpacity, strokeColor: zoneColor, strokeOpacity: '0', strokeWidth: strokeWidth, strokeLinejoin:

    'round', label: seatLabel, fontSize: '0px', fontColor: "#9C9595"
                };

                feature.attributes = {
                    row: seat.get('row'), col: seat.get('column'), status: '', type: type, strokeWidth: strokeWidth, originalColor: zoneColor,

                    originalOpacity: zoneOpacity, selectedOpacity: '1', unavailableColor: unavailableColor, label: seatLabel
                };
                feature.fid = feature.attributes.row + '-' + feature.attributes.col;

                features.push(feature);

                if (type == 'Companion' || type == 'Wheelchair') {
                    var point = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(col + seatWidth / 2, row + seatHeight / 2));
                    point.attributes = { row: seat.get('row'), col: seat.get('column'), type: 'Icon' };

                    var img = 'wheelchair';

                    if (type == 'Companion') {
                        img = 'companion';
                    }

                    point.style = {
                        pointerEvents: 'none',
                        graphicZIndex: 10,
                        externalGraphic: (arg ? arg.imgPath : '') + img + ".png",
                        pointRadius: 10,
                        graphicWidth: seatWidth / 2
                    };


                    features.push(point);
                }

                seatsRows[seat.get('row')] = true;
            }

            var startPointX = (performanceLayout.totalColumnCount / 2) * seatWidth;
            var startPointY = (performanceLayout.totalRowCount / 2) * (cinemaHeight / performanceLayout.totalRowCount);

            var compare = function (a, b) {
                return a.row - b.row;
            };

            rowStrings.sort(compare);

            for (var i = 0, j = 0; i <= performanceLayout.totalRowCount; i++) {
                if (!seatsRows[i]) continue;

                var rowLabelText = new OpenLayers.Feature.Vector(
            		new OpenLayers.Geometry.Point(-startPointX - seatWidth / 2, startPointY + (seatHeight / 2) - (seatHeight * i))
            	);

                rowLabelText.style = { fontColor: '#ffffff', strokeWidth: 3, label: (rowStrings[j] ? rowStrings[j].name : '') , fontSize: '16px' };
                rowLabelText.attributes = { notseat: true };

                var rowLabelText1 = new OpenLayers.Feature.Vector(
            		new OpenLayers.Geometry.Point(startPointX + seatWidth / 2, startPointY + (seatHeight / 2) - (seatHeight * i))
            	);

                rowLabelText1.style = { fontColor: '#ffffff', strokeWidth: 3, label: (rowStrings[j] ? rowStrings[j].name : ''), fontSize: '16px' };
                rowLabelText1.attributes = { notseat: true }; rowLabelText.attributes = { notseat: true };

                features.push(rowLabelText);
                features.push(rowLabelText1);

                j++;
            }

            var pointList2 = [];

            if (!options.forMobileDevice) {
                pointList2.push(new OpenLayers.Geometry.Point(-startPointX, startPointY + seatHeight));
                pointList2.push(new OpenLayers.Geometry.Point(-startPointX, startPointY + seatHeight + seatHeight));
                pointList2.push(new OpenLayers.Geometry.Point(startPointX, startPointY + seatHeight + seatHeight));
                pointList2.push(new OpenLayers.Geometry.Point(startPointX, startPointY + seatHeight));
            } else {
                pointList2.push(new OpenLayers.Geometry.Point(-startPointX, startPointY));
                pointList2.push(new OpenLayers.Geometry.Point(-startPointX, startPointY + seatHeight));
                pointList2.push(new OpenLayers.Geometry.Point(startPointX, startPointY + seatHeight));
                pointList2.push(new OpenLayers.Geometry.Point(startPointX, startPointY));
            }

            var linearRing2 = new OpenLayers.Geometry.LinearRing(pointList2);

            var screenFeature = new OpenLayers.Feature.Vector(
            	new OpenLayers.Geometry.Polygon(linearRing2)
            );

            var strokeColor = that.getZoneStyle(zoneColors, '.select-seats-screen', 'stroke');
            var fillColor = that.getZoneStyle(zoneColors, '.select-seats-screen', 'background-color');
            var fontColor = that.getZoneStyle(zoneColors, '.select-seats-screen', 'color');
            var fontSize = that.getZoneStyle(zoneColors, '.select-seats-screen', 'font-size');

            screenFeature.style = {
                strokeColor: strokeColor,
                fillColor: fillColor,
                strokeWidth: 2,
                fontColor: fontColor,
                fontSize: fontSize,
                label: that.localize.screen,
                pointerEvents: 'none'
            };

            screenFeature.attributes = { notseat: true };

            features.push(screenFeature);

            that.vectors.addFeatures(features);

            that.setLabels();
        },

        renderPage: function (that, fixPosition, opt) {
            var self = this;

            opt = opt || {};

            var pLayout = opt.pLayout != undefined ? opt.pLayout : null;
            var selector = opt.selector != undefined ? opt.selector : null;
            var preventEventBindings = opt.preventEventBindings != undefined ? opt.preventEventBindings : false;
            var enableZoom = opt.enableZoom != undefined ? opt.disableZoom : true;

            var performanceLayout = pLayout || window.performanceLayout;

            that.defaultZoomLevel = 1;

            if (!$(that.el).is(":visible")) return;
            var map;
            //if (that.map) that.map.destroy();

            var seatsLayout = $(that.el).find('#' + (selector || 'seats-layout'));

            seatsLayout.empty();

            var dimensions = that.getSeatSizes(pLayout);

            var seatWidth = dimensions.seatWidth;
            var seatHeight = dimensions.seatHeight;

            var cinemaHeight = dimensions.cinemaHeight;
            var cinemaWidth = dimensions.cinemaWidth;

            if (fixPosition)
                seatsLayout.css('height', cinemaHeight + 20);
            else
                seatsLayout.css('height', $(window).height() - $('.ui-header').height() - $('.screen-container').height() - 60);

            seatsLayout.css('width', cinemaWidth);


            //Setting up theater position and scale based on initial seat size
            var maxExtent;
            if (performanceLayout.totalColumnCount / performanceLayout.totalRowCount > dimensions.defaultRatio) {
                maxExtent = 3;
            } else {
                maxExtent = fixPosition && seatWidth < 16 ? 3 : 4;
            }

            var extentOffset = fixPosition && seatWidth < 16 ? 2.5 : 2;
            var maxScale = fixPosition && seatWidth < 16 ? 330000000 : 500000000;

            var options = {
                numZoomLevels: 6,
                minResolution: "auto",
                minExtent: new OpenLayers.Bounds(-1, -1, 1, 1),
                maxResolution: "auto",
                maxExtent: new OpenLayers.Bounds(-cinemaWidth / maxExtent, -cinemaHeight / maxExtent, cinemaWidth / maxExtent, cinemaHeight / extentOffset),
                maxScale: maxScale,
                minScale: 100000000
            };

            if (!enableZoom) {
                options.controls = [];
            }

            map = new OpenLayers.Map((selector || 'seats-layout'), options);

            that.vectors = new OpenLayers.Layer.Vector("vector", { isBaseLayer: true });

            map.addLayers([that.vectors]);

            that.selectCtrl = new OpenLayers.Control.SelectFeature(that.vectors,
                {
                    clickout: false,
                    multiple: true,
                    toggle: true,
                    hover: false,
                    onBeforeSelect: function (feature) {
                        if (!preventEventBindings) {
                            that.changeStyle(feature);
                        }
                    },
                    onSelect: function (feature) {
                        if (!preventEventBindings) {
                            that.onClickSeat(feature, true);
                        }
                    },
                    onUnselect: function (feature) {
                        if (!preventEventBindings) {
                            that.onClickSeat(feature, false);
                        }
                    },
                    selectStyle: { strokeWidth: (seatWidth / 5) * 0.7, strokeLinejoin: 'round' }
                }
            );

            map.addControl(that.selectCtrl);

            that.selectCtrl.handlers.feature.stopDown = false;

            if (enableZoom) {
                var pinchActive = false;
                that.pinchZoom = new OpenLayers.Control.PinchZoom(
                    {
                        pinchDone: function() {
                            pinchActive = true;
                        }
                    }
                );
                map.addControl(that.pinchZoom);

                map.events.register('zoomend', map, function() {
                    var x = map.getZoom();

                    if (x > 4 && !pinchActive) {
                        map.zoomTo(that.defaultZoomLevel);
                    } else if (x > 4) {
                        map.zoomTo(4);
                    } else {
                        that.currentZoom = x;
                    }

                    that.setLabels();
                    self.setImgAttr(x, seatWidth);

                    pinchActive = false;
                });

                map.events.register('moveend', map, function() {
                    that.setLabels();
                    self.setImgAttr(map.getZoom(), seatWidth);
                });
            } else {
                map.events.register('zoomend', map, function () {
                    that.setLabels();
                });
            }

            that.selectCtrl.activate();

            if (fixPosition)
                map.setCenter(new OpenLayers.LonLat(0, (performanceLayout.totalRowCount * seatHeight * 2)), 1);
            else
                map.setCenter(new OpenLayers.LonLat(0, (performanceLayout.totalRowCount * seatHeight / 2.5)), 1);

            opt.forMobileDevice = true;
            that.drawSeats(opt);

            map.layers[0].redraw();

            var columnsHeight = performanceLayout.totalColumnCount * seatWidth;
            var rowsWidth = performanceLayout.totalRowCount * seatWidth;
            if (fixPosition && (columnsHeight > cinemaHeight || rowsWidth > cinemaWidth || seatWidth < 16 || seatWidth > 70)) {
                that.defaultZoomLevel = 0;
                map.zoomTo(that.defaultZoomLevel);
            }
            that.refreshStatuses(opt);
        },

        setImgAttr: function (zoom, seatWidth) {
            if (zoom == 4) {
                var featureWidth = $('svg g g path')[0].getBoundingClientRect().width;

                var imgSize = featureWidth / 2;
                var offest = (imgSize - seatWidth / 2) / 2;

                $('svg g image').each(function () {
                    if ($(this).attr('adjusted') == 'true')
                        return;

                    var x = $(this).attr('x');
                    var y = $(this).attr('y');

                    $(this).attr({
                        'width': imgSize,
                        'height': imgSize,
                        'x': x - offest,
                        'y': y - offest,
                        'adjusted': true
                    });
                });
            } else {
                $('svg g image').each(function () {
                    $(this).attr('adjusted', false);
                });
            }
        },

        refreshStatuses: function (that, arg) {
            // that.seatStatuses = window.ObjectModels.OrderModel.get('seatStatuses');
            var result = (arg.seatInfo && arg.seatInfo.seatInfo) ? arg.seatInfo.seatInfo : window.ObjectModels.OrderModel.get('seatStatuses');

            var features = [];

            var performanceLayout = (arg.seatInfo && arg.seatInfo.pLayout) ? arg.seatInfo.pLayout : window.performanceLayout;

            if (result && result.overrides && result.models) {
                for (var i = 0; i < result.overrides.length; i++) {
                    var currType = result.overrides[i];

                    var row = currType.row;
                    var column = currType.column;

                    var seat = performanceLayout.where({ row: row, column: column })[0];
                    if (seat) {
                        seat.set('type', currType, { silent: true });

                        var seatElement = that.vectors.getFeatureByFid(row + '-' + column);

                        var type = currType.type;

                        switch (type) {
                            case "Blocked":
                                seatElement.attributes.type = type;
                                seatElement.style.fillColor = seatElement.attributes.unavailableColor;
                                $('[id="' + seatElement.geometry.id + '"]').css({ 'fill': seatElement.attributes.unavailableColor });
                                if (seatElement.attributes.type != 'Companion' && seatElement.attributes.type != 'Wheelchair') {
                                    $('[id="' + seatElement.id + '_label_tspan_0' + '"]').text('X');
                                    $('[id="' + seatElement.id + '_label_tspan_0' + '"]').css({ 'font-weight': 'bold' });
                                    seatElement.attributes.label = 'X';
                                    seatElement.style.label = 'X';
                                    seatElement.style.fontWeight = 'bold';
                                }
                                break;
                            case "GeneralAdmission":
                                seatElement.attributes.type = type;
                                seatElement.style.fillColor = seatElement.attributes.unavailableColor;
                                $('[id="' + seatElement.geometry.id + '"]').css({ 'fill': seatElement.attributes.unavailableColor });
                                if (seatElement.attributes.type != 'Companion' && seatElement.attributes.type != 'Wheelchair') {
                                    $('[id="' + seatElement.id + '_label_tspan_0' + '"]').text('X');
                                    $('[id="' + seatElement.id + '_label_tspan_0' + '"]').css({ 'font-weight': 'bold' });
                                    seatElement.attributes.label = 'X';
                                    seatElement.style.label = 'X';
                                    seatElement.style.fontWeight = 'bold';
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }

                for (var i = 0; i < result.models.length; i++) {
                    var currStatus = result.models[i];

                    var row = currStatus.get('row');
                    var column = currStatus.get('column');

                    var seat = performanceLayout.where({ row: row, column: column })[0];
                    if (seat) {
                        currStatus.set('seat', seat, { silent: true });
                        seat.set('status', currStatus, { silent: true });

                        var seatElement = that.vectors.getFeatureByFid(row + '-' + column);

                        var status = currStatus.get('status');

                        seatElement.attributes.refresh = true;

                        switch (status) {
                            case "Locked":
                                that.selectCtrl.select(seatElement);
                                break;
                            case "Hold":
                                that.selectCtrl.select(seatElement);
                                break;
                            case "Sold":
                                $('[id="' + seatElement.geometry.id + '"]').css({ 'fill': seatElement.attributes.unavailableColor });
                                seatElement.attributes.status = status;

                                if (seatElement.attributes.type != 'Companion' && seatElement.attributes.type != 'Wheelchair') {
                                    $('[id="' + seatElement.id + '_label_tspan_0' + '"]').text('X');
                                    $('[id="' + seatElement.id + '_label_tspan_0' + '"]').css({ 'font-weight': 'bold' });
                                    seatElement.attributes.label = 'X';
                                    seatElement.style.label = 'X';
                                    seatElement.style.fontWeight = 'bold';
                                }

                                seatElement.attributes.type = status;
                                seatElement.style.fillColor = seatElement.attributes.unavailableColor;
                                
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            if (arg && arg.touchEvents)
                that.firstLoad = false;

            that.vectors.addFeatures(features);
        }
    };

    return helper;
});