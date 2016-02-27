#### USMAP Extension
usmap extension for WebFocus 8200

Make sure that you follow these rules when using the extension:

1. Source(DIM) and Destination(DIM) buckets can take names of the cityes or airport abreviations, given that they are presented in data/airports.js file.

2. If the name of the city or abbrebiated name of the aiport that you want to use is not present in data/airports file, then you need to give a string that has a label ( will be used to label a node ) and a position ( longitude and latitude  ). For example, "Los Angeles;-118.4079971;33.94250107" ( label;longitude;latitude ). In the given string data values are separated by ";". You can change data separator by assigning nodes.dataSeparator to some other value.


