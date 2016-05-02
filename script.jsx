function main() {

    var csvFilter = "*.csv",
        csvFile = File.openDialog("Please select the CSV File…", csvFilter, false),
        csvHeaders,
        s ,
        model,
        manufacturer,
        measurement_type,
        fda,
        ce;

    if ( !csvFile ) return;

    var measurement_type_to_device = {};

    csvFile.open('r');
    // skip headers
    csvFile.readln().split(",");

    while (!csvFile.eof){
        var device = {};
        var line = csvFile.readln();

        var q = [];
        var part = "";
        var notInBrackets = true;
        for (var index = 0; index < line.length; index++) {
            var ch = line.charAt(index);
            switch (ch)
            {
                case ',':
                    if (notInBrackets) {
                        q.push(part);
                        part = "";
                        notInBrackets = true;
                    }
                    break;

                case '"':
                    notInBrackets = !notInBrackets;
                    break;

                default: part = part + ch;
            }
        }

        //s = line.split(",");
        s = q;

        // construct the device object
        if (s.length >= 0)  {
            device["model"] = s[1];
            device["manufacturer"] = s[2];
            device["measurement_type"] = s[5].length > 0 ? s[5].replace(new RegExp("^\"|\"$", 'g'), "").split(";") : [];
            device["fda"] = Boolean("YES" == s[11]);
            device["ce"] = Boolean("YES" == s[12]);
        }

        // types may contain garbage
        for (var k = 0; k < device.measurement_type.length; k++) {
            device.measurement_type[k] = device.measurement_type[k].trim();
        }

        // construct type -> device map
        for(var i = 0; i < device.measurement_type.length; i++) {
            //noinspection JSValidateTypes
            if (typeof measurement_type_to_device[device.measurement_type[i]] === 'undefined' ||
                typeof measurement_type_to_device[device.measurement_type[i]] == null) {
                measurement_type_to_device[device.measurement_type[i]] = []
            }
            measurement_type_to_device[device.measurement_type[i]].push(device);
        }

    }


    // Rendering stuff
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
        device_group.name = device_type + " group";

        // Type name box
        var itemRef = device_group.pathItems.rectangle(posTop, posLeft, 500, 50);
        var textRef = device_group.textFrames.areaText(itemRef);
        textRef.contents = device_type + " (" + measurement_type_to_device[device_type].length + ")";

        for (var j = 0; j < measurement_type_to_device[device_type].length; j++) {
            posTop -= 50;

            var current_device = measurement_type_to_device[device_type][j];
            var dev_group = device_group.groupItems.add();
            dev_group.name = current_device.manufacturer + " " + current_device.model + " group";

            // Device description box
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

if (!String.prototype.trim) {
    (function() {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
            return this.replace(rtrim, '');
        };
    })();
}

main();
redraw();