function main() {

    alert(app.coordinateSystem);

    var csvFilter = "*.csv", //  function(f) { return /\.csv$/i.test ( f.name ); },
        csvFile = File.openDialog("Please select the CSV File…", csvFilter, false),
        docsData = [],
        csvSep = ",",
        csvContent,
        csvHeaders,
        s ,
        n,
        model,
        manufacturer,
        measurement_type,
        fda,
        ce;

    if ( !csvFile ) return;

    var data = [];
    var measurement_type_to_device = {};


    csvFile.open('r');
    csvHeaders = csvFile.readln().split(",");

    while (!csvFile.eof){
        var device = {};
        s = csvFile.readln().split(",");
        if (s.length >= 0)  {
            device["model"] = s[1];
            device["manufacturer"] = s[2];
            device["measurement_type"] = s[5].length > 0 ? s[5].replace(new RegExp("^\"|\"$", 'g'), "").split(";") : [];
            device["fda"] = Boolean("YES" == s[11]);
            device["ce"] = Boolean("YES" == s[12]);
        }
        var item = device.manufacturer.concat(" ")
            .concat(device.model)
//            .concat(measurement_type)
//             .concat(" FDA:")
//             .concat(fda)
//             .concat(" CE:").
//             concat(ce);
            .concat("\n");
        data.push(item);
        for(var i = 0; i < device.measurement_type.length; i++) {
            //noinspection JSValidateTypes
            if (typeof measurement_type_to_device[device.measurement_type[i]] === 'undefined' ||
                typeof measurement_type_to_device[device.measurement_type[i]] == null) {
                measurement_type_to_device[device.measurement_type[i]] = []
            }
            measurement_type_to_device[device.measurement_type[i]].push(device);
        }

    }

    var docRef;

    if ( app.documents.length == 0 ) {
        docRef = app.documents.add();
    }
    else {
        docRef = app.activeDocument;
    }

    var posTop = 10;
    var posLeft = 10;
    var paddingLeft = 75;


    for (var device_type in measurement_type_to_device) {
        posTop -= 50;
        var device_group = docRef.groupItems.add();
        device_group.name = device_type;

        var itemRef = device_group.pathItems.rectangle(posTop, posLeft, 500, 50);
        var textRef = device_group.textFrames.areaText(itemRef);
        textRef.contents = device_type;

        for (var j = 0; j < measurement_type_to_device[device_type].length; j++) {
            posTop -= 50;
            // Create a new document and add 2 area TextFrames
            var current_device = measurement_type_to_device[device_type][j];
            var dev_group = device_group.groupItems.add();
            dev_group.name = current_device.manufacturer + " " + current_device.model;
            var itemRef1 = dev_group.pathItems.rectangle(posTop, posLeft + paddingLeft, 300, 100);
            var textRef1 = dev_group.textFrames.areaText(itemRef1);
            textRef1.contents = dev_group.name;
        }
    }
};

function logObject(obj) {
    var output = '';
    for (var property in obj) {
        output += property + ":\n" + obj[property]+'-----------------\n';
    }
    return output;
}

main();
redraw();