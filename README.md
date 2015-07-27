# wf-extensions-chart
Examples on extending the charting capabilities of IBI's WebFocus using d3.

To install extensions into WebFocus 8200:
  1) Copy the entire extension folder to C:\ibi\WebFOCUS82\config\web_resource\extensions, so that the extension folder is a child folder.
  2) Edit the file tdgextensionlist.json that is in the \extensions directory. Put in the name of each extension you want to use. For example: 
  
      // Copyright 1996-2015 Information Builders, Inc. All rights reserved.
    {
    "com.ibi.simple_bar": "extensions/com.ibi.simple_bar",
    "com.ibi.liquid_gauge": "extensions/com.ibi.liquid_gauge",
    "com.ibi.sankey": "extensions/com.ibi.sankey"
    }
    
  3) Recycle Tomcat
